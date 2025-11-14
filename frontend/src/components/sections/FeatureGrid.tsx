import { Lock, Network, Cpu, Zap } from "lucide-react";

const features = [
  {
    title: "End-to-end encryption",
    description: "Survey inputs are encrypted client-side using Zama's FHEVM SDK before they are sent to the blockchain.",
    icon: Lock,
  },
  {
    title: "Creator-controlled decryption",
    description: "Only the creator who produced a handle can authorize decrypt requests, ensuring participant trust.",
    icon: Cpu,
  },
  {
    title: "Seamless multi-network",
    description: "Switch instantly between Sepolia testnet and localhost mock mode without updating the UI.",
    icon: Network,
  },
  {
    title: "Analytics ready",
    description: "Homomorphic computations like weighted stress metrics run entirely in encrypted space before decryption.",
    icon: Zap,
  },
];

const FeatureGrid = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-3 text-center text-white lg:text-left">
        <p className="text-sm uppercase tracking-widest text-indigo-300">Why Persona Shard Cipher</p>
        <h2 className="text-3xl font-semibold md:text-4xl">Built for sensitive wellbeing programs</h2>
        <p className="max-w-2xl text-slate-300">
          Encrypt, compute, and decrypt mental health insights without exposing personal responses. This UI wraps advanced FHE workflows in a responsive experience inspired by the reference design.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur transition hover:border-emerald-400/40">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
