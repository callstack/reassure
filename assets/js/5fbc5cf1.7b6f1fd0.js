"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[624],{8946:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>u,frontMatter:()=>t,metadata:()=>c,toc:()=>a});var r=s(4848),i=s(8453);const t={title:"API",sidebar_position:4},o="API",c={id:"api",title:"API",description:"Measurements",source:"@site/docs/api.md",sourceDirName:".",slug:"/api",permalink:"/reassure/docs/api",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"API",sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Methodology",permalink:"/reassure/docs/methodology"},next:{title:"Troubleshooting",permalink:"/reassure/docs/troubleshooting"}},l={},a=[{value:"Measurements",id:"measurements",level:2},{value:"<code>measureRenders()</code> function",id:"measure-renders",level:3},{value:"Example",id:"measure-renders-example",level:4},{value:"<code>MeasureRendersOptions</code> type",id:"measure-renders-options",level:3},{value:"<code>measureFunction</code> function",id:"measure-function",level:3},{value:"Example",id:"measure-function-example",level:4},{value:"<code>MeasureFunctionOptions</code> type",id:"measure-function-options",level:3},{value:"<code>measureAsyncFunction</code> function",id:"measure-async-function",level:3},{value:"Example",id:"measure-async-function-example",level:4},{value:"<code>MeasureAsyncFunctionOptions</code> type",id:"measure-async-function-options",level:3},{value:"Configuration",id:"configuration",level:2},{value:"Default configuration",id:"default-configuration",level:3},{value:"<code>configure</code> function",id:"configure-function",level:3},{value:"Example",id:"configure-example",level:4},{value:"<code>resetToDefaults</code> function",id:"reset-to-defaults",level:3},{value:"Environmental variables",id:"environmental-variables",level:3}];function d(e){const n={admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.h1,{id:"api",children:"API"}),"\n",(0,r.jsx)(n.h2,{id:"measurements",children:"Measurements"}),"\n",(0,r.jsxs)(n.h3,{id:"measure-renders",children:[(0,r.jsx)(n.code,{children:"measureRenders()"})," function"]}),"\n",(0,r.jsx)(n.admonition,{type:"info",children:(0,r.jsxs)(n.p,{children:["Prior to version 1.0, this function has been named ",(0,r.jsx)(n.code,{children:"measurePerformance"}),"."]})}),"\n",(0,r.jsxs)(n.p,{children:["Custom wrapper for the RNTL/RTL's ",(0,r.jsx)(n.code,{children:"render"})," function responsible for rendering the passed screen inside a ",(0,r.jsx)(n.code,{children:"React.Profiler"})," component,\nmeasuring its performance and writing results to the output file. You can use optional ",(0,r.jsx)(n.code,{children:"options"})," object allows customizing aspects\nof the testing."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"async function measureRenders(\n  ui: React.ReactElement,\n  options?: MeasureRendersOptions,\n): Promise<MeasureResults> {\n"})}),"\n",(0,r.jsx)(n.h4,{id:"measure-renders-example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"// sample.perf-test.tsx\nimport { measureRenders } from 'reassure';\nimport { screen, fireEvent } from '@testing-library/react-native';\nimport { ComponentUnderTest } from './ComponentUnderTest';\n\ntest('Test with scenario', async () => {\n  const scenario = async () => {\n    fireEvent.press(screen.getByText('Go'));\n    await screen.findByText('Done');\n  };\n\n  await measureRenders(<ComponentUnderTest />, { scenario });\n});\n"})}),"\n",(0,r.jsxs)(n.h3,{id:"measure-renders-options",children:[(0,r.jsx)(n.code,{children:"MeasureRendersOptions"})," type"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"interface MeasureRendersOptions {\n  runs?: number;\n  warmupRuns?: number;\n  removeOutliers?: boolean;\n  wrapper?: React.ComponentType<{ children: ReactElement }>;\n  scenario?: (view?: RenderResult) => Promise<any>;\n  writeFile?: boolean;\n}\n"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"runs"})}),": number of runs per series for the particular test"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"warmupRuns"})}),": number of additional warmup runs that will be done and discarded before the actual runs (default: 1)"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"removeOutliers"})}),": should remove statistical outlier results (default: ",(0,r.jsx)(n.code,{children:"true"}),")"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"wrapper"})}),": React component, such as a ",(0,r.jsx)(n.code,{children:"Provider"}),", which the ",(0,r.jsx)(n.code,{children:"ui"})," will be wrapped with. Note: the render duration of the ",(0,r.jsx)(n.code,{children:"wrapper"})," itself is excluded from the results, only the wrapped component is measured."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"scenario"})}),": a custom async function, which defines user interaction within the ui by utilized RNTL functions"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"writeFile"})}),": should write output to file (default ",(0,r.jsx)(n.code,{children:"true"}),")"]}),"\n"]}),"\n",(0,r.jsxs)(n.h3,{id:"measure-function",children:[(0,r.jsx)(n.code,{children:"measureFunction"})," function"]}),"\n",(0,r.jsxs)(n.p,{children:["Allows you to wrap any synchronous function, measure its performance and write results to the output file. You can use optional ",(0,r.jsx)(n.code,{children:"options"})," to customize aspects of the testing."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"async function measureFunction(\n  fn: () => void,\n  options?: MeasureFunctionOptions,\n): Promise<MeasureResults> {\n"})}),"\n",(0,r.jsx)(n.h4,{id:"measure-function-example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"// sample.perf-test.tsx\nimport { measureFunction } from 'reassure';\nimport { fib } from './fib';\n\ntest('fib 30', async () => {\n  await measureFunction(() => fib(30));\n});\n"})}),"\n",(0,r.jsxs)(n.h3,{id:"measure-function-options",children:[(0,r.jsx)(n.code,{children:"MeasureFunctionOptions"})," type"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"interface MeasureFunctionOptions {\n  runs?: number;\n  warmupRuns?: number;\n  removeOutliers?: boolean;\n  writeFile?: boolean;\n}\n"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"runs"})}),": number of runs per series for the particular test"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"warmupRuns"})}),": number of additional warmup runs that will be done and discarded before the actual runs"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"removeOutliers"})}),": should remove statistical outlier results (default: ",(0,r.jsx)(n.code,{children:"true"}),")"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"writeFile"})}),": should write output to file (default ",(0,r.jsx)(n.code,{children:"true"}),")"]}),"\n"]}),"\n",(0,r.jsxs)(n.h3,{id:"measure-async-function",children:[(0,r.jsx)(n.code,{children:"measureAsyncFunction"})," function"]}),"\n",(0,r.jsxs)(n.p,{children:["Allows you to wrap any asynchronous function, measure its performance and write results to the output file. You can use optional ",(0,r.jsx)(n.code,{children:"options"})," to customize aspects of the testing."]}),"\n",(0,r.jsx)(n.admonition,{type:"info",children:(0,r.jsxs)(n.p,{children:["Measuring performance of asynchronous functions can be tricky. These functions often depend on external conditions like I/O operations, network requests, or storage access, which introduce unpredictable timing variations in your measurements. For stable and meaningful performance metrics, ",(0,r.jsx)(n.strong,{children:"always ensure all external calls are properly mocked in your test environment to avoid polluting your performance measurements with uncontrollable factors."})]})}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"async function measureAsyncFunction(\n  fn: () => Promise<unknown>,\n  options?: MeasureAsyncFunctionOptions,\n): Promise<MeasureResults> {\n"})}),"\n",(0,r.jsx)(n.h4,{id:"measure-async-function-example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"// sample.perf-test.tsx\nimport { measureAsyncFunction } from 'reassure';\nimport { fib } from './fib';\n\ntest('fib 30', async () => {\n  await measureAsyncFunction(async () => {\n    return Promise.resolve().then(() => fib(30));\n  });\n});\n"})}),"\n",(0,r.jsxs)(n.h3,{id:"measure-async-function-options",children:[(0,r.jsx)(n.code,{children:"MeasureAsyncFunctionOptions"})," type"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"interface MeasureAsyncFunctionOptions {\n  runs?: number;\n  warmupRuns?: number;\n  removeOutliers?: boolean;\n  writeFile?: boolean;\n}\n"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"runs"})}),": number of runs per series for the particular test"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"warmupRuns"})}),": number of additional warmup runs that will be done and discarded before the actual runs"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"removeOutliers"})}),": should remove statistical outlier results (default: ",(0,r.jsx)(n.code,{children:"true"}),")"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"writeFile"})}),": (default ",(0,r.jsx)(n.code,{children:"true"}),") should write output to file"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"configuration",children:"Configuration"}),"\n",(0,r.jsx)(n.h3,{id:"default-configuration",children:"Default configuration"}),"\n",(0,r.jsxs)(n.p,{children:["The default config which will be used by the measuring script. This configuration object can be overridden with the use\nof the ",(0,r.jsx)(n.code,{children:"configure"})," function."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"type Config = {\n  runs?: number;\n  warmupRuns?: number;\n  outputFile?: string;\n  verbose?: boolean;\n  testingLibrary?:\n    | 'react-native'\n    | 'react'\n    | { render: (component: React.ReactElement<any>) => any; cleanup: () => any };\n};\n"})}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"const defaultConfig: Config = {\n  runs: 10,\n  warmupRuns: 1,\n  outputFile: '.reassure/current.perf',\n  verbose: false,\n  testingLibrary: undefined, // Will try auto-detect first RNTL, then RTL\n};\n"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"runs"})}),": number of repeated runs in a series per test (allows for higher accuracy by aggregating more data). Should be handled with care."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"warmupRuns"})}),": number of additional warmup runs that will be done and discarded before the actual runs."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"outputFile"})}),": name of the file the records will be saved to"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"verbose"})}),": make Reassure log more, e.g. for debugging purposes"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:(0,r.jsx)(n.code,{children:"testingLibrary"})}),": where to look for ",(0,r.jsx)(n.code,{children:"render"})," and ",(0,r.jsx)(n.code,{children:"cleanup"})," functions, supported values ",(0,r.jsx)(n.code,{children:"'react-native'"}),", ",(0,r.jsx)(n.code,{children:"'react'"})," or object providing custom ",(0,r.jsx)(n.code,{children:"render"})," and ",(0,r.jsx)(n.code,{children:"cleanup"})," functions"]}),"\n"]}),"\n",(0,r.jsxs)(n.h3,{id:"configure-function",children:[(0,r.jsx)(n.code,{children:"configure"})," function"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"function configure(customConfig: Partial<Config>): void;\n"})}),"\n",(0,r.jsxs)(n.p,{children:["You can use the ",(0,r.jsx)(n.code,{children:"configure"})," function to override the default config parameters."]}),"\n",(0,r.jsx)(n.h4,{id:"configure-example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"import { configure } from 'reassure';\n\nconfigure({\n  testingLibrary: 'react', // force using React Testing Library internally by Reassure to render and cleanup\n  runs: 7, // by default repeat performance tests 7 times\n});\n"})}),"\n",(0,r.jsxs)(n.h3,{id:"reset-to-defaults",children:[(0,r.jsx)(n.code,{children:"resetToDefaults"})," function"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-ts",children:"resetToDefaults(): void\n"})}),"\n",(0,r.jsxs)(n.p,{children:["Reset current config to the original ",(0,r.jsx)(n.code,{children:"defaultConfig"})," object. You can call ",(0,r.jsx)(n.code,{children:"resetToDefaults()"})," anywhere in your performance test file."]}),"\n",(0,r.jsx)(n.h3,{id:"environmental-variables",children:"Environmental variables"}),"\n",(0,r.jsxs)(n.p,{children:["The ",(0,r.jsx)(n.code,{children:"reassure"})," CLI can be parametrized using available environmental variables:"]}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"TEST_RUNNER_PATH"}),": an alternative path for your test runner. Defaults to ",(0,r.jsx)(n.code,{children:"'node_modules/.bin/jest'"})," or on Windows ",(0,r.jsx)(n.code,{children:"'node_modules/jest/bin/jest'"})]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"TEST_RUNNER_ARGS"}),": a set of arguments fed to the runner. Defaults to ",(0,r.jsx)(n.code,{children:'\'--runInBand --testMatch "**/__perf__/**/*.[jt]s?(x)", "**/*.(perf|perf-test).[jt]s?(x)"'})]}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"Example:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-sh",children:"TEST_RUNNER_PATH=myOwnPath/jest/bin yarn reassure\n"})})]})}function u(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>c});var r=s(6540);const i={},t=r.createContext(i);function o(e){const n=r.useContext(t);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);