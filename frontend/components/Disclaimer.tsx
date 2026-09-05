import React from "react";
import { Info } from "lucide-react";

export const Disclaimer: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6 p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start space-x-2.5">
      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        <span className="font-semibold text-amber-950">Prototype Notice:</span>{" "}
        FINOPT is a prototype for financial decision support. Product data shown in
        future demo stages may be illustrative.
      </p>
    </div>
  );
};
