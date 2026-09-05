import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 space-y-2">
        <p className="font-medium text-slate-700">
          FINOPT &bull; Smarter Financial Decisions, Simplified
        </p>
        <p>Built by Team The Hustlers &bull; Hackathon Project</p>
        <p className="text-slate-400 text-2xs">
          Empowering savers through requirement-driven decision support &amp; tenure optimization.
        </p>
      </div>
    </footer>
  );
};
