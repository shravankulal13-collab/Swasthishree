import { handleAsNodeRequest } from "cloudflare:node";
import { env } from "cloudflare:workers";

// Make Cloudflare secrets available to the existing Express/Supabase code
// BEFORE the backend is imported.
process.env.CLOUDFLARE_WORKER = "1";

if (env.SUPABASE_URL) {
  process.env.SUPABASE_URL = env.SUPABASE_URL;
}

if (env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
}

if (env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
}

// IMPORTANT: import backend only AFTER the environment variables are ready.
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