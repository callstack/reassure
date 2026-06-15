import { formatCountChange, formatCountDiff } from '../format';

test(`formatCountChange`, () => {
  expect(formatCountChange(1, 2)).toMatchInlineSnapshot(`"2 → 1 (-1, -50.0%) 🟢"`);
  expect(formatCountChange(1, 1)).toMatchInlineSnapshot(`"1 → 1 "`);
  expect(formatCountChange(2, 1)).toMatchInlineSnapshot(`"1 → 2 (+1, +100.0%) 🔴"`);
  expect(formatCountChange(1.01, 2.0)).toMatchInlineSnapshot(`"2 → 1.01 (-0.99, -49.5%) 🟢"`);
  expect(formatCountChange(1.45, 2.05)).toMatchInlineSnapshot(`"2.05 → 1.45 (-0.60, -29.3%) 🟢"`);
});

test('formatCountDiff', () => {
  expect(formatCountDiff(2, 1)).toMatchInlineSnapshot('"+1"');
  expect(formatCountDiff(0, 1)).toMatchInlineSnapshot('"-1"');
  expect(formatCountDiff(2, 2)).toMatchInlineSnapshot('"±0"');

  expect(formatCountDiff(1.01, 2.23)).toMatchInlineSnapshot(`"-1.22"`);
  expect(formatCountDiff(0.01, 5.54)).toMatchInlineSnapshot(`"-5.53"`);
  expect(formatCountDiff(1.01, 1.01)).toMatchInlineSnapshot('"±0"');
});
