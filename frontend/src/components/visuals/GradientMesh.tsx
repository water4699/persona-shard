const GradientMesh = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="noise-texture absolute inset-0 bg-slate-950" />
    <div className="absolute left-1/2 top-[-20%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/60 via-sky-400/40 to-emerald-400/50 blur-3xl" />
    <div className="absolute bottom-[-30%] left-[-10%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-sky-500/30 via-indigo-500/50 to-purple-500/40 blur-3xl" />
    <div className="absolute bottom-[-20%] right-[-10%] h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-amber-500/20 via-fuchsia-500/40 to-cyan-400/30 blur-3xl" />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-950" />
  </div>
);

export default GradientMesh;
