import React from "react";

export const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-finopt-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              FINOPT
            </span>
            <span className="hidden sm:inline-block ml-3 text-xs text-slate-500 font-medium border-l border-slate-200 pl-3">
              Your money. Your goals. Better options.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Phase 1 • Intake Foundation
          </span>
        </div>
      </div>
    </header>
  );
};
