/**
 * ICOGON — Phase 1 / File 13
 *
 * Reconnect to an EXISTING orchestrator run using a durable checkpoint.
 * This service deliberately does not own React state or persist a complete
 * WorkspaceSessionSnapshot: the Builder hook/controller owns those writes.
 *
 * An unconfirmed submission has no known run ID. Never infer or invent one;
 * offer an EXPLICIT retry using the original idempotency key instead.
 */

import {
    getOrchestratorRecoveryApi,
    streamOrchestratorEventsApi,
    submitOrchestratorRunApi,
    type OrchestratorRun,
    type OrchestratorRunEvent,
    type OrchestratorRunStep,
} from "../../api/projectApi";
import {
    isTerminalRunStage,
    normalizeStage,
    type PendingRunSubmission,
    type RunStage,
    type WorkspaceRunCheckpoint,
    type WorkspaceRunRecovery,
    type WorkspaceSessionScope,
} from "../../pages/Builder/types";

/** Keep the cursor, but bound the in-memory history stored in each snapshot. */
export const MAX_RECOVERY_EVENTS = 500;
export const DEFAULT_RECONNECT_ATTEMPTS = 3;
const DEFAULT_RECONNECT_DELAY_MS = 750;
const MAX_RECONNECT_DELAY_MS = 5_000;

export type RunRecoveryErrorCode =
    | "invalid_checkpoint"
    | "wrong_project"
    | "wrong_user"
    | "invalid_response"
    | "connection_lost";

export class RunRecoveryError extends Error {
    public readonly code: RunRecoveryErrorCode;
    public readonly lastKnown?: RecoveredRunState;

    constructor(
        code: RunRecoveryErrorCode,
        message: string,
        lastKnown?: RecoveredRunState,
    ) {
        super(message);
        this.code = code;
        this.lastKnown = lastKnown;
        this.name = "RunRecoveryError";
    }
}

/** The API is authoritative; stage in a checkpoint is the last known UI stage. */
export interface RecoveredRunState {
    run: OrchestratorRun;
    checkpoint: WorkspaceRunCheckpoint;
    /** Events received since the supplied checkpoint, not all historical events. */
    newEvents: OrchestratorRunEvent[];
    terminal: boolean;
}

export type RecoveryInspection =
    | { status: "none" }
    | {
        status: "submission-unconfirmed";
        submission: PendingRunSubmission;
        reason: string;
    }
    | { status: "recovered"; state: RecoveredRunState };

export interface InspectRunRecoveryOptions {
    scope: WorkspaceSessionScope;
    recovery: WorkspaceRunRecovery | null;
    signal?: AbortSignal;
}

export interface TrackRunRecoveryOptions {
    scope: WorkspaceSessionScope;
    checkpoint: WorkspaceRunCheckpoint;
    signal?: AbortSignal;
    /** The caller can update React state and schedule a snapshot save. */
    onProgress?: (state: RecoveredRunState) => void;
    /** Additional SSE reconnects after the first connection. Default: 3. */
    maxReconnectAttempts?: number;
    reconnectDelayMs?: number;
}

export interface RetryPendingSubmissionOptions {
    scope: WorkspaceSessionScope;
    submission: PendingRunSubmission;
    /** Must be explicitly true; this is never invoked by automatic recovery. */
    confirmRetry: true;
    signal?: AbortSignal;
}

function assertScope(scope: WorkspaceSessionScope): void {
    if (!scope.userId?.trim() || !scope.projectId?.trim()) {
        throw new RunRecoveryError("invalid_checkpoint", "A user and project ID are required for recovery.");
    }
}

function assertNotAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
        const error = new Error("Run recovery was cancelled.");
        error.name = "AbortError";
        throw error;
    }
}

function assertRunScope(run: OrchestratorRun, scope: WorkspaceSessionScope, runId?: string): void {
    if (!run || typeof run.id !== "string" || (runId && run.id !== runId)) {
        throw new RunRecoveryError("invalid_response", "The server returned the wrong generation run.");
    }
    if (run.project_id !== scope.projectId) {
        throw new RunRecoveryError("wrong_project", "The generation belongs to a different project.");
    }
    if (run.user_id !== scope.userId) {
        throw new RunRecoveryError("wrong_user", "The generation belongs to another account.");
    }
}

function stageFromRun(run: OrchestratorRun): RunStage {
    const stage = normalizeStage(run.status);
    if (stage === "idle") {
        throw new RunRecoveryError("invalid_response", `Unknown generation status: ${String(run.status)}.`);
    }
    return stage;
}

function failureMessage(run: OrchestratorRun, previous: string): string {
    if (stageFromRun(run) !== "failed") return "";
    const failure = run.failure;
    if (failure && typeof failure === "object" && "message" in failure &&
        typeof failure.message === "string" && failure.message.trim()) {
        return failure.message;
    }
    return previous || "Generation failed. Check the run details.";
}

function stageFromEvent(event: OrchestratorRunEvent, previous: RunStage): RunStage {
    if (event.event_type === "run.completed") return "completed";
    if (event.event_type === "run.failed") return "failed";
    if (event.event_type === "run.cancelled") return "cancelled";
    if (event.event_type === "run.status_changed") {
        const target = event.payload?.to ?? event.payload?.status;
        const stage = typeof target === "string" ? normalizeStage(target) : "idle";
        return stage === "idle" ? previous : stage;
    }
    return previous;
}

function stepsFromEvents(
    initial: OrchestratorRunStep[],
    events: readonly OrchestratorRunEvent[],
): OrchestratorRunStep[] {
    const steps = new Map(initial.map(step => [step.id, { ...step }]));
    for (const event of events) {
        if (!["step.started", "step.completed", "step.failed"].includes(event.event_type)) continue;
        const payload = event.payload ?? {};
        const stepId = payload.step_id;
        if (typeof stepId !== "string" || !stepId.trim()) continue;
        const previous = steps.get(stepId);
        const name = typeof payload.name === "string" && payload.name.trim()
            ? payload.name : previous?.name ?? "Processing";
        const status = event.event_type === "step.started" ? "running"
            : event.event_type === "step.completed" ? "completed" : "failed";
        steps.set(stepId, {
            ...previous,
            id: stepId,
            name,
            status,
            ...(event.event_type === "step.failed" && typeof payload.error === "string"
                ? { error: payload.error } : {}),
            ...(event.event_type === "step.completed" && payload.details &&
                typeof payload.details === "object" && !Array.isArray(payload.details)
                ? { details: payload.details as Record<string, unknown> } : {}),
        });
    }
    return Array.from(steps.values());
}

function mergeEvents(
    checkpoint: WorkspaceRunCheckpoint,
    incoming: readonly OrchestratorRunEvent[],
): { checkpoint: WorkspaceRunCheckpoint; fresh: OrchestratorRunEvent[] } {
    const known = new Set(checkpoint.runEvents.map(event => event.sequence));
    let cursor = checkpoint.lastEventSequence;
    const fresh: OrchestratorRunEvent[] = [];
    for (const event of [...incoming].sort((a, b) => a.sequence - b.sequence)) {
        if (event.run_id !== checkpoint.runId) {
            throw new RunRecoveryError("invalid_response", "A generation event belongs to another run.");
        }
        if (!Number.isSafeInteger(event.sequence) || event.sequence < 0) {
            throw new RunRecoveryError("invalid_response", "Invalid generation event sequence.");
        }
        if (event.sequence <= cursor || known.has(event.sequence)) continue;
        cursor = event.sequence;
        known.add(event.sequence);
        fresh.push(event);
    }
    const events = [...checkpoint.runEvents, ...fresh]
        .sort((a, b) => a.sequence - b.sequence)
        .slice(-MAX_RECOVERY_EVENTS);
    let stage = checkpoint.stage;
    for (const event of fresh) stage = stageFromEvent(event, stage);
    return {
        fresh,
        checkpoint: {
            ...checkpoint,
            stage,
            lastEventSequence: cursor,
            runEvents: events,
            runSteps: stepsFromEvents(checkpoint.runSteps, fresh),
            runError: fresh.some(event => event.event_type === "run.failed")
                ? "Generation failed. Check the run details." : checkpoint.runError,
            updatedAt: new Date().toISOString(),
        },
    };
}

function reconcileWithRun(
    checkpoint: WorkspaceRunCheckpoint,
    run: OrchestratorRun,
): WorkspaceRunCheckpoint {
    return {
        ...checkpoint,
        stage: stageFromRun(run),
        runSteps: run.steps?.length ? run.steps : checkpoint.runSteps,
        runError: failureMessage(run, checkpoint.runError),
        updatedAt: new Date().toISOString(),
    };
}

function makeCheckpoint(run: OrchestratorRun): WorkspaceRunCheckpoint {
    return {
        kind: "tracking",
        runId: run.id,
        stage: stageFromRun(run),
        lastEventSequence: 0,
        runEvents: [],
        runSteps: run.steps ?? [],
        runError: failureMessage(run, ""),
        updatedAt: new Date().toISOString(),
    };
}

/** Fetch server status + missed events for a SAVED run ID. No new run is created. */
export async function recoverKnownRun(
    options: { scope: WorkspaceSessionScope; checkpoint: WorkspaceRunCheckpoint; signal?: AbortSignal },
): Promise<RecoveredRunState> {
    const { scope, checkpoint, signal } = options;
    assertScope(scope);
    assertNotAborted(signal);
    if (checkpoint.kind !== "tracking" || !checkpoint.runId?.trim() ||
        !Number.isSafeInteger(checkpoint.lastEventSequence) || checkpoint.lastEventSequence < 0) {
        throw new RunRecoveryError("invalid_checkpoint", "The saved generation checkpoint is invalid.");
    }

    const recovered = await getOrchestratorRecoveryApi({
        projectId: scope.projectId,
        runId: checkpoint.runId,
        after: checkpoint.lastEventSequence,
        signal,
    });
    assertNotAborted(signal);
    assertRunScope(recovered.run, scope, checkpoint.runId);
    const { checkpoint: merged, fresh } = mergeEvents(checkpoint, recovered.events);
    const updated = reconcileWithRun(merged, recovered.run);
    return {
        run: recovered.run,
        checkpoint: updated,
        newEvents: fresh,
        terminal: isTerminalRunStage(updated.stage),
    };
}

/**
 * Inspect the durable checkpoint without automatically re-submitting an
 * uncertain request. The caller decides whether to offer a retry button.
 */
export async function inspectWorkspaceRun(
    options: InspectRunRecoveryOptions,
): Promise<RecoveryInspection> {
    assertScope(options.scope);
    if (!options.recovery) return { status: "none" };
    if (options.recovery.kind === "submitting") {
        return {
            status: "submission-unconfirmed",
            submission: options.recovery,
            reason: "The previous submission did not return a run ID. Retry explicitly using its saved idempotency key.",
        };
    }
    return {
        status: "recovered", state: await recoverKnownRun({
            scope: options.scope,
            checkpoint: options.recovery,
            signal: options.signal,
        })
    };
}

function maxRetries(value: number | undefined): number {
    if (value === undefined) return DEFAULT_RECONNECT_ATTEMPTS;
    if (!Number.isInteger(value) || value < 0 || value > 10) {
        throw new RunRecoveryError("invalid_checkpoint", "Reconnect attempts must be between 0 and 10.");
    }
    return value;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) { assertNotAborted(signal); return; }
        const timeout = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timeout);
            signal?.removeEventListener("abort", onAbort);
            try { assertNotAborted(signal); } catch (error) { reject(error); }
        };
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}

function responseStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;
    const candidate = error as { status?: unknown; response?: { status?: unknown } };
    const code = candidate.response?.status ?? candidate.status;
    return typeof code === "number" ? code : undefined;
}

/**
 * Replay events, then follow the existing run until the backend confirms a
 * terminal status. Reconnect using the last applied event sequence.
 *
 * Does not mutate stored snapshots. onProgress receives immutable checkpoint
 * replacements; the hook/controller will persist them together with the
 * latest chat and preview state.
 */
export async function trackRecoveredRun(options: TrackRunRecoveryOptions): Promise<RecoveredRunState> {
    const { scope, signal, onProgress } = options;
    const retries = maxRetries(options.maxReconnectAttempts);
    const interval = options.reconnectDelayMs ?? DEFAULT_RECONNECT_DELAY_MS;
    if (!Number.isFinite(interval) || interval < 0 || interval > 30_000) {
        throw new RunRecoveryError("invalid_checkpoint", "Invalid reconnect delay.");
    }

    let state = await recoverKnownRun({ scope, checkpoint: options.checkpoint, signal });
    onProgress?.(state);
    if (state.terminal) return state;

    for (let attempt = 0; attempt <= retries; attempt++) {
        assertNotAborted(signal);
        const controller = new AbortController();
        const forwardAbort = () => controller.abort();
        signal?.addEventListener("abort", forwardAbort, { once: true });
        let terminalEventSeen = false;
        let streamError: unknown = null;
        let progressError: unknown = null;

        try {
            await streamOrchestratorEventsApi({
                runId: state.checkpoint.runId,
                after: state.checkpoint.lastEventSequence,
                signal: controller.signal,
                onEvent: (event) => {
                    // The server may replay a previously saved event at reconnect.
                    const merged = mergeEvents(state.checkpoint, [event]);
                    if (merged.fresh.length === 0) return;
                    const eventReportsTerminal = isTerminalRunStage(merged.checkpoint.stage);
                    state = {
                        ...state,
                        checkpoint: merged.checkpoint,
                        newEvents: merged.fresh,
                        // A terminal SSE event is not proof of a completed server run.
                        // Only mark terminal after the authoritative GET succeeds.
                        terminal: false,
                    };
                    try {
                        onProgress?.(state);
                    } catch (error) {
                        progressError = error;
                        controller.abort();
                        return;
                    }
                    if (eventReportsTerminal) {
                        terminalEventSeen = true;
                        controller.abort(); // Stop streaming; verify final status with GET.
                    }
                },
            });
        } catch (error: unknown) {
            if (signal?.aborted) assertNotAborted(signal);
            if (!(terminalEventSeen && controller.signal.aborted)) streamError = error;
        } finally {
            signal?.removeEventListener("abort", forwardAbort);
            controller.abort();
        }

        // Never conceal an application state/persistence callback failure behind
        // a successful network retry.
        if (progressError !== null) throw progressError;

        // Always verify authoritative run status, including after a stream error.
        // This also catches events that arrived between the stream closing and GET.
        try {
            const refreshed = await recoverKnownRun({
                scope, checkpoint: state.checkpoint, signal,
            });
            state = refreshed;
            onProgress?.(state);
            if (state.terminal) return state;
        } catch (error) {
            if (signal?.aborted) assertNotAborted(signal);
            if (error instanceof RunRecoveryError && error.code !== "connection_lost") throw error;
            const status = responseStatus(error);
            if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) throw error;
            streamError = error;
        }

        const status = responseStatus(streamError);
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
            throw streamError;
        }
        if (streamError instanceof RunRecoveryError && streamError.code !== "connection_lost") {
            throw streamError;
        }
        if (attempt === retries) {
            throw new RunRecoveryError(
                "connection_lost",
                "Generation tracking was interrupted. The existing run can be resumed again from the saved event sequence.",
                state,
            );
        }
        const wait = Math.min(MAX_RECONNECT_DELAY_MS, interval * 2 ** attempt);
        await delay(wait, signal);
    }

    // The loop always returns or throws; satisfy exhaustive analysis.
    throw new RunRecoveryError("connection_lost", "Generation tracking stopped unexpectedly.", state);
}

/**
 * Explicit user-initiated retry ONLY. Reuse the original idempotency key so
 * the backend can return an already-created run if the response was lost.
 * Never generate a new key, and do not automatically invoke this on restore.
 */
export async function retryUnconfirmedSubmission(
    options: RetryPendingSubmissionOptions,
): Promise<RecoveredRunState> {
    const { scope, submission, signal } = options;
    assertScope(scope);
    assertNotAborted(signal);
    if (options.confirmRetry !== true) {
        throw new RunRecoveryError("invalid_checkpoint", "Retry requires explicit confirmation.");
    }
    if (!submission.prompt?.trim() || !submission.idempotencyKey ||
        submission.idempotencyKey.length < 8 || submission.idempotencyKey.length > 200) {
        throw new RunRecoveryError("invalid_checkpoint", "The previous submission checkpoint is incomplete.");
    }

    const run = await submitOrchestratorRunApi({
        projectId: scope.projectId,
        prompt: submission.prompt,
        quality: submission.quality,
        idempotencyKey: submission.idempotencyKey,
        baseRunId: submission.baseRunId,
        signal,
    });
    assertNotAborted(signal);
    assertRunScope(run, scope);
    if (run.idempotency_key !== submission.idempotencyKey) {
        throw new RunRecoveryError("invalid_response", "The server returned a different submission key.");
    }
    const checkpoint = makeCheckpoint(run);
    return {
        run,
        checkpoint,
        newEvents: [],
        terminal: isTerminalRunStage(checkpoint.stage),
    };
}

export default {
    inspectWorkspaceRun,
    recoverKnownRun,
    trackRecoveredRun,
    retryUnconfirmedSubmission,
};
