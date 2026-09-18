import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Unplug,
} from "lucide-react";

import {
  disconnectGmail,
  getGmailMessages,
  getGmailProfile,
} from "../../api/connectorsApi";

interface GmailConnectorPanelProps {
  email: string;
  onDisconnected?: () => void;
}

interface GmailMessage {
  id: string;
  threadId?: string;
}

interface GmailMessagesResponse {
  messages?: GmailMessage[];
}

const GmailConnectorPanel = ({
  email,
  onDisconnected,
}: GmailConnectorPanelProps) => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [messages, setMessages] =
    useState<GmailMessage[]>([]);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [disconnecting, setDisconnecting] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD GMAIL MESSAGES
  // ==========================================================

  const loadMessages =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const result =
            (await getGmailMessages()) as GmailMessagesResponse;

          setMessages(
            result.messages ?? []
          );
        } catch (err: unknown) {
          console.error(
            "GMAIL LOAD ERROR:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load Gmail."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadMessages();

    void getGmailProfile().catch(
      (err: unknown) => {
        console.error(
          "GMAIL PROFILE ERROR:",
          err
        );
      }
    );
  }, [loadMessages]);


  // ==========================================================
  // SEARCH GMAIL
  // ==========================================================

  const handleSearch =
    async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          (await getGmailMessages(
            query.trim()
          )) as GmailMessagesResponse;

        setMessages(
          result.messages ?? []
        );
      } catch (err: unknown) {
        console.error(
          "GMAIL SEARCH ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Search failed."
        );
      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // DISCONNECT GMAIL
  // ==========================================================

  const handleDisconnect =
    async () => {
      const confirmed =
        window.confirm(
          "Disconnect this Gmail account?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDisconnecting(true);
        setError("");

        await disconnectGmail();

        setMessages([]);

        onDisconnected?.();
      } catch (err: unknown) {
        console.error(
          "GMAIL DISCONNECT ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to disconnect Gmail."
        );
      } finally {
        setDisconnecting(false);
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-slate-200
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-red-50
            "
          >
            <Mail
              size={19}
              className="text-red-500"
            />
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              Gmail
            </p>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
            >
              {email}
            </p>
          </div>

        </div>


        {/* ACTIONS */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <button
            type="button"
            onClick={() => {
              void loadMessages();
            }}
            disabled={loading}
            className="
              flex
              h-9
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              px-3
              text-xs
              text-slate-600
              transition
              hover:bg-slate-50
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={13}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>


          <button
            type="button"
            onClick={() => {
              void handleDisconnect();
            }}
            disabled={disconnecting}
            className="
              flex
              h-9
              items-center
              gap-2
              rounded-lg
              border
              border-red-100
              px-3
              text-xs
              text-red-500
              transition
              hover:bg-red-50
              disabled:opacity-50
            "
          >

            <Unplug size={13} />

            {disconnecting
              ? "Disconnecting..."
              : "Disconnect"}

          </button>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div
        className="
          border-b
          border-slate-200
          p-4
        "
      >

        <div
          className="
            flex
            gap-2
          "
        >

          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              px-3
            "
          >

            <Search
              size={15}
              className="text-slate-400"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  void handleSearch();
                }
              }}
              placeholder="Search Gmail..."
              className="
                min-w-0
                flex-1
                bg-transparent
                py-2.5
                text-sm
                text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

          </div>


          <button
            type="button"
            onClick={() => {
              void handleSearch();
            }}
            disabled={loading}
            className="
              rounded-lg
              bg-slate-900
              px-4
              text-sm
              font-medium
              text-white
              transition
              hover:bg-slate-800
              disabled:opacity-50
            "
          >
            Search
          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className="
            mx-4
            mt-4
            rounded-lg
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-xs
            text-red-600
          "
        >
          {error}
        </div>
      )}


      {/* ======================================================
          MESSAGES
      ====================================================== */}

      <div className="p-4">

        {loading ? (

          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              py-12
              text-sm
              text-slate-400
            "
          >

            <Loader2
              size={17}
              className="animate-spin"
            />

            Loading Gmail...

          </div>

        ) : messages.length === 0 ? (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              py-12
              text-center
            "
          >

            <Mail
              size={24}
              className="text-slate-300"
            />

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-slate-600
              "
            >
              No emails found
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Try another Gmail search.
            </p>

          </div>

        ) : (

          <div
            className="
              divide-y
              divide-slate-100
              rounded-xl
              border
              border-slate-100
            "
          >

            {messages.map(
              (message) => (
                <div
                  key={message.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    px-4
                    py-3.5
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >

                    <Mail
                      size={15}
                      className="
                        shrink-0
                        text-slate-400
                      "
                    />

                    <div className="min-w-0">

                      <p
                        className="
                          truncate
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        Gmail message
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-xs
                          text-slate-400
                        "
                      >
                        ID: {message.id}
                      </p>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default GmailConnectorPanel;