;(function(window,undefined){

	function Storage() {

		this.save = function(key,value) {
			window.localStorage.setItem(key,escape(JSON.stringify(value)));
			//window.localStorage.setItem(key,);
		};

		this.load = function(key) {
			return JSON.parse(unescape(window.localStorage.getItem(key)));
		};
	};

	window.Store = new Storage();
})(window);