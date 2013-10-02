window.gParams = window.gParams || {};

window.getScript = function(url, callback)
{
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.src = url;

	// Handle Script loading
	var done = false;

	// Attach handlers for all browsers
	script.onload = script.onreadystatechange = function()
	{
		if(!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete"))
		{
			done = true;
			if(callback) {
				callback();
			}

			// Handle memory leak in IE
			script.onload = script.onreadystatechange = null;
		}
	};

	head.appendChild(script);
};

window.globalEval = function(src){
	var g = document.createElement('script');
	var s = document.getElementsByTagName('script')[0];
	g.text = src;
	if(s){
		s.parentNode.insertBefore(g, s);
	}
	else{
		document.head.appendChild(s);
	}
};

(function(global)
{
	window.gParams = window.gParams || {};

	(function() {
		var paramsLoc = window.location.href.split("?").pop();
		var params = paramsLoc.split("&");
		for(var i = 0; i < params.length; i++) {
			var tmp = params[i].split("=");
			if(tmp.length > 1){
				window.gParams[tmp[0]] = tmp[1];
			}
		}
	})();

	if(!gParams.branch) {
		gParams.branch = 1;
	}

	var path = global.gParams.gPath ? global.gParams.gPath + "assets/deploy/" : "assets/deploy/";
	path += global.gParams.branch ? global.gParams.branch + "/" : "";
	global.gParams.path = path;

	var coreIncludes = [
		path+"library.js",
		"engine/MightyEngine.js",
		path+"includes.js"
	];

	var i = 0;
	var loadScripts = function()
	{
		i++;
		if(i<coreIncludes.length) {
			window.getScript(coreIncludes[i],loadScripts);
		}
		else
		{
			path = "";
			if(!global.gParams.gMainJs){
				window.getScript("src/main.js");
			}
			else{
				window.getScript(global.gParams.gMainJs);
			}
		}
	};
	window.getScript(coreIncludes[i],loadScripts);
})(window);