import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { fireEvent, RenderAPI } from '@testing-library/react-native';
import { measureRender, writeTestStats, clearTestStats } from 'rn-perf-tool';

import { SlowList } from 'components/SlowList';

beforeAll(async () => {
  await clearTestStats();
});

const AsyncComponent = () => {
  const [count, setCount] = React.useState(0);

  const handlePress = () => {
    setTimeout(() => setCount((c) => c + 1), 50);
  };

  const memoizedList = React.useMemo(() => <SlowList count={200} />, []);

  return (
    <View>
      <TouchableOpacity onPress={handlePress}>
        <Text>Action</Text>
      </TouchableOpacity>

      <Text>Count: {count}</Text>

      {memoizedList} */}
      {/* {/* <SlowList count={200} /> */}
    </View>
  );
};

jest.setTimeout(60000);
test('Async Component', async () => {
  const scenario = async (screen: RenderAPI) => {
    const button = screen.getByText('Action');

    fireEvent.press(button);
    await screen.findByText('Count: 1');

    fireEvent.press(button);
    await screen.findByText('Count: 2');

    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);
    await screen.findByText('Count: 5');
  };

  const stats = await measureRender(<AsyncComponent />, {scenario});
  await writeTestStats('AsyncComponent', stats);
  expect(true).toBeTruthy();
});
