/**
 * Preflight check: `npm run doctor`
 *
 * Every failure this project hit in production was diagnosable in seconds
 * with the right question, but presented as something opaque — a 500 with a
 * digest, "fetch failed" at signup, "Unregistered API key", or a catalogue
 * that silently fell back to static data. This asks all of those questions
 * at once and says plainly which one is wrong.
 *
 * Read-only. Safe to run against production.
 */
import { createClient } from "@supabase/supabase-js";

type Status = "ok" | "warn" | "fail";
const results: { status: Status; label: string; detail: string }[] = [];
const add = (status: Status, label: string, detail: string) =>
  results.push({ status, label, detail });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** sb_publishable_… / sb_secret_… are the current format; eyJ… is a legacy JWT. */
function keyKind(k: string): string {
  if (k.startsWith("sb_publishable_")) return "publishable (current)";
  if (k.startsWith("sb_secret_")) return "secret (current)";
  if (k.startsWith("eyJ")) return "legacy JWT";
  return "unrecognised";
}

async function main() {
  // ── env ───────────────────────────────────────────────────────────────
  if (!url) add("fail", "NEXT_PUBLIC_SUPABASE_URL", "not set");
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))
    add("warn", "NEXT_PUBLIC_SUPABASE_URL", `unusual shape: ${url}`);
  else add("ok", "NEXT_PUBLIC_SUPABASE_URL", url);

  if (!anon) add("fail", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "not set");
  else if (anon.startsWith("sb_secret_"))
    add("fail", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "this is a SECRET key in a NEXT_PUBLIC_ variable — it would ship to every browser. Use the sb_publishable_ key.");
  else add(anon.startsWith("eyJ") ? "warn" : "ok", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          `${keyKind(anon)}${anon.startsWith("eyJ") ? " — legacy keys are deprecated and can no longer be rotated" : ""}`);

  if (!service) add("warn", "SUPABASE_SERVICE_ROLE_KEY", "not set — /admin and profile self-heal will not work");
  else if (service.startsWith("sb_publishable_"))
    add("fail", "SUPABASE_SERVICE_ROLE_KEY", "this is the publishable key, not the secret key");
  else add(service.startsWith("eyJ") ? "warn" : "ok", "SUPABASE_SERVICE_ROLE_KEY", keyKind(service));

  add(process.env.ANTHROPIC_API_KEY ? "ok" : "warn", "ANTHROPIC_API_KEY",
      process.env.ANTHROPIC_API_KEY ? "set" : "not set — interpretations degrade silently, scores unaffected");
  add(process.env.STRIPE_SECRET_KEY ? "ok" : "warn", "STRIPE_SECRET_KEY",
      process.env.STRIPE_SECRET_KEY ? "set" : "not set — checkout disabled");

  if (!url || !anon) return report();

  // ── reachability + key acceptance ─────────────────────────────────────
  // Distinguishes a dead project ref (DNS) from a rejected key (401) — the
  // two failures that looked identical from the app.
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, { headers: { apikey: anon } });
    if (res.status === 401) {
      add("fail", "anon key accepted", 'Supabase returned 401 "Unregistered API key" — the key is not valid for this project, or it has been deactivated. If you just rotated, rebuild: NEXT_PUBLIC_* is inlined at build time.');
    } else if (res.ok || res.status === 404) {
      add("ok", "anon key accepted", `Supabase responded ${res.status}`);
    } else {
      add("warn", "anon key accepted", `unexpected status ${res.status}`);
    }
  } catch (err) {
    add("fail", "Supabase reachable", `${(err as Error).message} — check the project ref in the URL is real and the project is not paused`);
    return report();
  }

  // ── data ──────────────────────────────────────────────────────────────
  const db = createClient(url, service || anon, { auth: { persistSession: false } });

  const { count: assessments } = await db
    .from("assessments").select("id", { count: "exact", head: true }).eq("status", "published");
  if (!assessments) add("fail", "assessments seeded", "0 published assessments — run the seed, or the catalogue silently falls back to static data and no test can be started");
  else add(assessments >= 29 ? "ok" : "warn", "assessments seeded", `${assessments} published`);

  const { count: questions } = await db.from("questions").select("id", { count: "exact", head: true });
  add((questions ?? 0) > 0 ? "ok" : "fail", "questions seeded", `${questions ?? 0}`);

  const { count: noVersion } = await db
    .from("assessments").select("id", { count: "exact", head: true })
    .eq("status", "published").is("current_version_id", null);
  add((noVersion ?? 0) === 0 ? "ok" : "fail", "every published assessment has a version",
      (noVersion ?? 0) === 0 ? "yes" : `${noVersion} without one — their detail pages will show "temporarily unavailable"`);

  // Needs the service key: profiles is RLS-protected.
  if (service) {
    const { count: profiles } = await db.from("profiles").select("id", { count: "exact", head: true });
    add("ok", "profiles", `${profiles ?? 0} row(s) — if a signed-in user has none, starting an assessment fails on a foreign key`);
  }

  report();
}

function report() {
  const icon = { ok: "  ok  ", warn: " warn ", fail: " FAIL " } as const;
  console.log("\nEvalOtter preflight\n" + "─".repeat(72));
  for (const r of results) console.log(`[${icon[r.status]}] ${r.label.padEnd(38)} ${r.detail}`);
  const fails = results.filter((r) => r.status === "fail").length;
  const warns = results.filter((r) => r.status === "warn").length;
  console.log("─".repeat(72));
  console.log(fails ? `${fails} failure(s), ${warns} warning(s)\n` : `All checks passed${warns ? `, ${warns} warning(s)` : ""}\n`);
  process.exit(fails ? 1 : 0);
}

main().catch((err) => {
  console.error("doctor crashed:", err);
  process.exit(1);
});
