import { PrettierStack } from '@premierstacks/prettier-stack';

// eslint-disable-next-line no-restricted-exports
export default PrettierStack.create()
  .base()
  .pug()
  .ruby()
  .xml()
  .build();
