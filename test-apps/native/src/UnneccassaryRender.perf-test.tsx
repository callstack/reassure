import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { measurePerformance } from 'reassure';

const UnnecessaryComponent = () => {
  const [count, setCount] = React.useState(0);

  const handlePress = () => {
    setCount((c) => c + 1);
  };

  return (
    <View>
      <Pressable accessibilityRole="button" onPress={handlePress}>
        <Text>Action</Text>
      </Pressable>

      <Text>Count: 0</Text>
    </View>
  );
};

jest.setTimeout(60_000);

test('Unncessary Renders Component', async () => {
  const scenario = async () => {
    const button = screen.getByText('Action');
    await screen.findByText('Count: 0');
    await fireEvent.press(button);
  };

  await measurePerformance(<UnnecessaryComponent />, { scenario });
});
