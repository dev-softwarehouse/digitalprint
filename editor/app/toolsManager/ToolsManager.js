var EditTools = require('./../EditTools').EditTools;

export var tools = (function(){

	function toolsManager(){

		var tools = [];

		function getToolsFromType( typ ){
			for( var i=0; i < tools.length; i++ ){
				if( tools[i].name == typ ){
					return tools[i];
				}
			}
			console.warn("brak narzedzi do inicjalizacji!");
		};

		function getToolsList(){
			return tools;
		};

		function addTool( tool ){
			if( tool instanceof EditTools ){
				tools.push( tool );
			}
			else {
				console.error("błędny typ");
			}
		}

		function initTool( toolName ){
			for( var i=0; i < tools.length; i++ ){
				if ( toolName == tools[i].name ){
					return tools[i].components;
				}
			}
		}

		return {

			getToolsFromType : getToolsFromType,
			getToolsList : getToolsList,
			addTool : addTool,
			initTool : initTool
			
		};
		
	};

	return toolsManager();

})();


