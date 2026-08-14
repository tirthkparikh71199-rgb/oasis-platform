import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@oasis/ai", "@oasis/config", "@oasis/db", "@oasis/domain", "@oasis/logger", "@oasis/messaging", "@oasis/rag"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  output: "standalone",
};

export default nextConfig;
