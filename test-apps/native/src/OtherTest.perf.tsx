import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { measureRenders } from 'reassure';

import { SlowList } from './SlowList';

const AsyncComponent = () => {
  const [count, setCount] = React.useState(0);

  const handlePress = () => {
    setTimeout(() => setCount(c => c + 1), 10);
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
test('<AsyncComponent />: 10 runs', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    await screen.findByText('Count: 1');
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measureRenders(<AsyncComponent />, { scenario, runs: 10 });
});

test('<AsyncComponent />: 20 runs', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    await screen.findByText('Count: 1');
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measureRenders(<AsyncComponent />, { scenario, runs: 20 });
});
