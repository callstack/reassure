---
sidebar_position: 2
---

# Methodology

## Assessing CI stability

During performance measurements we measure React component render times with microsecond precision using `React.Profiler`. This means
that the same code will run faster or slower depending on the machine. For this reason,
baseline & current measurements need to be run on the same machine. Optimally, they should be run one after another.

Moreover, in order to achieve meaningful results your CI agent needs to have stable performance. It does not matter
really if your agent is fast or slow as long as it is consistent in its performance. That's why during the performance
tests the agent should not be used for any other work that might impact measuring render times.

In order to help you assess your machine stability, you can use `reassure check-stability` command. It runs performance
measurements twice for the current code, so baseline and current measurements refer to the same code. In such case the
expected changes are 0% (no change). The degree of random performance changes will reflect the stability of your machine.
This command can be run both on CI and local machines.

Normally, the random changes should be below 5%. Results of 10% and more considered too high and mean that you should
work on tweaking your machine stability.

> **Note**: As a trick of last resort you can increase the `run` option, from the default value of 10 to 20, 50 or even 100, for all or some of your tests, based on the assumption that more test runs will even out measurement fluctuations. That will however make your tests run even longer.

You can refer to our example [GitHub workflow](https://github.com/callstack/reassure/blob/main/.github/workflows/stability.yml).

## Analyzing results

<p align="center">
<img src="https://github.com/callstack/reassure/raw/main/packages/reassure/docs/report-markdown.png" width="920px" alt="Markdown report" />
</p>

### Results categorization

Looking at the example you can notice that test scenarios can be assigned to certain categories:

- **Significant Changes To Duration** shows test scenario where the performance change is statistically significant and **should** be looked into as it marks a potential performance loss/improvement
- **Meaningless Changes To Duration** shows test scenarios where the performance change is not statistically significant
- **Changes To Count** shows test scenarios where the render or execution count did change
- **Added Scenarios** shows test scenarios which do not exist in the baseline measurements
- **Removed Scenarios** shows test scenarios which do not exist in the current measurements

### Render issues (experimental)

Reassure analyses your components render patterns during the initial test run (usually the warm up run) to spot signs of potential issues.

Currently it's able to inform you about following types of issues:

- **Initial render cascade** informs about number of renders that happened immediately (synchronously) after the initial render. This is most likely caused by `useEffect` triggering immediate re-render by using set state. In the optimal case, initial render should not cause immediate re-renders by itself. Next renders should be caused by some external source: user action, system event, API call response, timers, etc.

- **Redundant updates** informs about renders that resulted in the same host element tree as the previous render. This check inspects host component structure after each update and compares it the the previous structure. If they are the same, it means that the subsequent render could be avoided as it resulted in no visible change to the user.
  - This feature is available on React Native at this time.
  - The host element tree comparison ignores event handlers references. This means that only non-function props (like strings, numbers, objects, arrays, etc) are take into consideration.
