/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["your-domain.com"],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss: true,
    fontLoaders: [{ loader: "@next/font/google", options: { subsets: ["latin"] } }],
  },
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "Cache-Control", value: "s-maxage=60, stale-while-revalidate=30" },
      ],
    },
  ],
};

export default nextConfig;