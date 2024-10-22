import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { measureRenders } from 'reassure';

jest.setTimeout(60_000);

type RenderIssuesProps = {
  initial?: number;
  redundant?: number;
};

const RenderIssues = ({ initial: initialUpdates = 0 }: RenderIssuesProps) => {
  const [count, setCount] = React.useState(0);
  const [_, forceRender] = React.useState(0);

  React.useEffect(() => {
    if (count < initialUpdates) {
      setCount(c => c + 1);
    }
  }, [count, initialUpdates]);

  return (
    <View>
      <Text>Count: ${count}</Text>

      <Pressable onPress={() => forceRender(c => c + 1)}>
        <Text>Inc</Text>
      </Pressable>
    </View>
  );
};

test('InitialRenders 1', async () => {
  await measureRenders(<RenderIssues initial={1} />);
});

test('InitialRenders 3', async () => {
  await measureRenders(<RenderIssues initial={3} />);
});

test('RedundantUpdates', async () => {
  const scenario = async () => {
    await fireEvent.press(screen.getByText('Inc'));
  };

  await measureRenders(<RenderIssues />, { scenario });
});

test('ManyRenderIssues', async () => {
  const scenario = async () => {
    await fireEvent.press(screen.getByText('Inc'));
    await fireEvent.press(screen.getByText('Inc'));
  };

  await measureRenders(<RenderIssues initial={2} />, { scenario });
});
