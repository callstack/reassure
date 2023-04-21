/**
 * @format
 */

import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

// Note: test renderer must be required after react-native.

describe('App', () => {
  it('renders correctly', () => {
    expect(renderer.create(<App />)).toBeTruthy();
  });
});
