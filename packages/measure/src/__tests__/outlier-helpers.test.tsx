import { findOutliers } from '../outlier-helpers';

test('returns the original array if it has 0 elements', () => {
  const results: { duration: number }[] = [];

  expect(findOutliers(results)).toEqual({
    results,
    outliers: [],
  });
});

test('returns the original array if it has 1 element', () => {
  const results = [{ duration: 100 }];

  expect(findOutliers(results)).toEqual({
    results,
    outliers: [],
  });
});

test('returns all elements if there are no outliers', () => {
  const results = [{ duration: 100 }, { duration: 105 }, { duration: 98 }, { duration: 102 }];

  expect(findOutliers(results)).toEqual({
    results,
    outliers: [],
  });
});

test('filters out significant outliers', () => {
  const results = [
    { duration: 100 },
    { duration: 105 },
    { duration: 98 },
    { duration: 1000 }, // outlier
    { duration: 102 },
  ];

  expect(findOutliers(results)).toEqual({
    results: [{ duration: 100 }, { duration: 105 }, { duration: 98 }, { duration: 102 }],
    outliers: [{ duration: 1000 }],
  });
});

test('handles case where all elements have the same value (MAD = 0)', () => {
  const results = [{ duration: 100 }, { duration: 100 }, { duration: 100 }];

  expect(findOutliers(results)).toEqual({
    results,
    outliers: [],
  });
});

test('retains original object properties', () => {
  const results = [
    { duration: 100, name: 'test1' },
    { duration: 1000, name: 'outlier' }, // outlier
    { duration: 105, name: 'test2' },
    { duration: 98, name: 'test3' },
    { duration: 102, name: 'test4' },
  ];

  expect(findOutliers(results)).toEqual({
    results: [
      { duration: 100, name: 'test1' },
      { duration: 105, name: 'test2' },
      { duration: 98, name: 'test3' },
      { duration: 102, name: 'test4' },
    ],
    outliers: [{ duration: 1000, name: 'outlier' }],
  });
});

test('handles multiple outliers', () => {
  const results = [
    { duration: 28 }, // outlier
    { duration: 13 },
    { duration: 13 },
    { duration: 14 }, // outlier
    { duration: 13 },
    { duration: 13 },
    { duration: 12 }, // outlier
    { duration: 29 }, // outlier
    { duration: 13 },
    { duration: 13 },
  ];

  expect(findOutliers(results)).toEqual({
    results: [
      { duration: 13 },
      { duration: 13 },
      { duration: 13 },
      { duration: 13 },
      { duration: 13 },
      { duration: 13 },
    ],
    outliers: [{ duration: 28 }, { duration: 14 }, { duration: 12 }, { duration: 29 }],
  });
});

test('handles multiple outliers with larger values', () => {
  const results = [
    { duration: 280 }, // outlier
    { duration: 130 },
    { duration: 130 },
    { duration: 140 },
    { duration: 130 },
    { duration: 125 },
    { duration: 120 },
    { duration: 290 }, // outlier
    { duration: 130 },
    { duration: 135 },
  ];

  expect(findOutliers(results)).toEqual({
    results: [
      { duration: 130 },
      { duration: 130 },
      { duration: 140 },
      { duration: 130 },
      { duration: 125 },
      { duration: 120 },
      { duration: 130 },
      { duration: 135 },
    ],
    outliers: [{ duration: 280 }, { duration: 290 }],
  });
});

test('handles multiple outliers with small decimal values', () => {
  const results = [
    { duration: 2.8 }, // outlier
    { duration: 1.3 },
    { duration: 1.3 },
    { duration: 1.4 }, // outlier
    { duration: 1.3 },
    { duration: 1.3 },
    { duration: 1.2 }, // outlier
    { duration: 2.9 }, // outlier
    { duration: 1.3 },
    { duration: 1.3 },
  ];

  expect(findOutliers(results)).toEqual({
    results: [
      { duration: 1.3 },
      { duration: 1.3 },
      { duration: 1.3 },
      { duration: 1.3 },
      { duration: 1.3 },
      { duration: 1.3 },
    ],
    outliers: [{ duration: 2.8 }, { duration: 1.4 }, { duration: 1.2 }, { duration: 2.9 }],
  });
});
