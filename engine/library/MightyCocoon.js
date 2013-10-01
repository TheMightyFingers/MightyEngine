'use strict';(function(){CocoonJS=window.CocoonJS?window.CocoonJS:{};CocoonJS.nativeExtensionObjectAvailable="undefined"!==typeof window.ext;CocoonJS.Size={width:0,height:0};CocoonJS.extend=function(a,b){var c=a.prototype,e=function(){};e.prototype=b.prototype;a.prototype=new e;a.superclass=b.prototype;a.prototype.constructor=a;b.prototype.constructor===Object.prototype.constructor&&(b.prototype.constructor=b);for(var d in c)c.hasOwnProperty(d)&&(a.prototype[d]=c[d])};CocoonJS.makeNativeExtensionObjectFunctionCall=
function(a,b,c,e){if(CocoonJS.nativeExtensionObjectAvailable){c=Array.prototype.slice.call(c);c.unshift(b);a=ext[a];a=e=(e?a.makeCallAsync:a.makeCall).apply(a,c);if("string"===typeof e)try{a=JSON.parse(e)}catch(d){}return a}};CocoonJS.getObjectFromPath=function(a,b){for(var c=b.split("."),e=a,d=0,f=c.length;d<f;++d)e[c[d]]=e[c[d]]||void 0,e=e[c[d]];return e};CocoonJS.getKeyForValueInDictionary=function(a,b){var c=null,e;for(e in a)if(a[e]===b){c=e;break}return c};CocoonJS.findStringInStringArrayThatIsIndexOf=
function(a,b,c){for(var e=null,b=c?b:b.toUpperCase(),d=0;null==e&&d<a.length;d++)e=c?a[d]:a[d].toUpperCase(),e=0<=e.indexOf(b)?a[d]:null;return e};CocoonJS.EventHandler=function(a,b,c,e){this.listeners=[];this.listenersOnce=[];this.chainFunction=e;this.addEventListener=function(d){if(e){var f=function(){e.call(this,arguments.callee.sourceListener,Array.prototype.slice.call(arguments))};d.CocoonJSEventHandlerChainFunction=f;f.sourceListener=d;d=f}(f=CocoonJS.getObjectFromPath(CocoonJS,b))&&f.nativeExtensionObjectAvailable?
ext[a].addEventListener(c,d):0>this.listeners.indexOf(d)&&this.listeners.push(d)};this.addEventListenerOnce=function(d){if(e){var f=function(){e(arguments.callee.sourceListener,Array.prototype.slice.call(arguments))};f.sourceListener=d;d=f}CocoonJS.getObjectFromPath(CocoonJS,b).nativeExtensionObjectAvailable?ext[a].addEventListenerOnce(c,d):0>this.listeners.indexOf(d)&&this.listenersOnce.push(d)};this.removeEventListener=function(d){e&&(d=d.CocoonJSEventHandlerChainFunction,delete d.CocoonJSEventHandlerChainFunction);
CocoonJS.getObjectFromPath(CocoonJS,b).nativeExtensionObjectAvailable?ext[a].removeEventListener(c,d):(d=this.listeners.indexOf(d),0<=d&&this.listeners.splice(d,1))};this.notifyEventListeners=function(){var d=CocoonJS.getObjectFromPath(CocoonJS,b);if(d&&d.nativeExtensionObjectAvailable)ext[a].notifyEventListeners(c);else{var e=Array.prototype.slice.call(arguments),g=Array.prototype.slice.call(this.listeners),h=Array.prototype.slice.call(this.listenersOnce),i=this;setTimeout(function(){for(var a=0;a<
g.length;a++)g[a].apply(i,e);for(a=0;a<h.length;a++)h[a].apply(i,e)},0);i.listenersOnce=[]}};return this};CocoonJS.Timer=function(){this.reset();return this};CocoonJS.Timer.prototype={currentTimeInMillis:0,lastTimeInMillis:0,elapsedTimeInMillis:0,elapsedTimeInSeconds:0,accumTimeInMillis:0,reset:function(){this.currentTimeInMillis=this.lastTimeInMillis=(new Date).getTime();this.accumTimeInMillis=this.elapsedTimeInMillis=this.elapsedTimeInSeconds=0},update:function(){this.currentTimeInMillis=(new Date).getTime();
this.elapsedTimeInMillis=this.currentTimeInMillis-this.lastTimeInMillis;this.elapsedTimeInSeconds=this.elapsedTimeInMillis/1E3;this.lastTimeInMillis=this.currentTimeInMillis;this.accumTimeInMillis+=this.elapsedTimeInMillis}}})();
(function(){if("undefined"===typeof window.CocoonJS||null===window.CocoonJS)throw"The CocoonJS object must exist and be valid before creating any extension object.";CocoonJS.App=CocoonJS.App?CocoonJS.App:{};CocoonJS.App.nativeExtensionObjectAvailable=CocoonJS.nativeExtensionObjectAvailable&&"undefined"!==typeof window.ext.IDTK_APP;CocoonJS.App.FPSLayout={TOP_LEFT:"top-left",TOP_RIGHT:"top-right",BOTTOM_LEFT:"bottom-left",BOTTOM_RIGHT:"bottom-right"};CocoonJS.App.KeyboardType={TEXT:"text",NUMBER:"num",
PHONE:"phone",EMAIL:"email",URL:"url"};CocoonJS.App.StorageType={APP_STORAGE:"APP_STORAGE",INTERNAL_STORAGE:"INTERNAL_STORAGE",EXTERNAL_STORAGE:"EXTERNAL_STORAGE",TEMPORARY_STORAGE:"TEMPORARY_STORAGE"};CocoonJS.App.CaptureType={EVERYTHING:0,JUST_COCOONJS_GL_SURFACE:1,JUST_SYSTEM_VIEWS:2};CocoonJS.App.forward=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","forward",arguments);if(!navigator.isCocoonJS)return"CocoonJS_App_ForCocoonJS_WebViewIFrame"==
window.name?window.parent.eval(a):window.frames.CocoonJS_App_ForCocoonJS_WebViewIFrame.window.eval(a)};CocoonJS.App.forwardAsync=function(a,b){if(CocoonJS.App.nativeExtensionObjectAvailable)return"undefined"!==typeof b?ext.IDTK_APP.makeCallAsync("forward",a,b):ext.IDTK_APP.makeCallAsync("forward",a);if(!navigator.isCocoonJS)return"CocoonJS_App_ForCocoonJS_WebViewIFrame"==window.name?window.parent.eval(a):window.parent.frames.CocoonJS_App_ForCocoonJS_WebViewIFrame.window.eval(a)};CocoonJS.App.showTextDialog=
function(a,b,c,e,d,f){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","showTextDialog",arguments,!0);if(!navigator.isCocoonJS){b||(b="");c||(c="");var g=prompt(b,c);(g?CocoonJS.App.onTextDialogFinished:CocoonJS.App.onTextDialogCancelled).notifyEventListeners(g)}};CocoonJS.App.showMessageBox=function(a,b,c,e){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","showMessageBox",
arguments,!0);navigator.isCocoonJS||(b||(b=""),(confirm(b)?CocoonJS.App.onMessageBoxConfirmed:CocoonJS.App.onMessageBoxDenied).notifyEventListeners())};CocoonJS.App.load=function(a,b){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","loadPath",arguments);if(!navigator.isCocoonJS){var c=new XMLHttpRequest;c.onreadystatechange=function(){if(4===c.readyState)if(200===c.status){var b;b=CocoonJS.App.EmulatedWebViewIFrame?"window.CocoonJS && window.CocoonJS.App.onLoadInCocoonJSSucceed.notifyEventListeners('"+
a+"');":"window.CocoonJS && window.CocoonJS.App.onLoadInTheWebViewSucceed.notifyEventListeners('"+a+"');";CocoonJS.App.forwardAsync(b);window.location.href=a}else 404===c.status&&(this.onreadystatechange=null,b=CocoonJS.App.EmulatedWebViewIFrame?"CocoonJS && CocoonJS.App.onLoadInCocoonJSFailed.notifyEventListeners('"+a+"');":"CocoonJS && CocoonJS.App.onLoadInTheWebViewFailed.notifyEventListeners('"+a+"');",CocoonJS.App.forwardAsync(b))};c.open("GET",a,!0);c.send()}};CocoonJS.App.reload=function(){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP",
"reload",arguments);if(!navigator.isCocoonJS)return"CocoonJS_App_ForCocoonJS_WebViewIFrame"==window.name?window.parent.location.reload():window.parent.frames.CocoonJS_App_ForCocoonJS_WebViewIFrame.window.location.reload()};CocoonJS.App.openURL=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","openURL",arguments,!0);navigator.isCocoonJS||window.open(a,"_blank")};CocoonJS.App.forceToFinish=function(){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP",
"forceToFinish",arguments);navigator.isCocoonJS||window.close()};CocoonJS.App.setAutoLockEnabled=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","setAutoLockEnabled",arguments)};CocoonJS.App.createScreenCanvas=function(){var a;navigator.isCocoonJS?a=document.createElement("screencanvas"):navigator.isCocoonJS||(a=document.createElement("canvas"),a.width=window.innerWidth,a.height=window.innerHeight);return a};CocoonJS.App.disableTouchInCocoonJS=
function(){CocoonJS.App.nativeExtensionObjectAvailable&&window.ext.IDTK_APP.makeCall("disableTouchLayer","CocoonJSView")};CocoonJS.App.enableTouchInCocoonJS=function(){CocoonJS.App.nativeExtensionObjectAvailable&&window.ext.IDTK_APP.makeCall("enableTouchLayer","CocoonJSView")};CocoonJS.App.disableTouchInTheWebView=function(){CocoonJS.App.nativeExtensionObjectAvailable&&window.ext.IDTK_APP.makeCall("disableTouchLayer","WebView")};CocoonJS.App.enableTouchInTheWebView=function(){CocoonJS.App.nativeExtensionObjectAvailable&&
window.ext.IDTK_APP.makeCall("enableTouchLayer","WebView")};CocoonJS.App.setAccelerometerUpdateIntervalInSeconds=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable)return window.ext.IDTK_APP.makeCall("setAccelerometerUpdateIntervalInSeconds",a)};CocoonJS.App.getAccelerometerUpdateIntervalInSeconds=function(){if(CocoonJS.App.nativeExtensionObjectAvailable)return window.ext.IDTK_APP.makeCall("getAccelerometerUpdateIntervalInSeconds")};CocoonJS.App.setGyroscopeUpdateIntervalInSeconds=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable)return window.ext.IDTK_APP.makeCall("setGyroscopeUpdateIntervalInSeconds",
a)};CocoonJS.App.getGyroscopeUpdateIntervalInSeconds=function(){CocoonJS.App.nativeExtensionObjectAvailable&&window.ext.IDTK_APP.makeCall("getGyroscopeUpdateIntervalInSeconds")};CocoonJS.App.setupOriginProxyType=function(a,b,c,e){if(CocoonJS.App.nativeExtensionObjectAvailable){if(!a)throw"The given typeName must be valid.";if(!b&&!c&&!e)throw"There is no point on setting up a proxy for no attributes, functions nor eventHandlers.";var b=b?b:[],c=c?c:[],e=e?e:[],d=window,f="CocoonJS.App.setupDestinationProxyType("+
JSON.stringify(a)+", "+JSON.stringify(e)+");";CocoonJS.App.forward(f);f=d[a];d[a]=function(){var g=this;this._cocoonjs_proxy_object_data={};var f="CocoonJS.App.newDestinationProxyObject("+JSON.stringify(a)+");";this._cocoonjs_proxy_object_data.id=CocoonJS.App.forward(f);this._cocoonjs_proxy_object_data.eventHandlers={};this._cocoonjs_proxy_object_data.typeName=a;this._cocoonjs_proxy_object_data.eventListeners={};d[a]._cocoonjs_proxy_type_data.proxyObjects[this._cocoonjs_proxy_object_data.id]=this;
for(f=0;f<b.length;f++)(function(b){g.__defineSetter__(b,function(c){c="CocoonJS.App.setDestinationProxyObjectAttribute("+JSON.stringify(a)+", "+g._cocoonjs_proxy_object_data.id+", "+JSON.stringify(b)+", "+JSON.stringify(c)+");";return CocoonJS.App.forwardAsync(c)});g.__defineGetter__(b,function(){var c="CocoonJS.App.getDestinationProxyObjectAttribute("+JSON.stringify(a)+", "+g._cocoonjs_proxy_object_data.id+", "+JSON.stringify(b)+");";return CocoonJS.App.forwardAsync(c)})})(b[f]);for(f=0;f<c.length;f++)(function(b){g[b]=
function(){var c=Array.prototype.slice.call(arguments);c.unshift(b);c.unshift(this._cocoonjs_proxy_object_data.id);c.unshift(a);for(var d="CocoonJS.App.callDestinationProxyObjectFunction(",e=0;e<c.length;e++)d+=(1!==e?JSON.stringify(c[e]):c[e])+(e<c.length-1?", ":"");return CocoonJS.App.forwardAsync(d+");")}})(c[f]);for(f=0;f<e.length;f++)(function(a){g.__defineSetter__(a,function(b){g._cocoonjs_proxy_object_data.eventHandlers[a]=b});g.__defineGetter__(a,function(){return g._cocoonjs_proxy_object_data.eventHandlers[a]})})(e[f]);
g.addEventListener=function(a,b){var c=!0,d=g._cocoonjs_proxy_object_data.eventListeners[a];if(d)c=0>d.indexOf(b);else{d=[];g._cocoonjs_proxy_object_data.eventListeners[a]=d;var e="CocoonJS.App.addDestinationProxyObjectEventListener("+JSON.stringify(g._cocoonjs_proxy_object_data.typeName)+", "+g._cocoonjs_proxy_object_data.id+", "+JSON.stringify(a)+");";CocoonJS.App.forwardAsync(e)}c&&d.push(b)};g.removeEventListener=function(a,b){var c=g._cocoonjs_proxy_object_data.eventListeners[a];if(c){var d=
c.indexOf(b);0<=d&&c.splice(d,1)}};return this};d[a]._cocoonjs_proxy_type_data={originalType:f,proxyObjects:[]};d[a]._cocoonjs_proxy_type_data.deleteProxyObject=function(b){var c=CocoonJS.getKeyForValueInDictionary(this.proxyObjects,b);if(c){var d="CocoonJS.App.deleteDestinationProxyObject("+JSON.stringify(a)+", "+b._cocoonjs_proxy_object_data.id+");";CocoonJS.App.forwardAsync(d);b._cocoonjs_proxy_object_data=null;delete this.proxyObjects[c]}};d[a]._cocoonjs_proxy_type_data.callProxyObjectEventHandler=
function(a,b){var c=this.proxyObjects[a],d=c._cocoonjs_proxy_object_data.eventHandlers[b];d&&d({target:c})};d[a]._cocoonjs_proxy_type_data.callProxyObjectEventListeners=function(a,b){for(var c=this.proxyObjects[a],d=c._cocoonjs_proxy_object_data.eventListeners[b].slice(),e=0;e<d.length;e++)d[e]({target:c})}}};CocoonJS.App.takedownOriginProxyType=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable){var b=window;b[a]&&b[a]._cocoonjs_proxy_type_data&&(b[a]=b[a]._cocoonjs_proxy_type_data.originalType)}};
CocoonJS.App.deleteOriginProxyObject=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable){var b=window;a&&a._cocoonjs_proxy_object_data&&b[a._cocoonjs_proxy_object_data.typeName]._cocoonjs_proxy_type_data.deleteProxyObject(a)}};CocoonJS.App.callOriginProxyObjectEventHandler=function(a,b,c){CocoonJS.App.nativeExtensionObjectAvailable&&window[a]._cocoonjs_proxy_type_data.callProxyObjectEventHandler(b,c)};CocoonJS.App.callOriginProxyObjectEventListeners=function(a,b,c){CocoonJS.App.nativeExtensionObjectAvailable&&
window[a]._cocoonjs_proxy_type_data.callProxyObjectEventListeners(b,c)};CocoonJS.App.setupDestinationProxyType=function(a,b){CocoonJS.App.nativeExtensionObjectAvailable&&(window[a]._cocoonjs_proxy_type_data={nextId:0,proxyObjects:{},eventHandlerNames:b})};CocoonJS.App.takedownDestinationProxyType=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable){var b=window;parent[a]&&b[a]._cocoonjs_proxy_type_data&&delete b[a]._cocoonjs_proxy_type_data}};CocoonJS.App.newDestinationProxyObject=function(a){if(CocoonJS.App.nativeExtensionObjectAvailable){var b=
window,c=new b[a];c._cocoonjs_proxy_object_data={};c._cocoonjs_proxy_object_data.typeName=a;var e=b[a]._cocoonjs_proxy_type_data.nextId;b[a]._cocoonjs_proxy_type_data.proxyObjects[e]=c;c._cocoonjs_proxy_object_data.id=e;b[a]._cocoonjs_proxy_type_data.nextId++;for(var d=0;d<b[a]._cocoonjs_proxy_type_data.eventHandlerNames.length;d++)(function(a){c[a]=function(){var b="CocoonJS.App.callOriginProxyObjectEventHandler("+JSON.stringify(this._cocoonjs_proxy_object_data.typeName)+", "+this._cocoonjs_proxy_object_data.id+
", "+JSON.stringify(a)+");";CocoonJS.App.forwardAsync(b)}})(b[a]._cocoonjs_proxy_type_data.eventHandlerNames[d]);c._cocoonjs_proxy_object_data.eventListeners={};return e}};CocoonJS.App.callDestinationProxyObjectFunction=function(a,b,c){if(CocoonJS.App.nativeExtensionObjectAvailable){var e=window,d=Array.prototype.slice.call(arguments);d.splice(0,3);e=e[a]._cocoonjs_proxy_type_data.proxyObjects[b];return e[c].apply(e,d)}};CocoonJS.App.setDestinationProxyObjectAttribute=function(a,b,c,e){CocoonJS.App.nativeExtensionObjectAvailable&&
(window[a]._cocoonjs_proxy_type_data.proxyObjects[b][c]=e)};CocoonJS.App.getDestinationProxyObjectAttribute=function(a,b,c){if(CocoonJS.App.nativeExtensionObjectAvailable)return window[a]._cocoonjs_proxy_type_data.proxyObjects[b][c]};CocoonJS.App.deleteDestinationProxyObject=function(a,b){CocoonJS.App.nativeExtensionObjectAvailable&&delete window[a]._cocoonjs_proxy_type_data.proxyObjects[b]};CocoonJS.App.addDestinationProxyObjectEventListener=function(a,b,c){CocoonJS.App.nativeExtensionObjectAvailable&&
(a=window[a]._cocoonjs_proxy_type_data.proxyObjects[b],b=function(){var a="CocoonJS.App.callOriginProxyObjectEventListeners("+JSON.stringify(this._cocoonjs_proxy_object_data.typeName)+", "+this._cocoonjs_proxy_object_data.id+", "+JSON.stringify(c)+");";CocoonJS.App.forwardAsync(a)},a._cocoonjs_proxy_object_data.eventListeners[c]=b,a.addEventListener(c,b))};CocoonJS.App.proxifyXHR=function(){CocoonJS.App.setupOriginProxyType("XMLHttpRequest","timeout withCredentials upload status statusText responseType response responseText responseXML readyState".split(" "),
"open setRequestHeader send abort getResponseHeader getAllResponseHeaders overrideMimeType".split(" "),"onloadstart onprogress onabort onerror onload ontimeout onloadend onreadystatechange".split(" "))};CocoonJS.App.proxifyAudio=function(){CocoonJS.App.setupOriginProxyType("Audio",["src","loop","volume","preload"],["play","pause","load","canPlayType"],["onended","oncanplay","oncanplaythrough","onerror"])};CocoonJS.App.captureScreen=function(a,b,c){if(CocoonJS.App.nativeExtensionObjectAvailable)return window.ext.IDTK_APP.makeCall("captureScreen",
a,b,c)};CocoonJS.App.captureScreenAsync=function(a,b,c,e){CocoonJS.App.nativeExtensionObjectAvailable&&window.ext.IDTK_APP.makeCallAsync("captureScreen",a,b,c,e)};CocoonJS.App.getDeviceId=function(){if(CocoonJS.App.nativeExtensionObjectAvailable)return window.ext.IDTK_APP.makeCall("getDeviceId")};CocoonJS.App.DeviceInfo={os:null,version:null,dpi:null,brand:null,model:null,imei:null,platformId:null,odin:null,openudid:null};CocoonJS.App.getDeviceInfo=function(){if(CocoonJS.App.nativeExtensionObjectAvailable)return window.ext.IDTK_APP.makeCall("getDeviceInfo")};
CocoonJS.App.onTextDialogFinished=new CocoonJS.EventHandler("IDTK_APP","App","ontextdialogfinish");CocoonJS.App.onTextDialogCancelled=new CocoonJS.EventHandler("IDTK_APP","App","ontextdialogcancel");CocoonJS.App.onMessageBoxConfirmed=new CocoonJS.EventHandler("IDTK_APP","App","onmessageboxconfirmed");CocoonJS.App.onMessageBoxDenied=new CocoonJS.EventHandler("IDTK_APP","App","onmessageboxdenied");CocoonJS.App.onSuspended=new CocoonJS.EventHandler("IDTK_APP","App","onsuspended");CocoonJS.App.onActivated=
new CocoonJS.EventHandler("IDTK_APP","App","onactivated")})();
(function(){if("undefined"===typeof window.CocoonJS||null===window.CocoonJS)throw"The CocoonJS object must exist and be valid before adding more functionalities to an extension.";if("undefined"===typeof window.CocoonJS.App||null===window.CocoonJS.App)throw"The CocoonJS.App object must exist and be valid before adding more functionalities to it.";if(navigator.isCocoonJS)throw"Do not inject CocoonJS_App_ForWebView.js file in the CocoonJS environment.";CocoonJS.App=CocoonJS.App?CocoonJS.App:{};CocoonJS.App.nativeExtensionObjectAvailable=
CocoonJS.App.nativeExtensionObjectAvailable;CocoonJS.App.show=function(a,b,c,e){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","show",arguments);var d=window.parent.document.getElementById("CocoonJS_App_ForCocoonJS_WebViewDiv");d.style.left=(a?a:d.style.left)+"px";d.style.top=(b?b:d.style.top)+"px";d.style.width=(c?c:window.parent.innerWidth)+"px";d.style.height=(e?e:window.parent.innerHeight)+"px";d.style.display="block";d=window.parent.document.getElementById("CocoonJS_App_ForCocoonJS_WebViewIFrame");
d.style.width=(c?c:window.parent.innerWidth)+"px";d.style.height=(e?e:window.parent.innerHeight)+"px"};CocoonJS.App.hide=function(){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.makeNativeExtensionObjectFunctionCall("IDTK_APP","hide",arguments);window.parent.document.getElementById("CocoonJS_App_ForCocoonJS_WebViewDiv").style.display="none"};CocoonJS.App.loadInCocoonJS=function(a,b){if(CocoonJS.App.nativeExtensionObjectAvailable){var c="ext.IDTK_APP.makeCall('loadPath'";"undefined"!==
typeof a&&(c+=", '"+a+"'","undefined"!==typeof b&&(c+=", '"+b+"'"));return CocoonJS.App.forwardAsync(c+");")}CocoonJS.App.forwardAsync("CocoonJS.App.load('"+a+"');")};CocoonJS.App.reloadCocoonJS=function(){if(CocoonJS.App.nativeExtensionObjectAvailable)return CocoonJS.App.forwardAsync("ext.IDTK_APP.makeCall('reload');");navigator.isCocoonJS||window.parent.location.reload()};CocoonJS.App.proxifyConsole=function(){if(CocoonJS.nativeExtensionObjectAvailable){"undefined"===typeof CocoonJS.App.originalConsole&&
(CocoonJS.App.originalConsole=window.console);for(var a=["log","error","info","debug","warn"],b={},c=0;c<a.length;c++)b[a[c]]=function(a){return function(b){b="console."+a+"("+JSON.stringify(b)+");";CocoonJS.App.originalConsole.log(b);ext.IDTK_APP.makeCallAsync("forward",b)}}(a[c]);b.assert||(b.assert=function(){0<arguments.length&&!arguments[0]&&b.error("Assertion failed: "+(1<arguments.length?arguments[1]:""))});window.console=b}};CocoonJS.App.deproxifyConsole=function(){!window.navigator.isCocoonJS&&
CocoonJS.nativeExtensionObjectAvailable&&"undefined"!==typeof CocoonJS.App.originalConsole&&(window.console=CocoonJS.App.originalConsole,CocoonJS.App.originalConsole=void 0)};window.addEventListener("load",function(){CocoonJS.App.proxifyConsole()});CocoonJS.App.onLoadInCocoonJSSucceed=new CocoonJS.EventHandler("IDTK_APP","App","forwardpageload");CocoonJS.App.onLoadInCocoonJSFailed=new CocoonJS.EventHandler("IDTK_APP","App","forwardpagefail")})();CocoonJS.App.proxifyConsole();CocoonJS.App.disableTouchInTheWebView();
mighty={UI:{},AddUI:function(a){mighty.UI[a]=new mighty.UIItem(a);var b=document.createElement("link");b.setAttribute("rel","stylesheet");b.setAttribute("type","text/css");b.setAttribute("href","../../src/templates/"+a+"/"+a+".css");document.head.appendChild(b);b=document.createElement("div");b.setAttribute("id","view-"+a);mighty.UI[a].parent=b},UIItem:function(a){this.name=a;this.html="";this.parent=this.data=null;this.data=[];this.properties=[]}};
mighty.UIItem.prototype={_parseVar:function(a){for(var b=[],c="",e=null,d=null,d=void 0===a?this.parent.querySelectorAll("[data-var], [data-click]"):[a],a=d.length,f=0;f<a;f++)if(e=d[f],c=e.getAttribute("data-var"))this.properties[c]=e,b.push(c);b=JSON.stringify(b);CocoonJS.App.forward("mighty.Template._populateData('"+this.name+"', '"+b+"');")},createElement:function(a,b,c,e){a=document.createElement(a);a.setAttribute("id",b);a.className=c;a.style.cssText=e;this.parent.appendChild(a)},createElementEx:function(a,
b,c,e,d,f,g){a=document.createElement(a);a.setAttribute("id",b);a.className=c;a.style.cssText=e;a.innerHTML=d;var f=JSON.parse(f),h;for(h in f)a.setAttribute(h,f[h]);g?(document.querySelector(g).appendChild(a),this._parseVar(a)):(this.parent.appendChild(a),this._parseVar(this.parent.lastChild))},removeElementByID:function(a){this.parent.removeChild(this.parent.querySelector("#"+a))},setVar:function(a,b){this.properties[a]&&(this.properties[a].innerHTML=window.atob(b))},setHTML:function(a){this.parent.innerHTML=
window.atob(a);this._parseVar()},show:function(){document.getElementById("view").appendChild(this.parent)},hide:function(){document.getElementById("view").removeChild(this.parent)},setStyle:function(a,b){var c=this.properties[a];c&&(c.style.cssText=b)},setStyleByID:function(a,b){var c=this.parent.querySelector("#"+a);c&&(c.style.cssText=b)},addStyle:function(a,b){var c=JSON.parse(b),e=this.properties[a].style,d;for(d in c)e[d]=c[d]},setClass:function(a,b){this.properties[a].setAttribute("class",b)},
setClassByID:function(a,b){document.getElementById(a).setAttribute("class",b)}};mighty.InitError=function(){mighty.UI.Error={};mighty.UI.Error.errorBox=document.getElementById("mightyError");mighty.UI.Error.errorLog=mighty.UI.Error.errorBox.getElementsByTagName("ul")[0]};mighty.ShowError=function(a,b){var c="",c=a&&a.length?b&&b.length?"["+a+"] - "+b:a:b,e=document.createElement("li");e.innerHTML=c;mighty.UI.Error.errorLog.appendChild(e);mighty.UI.Error.errorBox.style.display="block"};
window.onerror=function(a,b,c){mighty.ShowError(b+": "+c,a)};
