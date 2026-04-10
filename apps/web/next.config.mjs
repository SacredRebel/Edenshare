/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@edenshare/ui', '@edenshare/types'],
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com', 'unpkg.com'],
  },
};

export default nextConfig;
