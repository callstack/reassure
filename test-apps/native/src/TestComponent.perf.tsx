import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { measureRenders } from 'reassure';

import { SlowList } from './SlowList';

const TestComponent = ({ size = 200 }) => {
  const [count, setCount] = React.useState(0);

  const handlePress = () => {
    setCount(c => c + 1);
  };

  return (
    <View>
      <Pressable accessibilityRole="button" onPress={handlePress}>
        <Text>Action</Text>
      </Pressable>

      <Text>Count: {count}</Text>

      <SlowList count={size} />
    </View>
  );
};

jest.setTimeout(600_000);

test('<TestComponent size={50} />: 10 runs', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    await screen.findByText('Count: 1');
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measureRenders(<TestComponent />, { scenario, runs: 10 });
});

test('<TestComponent size={50} />: 50 runs', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    await screen.findByText('Count: 1');
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measureRenders(<TestComponent />, { scenario, runs: 50 });
});

test('<TestComponent size={500} />: 10 runs', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    await screen.findByText('Count: 1');
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measureRenders(<TestComponent />, { scenario, runs: 10 });
});
