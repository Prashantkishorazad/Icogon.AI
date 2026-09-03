import { useRef, useState } from "react";
import {
  Paperclip,
  Sparkles,
  Mic,
  ArrowUp,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const suggestions = [
  "Build an AI SaaS dashboard",
  "Create an E-commerce website",
  "Build a social media app",
];

const PromptInput = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isGenerating) return;

    setIsGenerating(true);

    /*
      CURRENT FLOW:
      Landing Page
          ↓
      User enters prompt
          ↓
      Save prompt temporarily
          ↓
      Navigate to Builder

      FUTURE FLOW:
      Create Project API
          ↓
      Save prompt in database
          ↓
      Create project ID
          ↓
      Navigate to /builder/:projectId
    */

    navigate("/builder", {
      state: {
        prompt: trimmedPrompt,
      },
    });
  };

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

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleGenerate();
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log("Selected file:", file);

    // Future:
    // Upload file to backend
    // Attach file to generation request
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const image = event.target.files?.[0];

    if (!image) return;

    console.log("Selected image:", image);

    // Future:
    // Upload image to backend
    // Use image as design reference
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.3,
      }}
      className="mt-14 w-full max-w-4xl"
    >
      {/* Main Prompt Container */}

      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/80 p-2 shadow-[0_0_80px_rgba(37,99,235,0.12)] backdrop-blur-2xl transition duration-300 hover:border-cyan-500/30">

        {/* Background Glow */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-cyan-500/5" />

        <div className="relative">

          {/* Textarea */}

          <textarea
            rows={4}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to build?

Example: Build a modern AI SaaS dashboard with authentication and analytics."
            className="w-full resize-none bg-transparent px-6 py-5 text-base leading-7 text-white outline-none placeholder:text-slate-500 md:text-lg"
          />

          {/* Hint */}

          <div className="px-6 pb-4 text-left text-xs text-slate-600">
            Press ⌘ + Enter to generate
          </div>

          {/* Bottom Toolbar */}

          <div className="flex flex-col gap-4 border-t border-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Left Tools */}

            <div className="flex flex-wrap items-center gap-2">

              {/* Hidden File Input */}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Hidden Image Input */}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* Attach File */}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <Paperclip size={18} />
              </button>

              {/* Attach Image */}

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                title="Upload image"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <ImageIcon size={18} />
              </button>

              {/* Voice - Future */}

              <button
                type="button"
                title="Voice input coming soon"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <Mic size={18} />
              </button>

              {/* Enhance Prompt */}

              <button
                type="button"
                onClick={handleEnhancePrompt}
                className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-cyan-400 sm:flex"
              >
                <Sparkles size={16} />

                Enhance prompt
              </button>

            </div>

            {/* Generate Button */}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-medium text-white shadow-lg shadow-blue-600/20 transition hover:scale-[1.03] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Opening...
                </>
              ) : (
                <>
                  Generate

                  <ArrowUp size={18} />
                </>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Suggestions */}

      <div className="mt-5 flex flex-wrap justify-center gap-3">

        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPrompt(item)}
            className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-slate-400 transition duration-200 hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-white"
          >
            {item}
          </button>
        ))}

      </div>

    </motion.div>
  );
};

export default PromptInput;