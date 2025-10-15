// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gfneyddeoqflafmzuqzb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
