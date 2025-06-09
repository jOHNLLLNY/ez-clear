/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add environment variables that should be available during build
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Disable static optimization for pages that use Supabase
  // This ensures they're always server-rendered and have access to environment variables
  experimental: {
    // Opt-in to newer Next.js features
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
