import { Hero } from "@/components/Hero";
import { RequirementForm } from "@/components/RequirementForm";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <Hero />
      <div className="mt-8">
        <RequirementForm />
      </div>
    </div>
  );
}
