export type LegalBlock =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export function LegalContent({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-4">
        {blocks.map((b, i) => {
          if (b.kind === "h2") {
            return (
              <h2 key={i} className="mt-8 font-display text-xl text-paper-100 first:mt-0">
                {b.text}
              </h2>
            );
          }
          if (b.kind === "h3") {
            return (
              <h3 key={i} className="mt-4 text-[15px] font-medium text-paper-100/90">
                {b.text}
              </h3>
            );
          }
          if (b.kind === "ul") {
            return (
              <ul key={i} className="list-disc pl-5 leading-relaxed text-paper-100/60">
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="leading-relaxed text-paper-100/60">
              {b.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
