import React from 'react';
import { measureRender } from 'rn-perf-tool';

import { SlowList } from 'components/SlowList';

test('Renders Slow List 1', async () => {
  const { meanDuration, stdevDuration, meanCount, stdevCount } =
    await measureRender(<SlowList count={200} />);
  console.log(
    'Result',
    meanDuration,
    (stdevDuration / meanDuration) * 100,
    meanCount,
    (stdevCount / meanCount) * 100
  );
  expect(meanDuration).toBeTruthy();
});
