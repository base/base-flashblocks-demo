import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypes from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypes,
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts", ".tmp/**"],
  },
];

export default eslintConfig;
