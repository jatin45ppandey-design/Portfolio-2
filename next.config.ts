import type { NextConfig } from "next";

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const cloudinaryRemotePatterns =
  cloudinaryCloudName && /^[a-zA-Z0-9_-]+$/.test(cloudinaryCloudName)
    ? [
        {
          protocol: "https" as const,
          hostname: "res.cloudinary.com",
          pathname: `/${cloudinaryCloudName}/image/upload/**`,
        },
      ]
    : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: cloudinaryRemotePatterns,
  },
};

export default nextConfig;
