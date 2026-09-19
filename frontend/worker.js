import { handleAsNodeRequest } from "cloudflare:node";
import { env } from "cloudflare:workers";

process.env.CLOUDFLARE_WORKER = "1";

// Pass Cloudflare secrets into process.env BEFORE loading Express/Supabase.
if (env.SUPABASE_URL) {
  process.env.SUPABASE_URL = env.SUPABASE_URL;
}

if (env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
}

if (env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
}

// IMPORTANT: load backend only AFTER environment variables are available.
await import("../backend/server.js");

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleAsNodeRequest(5000, request);
    }

    return env.ASSETS.fetch(request);
  },
};