
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    loader: 'custom',
    loaderFile: './src/loaders/image.ts',
  }
}

module.exports = nextConfig
