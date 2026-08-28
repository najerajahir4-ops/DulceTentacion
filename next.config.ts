import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
    workerThreads: true,
    cpus: 2,
    optimizePackageImports: ["lucide-react", "framer-motion", "gsap", "@gsap/react"],
  },
};

export default nextConfig;
