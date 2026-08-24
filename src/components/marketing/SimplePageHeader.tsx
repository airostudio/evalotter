export function SimplePageHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-4 pt-16 text-center sm:px-6">
      <span className="text-xs uppercase tracking-widest text-signal-cyan/80">{eyebrow}</span>
      <h1 className="mt-3 font-display text-4xl text-paper-100 sm:text-5xl">{title}</h1>
      {lede && <p className="mx-auto mt-4 max-w-2xl text-paper-100/65">{lede}</p>}
    </div>
  );
}
