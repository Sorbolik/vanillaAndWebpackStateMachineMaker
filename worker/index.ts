// Serves the editor and forwards /api/* to the state-machine-api Worker.
// Editor and API share one address, so one Cloudflare Access rule protects
// both and the browser needs no CORS. The API has no public URL of its own.

type Env = { ASSETS: Fetcher; API: Fetcher };

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      url.pathname = url.pathname.slice("/api".length) || "/";
      return env.API.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
