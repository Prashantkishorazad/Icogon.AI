import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  Unplug,
} from "lucide-react";

import {
  useSearchParams,
} from "react-router-dom";

import ConnectorCard from "../../components/connectors/ConnectorCard";
import GmailConnectionModal from "../../components/connectors/GmailConnectionModal";
import GmailConnectorPanel from "../../components/connectors/GmailConnectorPanel";

// ==========================================================
// TYPES
// ==========================================================

interface GmailStatus {
  connected: boolean;
  email: string | null;
}

interface GmailStatusResponse {
  connected?: boolean;
  email?: string | null;
}

// ==========================================================
// GMAIL STATUS API
// ==========================================================
//
// This replaces the missing:
// ../../api/connectorsApi
//
// If your backend endpoint is different, change ONLY
// GMAIL_STATUS_ENDPOINT below.
// ==========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

const GMAIL_STATUS_ENDPOINT =
  `${API_BASE_URL}/api/connectors/gmail/status`;

const getGmailStatus =
  async (): Promise<GmailStatusResponse> => {
    const response = await fetch(
      GMAIL_STATUS_ENDPOINT,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gmail status request failed: ${response.status}`
      );
    }

    return response.json();
  };


// ==========================================================
// COMPONENT
// ==========================================================

const ConnectorsPage = () => {

  // ========================================================
  // URL SEARCH PARAMS
  // ========================================================

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  // ========================================================
  // GMAIL STATUS
  // ========================================================

  const [
    gmailStatus,
    setGmailStatus,
  ] = useState<GmailStatus>({
    connected: false,
    email: null,
  });


  // ========================================================
  // LOADING
  // ========================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ========================================================
  // MODAL
  // ========================================================

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  // ========================================================
  // LOAD GMAIL STATUS
  // ========================================================

  const loadGmailStatus =
    useCallback(async () => {

      try {
        setLoading(true);

        const status =
          await getGmailStatus();

        setGmailStatus({
          connected:
            Boolean(
              status.connected
            ),

          email:
            status.email ||
            null,
        });

      } catch (error) {

        console.error(
          "GMAIL STATUS ERROR:",
          error
        );

        setGmailStatus({
          connected: false,
          email: null,
        });

      } finally {

        setLoading(false);
      }

    }, []);


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    void loadGmailStatus();
  }, [loadGmailStatus]);


  // ========================================================
  // GOOGLE / GMAIL CALLBACK
  // ========================================================

  useEffect(() => {

    const result =
      searchParams.get("gmail");

    // No OAuth result in URL
    if (!result) {
      return;
    }


    // Gmail connected successfully
    if (result === "connected") {
      void loadGmailStatus();
    }


    // ======================================================
    // REMOVE OAUTH PARAMETERS FROM URL
    // ======================================================

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    nextParams.delete("gmail");
    nextParams.delete("email");
    nextParams.delete("message");


    setSearchParams(
      nextParams,
      {
        replace: true,
      }
    );

  }, [
    searchParams,
    setSearchParams,
    loadGmailStatus,
  ]);


  // ========================================================
  // DISCONNECTED
  // ========================================================

  const handleDisconnected =
    useCallback(() => {

      setGmailStatus({
        connected: false,
        email: null,
      });

    }, []);


  // ========================================================
  // LOADING SCREEN
  // ========================================================

  if (loading) {

    return (
      <div
        className="
          min-h-screen
          bg-[#faf9f6]
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            text-sm
            text-slate-500
          "
        >

          <Loader2
            size={18}
            className="animate-spin"
          />

          Loading connectors...

        </div>

      </div>
    );
  }


  // ========================================================
  // MAIN UI
  // ========================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#faf9f6]
        text-slate-900
      "
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header
        className="
          border-b
          border-slate-200
          bg-white
        "
      >

        <div
          className="
            mx-auto
            max-w-[1180px]
            px-5
            py-8
            md:px-8
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* CONNECTOR ICON */}

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-slate-900
              "
            >

              <Unplug
                size={20}
                className="text-white"
              />

            </div>


            {/* TITLE */}

            <div>

              <h1
                className="
                  text-2xl
                  font-semibold
                  tracking-tight
                "
              >
                Connectors
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Connect your tools with
                ICOGON AI.
              </p>

            </div>

          </div>

        </div>

      </header>


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main
        className="
          mx-auto
          max-w-[1180px]
          px-5
          py-8
          md:px-8
          md:py-10
        "
      >

        {/* ==================================================
            CONNECTED SUCCESS MESSAGE
        ================================================== */}

        {gmailStatus.connected && (

          <div
            className="
              mb-6
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-emerald-200
              bg-emerald-50
              px-4
              py-3
            "
          >

            <CheckCircle2
              size={18}
              className="
                mt-0.5
                shrink-0
                text-emerald-600
              "
            />

            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-emerald-800
                "
              >
                Gmail connected successfully
              </p>


              {gmailStatus.email && (

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-emerald-600
                  "
                >
                  {gmailStatus.email}
                </p>

              )}

            </div>

          </div>

        )}


        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="mb-6">

          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Available connectors
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Connect external services to
            power your ICOGON workflows.
          </p>

        </div>


        {/* ==================================================
            GMAIL CONNECTOR
        ================================================== */}

        {!gmailStatus.connected ? (

          <ConnectorCard
            connected={false}
            email={null}
            onConnect={() =>
              setModalOpen(true)
            }
          />

        ) : (

          <GmailConnectorPanel
            email={
              gmailStatus.email ||
              "Gmail account"
            }
            onDisconnected={
              handleDisconnected
            }
          />

        )}

      </main>


      {/* ====================================================
          GMAIL CONNECTION MODAL
      ==================================================== */}

      <GmailConnectionModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
      />

    </div>
  );
};


// ==========================================================
// EXPORT
// ==========================================================

export default ConnectorsPage;