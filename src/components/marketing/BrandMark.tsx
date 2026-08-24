import Image from "next/image";
import { clsx } from "clsx";

export function BrandMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      className={clsx("object-contain", className)}
      style={{ width: size, height: size }}
      priority
    />
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={clsx("font-display tracking-tight text-paper-100", className)}>EvalOtter</span>
  );
}
