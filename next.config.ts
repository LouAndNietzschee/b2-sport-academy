import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // varsa diğer ayarların burada kalacak
};

export default nextConfig;
