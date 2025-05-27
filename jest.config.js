import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('ts-jest').JestConfigWithTsJest} */
export const preset = "ts-jest";
export const testEnvironment = "node";
export const testMatch = ["**/tests/**/*.test.ts"];
