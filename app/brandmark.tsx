// Selo da marca — iniciais "MC" num círculo dourado, como na arte da Mariana.
export function Brandmark({ size = 44 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-dourado-400 font-heading font-bold text-roxo-800"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      MC
    </span>
  );
}
