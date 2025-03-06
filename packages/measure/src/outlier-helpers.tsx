/* Adapted from https://github.com/sharkdp/hyperfine/blob/3b0918511aee4d6f8860bb663cb7a7af57bc3814/src/outlier_detection.rs */

import * as math from 'mathjs';

// Minimum modified Z-score for a datapoint to be an outlier. Here, 1.4826 is a factor that
// converts the MAD to an estimator for the standard deviation. The second factor is the number
// of standard deviations.
const OUTLIER_THRESHOLD = 1.4826 * 10;

type OutlierResult<T> = {
  results: T[];
  outliers: T[];
};

export function findOutliers<T extends { duration: number }>(items: T[]): OutlierResult<T> {
  if (items.length <= 1) {
    return {
      results: items,
      outliers: [],
    };
  }

  const durations = items.map(({ duration }) => duration);

  // Compute the sample median and median absolute deviation (MAD)
  const median = math.median(durations);
  const mad = math.mad(durations);

  return items.reduce<OutlierResult<T>>(
    (acc, result) => {
      const modifiedZScore = (result.duration - median) / (mad > 0 ? mad : Number.EPSILON);

      // An outlier is a point that is larger than the modified Z-score threshold
      if (Math.abs(modifiedZScore) > OUTLIER_THRESHOLD) {
        acc.outliers.push(result);
      } else {
        acc.results.push(result);
      }

      return acc;
    },
    {
      results: [],
      outliers: [],
    }
  );
}
