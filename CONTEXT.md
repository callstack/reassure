# Reassure

Reassure is a performance testing toolkit that measures React and React Native scenarios repeatedly and compares measurement results between code states.

## Language

**Measurement Entry**:
A single named performance scenario result produced by repeated runs of the same scenario.
_Avoid_: Test stability, benchmark row

**Coefficient of Variation**:
A unitless measure of relative duration variability for a **Measurement Entry**, calculated as standard deviation divided by mean.
_Avoid_: Variation, stability

**Stability Check**:
A workflow that compares two measurement files from the same code state to assess environment or machine stability.
_Avoid_: Coefficient of variation, duration variability

**Run Stability**:
A summary of measurement stability across all measurement entries in one measurement file.
_Avoid_: Run variability, suite variability

**Worst Measurement Entry**:
The measurement entry with the highest coefficient of variation in a measurement file.
_Avoid_: Slowest test, biggest regression

## Relationships

- A **Measurement Entry** has one **Coefficient of Variation** for duration measurements.
- A **Stability Check** compares two sets of **Measurement Entries**.
- **Run Stability** is summarized by mean-duration-weighted average **Coefficient of Variation** and the worst **Measurement Entry** by **Coefficient of Variation**.
- A comparison report may show **Run Stability** for the current and baseline measurement files separately.

## Example dialogue

> **Dev:** "Should we call `stdev / mean` test stability?"
> **Domain expert:** "No. That value is the **Coefficient of Variation** for a **Measurement Entry**; a **Stability Check** compares same-code measurement files."
> **Dev:** "How do we tell whether a Reassure tweak made a whole run less noisy?"
> **Domain expert:** "Compare **Run Stability** using mean-duration-weighted average **Coefficient of Variation**, then inspect the worst entry."
> **Dev:** "Does the worst entry mean the slowest test?"
> **Domain expert:** "No. The **Worst Measurement Entry** is the entry with the highest **Coefficient of Variation**, regardless of duration."

## Flagged ambiguities

- "stability" was used for both same-code comparison and per-entry measurement spread — resolved: same-code comparison is a **Stability Check**, while `stdev / mean` is the **Coefficient of Variation**.
- "worst" can mean slowest, noisiest, or most regressed — resolved: for **Run Stability**, worst means highest **Coefficient of Variation**.
