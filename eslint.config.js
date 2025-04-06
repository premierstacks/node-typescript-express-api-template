import { createEslintConfigNodeTypescript, createEslintIgnorePatterns, createEslintOverridesForConfigs } from '@premierstacks/eslint-stack';

export default [...createEslintIgnorePatterns(['dist']), ...createEslintConfigNodeTypescript(), ...createEslintOverridesForConfigs()];
