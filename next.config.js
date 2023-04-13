/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

module.exports = { transpilePackages: ['react-timezone-select', 'react-drag-drop-files'], nextConfig };
