/**
 * Security headers applied to every response.
 *
 * Deliberately no Content-Security-Policy here yet: the app renders
 * question stimuli as inline `data:` SVG/image URIs and Next injects inline
 * bootstrap scripts, so a CSP tight enough to be worth having needs a nonce
 * pipeline through the middleware. Shipping a loose `unsafe-inline` policy
 * would read as protection while providing almost none, so it is left as
 * deliberate follow-up rather than security theatre.
 */
const securityHeaders = [
  // Assessment content is not meant to be framed by third parties; combined
  // with frame-ancestors this also blocks clickjacking of the paywall and
  // the account pages.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak attempt/result ids in the Referer when a user follows an
  // outbound link from a results page.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Palmistry is the only feature that ever needs a camera, and it uses a
  // file input rather than getUserMedia.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
