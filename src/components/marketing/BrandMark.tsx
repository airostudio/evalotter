import Image from "next/image";
import { Brain } from "lucide-react";
import { clsx } from "clsx";

/**
 * TODO: replace the Brain icon fallback with /public/logo.svg once the real
 * EvalOtter logo asset is supplied — swap the `<Brain />` block below for
 * `<Image src="/logo.svg" alt="" width={size} height={size} />` (logo is
 * decorative here since the wordmark sits right next to it).
 */
export function BrandMark({ size = 20, className }: { size?: number; className?: string }) {
  return <Brain className={clsx("text-signal-cyan", className)} style={{ width: size, height: size }} />;
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={clsx("font-display tracking-tight text-paper-100", className)}>EvalOtter</span>
  );
}

// Reserved for once the raster/vector logo file is uploaded to /public.
export function BrandLogoImage({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="EvalOtter"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
