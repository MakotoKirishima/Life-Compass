/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
};
if (process.env.NODE_ENV !== "development") {
  nextConfig.output = "export";
}
module.exports = nextConfig;
