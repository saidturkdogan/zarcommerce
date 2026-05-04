import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** Vercel rewrites hedefi (HTTP olabilir; tarayıcıya gitmez). Vercel env: BACKEND_API_ORIGIN */
const backendApiOrigin = (
  process.env.BACKEND_API_ORIGIN ||
  process.env.BACKEND_GATEWAY_URL ||
  "http://209.38.224.246:8080"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/gw/:path*",
        destination: `${backendApiOrigin}/:path*`,
      },
    ];
  },
  webpack: (config, context) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
};

export default withNextIntl(nextConfig);
