/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/mrd-system',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['pdfjs-dist'],
  webpack: (config) => {
    // pdfjs-dist 4.x ESM 対応
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

module.exports = nextConfig;
