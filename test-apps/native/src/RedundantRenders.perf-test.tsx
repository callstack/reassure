import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { measureRenders } from 'reassure';

jest.setTimeout(60_000);

const RedundantInitialRenders = ({ repeat }: { repeat: number }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (count < repeat) {
      setCount(c => c + 1);
    }
  }, [count, repeat]);

  return (
    <View>
      <Text>Count: ${count}</Text>
    </View>
  );
};

test('RedundantInitialRenders 1', async () => {
  await measureRenders(<RedundantInitialRenders repeat={1} />);
});

test('RedundantInitialRenders 3', async () => {
  await measureRenders(<RedundantInitialRenders repeat={3} />);
});

const RedundantUpdates = () => {
  const [_, forceRender] = React.useState(0);

  return (
    <View>
      <Pressable onPress={() => forceRender(c => c + 1)}>
        <Text>Inc</Text>
      </Pressable>
    </View>
  );
};

test('RedundantUpdates', async () => {
  const scenario = async () => {
    await fireEvent.press(screen.getByText('Inc'));
  };

  await measureRenders(<RedundantUpdates />, { scenario });
});
