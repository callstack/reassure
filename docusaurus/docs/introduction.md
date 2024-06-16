---
title: Why Reassure?
sidebar_position: 1
---

## The problem

You want your React Native app to perform well and fast at all times. As a part of this goal, you profile the app, observe render patterns, apply memoization in the right places, etc. But it's all manual and too easy to unintentionally introduce performance regressions that would only get caught during QA or worse, by your users.

## This solution

Reassure allows you to automate React Native app performance regression testing on CI or a local machine. The same way you write your
integration and unit tests that automatically verify that your app is still _working correctly_, you can write
performance tests that verify that your app still _working performantly_.

You can think about it as a React performance testing library. In fact, Reassure is designed to reuse as much of your [React Native Testing Library](https://github.com/callstack/react-native-testing-library) tests and setup as possible.

Reassure works by measuring render characteristics – duration and count – of the testing scenario you provide and comparing that to the stable version. It repeats the scenario multiple times to reduce impact of random variations in render times caused by the runtime environment. Then it applies statistical analysis to figure out whether the code changes are statistically significant or not. As a result, it generates a human-readable report summarizing the results and displays it on the CI or as a comment to your pull request.
