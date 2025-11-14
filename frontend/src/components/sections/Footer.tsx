const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-center text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:text-left">
        <p>&copy; {new Date().getFullYear()} Persona Shard Cipher. Built with FHE-first principles.</p>
        <div className="flex justify-center gap-6 md:justify-end">
          <a className="transition hover:text-white" href="https://docs.zama.ai/fhevm" target="_blank" rel="noreferrer">
            FHEVM Docs
          </a>
          <a className="transition hover:text-white" href="https://github.com/water4699/persona-shard" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="transition hover:text-white" href="#survey">
            Start Survey
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

