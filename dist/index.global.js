"use strict";var EwIframeEditor=(()=>{var h=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var _=Object.prototype.hasOwnProperty;var j=(t,e)=>{for(var s in e)h(t,s,{get:e[s],enumerable:!0})},O=(t,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of D(e))!_.call(t,r)&&r!==s&&h(t,r,{get:()=>e[r],enumerable:!(n=R(e,r))||n.enumerable});return t};var H=t=>O(h({},"__esModule",{value:!0}),t);var q={};j(q,{EwCodeEditorAdapter:()=>l,createEditor:()=>b,defaultParser:()=>E,ewCodeEditorAdapter:()=>m});function E(t){let e="",s="",n="",r=t.match(/<style>[\s\S]*?<\/style>/i);r&&(s=r[0].replace(/<\/?style>/gi,""));let d=t.match(/<html>[\s\S]*?<\/html>/i);d&&(e=d[0].replace(/<\/?html>/gi,""));let i=t.match(/<script>[\s\S]*?<\/script>/i);return i&&(n=i[0].replace(/<\/?script>/gi,"")),{html:e,css:s,js:n}}function M(t){return[{type:"html",content:t.html},{type:"css",content:t.css},{type:"js",content:t.js}]}var W="https://ew-code-editor.eveningwater.com",Y=5e3,l=class{constructor(e=W){this.name="ew-code-editor";this.usesPostMessage=!0;this.codeUrl=e}getUrl(){return this.codeUrl}sendCode(e,s){let n=M(s);e.contentWindow?.postMessage(n,"*")}waitForReady(e,s,n){let r=!1,d=i=>{!r&&i.data&&typeof i.data=="object"&&i.data.type==="ready"&&i.source===e.contentWindow&&(r=!0,window.removeEventListener("message",d),s())};window.addEventListener("message",d),setTimeout(()=>{r||(r=!0,window.removeEventListener("message",d),n())},Y)}};function m(t){return new l(t)}var k=`
  body,html {
    height: 100%;
    overflow: hidden;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .ew-iframe {
    width: 100%;
    height: 100%;
    border: none;
    overflow: hidden;
  }
`,B=[0,300,800,1500,3e3],L="ew-code-editor-iframe",T="ew-code-editor-style";async function x(t,e,s){if(t)return t;if(e){let r=await(await fetch(e)).text();return s(r)}return{html:"",css:"",js:""}}function b(t){let{adapter:e=m(),requestUrl:s,code:n,iframeStyle:r=k,container:d,parser:i=E,retryDelays:F=B,onLoad:I,onError:g}=t,S=d instanceof HTMLElement?d:typeof d=="string"?document.querySelector(d)??document.body:document.body,w=document.getElementById(L);w&&w.remove();let C=document.getElementById(T);C&&C.remove();let o=document.createElement("iframe");o.id=L,o.scrolling="no",o.title="code",o.setAttribute("frameborder","no"),o.setAttribute("allowtransparency","true"),o.setAttribute("allowfullscreen","true"),o.classList.add("ew-iframe");let p=document.createElement("style");p.id=T,p.textContent=r;let A=a=>{let u=a instanceof Error?a:new Error(String(a));g?g(u):console.error("[ew-iframe-editor] Failed to load initial code:",u)},f=!1,y=!1,c=null,U=()=>{f&&c&&!y&&e.sendCode(o,c)},v=()=>{f&&c&&(y?P(c):e.sendCode(o,c))},P=a=>{F.forEach(u=>{setTimeout(()=>e.sendCode(o,a),u)})};return e.usesPostMessage&&e.waitForReady&&e.waitForReady(o,()=>{f=!0,U()},()=>{y=!0,f=!0,v()}),o.onload=function(){e.usesPostMessage&&x(n,s,i).then(a=>{c=a,e.waitForReady?v():P(a)}).catch(A),I?.(o)},e.usesPostMessage?o.src=e.getUrl({html:"",css:"",js:""}):x(n,s,i).then(a=>{o.src=e.getUrl(a)}).catch(A),document.head.appendChild(p),S.appendChild(o),{iframe:o,destroy:()=>{o.onload=null,p.remove(),o.remove()}}}return H(q);})();
//# sourceMappingURL=index.global.js.map