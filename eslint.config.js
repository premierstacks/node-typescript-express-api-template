import { EslintStack } from '@premierstacks/eslint-stack';
import globals from 'globals';

// eslint-disable-next-line no-restricted-exports
export default EslintStack.create()
  .base()
  .globals({
    ...globals.node,
    ...globals.es2024,
  })
  .ignores([...EslintStack.Selectors.GlobalIgnore])
  .ignores(['dist'])
  .recommended()
  .typescript({ files: [...EslintStack.Selectors.GlobalTypeScript, ...EslintStack.Selectors.GlobalTypedReact] })
  .stylistic()
  .sonarjs()
  .typescriptDisabled({ files: [...EslintStack.Selectors.GlobalJavaScript, ...EslintStack.Selectors.GlobalReact] })
  .build();
