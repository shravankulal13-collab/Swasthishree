import { handleAsNodeRequest } from "cloudflare:node";

// Tell the existing Express backend that it is running inside Cloudflare Workers.
process.env.CLOUDFLARE_WORKER = "1";

// Load the existing Express backend.
await import("../backend/server.js");

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Send every /api/* request to the existing Express backend.
    if (url.pathname.startsWith("/api/")) {
      return handleAsNodeRequest(5000, request);
    }

    // Everything else is the React/Vite frontend.
    return env.ASSETS.fetch(request);
  },
};