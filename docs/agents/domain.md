# Domain Language

Use the project terms consistently when changing comparison, reporting, or measurement behavior.

## Measurement Entry

A single named performance scenario result produced by repeated runs of the same scenario.

Use this for one row/scenario in a `.perf` file or comparison report. Avoid calling it a benchmark row or test stability.

## Coefficient of Variation

A unitless measure of relative duration spread for one measurement entry, calculated as:

```txt
standard deviation / mean
```

Use this term when discussing the statistic itself. In user-facing report fields, prefer `stability` when that is the established output label.

## Stability Check

A workflow that compares two measurement files from the same code state to assess environment or machine stability.

Do not use this term for the coefficient of variation of one entry. A stability check is a workflow, not the statistic.

## Run Stability

A summary of measurement stability across all measurement entries in one measurement file.

Run stability is the mean-duration-weighted average coefficient of variation across entries. It excludes warmup runs and includes removed outliers.

Comparison reports may show run stability for current and baseline measurement files separately. Do not calculate a run-level stability change unless the feature explicitly asks for it.

## Reporting Rules

- Per-entry stability belongs next to each entry's baseline/current duration details.
- Run stability belongs at the end of reports.
- JSON output should use readable stability keys such as `current`, `baseline`, and `weightedAverage`; avoid leaking implementation names like `currentCV`.
- Use `stability` for the user-facing output label, and use coefficient of variation only when explaining the math.
