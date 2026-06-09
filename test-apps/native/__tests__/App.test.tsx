/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../src/App';

test('renders correctly', async () => {
  await render(<App />);
});
