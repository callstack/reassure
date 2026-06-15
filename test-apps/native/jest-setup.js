import { configure } from 'reassure';
import { disableOwnerStacks } from 'react-test-config';

configure({
  testingLibrary: 'react-native',
  verbose: true,
});

disableOwnerStacks();
