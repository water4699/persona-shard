import { FormEvent, useState } from "react";
import { LockKeyhole, Loader2, X } from "lucide-react";
import type { SurveyResponses } from "../../types/survey";
import { cn } from "../../lib/utils";

interface SurveyFormProps {
  onSubmit: (responses: SurveyResponses) => Promise<void>;
  encryptionPreview: string | null;
  isWalletConnected: boolean;
  isFheReady: boolean;
  isEncrypting: boolean;
  statusMessage?: string | null;
  submitError?: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
}

const questionBank: Array<{ id: keyof SurveyResponses; label: string; helper: string }> = [
  {
    id: "q1",
    label: "How has your overall mood been this week?",
    helper: "1 = very low, 5 = excellent",
  },
  {
    id: "q2",
    label: "How well did you sleep in the past 7 days?",
    helper: "1 = not at all, 5 = very well",
  },
  {
    id: "q3",
    label: "How supported did you feel by your network?",
    helper: "1 = not supported, 5 = highly supported",
  },
  {
    id: "q4",
    label: "How manageable did your stress feel?",
    helper: "1 = overwhelming, 5 = fully manageable",
  },
  {
    id: "q5",
    label: "How confident are you about upcoming commitments?",
    helper: "1 = unsure, 5 = confident",
  },
];

const options = [1, 2, 3, 4, 5];

const SurveyForm = ({
  onSubmit,
  encryptionPreview,
  isWalletConnected,
  isFheReady,
  isEncrypting,
  statusMessage,
  submitError,
  onCancel,
  onRetry,
}: SurveyFormProps) => {
  const [responses, setResponses] = useState<SurveyResponses>({ q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 });
  const [submitting, setSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!isWalletConnected) {
      setFormError("Connect your wallet to submit encrypted survey data.");
      return;
    }
    if (!isFheReady) {
      setFormError("FHE engine is not ready yet. Please wait for initialization.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(responses);
      setSubmittedAt(Date.now());
      setFormError(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="survey" className="relative flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Encrypted wellbeing survey</h2>
          <p className="mt-1 text-sm text-slate-300">
            Fill in five brief reflections. Responses are encrypted client-side and stored as handles on-chain.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
          <LockKeyhole className="h-5 w-5" />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {questionBank.map((question) => (
          <div key={question.id} className="rounded-2xl border border-white/5 bg-slate-900/70 p-4">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              <span className="text-base font-medium text-white">{question.label}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">{question.helper}</span>
            </label>
            <div className="mt-4 flex items-center gap-3">
              {options.map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setResponses((prev) => ({ ...prev, [question.id]: value }))}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border bg-slate-800/60 text-sm transition",
                    responses[question.id] === value
                      ? "border-emerald-400/80 bg-emerald-400/20 text-white"
                      : "border-white/10 text-slate-300 hover:border-emerald-400/30 hover:text-white"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || isEncrypting || !isFheReady}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting || isEncrypting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Encrypting
              </>
            ) : (
              <>Encrypt &amp; store</>
            )}
          </button>

          {(submitting || isEncrypting) && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>

        {(submitting || isEncrypting) && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-100">
            <p className="font-medium">⏳ Processing may take 30-60 seconds due to FHEVM relayer operations.</p>
            <p className="mt-1 text-blue-200/80">The system will automatically retry if needed. Please keep this page open.</p>
          </div>
        )}
      </form>
      {(formError || submitError) && (
        <div className="space-y-3">
          <p className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {formError ?? submitError}
          </p>
          {onRetry && !isEncrypting && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-xl border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20"
            >
              🔄 Retry Submission
            </button>
          )}
        </div>
      )}
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-xs text-emerald-100">
        <p className="font-medium uppercase tracking-widest">Encryption preview</p>
        <p className="mt-2 break-all font-mono text-[11px] text-emerald-200">
          {encryptionPreview ? `${encryptionPreview}...` : "Submit to generate encrypted handles."}
        </p>
        {submittedAt && (
          <p className="mt-2 text-emerald-200/70">Last encrypted payload created {new Date(submittedAt).toLocaleTimeString()}.</p>
        )}
        {statusMessage && (
          <p className="mt-2 text-emerald-200/60">{statusMessage}</p>
        )}
      </div>
    </section>
  );
};

export default SurveyForm;
