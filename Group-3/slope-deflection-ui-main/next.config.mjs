/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, "pymport", "nodegyp"];
    return config;
  },
};

export default nextConfig;
