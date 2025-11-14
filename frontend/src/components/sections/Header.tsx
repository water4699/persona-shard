import { ReactNode } from "react";
import { Shield } from "lucide-react";
import { cn } from "../../lib/utils";

interface HeaderProps {
  children: ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  return (
    <header className="relative z-20 border-b border-white/5 bg-slate-950/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-glow">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Persona Shard Cipher</p>
            <p className="text-sm text-slate-400">Encrypted Mental Health Insights</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a className="hover:text-white" href="#survey">Encrypted Survey</a>
          <a className="hover:text-white" href="#results">Decryption</a>
          <a className="hover:text-white" href="#faq">FAQ</a>
        </nav>
        <div className={cn("flex items-center gap-3")}>{children}</div>
      </div>
    </header>
  );
};

export default Header;
