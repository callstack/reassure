import { configure } from 'reassure';
import { configure as configureRtc } from 'react-test-config';

configure({
  testingLibrary: 'react-native',
  verbose: true,
});

configureRtc({
  enableOwnerStacks: false,
})

