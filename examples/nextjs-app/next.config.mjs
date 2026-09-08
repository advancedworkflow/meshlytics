import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root explicitly — otherwise Next.js walks up looking
  // for a lockfile and can pick a wrong one if a parent directory happens
  // to have an unrelated pnpm-lock.yaml.
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
};

export default nextConfig;
