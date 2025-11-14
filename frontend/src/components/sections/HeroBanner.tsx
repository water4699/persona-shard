import { ArrowRight, ShieldCheck } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HeroBannerProps {
  stats: Stat[];
}

const HeroBanner = ({ stats }: HeroBannerProps) => {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-12 pt-16 text-white lg:pt-24">
      <div className="flex flex-col gap-6 text-center lg:text-left">
        <span className="inline-flex items-center gap-2 self-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-slate-300 lg:self-start">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Homomorphic Encryption
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
          Private mental health surveys secured by fully homomorphic encryption
        </h1>
        <p className="max-w-2xl self-center text-base text-slate-300 lg:self-start lg:text-lg">
          Persona Shard Cipher keeps every response encrypted end-to-end. Conduct sensitive assessments without ever exposing raw data, and decrypt only when the creator authorizes it.
        </p>
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-6 lg:items-start">
          <a
            href="#survey"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:opacity-90"
          >
            Start Encrypted Survey
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#results" className="text-sm font-medium text-slate-300 transition hover:text-white">
            Learn about decrypt permissions
          </a>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <stat.icon className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-lg font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
