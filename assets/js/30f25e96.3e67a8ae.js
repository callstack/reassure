"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[417],{1650:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>u,contentTitle:()=>i,default:()=>m,frontMatter:()=>o,metadata:()=>c,toc:()=>d});var t=r(4848),s=r(8453),a=r(1470),l=r(9365);const o={title:"Migration to v1.x",sidebar_position:6},i="Migration to v1.x",c={id:"migration-v1",title:"Migration to v1.x",description:"Installation",source:"@site/docs/migration-v1.md",sourceDirName:".",slug:"/migration-v1",permalink:"/reassure/docs/migration-v1",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:6,frontMatter:{title:"Migration to v1.x",sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"Troubleshooting",permalink:"/reassure/docs/troubleshooting"},next:{title:"Examples",permalink:"/reassure/docs/examples"}},u={},d=[{value:"Installation",id:"installation",level:2},{value:"Breaking changes",id:"breaking-changes",level:2},{value:"Rename <code>measurePerformance</code> to <code>measureRenders</code>",id:"rename-measureperformance-to-measurerenders",level:3},{value:"Rename <code>resetToDefault</code> to <code>resetToDefaults</code>",id:"rename-resettodefault-to-resettodefaults",level:3},{value:"Testing environment",id:"testing-environment",level:2},{value:"Non-breaking changes",id:"non-breaking-changes",level:2},{value:"Exporting of <code>Measure*</code> and <code>Compare*</code> types",id:"exporting-of-measure-and-compare-types",level:3},{value:"Removal of <code>--enable-wasm</code> flag",id:"removal-of---enable-wasm-flag",level:3}];function h(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"migration-to-v1x",children:"Migration to v1.x"}),"\n",(0,t.jsx)(n.h2,{id:"installation",children:"Installation"}),"\n",(0,t.jsxs)(a.A,{children:[(0,t.jsx)(l.A,{value:"npm",label:"npm",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-sh",children:"npm install --save-dev reassure\n"})})}),(0,t.jsx)(l.A,{value:"yarn",label:"yarn",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-sh",children:"yarn add --dev reassure\n"})})})]}),"\n",(0,t.jsx)(n.h2,{id:"breaking-changes",children:"Breaking changes"}),"\n",(0,t.jsxs)(n.h3,{id:"rename-measureperformance-to-measurerenders",children:["Rename ",(0,t.jsx)(n.code,{children:"measurePerformance"})," to ",(0,t.jsx)(n.code,{children:"measureRenders"})]}),"\n",(0,t.jsx)(n.p,{children:"The signature of the function did not change. Old name is still available but will generate warning messages when used."}),"\n",(0,t.jsxs)(n.h3,{id:"rename-resettodefault-to-resettodefaults",children:["Rename ",(0,t.jsx)(n.code,{children:"resetToDefault"})," to ",(0,t.jsx)(n.code,{children:"resetToDefaults"})]}),"\n",(0,t.jsx)(n.p,{children:"The signature of the function did not change. Old name is no longer available."}),"\n",(0,t.jsx)(n.h2,{id:"testing-environment",children:"Testing environment"}),"\n",(0,t.jsxs)(n.p,{children:["Reassure v0 used Node.js JIT-less mode (",(0,t.jsx)(n.code,{children:"--jitless"})," node flag), optionally using different flags if ",(0,t.jsx)(n.code,{children:"--enable-wasp"})," experimental option was passed. Reassure V1 runs tests using Node.js's non-optimized compilation to better reflect React Native runtime environment."]}),"\n",(0,t.jsx)(n.p,{children:"This means that:"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsx)(n.li,{children:"Tests will run ~2x faster than in V0. This should be visible in the single PR where you update Reassure to V1 in your repo as the baseline measurements will run with the old flags, while the current measurements will run with the new flags. Afterwards, both baseline and current measurement should run with the same compilation options."}),"\n",(0,t.jsx)(n.li,{children:"WebAssembly is now enabled by default."}),"\n"]}),"\n",(0,t.jsx)(n.h2,{id:"non-breaking-changes",children:"Non-breaking changes"}),"\n",(0,t.jsxs)(n.h3,{id:"exporting-of-measure-and-compare-types",children:["Exporting of ",(0,t.jsx)(n.code,{children:"Measure*"})," and ",(0,t.jsx)(n.code,{children:"Compare*"})," types"]}),"\n",(0,t.jsxs)(n.p,{children:["Reassure now exports following TypeScript types from root ",(0,t.jsx)(n.code,{children:"reassure"})," package:"]}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"MeasureResults"})," - return type of ",(0,t.jsx)(n.code,{children:"measureRenders"})," and ",(0,t.jsx)(n.code,{children:"measureFunction"})]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"MeasureRendersOptions"})," - options passed to ",(0,t.jsx)(n.code,{children:"measureRenders"})]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"MeasureFunctionOptions"})," - options passed to ",(0,t.jsx)(n.code,{children:"measureFunction"})]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"MeasureType"})," - type of measurement: ",(0,t.jsx)(n.code,{children:"render"})," or ",(0,t.jsx)(n.code,{children:"function"})]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"MeasureHeader"})," - header from performance file (",(0,t.jsx)(n.code,{children:"baseline.perf"}),", ",(0,t.jsx)(n.code,{children:"current.perf"}),")"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"MeasureMetadata"})," - metadata from performance file"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"MeasureEntry"})," - single entry from performance file"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"CompareResult"})," - format of ",(0,t.jsx)(n.code,{children:"output.json"})," file"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"CompareMetadata"})," - metadata from ",(0,t.jsx)(n.code,{children:"output.json"})," file"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"CompareEntry"})," - single comparison result from ",(0,t.jsx)(n.code,{children:"output.json"})," file"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"AddedEntry"})," - similar to ",(0,t.jsx)(n.code,{children:"CompareEntry"})," but for cases when there is only ",(0,t.jsx)(n.code,{children:"current"})," measurement"]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"RemovedEntry"})," - similar to ",(0,t.jsx)(n.code,{children:"CompareEntry"})," but for cases when there is only ",(0,t.jsx)(n.code,{children:"baseline"})," measurement"]}),"\n"]}),"\n",(0,t.jsxs)(n.h3,{id:"removal-of---enable-wasm-flag",children:["Removal of ",(0,t.jsx)(n.code,{children:"--enable-wasm"})," flag"]}),"\n",(0,t.jsxs)(n.p,{children:["Reassure now runs tests with WebAssembly enable by default (see ",(0,t.jsx)(n.a,{href:"#testing-environment",children:"testing environment"}),")."]})]})}function m(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(h,{...e})}):h(e)}},9365:(e,n,r)=>{r.d(n,{A:()=>l});r(6540);var t=r(8215);const s={tabItem:"tabItem_Ymn6"};var a=r(4848);function l(e){let{children:n,hidden:r,className:l}=e;return(0,a.jsx)("div",{role:"tabpanel",className:(0,t.A)(s.tabItem,l),hidden:r,children:n})}},1470:(e,n,r)=>{r.d(n,{A:()=>w});var t=r(6540),s=r(8215),a=r(3104),l=r(6347),o=r(205),i=r(7485),c=r(1682),u=r(9466);function d(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:r}=e;return(0,t.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:r,attributes:t,default:s}}=e;return{value:n,label:r,attributes:t,default:s}}))}(r);return function(e){const n=(0,c.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,r])}function m(e){let{value:n,tabValues:r}=e;return r.some((e=>e.value===n))}function f(e){let{queryString:n=!1,groupId:r}=e;const s=(0,l.W6)(),a=function(e){let{queryString:n=!1,groupId:r}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return r??null}({queryString:n,groupId:r});return[(0,i.aZ)(a),(0,t.useCallback)((e=>{if(!a)return;const n=new URLSearchParams(s.location.search);n.set(a,e),s.replace({...s.location,search:n.toString()})}),[a,s])]}function p(e){const{defaultValue:n,queryString:r=!1,groupId:s}=e,a=h(e),[l,i]=(0,t.useState)((()=>function(e){let{defaultValue:n,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!m({value:n,tabValues:r}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${r.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const t=r.find((e=>e.default))??r[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:n,tabValues:a}))),[c,d]=f({queryString:r,groupId:s}),[p,x]=function(e){let{groupId:n}=e;const r=function(e){return e?`docusaurus.tab.${e}`:null}(n),[s,a]=(0,u.Dv)(r);return[s,(0,t.useCallback)((e=>{r&&a.set(e)}),[r,a])]}({groupId:s}),b=(()=>{const e=c??p;return m({value:e,tabValues:a})?e:null})();(0,o.A)((()=>{b&&i(b)}),[b]);return{selectedValue:l,selectValue:(0,t.useCallback)((e=>{if(!m({value:e,tabValues:a}))throw new Error(`Can't select invalid tab value=${e}`);i(e),d(e),x(e)}),[d,x,a]),tabValues:a}}var x=r(2303);const b={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var g=r(4848);function j(e){let{className:n,block:r,selectedValue:t,selectValue:l,tabValues:o}=e;const i=[],{blockElementScrollPositionUntilNextRender:c}=(0,a.a_)(),u=e=>{const n=e.currentTarget,r=i.indexOf(n),s=o[r].value;s!==t&&(c(n),l(s))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const r=i.indexOf(e.currentTarget)+1;n=i[r]??i[0];break}case"ArrowLeft":{const r=i.indexOf(e.currentTarget)-1;n=i[r]??i[i.length-1];break}}n?.focus()};return(0,g.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":r},n),children:o.map((e=>{let{value:n,label:r,attributes:a}=e;return(0,g.jsx)("li",{role:"tab",tabIndex:t===n?0:-1,"aria-selected":t===n,ref:e=>i.push(e),onKeyDown:d,onClick:u,...a,className:(0,s.A)("tabs__item",b.tabItem,a?.className,{"tabs__item--active":t===n}),children:r??n},n)}))})}function v(e){let{lazy:n,children:r,selectedValue:s}=e;const a=(Array.isArray(r)?r:[r]).filter(Boolean);if(n){const e=a.find((e=>e.props.value===s));return e?(0,t.cloneElement)(e,{className:"margin-top--md"}):null}return(0,g.jsx)("div",{className:"margin-top--md",children:a.map(((e,n)=>(0,t.cloneElement)(e,{key:n,hidden:e.props.value!==s})))})}function y(e){const n=p(e);return(0,g.jsxs)("div",{className:(0,s.A)("tabs-container",b.tabList),children:[(0,g.jsx)(j,{...e,...n}),(0,g.jsx)(v,{...e,...n})]})}function w(e){const n=(0,x.A)();return(0,g.jsx)(y,{...e,children:d(e.children)},String(n))}},8453:(e,n,r)=>{r.d(n,{R:()=>l,x:()=>o});var t=r(6540);const s={},a=t.createContext(s);function l(e){const n=t.useContext(a);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),t.createElement(a.Provider,{value:n},e.children)}}}]);