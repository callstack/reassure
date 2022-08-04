import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { fireEvent, RenderAPI, screen } from '@testing-library/react-native';
import { measurePerformance } from 'reassure';

import { SlowList } from './SlowList';

const AsyncComponent = () => {
  const [count, setCount] = React.useState(0);

  const handlePress = () => {
    setTimeout(() => setCount((c) => c + 1), 10);
  };

  return (
    <View>
      <Pressable accessibilityRole="button" onPress={handlePress}>
        <Text>Action</Text>
      </Pressable>

      <Text>Count: {count}</Text>

      <SlowList count={200} />
    </View>
  );
};

jest.setTimeout(600_000);
test('Other Component 10', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measurePerformance(<AsyncComponent />, { scenario, runs: 10 });
});

test('Other Component 10 legacy scenario', async () => {
  const scenario = async (screen: RenderAPI) => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measurePerformance(<AsyncComponent />, { scenario, runs: 10 });
});

test('Other Component 20', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measurePerformance(<AsyncComponent />, { scenario, runs: 20 });
});
