export default {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/*.jest.test.js", "**/*.jest.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  extensionsToTreatAsEsm: [".ts"],
  preset: "ts-jest/presets/default-esm",
};
