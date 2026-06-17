// Config flat de ESLint para Next.js 16 (eslint-config-next ya provee config flat nativa).
import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "coverage/**"],
  },
];

export default eslintConfig;
