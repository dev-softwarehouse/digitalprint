
	export function EditComponent( name, eventType, graphicsBody, position, functions ){
	
		this.name = name;
		
		this.function = function(){ 
		
		};
		
		this.functions = functions;
		this.body = graphicsBody;
		this.positionInfo = position;
		
		this.position = {
		
			x: 0,
			y: 0,
		
		};

		this.setPosition = function( _x, _y){
		
			this.position.x = this.body.x = _x;
			this.position.y = this.body.y = _y;
			
		};

		for( var i = 0; i < functions.length; i++){
		
			this.body.addEventListener( functions[i].event, functions[i].function.bind(this));
		
		}

	};