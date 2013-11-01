(mighty.Loader.path = (window.gParams.gPath ? window.gParams.gPath : ""));
(function(){
var loader = mighty.Loader;
loader.include("src/plugins/Server/Server.js");
loader.include("src/addons/scene/Scene.Default.js");
loader.include("src/addons/scene/dat.gui.js");
})();
