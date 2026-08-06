import { useState } from "react";
import { Paperclip, Sparkles, Mic, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

const PromptInput = () => {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    console.log(prompt);

    // Later
    // Navigate to Builder Page
    // Send prompt to backend
    // Start AI generation
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto mt-16 w-full max-w-5xl"
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl">

        {/* Textarea */}

        <textarea
          rows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the app you want to build...

Examples:

• Build an AI SaaS Dashboard
• Create a Hospital Management System
• Generate an E-Commerce Website
• Build an AI Chatbot using FastAPI & React"
          className="w-full resize-none rounded-t-3xl bg-transparent p-8 text-lg text-white outline-none placeholder:text-slate-500"
        />

        {/* Bottom */}

        <div className="flex flex-col gap-5 border-t border-slate-800 p-6 md:flex-row md:items-center md:justify-between">

          {/* Left */}

          <div className="flex flex-wrap items-center gap-3">

            <button className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-white">

              <Paperclip size={18} />

              Attach

            </button>

            <button className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-white">

              <Mic size={18} />

              Voice

            </button>

            <button className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-white">

              <Sparkles size={18} />

              AI Prompt

            </button>

          </div>

          {/* Right */}

          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 font-semibold text-white transition hover:scale-105"
          >
            Generate

            <ArrowUp size={20} />
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default PromptInput;