/* eslint-disable no-undef */
import { configure } from 'reassure';

configure({ testingLibrary: 'react-native', verbose: true });

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
