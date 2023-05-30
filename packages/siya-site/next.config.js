
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  assetPrefix: isProd ? 'https://cdn.siya.bhavinkamani.com' : undefined,
}

module.exports = nextConfig
