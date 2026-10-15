import type { NextConfig } from "next"

import { API_URL } from "./lib/env"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  // The browser calls the API through this origin, so the httpOnly auth
  // cookies are first-party and no CORS setup is needed.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }]
  },
}

export default nextConfig
