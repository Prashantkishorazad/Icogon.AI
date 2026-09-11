import { useEffect, useRef, useState } from "react";
import {
  Paperclip,
  Sparkles,
  Mic,
  ArrowUp,
  Image as ImageIcon,
  Plus,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const suggestions = [
  "Build an AI SaaS dashboard",
  "Create an E-commerce website",
  "Build a social media app",
];

/* ================= ANIMATED TEXT ================= */

const animatedPrompts = [
  "What do you want to build?",
  "Build an AI SaaS dashboard...",
  "Create an e-commerce website...",
  "Build a social media application...",
];

const PromptInput = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  /* Typing Animation States */

  const [animatedText, setAnimatedText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  /* ================= TYPING ANIMATION ================= */

  useEffect(() => {
    if (prompt.length > 0) {
      return;
    }

    const currentText = animatedPrompts[promptIndex];

    if (isWaiting) {
      const waitTimeout = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, 1500);

      return () => clearTimeout(waitTimeout);
    }

    const speed = isDeleting ? 25 : 45;

    const timeout = setTimeout(() => {
      /* Typing */

      if (!isDeleting) {
        if (animatedText.length < currentText.length) {
          setAnimatedText(
            currentText.slice(0, animatedText.length + 1)
          );
        } else {
          setIsWaiting(true);
        }
      }

      /* Deleting */

      else {
        if (animatedText.length > 0) {
          setAnimatedText(
            currentText.slice(0, animatedText.length - 1)
          );
        } else {
          setIsDeleting(false);

          setPromptIndex(
            (previousIndex) =>
              (previousIndex + 1) % animatedPrompts.length
          );
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [
    animatedText,
    promptIndex,
    isDeleting,
    isWaiting,
    prompt,
  ]);

  /* ================= GENERATE ================= */

  const handleGenerate = () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isGenerating) return;

    setIsGenerating(true);

    navigate("/builder", {
      state: {
        prompt: trimmedPrompt,
      },
    });
  };

  /* ================= ENHANCE PROMPT ================= */

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setPrompt(
        "Build a modern, responsive and production-ready application with a beautiful UI, authentication and scalable architecture."
      );
      return;
    }

    setPrompt(
      `${prompt.trim()}

Make the design modern, responsive, professional and production-ready. Include a beautiful user interface and clean architecture.`
    );
  };

  /* ================= KEYBOARD ================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      handleGenerate();
    }
  };

  /* ================= FILE ================= */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log("Selected file:", file);
  };

  /* ================= IMAGE ================= */

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const image = event.target.files?.[0];

    if (!image) return;

    console.log("Selected image:", image);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.3,
      }}
      className="mt-14 w-full max-w-[800px]"
    >
      {/* ================= PROMPT BOX ================= */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[38px]
          border
          border-slate-300
          bg-white/95
          shadow-[0_20px_60px_rgba(15,23,42,0.12)]
          backdrop-blur-xl
        "
      >
        {/* ================= INPUT AREA ================= */}

        <div className="relative h-[125px] px-8 pt-7">
          <textarea
            value={prompt}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder=""
            className="
              absolute
              inset-0
              h-full
              w-full
              resize-none
              bg-transparent
              px-8
              pt-7
              text-[22px]
              leading-relaxed
              text-slate-800
              outline-none
              md:text-[24px]
            "
          />

          {/* ================= ANIMATED TEXT ================= */}

          {!prompt && (
            <div
              className="
                pointer-events-none
                absolute
                left-8
                top-7
                flex
                items-center
                whitespace-nowrap
                text-[22px]
                font-normal
                tracking-tight
                text-slate-500
                md:text-[24px]
              "
            >
              {animatedText}

              {/* Blinking Cursor */}

              <motion.span
                animate={{
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
                className="
                  ml-[3px]
                  inline-block
                  h-[25px]
                  w-[2px]
                  bg-slate-400
                "
              />
            </div>
          )}
        </div>

        {/* ================= BOTTOM TOOLBAR ================= */}

        <div
          className="
            relative
            flex
            items-center
            justify-between
            px-6
            pb-5
          "
        >
          {/* LEFT SIDE */}

          <div className="flex items-center gap-3">

            {/* Hidden File */}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Hidden Image */}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* PLUS */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                flex
                h-[48px]
                w-[48px]
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-slate-900
              "
            >
              <Plus size={24} strokeWidth={1.5} />
            </button>

            {/* IMAGE */}

            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                text-slate-400
                transition
                hover:text-slate-800
              "
            >
              <ImageIcon size={19} />
            </button>

            {/* FILE */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                text-slate-400
                transition
                hover:text-slate-800
              "
            >
              <Paperclip size={19} />
            </button>

            {/* ENHANCE */}

            <button
              type="button"
              onClick={handleEnhancePrompt}
              className="
                hidden
                items-center
                gap-2
                text-sm
                font-medium
                text-slate-500
                transition
                hover:text-blue-600
                sm:flex
              "
            >
              <Sparkles size={17} />

              Enhance
            </button>

          </div>

          {/* ================= RIGHT SIDE ================= */}

          <div className="flex items-center gap-4">

            {/* BUILD */}

            <button
              type="button"
              className="
                flex
                items-center
                gap-2
                text-[17px]
                font-medium
                text-slate-600
                transition
                hover:text-slate-900
              "
            >
              Build

              <ChevronDown
                size={18}
                strokeWidth={1.7}
              />
            </button>

            {/* MIC */}

            <button
              type="button"
              title="Voice input"
              className="
                text-slate-500
                transition
                hover:text-slate-900
              "
            >
              <Mic
                size={22}
                strokeWidth={1.7}
              />
            </button>

            {/* GENERATE */}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={
                !prompt.trim() || isGenerating
              }
              className="
                flex
                h-[48px]
                w-[48px]
                items-center
                justify-center
                rounded-full
                bg-slate-800
                text-white
                shadow-lg
                transition
                hover:bg-slate-950
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isGenerating ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ArrowUp size={21} />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* ================= SUGGESTIONS ================= */}

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPrompt(item)}
            className="
              rounded-full
              border
              border-slate-200
              bg-white/60
              px-5
              py-2.5
              text-sm
              text-slate-600
              transition
              hover:border-blue-400
              hover:bg-white
              hover:text-slate-900
            "
          >
            {item}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default PromptInput;