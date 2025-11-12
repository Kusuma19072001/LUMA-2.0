import type { AssistantPlan } from "../types/chat.ts";

type PlanCardProps = {
  plan?: AssistantPlan;
};

export const PlanCard = ({ plan }: PlanCardProps) => {
  if (!plan) return null;

  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-lg">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Gentle Next Steps
      </h3>
      <p className="mt-2 text-lg font-medium text-emerald-900">
        {plan.headline}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-emerald-800">
        {plan.steps.map((step, index) => (
          <li
            key={`${step}-${index}`}
            className="flex items-start gap-2 rounded-2xl bg-white/70 px-4 py-2 text-left shadow-sm"
          >
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

