const faqs = [
  {
    question: "How does Persona Shard keep survey data private?",
    answer:
      "All answers are encrypted in the browser using Zama's FHEVM SDK before they ever leave the device. The contract only stores opaque handles that can be decrypted later by the creator wallet.",
  },
  {
    question: "Can participants decrypt their own responses?",
    answer:
      "Only the account that created the encrypted handles can authorize a decrypt request. Other wallets can hold the data, but without the creator's signature the relayer refuses to reveal the plaintext.",
  },
  {
    question: "Does the UI support both local mocks and Sepolia?",
    answer:
      "Yes. The RainbowKit configuration ships with localhost and Sepolia endpoints. You can test the full flow with the built-in mock encryption or switch to Sepolia for live handles.",
  },
  {
    question: "Where can I review the stress index calculation?",
    answer:
      "Weighted scoring happens inside the smart contract using homomorphic operations. The UI displays the final value along with each decrypted question for transparency.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="mx-auto max-w-5xl px-6 pb-24">
      <div className="mb-10 text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-300">FAQ</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Frequently asked questions</h2>
        <p className="mt-2 text-base text-slate-300">
          Inspired by the reference interface, this section highlights the most common questions stakeholders raise about encrypted
          wellbeing programs.
        </p>
      </div>
      <div className="space-y-4">
        {faqs.map((item) => (
          <article key={item.question} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">{item.question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;

