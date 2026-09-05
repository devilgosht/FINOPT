import React from "react";
import { ShieldCheck, Target, RefreshCw } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="pt-8 pb-6 sm:pt-12 sm:pb-8 text-center max-w-3xl mx-auto px-4">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-finopt-50 text-finopt-700 border border-finopt-200 mb-4">
        <Target className="w-3.5 h-3.5 text-finopt-600" />
        Requirement-Driven Decision Support
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
        Make the financial decision, not just the comparison.
      </h1>

      <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
        Tell us what you need. FINOPT helps you compare suitable options and
        understand the trade-offs.
      </p>

      {/* 3 Core Value Pillars */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 bg-slate-50 text-slate-700 rounded-md border border-slate-100 shrink-0">
            <Target className="w-4 h-4 text-finopt-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900">
              Customer First
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reverses the flow: Your requirements dictate suitable products.
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 bg-slate-50 text-slate-700 rounded-md border border-slate-100 shrink-0">
            <RefreshCw className="w-4 h-4 text-finopt-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900">
              Tenure Optimization
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzes nearby tenures to quantify extra earnings vs lock-in.
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 bg-slate-50 text-slate-700 rounded-md border border-slate-100 shrink-0">
            <ShieldCheck className="w-4 h-4 text-finopt-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900">
              Transparent Math
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear formulas, no hidden bias, and complete calculation clarity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
