(function()
{
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before adding more functionalities to an extension.");
    if (typeof window.CocoonJS.App === 'undefined' || window.CocoonJS.App === null) throw("The CocoonJS.App object must exist and be valid before adding more functionalities to it.");

    CocoonJS.App.webViewProxiesLoaded = function()
    {
    	// XHR PROXY
		var XHR_ATTRIBUTE_NAMES =
		[
			"timeout",
			"withCredentials",
			"upload",
			"status",
			"statusText",
			"responseType",
			"response",
			"responseText",
			"responseXML",
			"readyState"
		];
		var XHR_FUNCTION_NAMES =
		[
			"open",
			"setRequestHeader",
			"send",
			"abort",
			"getResponseHeader",
			"getAllResponseHeaders",
			"overrideMimeType"
		];
		var XHR_EVENT_HANDLER_NAMES =
		[
			"onloadstart",
			"onprogress",
			"onabort",
			"onerror",
			"onload",
			"ontimeout",
			"onloadend",
			"onreadystatechange"
		];
		CocoonJS.App.setupWebViewProxyType("XMLHttpRequest", XHR_ATTRIBUTE_NAMES, XHR_FUNCTION_NAMES, XHR_EVENT_HANDLER_NAMES);

		// ADD MORE PROXIES HERE!!!

		// Proxies have been defined, call the app to start!!!
    	if (CocoonJS.App.onWebViewProxiesReady)
    	{
    		CocoonJS.App.onWebViewProxiesReady();
    	}
    };

	CocoonJS.App.onLoadInTheWebViewSucceed.addEventListener(CocoonJS.App.webViewProxiesLoaded);
	CocoonJS.App.loadInTheWebView(CocoonJS.App.webViewProxyURL ? CocoonJS.App.webViewProxyURL : "CocoonJSWebViewProxies.html");

})();