import { measurePerformance } from 'reassure';

import React from 'react';

import { fireEvent, RenderResult } from '@testing-library/react';

import { SlowList } from './SlowList';

const AsyncComponent = () => {
  const [count, setCount] = React.useState(0);

  const triggerStateChange = () => {
    setTimeout(() => setCount((c) => c + 1), 50);
  };

  return (
    <div>
      <button onClick={triggerStateChange}>Action</button>
      <p>Count: {count}</p>

      <SlowList count={200} />
    </div>
  );
};

jest.setTimeout(60_000);
test('Async Component', async () => {
  const scenario = async (screen: RenderResult) => {
    const button = screen.getByText('Action');

    fireEvent.click(button);
    await screen.findByText('Count: 1');

    fireEvent.click(button);
    await screen.findByText('Count: 2');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    await screen.findByText('Count: 5');
  };

  await measurePerformance(<AsyncComponent />, { scenario });
  expect(true).toBeTruthy();
});
