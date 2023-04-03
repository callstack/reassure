import React from 'react';

interface Props {
  count: number;
}

export const SlowList = ({ count }: Props) => {
  const data = Array.from({ length: count }, (_, index) => index);

  return (
    <div>
      {data.map((item) => (
        <SlowListItem key={item} title={`Item ${item}`} />
      ))}
    </div>
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
    <div>
      <p>{title}</p>
    </div>
  );
};
