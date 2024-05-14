import { processRunResults } from '../measure-helpers';

test('processRunResults calculates correct means and stdevs', () => {
  const input = [
    { duration: 10, count: 2 },
    { duration: 12, count: 2 },
    { duration: 14, count: 2 },
  ];

  expect(processRunResults(input, 0)).toMatchInlineSnapshot(`
    {
      "counts": [
        2,
        2,
        2,
      ],
      "durations": [
        10,
        12,
        14,
      ],
      "meanCount": 2,
      "meanDuration": 12,
      "runs": 3,
      "stdevCount": 0,
      "stdevDuration": 2,
      "warmupDurations": [],
    }
  `);
});

test('processRunResults applies warmupRuns option', () => {
  const input = [
    { duration: 23, count: 1 },
    { duration: 20, count: 5 },
    { duration: 24, count: 5 },
    { duration: 22, count: 5 },
  ];

  expect(processRunResults(input, 1)).toMatchInlineSnapshot(`
    {
      "counts": [
        5,
        5,
        5,
      ],
      "durations": [
        20,
        24,
        22,
      ],
      "meanCount": 5,
      "meanDuration": 22,
      "runs": 3,
      "stdevCount": 0,
      "stdevDuration": 2,
      "warmupDurations": [
        23,
      ],
    }
  `);
});
