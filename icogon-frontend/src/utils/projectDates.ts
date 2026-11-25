
type ProjectActivityType = "created" | "edited" | "viewed";

interface DiscoveryProject {
    id: string;
    created_at?: DateInput;
    updated_at?: DateInput;
    last_opened_at?: DateInput;
    last_opened?: DateInput;
}

type ProjectHistory = Record<
    string,
    { viewedAt?: DateInput } | undefined
>;

/* =========================================================
   CONSTANTS
========================================================= */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/* =========================================================
   TYPES
========================================================= */

export type DateInput =
    | string
    | number
    | Date
    | null
    | undefined;

interface RelativeDateOptions {
    now?: Date;
    fallback?: string;
    locale?: string;
}

/* =========================================================
   SAFE DATE PARSER
========================================================= */

export const parseProjectDate = (
    value: DateInput,
): Date | null => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const date =
        value instanceof Date
            ? new Date(value.getTime())
            : new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
};

/* =========================================================
   TIMESTAMP
========================================================= */

export const getTimestamp = (
    value: DateInput,
): number => {
    return parseProjectDate(value)?.getTime() ?? 0;
};

/* =========================================================
   ABSOLUTE DATE FORMAT
========================================================= */

export const formatProjectDate = (
    value: DateInput,
    locale?: string,
): string => {
    const date = parseProjectDate(value);

    if (!date) return "—";

    return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

/* =========================================================
   EXACT DATE AND TIME
========================================================= */

export const formatProjectDateTime = (
    value: DateInput,
    locale?: string,
): string => {
    const date = parseProjectDate(value);

    if (!date) return "—";

    return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
};

/* =========================================================
   LOCAL CALENDAR DAY
   Prevent daylight-saving related date errors.
========================================================= */

const getCalendarDay = (
    date: Date,
): number => {
    return Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
};

/* =========================================================
   INTELLIGENT RELATIVE DATE
========================================================= */

export const formatRelativeDate = (
    value: DateInput,
    options: RelativeDateOptions = {},
): string => {
    const {
        now = new Date(),
        fallback = "—",
        locale,
    } = options;

    const date = parseProjectDate(value);

    if (!date) return fallback;

    const difference =
        now.getTime() - date.getTime();

    const calendarDays = Math.round(
        (
            getCalendarDay(now) -
            getCalendarDay(date)
        ) / DAY,
    );

    const formatter = new Intl.RelativeTimeFormat(
        locale,
        {
            numeric: "always",
            style: "long",
        },
    );

    // Handle future timestamps.
    if (difference < 0) {
        if (Math.abs(difference) < MINUTE) {
            return "Just now";
        }

        return formatProjectDate(date, locale);
    }

    // Less than one minute.
    if (difference < MINUTE) {
        return "Just now";
    }

    // Activity from previous calendar days.
    if (calendarDays === 1) {
        return "Yesterday";
    }

    if (calendarDays >= 2 && calendarDays < 7) {
        return formatter.format(
            -calendarDays,
            "day",
        );
    }

    // Less than one hour.
    if (difference < HOUR) {
        return formatter.format(
            -Math.floor(difference / MINUTE),
            "minute",
        );
    }

    // Activity from the current calendar day.
    if (calendarDays === 0) {
        return formatter.format(
            -Math.floor(difference / HOUR),
            "hour",
        );
    }

    // Weeks.
    if (calendarDays < 30) {
        return formatter.format(
            -Math.floor(calendarDays / 7),
            "week",
        );
    }

    // Older activity uses an exact calendar date.
    return formatProjectDate(date, locale);
};

/* =========================================================
   PROJECT VIEWING HISTORY
========================================================= */

export const getProjectLastViewedAt = (
    project: DiscoveryProject,
    history?: ProjectHistory,
): string | null => {
    const candidates = [
        history?.[project.id]?.viewedAt,
        project.last_opened_at,
        project.last_opened,
    ];

    // Prefer the latest valid viewing timestamp.
    const validDates = candidates
        .map(parseProjectDate)
        .filter(
            (date): date is Date => date !== null,
        )
        .sort(
            (first, second) =>
                second.getTime() - first.getTime(),
        );

    return validDates[0]?.toISOString() ?? null;
};

/* =========================================================
   PROJECT ACTIVITY DATE
========================================================= */

export const getProjectActivityDate = (
    project: DiscoveryProject,
    activityType: ProjectActivityType = "edited",
    history?: ProjectHistory,
): string | null => {
    switch (activityType) {
        case "created":
            return (
                parseProjectDate(project.created_at)
                    ?.toISOString() ?? null
            );

        case "viewed":
            return getProjectLastViewedAt(
                project,
                history,
            );

        case "edited":
        default:
            return (
                parseProjectDate(project.updated_at)
                    ?.toISOString() ?? null
            );
    }
};

/* =========================================================
   PROJECT ACTIVITY LABEL
========================================================= */

export const formatProjectActivity = (
    project: DiscoveryProject,
    activityType: ProjectActivityType = "edited",
    history?: ProjectHistory,
): string => {
    const value = getProjectActivityDate(
        project,
        activityType,
        history,
    );

    if (!value) {
        switch (activityType) {
            case "viewed":
                return "No viewing history";

            case "created":
                return "Creation date unavailable";

            default:
                return "Edit date unavailable";
        }
    }

    const labels: Record<
        ProjectActivityType,
        string
    > = {
        created: "Created",
        edited: "Edited",
        viewed: "Viewed",
    };

    const relativeDate = formatRelativeDate(value);

    return `${labels[activityType]} ${relativeDate.toLowerCase()}`;
};

/* =========================================================
   PROJECT SORTING — LAST EDITED
========================================================= */

export const sortProjectsByUpdated = (
    projects: DiscoveryProject[],
): DiscoveryProject[] => {
    return [...projects].sort(
        (first, second) =>
            getTimestamp(
                second.updated_at || second.created_at,
            ) -
            getTimestamp(
                first.updated_at || first.created_at,
            ),
    );
};

/* =========================================================
   PROJECT SORTING — CREATED
========================================================= */

export const sortProjectsByCreated = (
    projects: DiscoveryProject[],
): DiscoveryProject[] => {
    return [...projects].sort(
        (first, second) =>
            getTimestamp(second.created_at) -
            getTimestamp(first.created_at),
    );
};

/* =========================================================
   PROJECT SORTING — RECENTLY VIEWED
========================================================= */

export const sortProjectsByViewed = (
    projects: DiscoveryProject[],
    history?: ProjectHistory,
): DiscoveryProject[] => {
    return [...projects]
        .filter(
            (project) =>
                getProjectLastViewedAt(
                    project,
                    history,
                ) !== null,
        )
        .sort(
            (first, second) =>
                getTimestamp(
                    getProjectLastViewedAt(second, history),
                ) -
                getTimestamp(
                    getProjectLastViewedAt(first, history),
                ),
        );
};
