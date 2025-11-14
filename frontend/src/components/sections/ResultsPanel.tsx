import { Download, Loader2, LockOpen, X } from "lucide-react";
import type { DecryptedSurvey } from "../../types/survey";

interface ResultsPanelProps {
  onDecrypt: () => Promise<void>;
  decrypted: DecryptedSurvey | null;
  handles: string[];
  isWalletConnected: boolean;
  isDecrypting: boolean;
  decryptError?: string | null;
  statusMessage?: string | null;
  onCancelDecrypt?: () => void;
}

const ResultsPanel = ({
  onDecrypt,
  decrypted,
  handles,
  isWalletConnected,
  isDecrypting,
  decryptError,
  statusMessage,
  onCancelDecrypt,
}: ResultsPanelProps) => {
  return (
    <section id="results" className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Decrypt results</h2>
          <p className="mt-1 text-sm text-slate-300">
            Only the creator wallet can authorize decrypt requests. Preview handles and run decryption when ready.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
          <LockOpen className="h-5 w-5" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-[11px] text-slate-300">
        <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">Encrypted Handles</p>
        {handles.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {handles.map((value, idx) => (
              <li key={value} className="truncate text-slate-200">
                <span className="text-slate-500">#{idx + 1}</span> {value}
              </li>
            ))}
          </ul>
        ) : (
          <p>No handles available yet. Submit a response to generate encrypted data.</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onDecrypt}
          disabled={!isWalletConnected || !handles.length || isDecrypting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDecrypting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isDecrypting ? "Decrypting..." : "Request Decryption"}
        </button>

        {isDecrypting && onCancelDecrypt && (
          <button
            type="button"
            onClick={onCancelDecrypt}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        )}
      </div>

      {isDecrypting && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-100">
          <p className="font-medium">⏳ Decryption may take 20-45 seconds due to FHEVM relayer operations.</p>
          <p className="mt-1 text-purple-200/80">Please approve any signature requests and keep this page open.</p>
        </div>
      )}
      {decryptError && (
        <p className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {decryptError}
        </p>
      )}
      {statusMessage && !decryptError && (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">{statusMessage}</p>
      )}
      {decrypted ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-sm text-emerald-50">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">Decrypted Metrics</p>
          <div className="mt-4 grid gap-3">
            <p>
              Weighted stress index <span className="font-semibold text-white">{decrypted.stressIndex}</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-emerald-100/80">
              <Metric label="Mood" value={decrypted.q1} />
              <Metric label="Sleep" value={decrypted.q2} />
              <Metric label="Support" value={decrypted.q3} />
              <Metric label="Stress" value={decrypted.q4} />
              <Metric label="Confidence" value={decrypted.q5} />
              <p className="col-span-2 text-xs text-emerald-200/60">
                Timestamp: {new Date(decrypted.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          Awaiting decrypt authorization from the creator wallet.
        </div>
      )}
    </section>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2">
    <span className="text-xs uppercase tracking-widest text-slate-500">{label}</span>
    <span className="text-base font-semibold text-white">{value}</span>
  </div>
);

export default ResultsPanel;
