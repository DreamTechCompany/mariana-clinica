import Image from "next/image";

// Selo da marca — logo da Mariana (mc em aquarela). O arquivo fica em
// public/logo-mc.png. É circular na arte, então recortamos num círculo.
export function Brandmark({ size = 44 }: { size?: number }) {
  return (
    <Image
      src="/logo-mc.png"
      alt="Mariana Consentino"
      width={size}
      height={size}
      priority
      className="shrink-0 rounded-full bg-white object-cover"
      style={{ width: size, height: size }}
    />
  );
}
