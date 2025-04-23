import { createEslintConfigIgnores, createEslintConfigIgnoresRoot, createEslintConfigNodeTypescript } from '@premierstacks/eslint-stack';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([globalIgnores(['dist']), createEslintConfigIgnores(), createEslintConfigIgnoresRoot(), createEslintConfigNodeTypescript()]);
