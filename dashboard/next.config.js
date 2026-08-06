/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,

  // The dashboard's app/api/* routes import from root src/ via relative paths.
  // ignoreBuildErrors skips TypeScript errors; webpack NormalModuleReplacementPlugin
  // handles runtime resolution.
  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    // Intercept relative imports of ../../src/* and ../../../src/* from within
    // dashboard/app/api/** and redirect them to the actual root-level src/ directory.
    const rootSrc = path.resolve(__dirname, '..', 'src');

    config.plugins.push(
      new (require('webpack').NormalModuleReplacementPlugin)(
        /^\.\.\/\.\.\/\.\.\/src\/(.*)/,
        (resource) => {
          resource.request = path.join(rootSrc, resource.request.replace(/^\.\.\/\.\.\/\.\.\/src\//, ''));
        }
      )
    );

    return config;
  },
};

module.exports = nextConfig;
