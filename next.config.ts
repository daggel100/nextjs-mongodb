
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Bilder konfiguration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
