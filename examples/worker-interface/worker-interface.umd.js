!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).RESTObject={})}(this,(function(e){"use strict";const t=Date.now()-Math.floor(1e3*Math.random());let r=0;var o;!function(e){e.THEN="then",e.CATCH="catch"}(o||(o={}));const s=e=>e===o.THEN||e===o.CATCH,n=(e="")=>{const o=`${e?`${e}/`:""}${t}/`;return()=>`${o}${++r};`},i=n();class a{constructor(e=i()){this.id=e}}class c{constructor(e,t,r,o){this.type=e,this.name=t,this.value=r,this.context=o}toObject(e=!1){const{type:t,name:r,value:o,context:s}=this;return{type:t,name:r,value:o,context:e?s:void 0}}toJSON(e=!1){const{type:t,name:r,value:o,context:s}=this;return JSON.stringify([t,r,o,e?s:void 0])}static fromJSON(e){const[t,r,o,s]=JSON.parse(e);return new c(t,r,o,s)}}class u extends c{constructor(e,t,r,o,s){super(t,r,o,s),this.prev=e}*[Symbol.iterator](){let e=this;for(;e;)yield e,e=e.prev}isTail(){return!this.prev}forEach(e){let t=this;do{e(t),t=t.prev}while(t)}map(e){let t=this;const r=[];do{r.push(e(t)),t=t.prev}while(t);return r}reduce(e,t){let r=this,o=t;do{o=e(o,r),r=r.prev}while(r);return o}static fromCommand({type:e,name:t,value:r,context:o},s){return new u(s,e,t,r,o)}}var p;!function(e){e.GET="P:get",e.SET="P:set",e.APPLY="P:apply",e.DELETE_PROPERTY="P:del",e.METHOD_CALL="P:call"}(p||(p={}));const l={arguments:!0,caller:!0,prototype:!0},d=Symbol("P:api"),m=(e,t,r={})=>{const o=Object.assign("function"==typeof e?function(...t){return e.apply(this,t)}:function(){},{target:e,[d]:{getTarget:()=>e,...r}});return new Proxy(o,t)},h=(f=Object.prototype.hasOwnProperty,(e,t)=>Boolean(e&&f.call(e,t)));var f;const y=e=>e===d||h(l,e),w=e=>(t,r)=>{const{target:o}=t;return y(r)?t[r]:e(p.GET,r,void 0,o)},v=e=>({target:t},r,o)=>e(p.APPLY,void 0,o,t),E=e=>({target:t},r,o)=>!y(r)&&(e(p.SET,r,o,t),!0),g=e=>(t,r)=>!y(r)&&(e(p.DELETE_PROPERTY,r,void 0,t.target),!0),b=(e,t)=>!!y(t)&&e[t],P=()=>Object.getOwnPropertyNames(l),T=()=>Object.getOwnPropertyNames(l)[Symbol.iterator](),x=(e,t)=>y(t)?Object.getOwnPropertyDescriptor(e,t):Object.getOwnPropertyDescriptor(e.target,t),O=Promise.resolve(void 0),S=(e,t,r)=>{switch(t){case o.THEN:return e.then(...r);case o.CATCH:return e.catch(...r);default:throw new Error(`Unexpected Error: Promise method "${String(t)}" could not be called.`)}},L=(e,t=!0)=>(r,o)=>{const n=(r,o)=>{const i=(a=(r,i,a,c)=>{const l=((e,t,r,o,s,n)=>t===p.APPLY&&n&&e?.type===p.GET?new u(e.prev,p.METHOD_CALL,e.name,o,e.context):new u(e,t,r,o,s))(o,r,i,a,c,t);let d;return(e=>{const{type:t}=e;return t===p.GET||t===p.METHOD_CALL?s(e.name):t===p.APPLY&&s(e.prev?.name)})(l)?((e,t,r,o)=>{switch(e.type){case p.GET:{const{name:s,prev:n}=e;let{context:i}=e;if(r){if(!n)throw new Error("Unexpected Error: Proxy command GET has unknown context.");i=t(n,n.context,o)}return(...e)=>i[s](...e)}case p.METHOD_CALL:if(!e.context)throw new Error("Unexpected Error: Could not apply Promise method of unknown context.");return S(e.context,e.name,e.value);case p.APPLY:{const{prev:t}=e;if(!t?.context||!t?.name)throw new Error("Unexpected Error: Could not apply Promise method of unknown context.");return S(t.context,t.name,e.value)}default:throw new Error(`Command type "${e.type}" could not be executed as a Promise command.`)}})(l,e,t,n):(d=r!==p.APPLY&&r!==p.GET||!t?e(l,c,n):O,n(d,l))},{get:w(a),apply:v(a),set:E(a),deleteProperty:g(a),has:b,ownKeys:P,enumerate:T,getOwnPropertyDescriptor:x});var a;return m(r,i,{getCommand:()=>o,dropCommandChain(){o&&delete o.prev}})};return n(Promise.resolve(r),o?u.fromCommand(o):void 0)};class j{constructor(e){this.map=e,this.mapIterator=this.map.keys()}[Symbol.iterator](){return new j(this.map)}next(){let e,t,r;do{({done:r,value:e}=this.mapIterator.next()),r||(t=this.map.get(e).deref())}while(!r&&!t);return{done:r,value:e}}}class k{constructor(e){this.mapIterator=e}[Symbol.iterator](){return new k(this.mapIterator[Symbol.iterator]())}next(){let e,t,r;do{({done:r,value:e}=this.mapIterator.next()),t=r?void 0:e.deref()}while(!r&&!t);return{done:r,value:t}}}class M{constructor(e){this.mapIterator=e}[Symbol.iterator](){return new M(this.mapIterator[Symbol.iterator]())}next(){let e,t,r;do{({done:r,value:e}=this.mapIterator.next()),r?e=void 0:(t=e[1].deref(),e=[e[0],t])}while(!r&&!t);return{done:r,entries:e}}}class R{constructor(e=!0){this.map=new Map,e&&(this.finalizer=new FinalizationRegistry((e=>{const t=this.map.get(e);t&&t.deref()||this.map.delete(e)})))}get size(){return this.map.size}keys(){return new j(this.map)}values(){return new k(this.map.values())}entries(){return new M(this.map.entries())}set(e,t){this.map.set(e,new WeakRef(t))}get(e){const t=this.map.get(e);return t&&t.deref()}has(e){return!!this.get(e)}delete(e){return this.map.delete(e)}clear(){this.map.clear()}forEach(e){this.map.forEach(((t,r)=>{const o=t.deref();o&&e(o,r,this)}))}verify(){const e=new Map;this.map.forEach(((t,r)=>{t.deref()&&e.set(r,t)})),this.map.clear(),this.map=e}}class C extends a{constructor(e,t){super(),this.pool=e,this.type=t}toObject(){return{id:this.id,poolId:this.pool.id,type:this.type}}toJSON(){return JSON.stringify(this.toObject())}}const I=e=>e&&"object"==typeof e&&"string"==typeof e.id&&"string"==typeof e.poolId,$=new Set;var A;A=["object","function"],$.clear(),A.forEach((e=>$.add(e)));class H extends a{constructor(){super(...arguments),this.refs=new R,this.resources=new WeakMap}get active(){return!!this.resources}set(e,t){let r=null;return o=e,$.has(typeof o)?(r=this.resources.get(e),r||(r=((e,t,r)=>new C(e,r||typeof t))(this,e,t),this.refs.set(r.id,e),this.resources.set(e,r)),r):r;var o}has(e){return this.resources.has(e)}get({id:e}){return this.getById(e)}getById(e){return this.refs.get(e)}getResource(e){return this.resources.get(e)}remove(e){const t=this.resources.get(e);return!!t&&(this.refs.delete(t.id),this.resources.delete(e))}clear(){for(const e of this.refs.keys()){const t=this.refs.get(e);this.resources.delete(t)}this.refs.clear()}}const N=(e=>()=>(e||(e=new H),e))();class D extends a{constructor(){super(),this.pools={},this.register(N())}createPool(){const e=new H;return this.register(e),e}register(e){return!h(this.pools,e.id)&&(this.pools[e.id]=e,!0)}get(e){return this.pools[e]||null}isRegistered(e){return h(this.pools,e.id)}remove(e){const t="string"==typeof e?e:e.id;return delete this.pools[t]}}const Y=(e=>()=>(e||(e=new D),e))(),_="message";var W,G;!function(e){e.HOST="host",e.WORKER="worker"}(W||(W={})),function(e){e.REQUEST="request",e.RESPONSE="response"}(G||(G={}));const z=n("wi"),U=n("m"),J=(e="")=>t=>t&&"object"==typeof t&&"string"==typeof t.id&&(!e&&t.id.match(/^wi/)||e&&e===t.id),B=({handler:e,timeout:t,timeoutError:r=`Async operation didn't complete in ${t}ms.`,onTimeout:o})=>{const s=new Promise(e);return t?Promise.race([s,new Promise(((e,s)=>setTimeout((()=>{s(r),o&&o(r)}),t)))]):s},q=e=>{if(e)return e;if("object"==typeof self)return self;throw new Error('EventEmitter is not defined, please provide EventEmitter interface via "worker" or "eventEmitter" property.')},K=e=>{if(e)return e;if("object"==typeof self)return self;throw new Error('MessagePort is not defined, please provide MessagePort interface via "worker" or "messagePort" property.')},Q=e=>e instanceof Event?e.data:e,F=e=>{if(e.addEventListener)return{subscribe:t=>e.addEventListener(_,t),unsubscribe:t=>e.removeEventListener(_,t)};if(e.addListener)return{subscribe:t=>e.addListener(_,t),unsubscribe:t=>e.removeListener(_,t)};if(e.on)return{subscribe:t=>e.on(_,t),unsubscribe:t=>e.off(_,t)};throw new Error('Worker instance does not implement EventEmitter insterface, it must expose "addEventListener"/"removeEventListener", "addListener"/"removeListener" or "on"/"off" method pair.')},V=({type:e,remoteId:t,handshakeTimeout:r,...o})=>{const s={...o,isMessage:J(t)},n=e===W.HOST?(({id:e,root:t,isMessage:r,subscribe:o,unsubscribe:s,postMessage:n})=>i=>{const a=o=>{const c=Q(o);r(c)&&(s(a),n({id:e,root:t}),i(c))};o(a)})(s):(({id:e,root:t,isMessage:r,subscribe:o,unsubscribe:s,postMessage:n,handshakeInterval:i})=>a=>{let c;const u=e=>{const t=Q(e);r(t)&&(s(u),clearInterval(c),a(t))};o(u);const p=()=>n({id:e,root:t});i?c=setInterval(p,i):p()})(s);return B({handler:n,timeout:r,timeoutError:`Handshake sequence could not complete in ${r}ms.`})},X=Y().createPool(),Z=e=>{if(!I(e))return e;const{poolId:t,id:r}=e,o=Y().get(t);if(!o)throw new Error(`Resource Pool "${t}" does not exist.`);const s=o.getById(r);if(!s)throw new Error(`Resource "${r}" does not exist, pool "${t}".`);return s},ee=async({id:e,root:t,...r})=>{const o=e||z(),s=t?X.set(t).toObject():void 0,{subscribe:n,unsubscribe:i,postMessage:a}=r,{id:c,root:u}=await V({id:o,root:s,...r}),l=new Map,d=(m=o,e=>e&&"object"==typeof e&&"string"==typeof e.id&&m===e.target);var m;const h=((e,t)=>async(r,o,s=U())=>{const n=r.toObject(),i=await o;if(n.type===p.APPLY){let e;r.prev&&(e=await r.prev.context),n.value=[e,n.value]}return{id:s,type:G.REQUEST,source:e,target:t,command:n,context:i}})(o,c),f=(y=o,({id:e,source:t},r,o)=>({id:e,type:G.RESPONSE,source:y,target:t,value:r,error:o}));var y;const w=async e=>{const t=Q(e);if(d(t))switch(t.type){case G.REQUEST:{const e=t;try{const t=await(({command:e,command:{type:t,value:r},context:o})=>{const s=Z(o),n=e.name;if(!s)throw new Error(`Cannot excute command ${t}/${String(n)} on non existent target(${s}).`);let i;switch(t){case p.GET:i=s[n];break;case p.SET:return s[n]=Z(r);case p.DELETE_PROPERTY:return delete s[n];case p.APPLY:{const[e,t]=r;i=s.apply(Z(e),t.map(Z))}break;case p.METHOD_CALL:i=s[n](...r.map(Z))}if(i&&"function"==typeof i)return X.set(i).toObject();return i})(e);a(f(e,t))}catch(t){a(f(e,void 0,{message:t.message}))}}break;case G.RESPONSE:{const{id:e,value:r,error:o}=t,{resolve:s,reject:n}=l.get(e)||{};n&&o?n(o):s&&s(r)}}};n(w);const v=()=>i(w);if(!u)return{stop:v,pool:X};const E=L((async(e,t,o)=>{const{responseTimeout:s}=r,n=U(),i=`Could not receive command ${e.type}/${String(e.name)} response in ${s}ms.`,c=B({handler:async(r,o)=>{const s=await h(e,t,n);a(s),l.set(n,{resolve:r,reject:o})},timeout:s||0,timeoutError:i,onTimeout:()=>{const e=l.get(n);e&&(e.reject(new Error(i)),l.delete(n))}}),u=await c;return I(u)?o(c,e):c}),!1);return{stop:v,pool:X,wrap:E,pendingRequests:l,root:u?E(u):null}};e.initialize=ee,e.initializeHost=async({worker:e,...t})=>{let r=e;if("string"==typeof e){if("undefined"==typeof Worker)throw new Error("Worker class is not available globally.");r=new Worker(e)}return ee({...t,type:W.HOST,postMessage:e=>r.postMessage(e),...F(r)})},e.initializeWorker=async({worker:e,eventEmitter:t=q(e),messagePort:r=K(e),...o})=>ee({...o,type:W.WORKER,postMessage:e=>r.postMessage(e),...F(t)}),Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=worker-interface.umd.js.map
