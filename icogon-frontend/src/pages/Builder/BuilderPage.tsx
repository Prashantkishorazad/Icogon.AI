import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  createProjectApi,
} from "../../api/projectApi";


const BuilderPage = () => {

  const navigate = useNavigate();

  const [
    searchParams,
  ] = useSearchParams();


  // =====================================================
  // FORM STATE
  // =====================================================

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");


  // =====================================================
  // UI STATE
  // =====================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =====================================================
  // GET PROMPT FROM DASHBOARD
  // =====================================================

  useEffect(() => {

    const dashboardPrompt =
      searchParams.get("prompt");


    if (dashboardPrompt) {

      setDescription(
        dashboardPrompt
      );

    }

  }, [searchParams]);


  // =====================================================
  // CREATE PROJECT
  // =====================================================

  const handleCreateProject = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    const cleanName =
      name.trim();

    const cleanDescription =
      description.trim();


    if (!cleanName) {

      setError(
        "Project name is required."
      );

      return;
    }


    if (!cleanDescription) {

      setError(
        "Please describe what you want to build."
      );

      return;
    }


    // -----------------------------------------------
    // CREATE
    // -----------------------------------------------

    try {

      setLoading(true);

      setError("");


      const project =
        await createProjectApi({

          name: cleanName,

          description:
            cleanDescription,

        });


      console.log(
        "Project created:",
        project
      );


      /*
       * IMPORTANT
       *
       * Phase 2:
       *
       * Project is created only.
       *
       * AI generation will be connected later:
       *
       * POST /orchestrator/runs
       *
       */


      navigate(
        `/builder/${project.id}`
      );


    } catch (err: any) {

      console.error(
        "Create project error:",
        err
      );


      setError(

        err?.response?.data?.detail ||

        err?.response?.data?.message ||

        err?.message ||

        "Failed to create project. Please try again."

      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // CHARACTER COUNT
  // =====================================================

  const descriptionLength =
    description.length;


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#050505]
        text-white
      "
    >

      {/* =================================================
          TOP NAVIGATION
      ================================================= */}

      <header
        className="
          sticky
          top-0
          z-50

          h-[72px]

          border-b
          border-white/[0.07]

          bg-[#050505]/90

          backdrop-blur-xl
        "
      >

        <div
          className="
            mx-auto

            flex
            h-full

            max-w-[1400px]

            items-center
            justify-between

            px-5

            lg:px-8
          "
        >

          {/* LEFT */}

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="
                flex
                h-9
                w-9

                items-center
                justify-center

                rounded-lg

                border
                border-white/[0.07]

                bg-white/[0.02]

                text-slate-500

                transition

                hover:bg-white/[0.06]
                hover:text-white
              "
              title="Back to dashboard"
            >

              <ArrowLeft
                size={17}
              />

            </button>


            {/* LOGO */}

            <div
              className="
                flex
                items-center
                gap-2.5
              "
            >

              <div
                className="
                  flex
                  h-8
                  w-8

                  items-center
                  justify-center

                  rounded-lg

                  bg-gradient-to-br
                  from-pink-500
                  via-purple-500
                  to-cyan-400

                  shadow-lg
                  shadow-purple-500/10
                "
              >

                <div
                  className="
                    h-3
                    w-3

                    rounded-full

                    bg-white
                  "
                />

              </div>


              <span
                className="
                  text-sm
                  font-bold
                  tracking-wide

                  text-white
                "
              >
                ICOGON
              </span>

            </div>

          </div>


          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >



          </div>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          relative

          min-h-[calc(100vh-72px)]

          overflow-hidden
        "
      >

        {/* BACKGROUND GLOW */}

        <div
          className="
            pointer-events-none

            absolute
            left-1/2
            top-[-180px]

            h-[500px]
            w-[700px]

            -translate-x-1/2

            rounded-full

            bg-cyan-500/[0.035]

            blur-[120px]
          "
        />


        <div
          className="
            pointer-events-none

            absolute
            right-[-200px]
            top-[35%]

            h-[400px]
            w-[400px]

            rounded-full

            bg-purple-500/[0.025]

            blur-[120px]
          "
        />


        <div
          className="
            relative
            z-10

            mx-auto

            max-w-[1050px]

            px-5
            py-12

            md:py-16

            lg:px-8
            lg:py-20
          "
        >

          {/* =================================================
              PAGE INTRO
          ================================================= */}

          <div
            className="
              mx-auto

              max-w-3xl

              text-center
            "
          >

            {/* BADGE */}



            {/* TITLE */}

            <h1
              className="
                mt-6

                text-3xl
                font-semibold
                tracking-tight

                text-white

                sm:text-4xl
                md:text-5xl
              "
            >
              Create a new project
            </h1>


            {/* DESCRIPTION */}

            <p
              className="
                mx-auto
                mt-4

                max-w-2xl

                text-sm
                leading-6

                text-slate-500

                md:text-base
              "
            >
              Tell ICOGON AI what you want to
              build. We'll use your idea as the
              foundation for your project.
            </p>

          </div>


          {/* =================================================
              FORM CARD
          ================================================= */}

          <form
            onSubmit={
              handleCreateProject
            }

            className="
              mx-auto

              mt-10

              max-w-4xl
            "
          >

            <div
              className="
                overflow-hidden

                rounded-[24px]

                border
                border-white/[0.08]

                bg-[#0a0a0a]

                shadow-2xl
                shadow-black/40
              "
            >

              {/* =================================================
                  PROJECT NAME
              ================================================= */}

              <div
                className="
                  border-b
                  border-white/[0.06]

                  p-6

                  md:p-8
                "
              >

                <label
                  htmlFor="project-name"

                  className="
                    flex
                    items-center
                    gap-2

                    text-sm
                    font-medium

                    text-slate-300
                  "
                >

                  <FileText
                    size={16}
                    className="
                      text-slate-500
                    "
                  />

                  Project name

                </label>


                <p
                  className="
                    mt-1.5

                    text-xs

                    text-slate-600
                  "
                >
                  Give your project a clear name.
                </p>


                <input
                  id="project-name"

                  type="text"

                  value={name}

                  onChange={(e) => {

                    setName(
                      e.target.value
                    );

                    if (error) {
                      setError("");
                    }

                  }}

                  placeholder="My Restaurant CRM"

                  autoComplete="off"

                  className="
                    mt-4

                    h-12
                    w-full

                    rounded-xl

                    border
                    border-white/[0.08]

                    bg-[#070707]

                    px-4

                    text-sm

                    text-white

                    outline-none

                    placeholder:text-slate-700

                    transition

                    focus:border-cyan-500/30
                    focus:bg-[#090909]

                    focus:ring-4
                    focus:ring-cyan-500/[0.04]
                  "
                />

              </div>


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div
                className="
                  p-6

                  md:p-8
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <label
                      htmlFor="project-description"

                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        font-medium

                        text-slate-300
                      "
                    >

                      <Sparkles
                        size={16}
                        className="
                          text-cyan-400
                        "
                      />

                      What do you want to build?

                    </label>


                    <p
                      className="
                        mt-1.5

                        text-xs

                        text-slate-600
                      "
                    >
                      Describe your product, website,
                      features and requirements.
                    </p>

                  </div>


                  <span
                    className="
                      hidden

                      text-[11px]

                      text-slate-700

                      sm:block
                    "
                  >
                    {descriptionLength} characters
                  </span>

                </div>


                {/* TEXTAREA */}

                <div
                  className="
                    relative
                    mt-4
                  "
                >

                  <textarea
                    id="project-description"

                    value={description}

                    onChange={(e) => {

                      setDescription(
                        e.target.value
                      );

                      if (error) {
                        setError("");
                      }

                    }}

                    placeholder={`Example:

Build a modern restaurant management website with CRM, employee attendance, item listing, orders, analytics dashboard, customer management and an admin panel.`}

                    rows={10}

                    className="
                      min-h-[240px]

                      w-full

                      resize-y

                      rounded-2xl

                      border
                      border-white/[0.08]

                      bg-[#070707]

                      px-5
                      py-5

                      text-sm
                      leading-7

                      text-white

                      outline-none

                      placeholder:text-slate-700

                      transition

                      focus:border-cyan-500/30

                      focus:ring-4
                      focus:ring-cyan-500/[0.04]
                    "
                  />


                  {/* TEXTAREA BOTTOM */}

                  <div
                    className="
                      pointer-events-none

                      absolute
                      bottom-4
                      left-5
                      right-5

                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span
                      className="
                        flex
                        items-center
                        gap-1.5

                        text-[11px]

                        text-slate-700
                      "
                    >

                      <Lightbulb
                        size={12}
                      />

                      More detail helps AI
                      understand your idea

                    </span>


                    <span
                      className="
                        text-[11px]

                        text-slate-700

                        sm:hidden
                      "
                    >
                      {descriptionLength}
                    </span>

                  </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                  <div
                    className="
                      mt-4

                      flex
                      items-start
                      gap-3

                      rounded-xl

                      border
                      border-red-500/10

                      bg-red-500/[0.04]

                      px-4
                      py-3.5

                      text-sm

                      text-red-400
                    "
                  >

                    <XCircle
                      size={17}
                      className="
                        mt-0.5
                        shrink-0
                      "
                    />

                    <span>
                      {error}
                    </span>

                  </div>

                )}


                {/* =================================================
                    WHAT HAPPENS NEXT
                ================================================= */}

                <div
                  className="
                    mt-6

                    rounded-xl

                    border
                    border-white/[0.05]

                    bg-white/[0.015]

                    p-4
                  "
                >

                  <p
                    className="
                      text-xs
                      font-medium

                      text-slate-400
                    "
                  >
                    What happens next?
                  </p>


                  <div
                    className="
                      mt-3

                      grid
                      gap-3

                      sm:grid-cols-3
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2.5
                      "
                    >

                      <div
                        className="
                          flex
                          h-7
                          w-7

                          shrink-0

                          items-center
                          justify-center

                          rounded-lg

                          bg-cyan-500/[0.08]

                          text-xs

                          text-cyan-400
                        "
                      >
                        1
                      </div>

                      <span
                        className="
                          text-xs

                          text-slate-600
                        "
                      >
                        Create project
                      </span>

                    </div>


                    <div
                      className="
                        flex
                        items-center
                        gap-2.5
                      "
                    >

                      <div
                        className="
                          flex
                          h-7
                          w-7

                          shrink-0

                          items-center
                          justify-center

                          rounded-lg

                          bg-purple-500/[0.08]

                          text-xs

                          text-purple-400
                        "
                      >
                        2
                      </div>

                      <span
                        className="
                          text-xs

                          text-slate-600
                        "
                      >
                        AI plans your idea
                      </span>

                    </div>


                    <div
                      className="
                        flex
                        items-center
                        gap-2.5
                      "
                    >

                      <div
                        className="
                          flex
                          h-7
                          w-7

                          shrink-0

                          items-center
                          justify-center

                          rounded-lg

                          bg-blue-500/[0.08]

                          text-xs

                          text-blue-400
                        "
                      >
                        3
                      </div>

                      <span
                        className="
                          text-xs

                          text-slate-600
                        "
                      >
                        Start building
                      </span>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div
                  className="
                    mt-7

                    flex
                    flex-col-reverse

                    gap-3

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  {/* CANCEL */}

                  <button
                    type="button"

                    onClick={() =>
                      navigate("/dashboard")
                    }

                    disabled={loading}

                    className="
                      rounded-xl

                      px-5
                      py-3

                      text-sm
                      font-medium

                      text-slate-500

                      transition

                      hover:bg-white/[0.04]
                      hover:text-slate-300

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>


                  {/* CREATE */}

                  <button
                    type="submit"

                    disabled={loading}

                    className="
                      group

                      flex
                      items-center
                      justify-center
                      gap-2.5

                      rounded-xl

                      bg-gradient-to-r
                      from-blue-600
                      to-cyan-500

                      px-6
                      py-3.5

                      text-sm
                      font-semibold

                      text-white

                      shadow-lg
                      shadow-blue-600/20

                      transition-all

                      hover:from-blue-500
                      hover:to-cyan-400

                      hover:shadow-blue-500/25

                      active:scale-[0.98]

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {loading ? (

                      <>
                        <span
                          className="
                            h-4
                            w-4

                            animate-spin

                            rounded-full

                            border-2
                            border-white/30
                            border-t-white
                          "
                        />

                        Creating project...

                      </>

                    ) : (

                      <>

                        <Sparkles
                          size={17}
                        />

                        Create Project

                        <ArrowRight
                          size={17}

                          className="
                            transition

                            group-hover:translate-x-0.5
                          "
                        />

                      </>

                    )}

                  </button>

                </div>

              </div>

            </div>


            {/* =================================================
                SECURITY / INFO
            ================================================= */}

            <div
              className="
                mt-5

                flex
                items-center
                justify-center
                gap-2

                text-center

                text-[11px]

                text-slate-700
              "
            >

              <CheckCircle2
                size={13}
              />

              Your project will be saved to
              your ICOGON workspace.

            </div>

          </form>

        </div>

      </main>

    </div>

  );

};


export default BuilderPage;