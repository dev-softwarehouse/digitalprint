
    function EditorObject_admin(){

    };

	var p = EditorObject_admin.prototype;


	/**
	* Inicjalizuje eventy podpięte do obiektu
	*
	* @method initEvents
	*/
	p.initEvents = function(){

		var _this = this;
        var Editor = this.editor;

        this.addEventListener('click', function( e ){
        
            //e.stopPropagation();
            //console.log('KLICK');
        
        });


		this.addEventListener( 'mousedown', function(e){

            e.stopPropagation();
            
            if( e.nativeEvent.button == 0 ){

                 e.stopPropagation();
               
                $("#cmn-toggle-1").removeClass("cmn-toggle-round");

                $("#cmn-toggle-1").addClass("cmn-toggle-round");

                e.stopPropagation(e);
                //console.log( e.currentTarget );
                //console.log('***************');
    			_this.setCenterReg();
    			_this.editor.setVectorStart( e.stageX, e.stageY );
    			_this.editor.tools.setEditingObject( e.currentTarget.id);
    			_this.editor.tools.init();

    			// historia transformacji
    			_this.history_tmp = {};
    			_this.history_tmp['action'] = "translate";
    			_this.history_tmp['info'] = {};
    			_this.history_tmp['info']['id'] = _this.id;
    			_this.history_tmp['info']['before'] = { x: _this.x, y: _this.y };

    			_this.editor.stage.updateEditingTools( _this );

            }

		});

        this.addEventListener( 'mousedown', function(e){

            e.stopPropagation();

            var currentObject = e.currentTarget;

            if( e.nativeEvent.button == 0 ){

                if( currentObject.moveVector.start == null ){

                    _this.editor.stage.setObjectToMove( currentObject );
                    currentObject.tmpPos= { x : currentObject.x, y : currentObject.y};
                    currentObject.moveVector.start = [ e.stageX, e.stageY ];
                    currentObject.moveVector.stop =  [ e.stageX, e.stageY ];

                }
                else {
                    currentObject.moveVector.stop = [ e.stageX, e.stageY ];
                }
            }

        });

        this.addEventListener('pressup', function( e ){
            
            //console.log( _this );

            var objectToMove = _this.editor.stage.getObjectToMove();

            e.stopPropagation();

            if( objectToMove ){
                
                if( objectToMove.magneticLines  ){

                	objectToMove.showMagneticLines( 0, 0, 0, 0, 0, 0 );

                }

                _this.editor.stage.setObjectToMove( null );

                var currentObject = e.currentTarget;
                currentObject.moveVector.start = null;
                currentObject.moveVector.stop = null;
             	
             	if( _this.updatePositionInDB )
					_this.updatePositionInDB();

            }

    		_this.editor.stage.updateEditingTools( _this );

        });

        this.addEventListener('pressmove', function( e ){

			if( e.nativeEvent.button == 0 ){

                e.stopPropagation();
                var currentObject = e.currentTarget;
		        currentObject.moveVector.stop =  [ e.stageX, e.stageY ]; 

            }
            
        });

	};

export {EditorObject_admin};