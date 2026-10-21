function y(o){let e="",r="",d="",s=o.match(/<style>[\s\S]*?<\/style>/i);s&&(r=s[0].replace(/<\/?style>/gi,""));let n=o.match(/<html>[\s\S]*?<\/html>/i);n&&(e=n[0].replace(/<\/?html>/gi,""));let i=o.match(/<script>[\s\S]*?<\/script>/i);return i&&(d=i[0].replace(/<\/?script>/gi,"")),{html:e,css:r,js:d}}function P(o){return[{type:"html",content:o.html},{type:"css",content:o.css},{type:"js",content:o.js}]}var S="https://ew-code-editor.eveningwater.com",U=5e3,l=class{constructor(e=S){this.name="ew-code-editor";this.usesPostMessage=!0;this.codeUrl=e}getUrl(){return this.codeUrl}sendCode(e,r){let d=P(r);e.contentWindow?.postMessage(d,"*")}waitForReady(e,r,d){let s=!1,n=i=>{!s&&i.data&&typeof i.data=="object"&&i.data.type==="ready"&&i.source===e.contentWindow&&(s=!0,window.removeEventListener("message",n),r())};window.addEventListener("message",n),setTimeout(()=>{s||(s=!0,window.removeEventListener("message",n),d())},U)}};function u(o){return new l(o)}var R=`
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
`,D=[0,300,800,1500,3e3],M="ew-code-editor-iframe",L="ew-code-editor-style";async function T(o,e,r){if(o)return o;if(e){let s=await(await fetch(e)).text();return r(s)}return{html:"",css:"",js:""}}function _(o){let{adapter:e=u(),requestUrl:r,code:d,iframeStyle:s=R,container:n,parser:i=y,retryDelays:x=D,onLoad:b,onError:h}=o,F=n instanceof HTMLElement?n:typeof n=="string"?document.querySelector(n)??document.body:document.body,g=document.getElementById(M);g&&g.remove();let w=document.getElementById(L);w&&w.remove();let t=document.createElement("iframe");t.id=M,t.scrolling="no",t.title="code",t.setAttribute("frameborder","no"),t.setAttribute("allowtransparency","true"),t.setAttribute("allowfullscreen","true"),t.classList.add("ew-iframe");let m=document.createElement("style");m.id=L,m.textContent=s;let C=a=>{let f=a instanceof Error?a:new Error(String(a));h?h(f):console.error("[ew-iframe-editor] Failed to load initial code:",f)},p=!1,E=!1,c=null,I=()=>{p&&c&&!E&&e.sendCode(t,c)},A=()=>{p&&c&&(E?v(c):e.sendCode(t,c))},v=a=>{x.forEach(f=>{setTimeout(()=>e.sendCode(t,a),f)})};return e.usesPostMessage&&e.waitForReady&&e.waitForReady(t,()=>{p=!0,I()},()=>{E=!0,p=!0,A()}),t.onload=function(){e.usesPostMessage&&T(d,r,i).then(a=>{c=a,e.waitForReady?A():v(a)}).catch(C),b?.(t)},e.usesPostMessage?t.src=e.getUrl({html:"",css:"",js:""}):T(d,r,i).then(a=>{t.src=e.getUrl(a)}).catch(C),document.head.appendChild(m),F.appendChild(t),{iframe:t,destroy:()=>{t.onload=null,m.remove(),t.remove()}}}export{l as EwCodeEditorAdapter,_ as createEditor,y as defaultParser,u as ewCodeEditorAdapter};
//# sourceMappingURL=index.esm.js.map