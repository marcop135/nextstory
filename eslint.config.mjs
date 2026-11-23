import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "playwright-report/**", "test-results/**"] },
  ...nextVitals,
];

export default config;
