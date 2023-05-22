/** @type {import('next').NextConfig} */
// const path = require('path');

const nextConfig = {
  transpilePackages: ['react-timezone-select'],
  reactStrictMode: false,
  sassOptions: {
    fiber: false,
  },
};

module.exports = nextConfig;
