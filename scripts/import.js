// Simple Node.js wrapper to run the TypeScript import script
require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
  },
});

require("./import-responses.ts");
