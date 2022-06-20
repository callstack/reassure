import * as React from 'react';
import { View, Text } from 'react-native';
interface Props {
  count: number;
}

export const SlowList = ({ count }: Props) => {
  const data = Array.from({ length: count }, (_, index) => index);

  return (
    <View>
      {data.map((item) => (
        <SlowListItem key={item} title={`Item ${item}`} />
      ))}
    </View>
  );
};

interface ItemProps {
  title: string;
}

const SlowListItem = ({ title }: ItemProps) => {
  const [, forceRender] = React.useState<{}>();

  React.useEffect(() => {
    forceRender({});
  }, [title]);

  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
