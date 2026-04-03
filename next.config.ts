import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
      },
      {
        source: "/register",
        destination: "/auth/register",
      },
      {
        source: "/forgot-password",
        destination: "/auth/forgot-password",
      },
      {
        source: "/verify-otp",
        destination: "/auth/verify-otp",
      },
      {
        source: "/reset-password",
        destination: "/auth/reset-password",
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/auth/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/register",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/auth/forgot-password",
        destination: "/forgot-password",
        permanent: false,
      },
      {
        source: "/auth/verify-otp",
        destination: "/verify-otp",
        permanent: false,
      },
      {
        source: "/auth/reset-password",
        destination: "/reset-password",
        permanent: false,
      }
    ];
  }
};

export default nextConfig;