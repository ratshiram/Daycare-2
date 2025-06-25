/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // These modules are server-side only, so we'll mock them for the client build
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/exporter-jaeger': false,
        'require-in-the-middle': false,
        'handlebars': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
