Editor.panelTools = (function(){

	var panelTools = {};
	var updateTools = false;


	function initTool(){

		for( var tool in panelTools){
			$("#editor-panel").append("<div class='editor-panel-item'>" + panelTools[tool].template + "</div>");
			panelTools[tool].init();
		}
	};

	function update(){
		for( var tool in panelTools){
			panelTools[tool].update();
		}
	};

	function addTool( tool ){
		panelTools[tool.name] = tool;
	};

	return {
		addTool : addTool,
		initTool : initTool,
		update : update
	};

})();