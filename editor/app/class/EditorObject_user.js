
    function EditorObject_user(){

    }

	var p = EditorObject_user.prototype;


	/**
	* Inicjalizuje eventy podpięte do obiektu
	*
	* @method initEvents
	*/
	p.initEvents = function(){

        var Editor = this.editor;

        if( userType == 'advancedUser'){

            var _this = this;

            this.addEventListener('click', function( e ){

                e.stopPropagation();

            });


            this.addEventListener( 'mousedown', function(e){

                e.stopPropagation();

                if( e.nativeEvent.button == 0 ){

                     e.stopPropagation();

                    $("#cmn-toggle-1").removeClass("cmn-toggle-round");

                    $("#cmn-toggle-1").addClass("cmn-toggle-round");

                    e.stopPropagation(e);

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

        }else {

    		var _this = this;

            this.addEventListener('click', function( e ){

            });

    		this.addEventListener( 'mousedown', function(e){

                if( e.nativeEvent.button == 0 ){

                     e.stopPropagation();

                    $("#cmn-toggle-1").removeClass("cmn-toggle-round");

                    $("#cmn-toggle-1").addClass("cmn-toggle-round");

                    e.stopPropagation(e);

        			_this.setCenterReg();

                    _this.editor.setVectorStart( e.stageX, e.stageY );
                    _this.editor.setVectorStop( e.stageX, e.stageY );

        			_this.editor.tools.setEditingObject( e.currentTarget.id);

        			//Editor.tools.init();

        			// historia transformacji
        			_this.history_tmp = {};
        			_this.history_tmp['action'] = "translate";
        			_this.history_tmp['info'] = {};
        			_this.history_tmp['info']['id'] = _this.id;
        			_this.history_tmp['info']['before'] = { x: _this.x, y: _this.y };

        			//Editor.stage.updateEditingTools( _this );

                }

    		});

            this.addEventListener( 'mousedown', function(e){

                e.stopPropagation();

                var currentObject = e.currentTarget;

                if( e.nativeEvent.button == 0 ){

                    if( userType == 'advancedUser'){

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

                }

            });

            this.addEventListener('pressup', function( e ){

                if( userType == 'advancedUser' ){

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

                        /*
                     	if( _this.updatePositionInDB )
        					_this.updatePositionInDB();
                        */

                    }

                }

        		//Editor.stage.updateEditingTools( _this );

            });

            this.addEventListener('pressmove', function( e ){

                if( userType == 'admin' ){

        			if( e.nativeEvent.button == 0 ){

                        e.stopPropagation();
                        var currentObject = e.currentTarget;
        		        currentObject.moveVector.stop =  [ e.stageX, e.stageY ];

                    }

                }

            });

            this.addEventListener('mouseover', function( e ){

                return;

                e.stopPropagation();

                var elem = document.createElement('div');
                elem.className = 'objectRemover';

                elem.addEventListener('click', function( e ){

                    e.stopPropagation();


                });

                elem.style.width = '100px';
                elem.style.height = '100px';
                elem.style.backgroundColor = 'red';
                elem.style.position = 'fixed';
                elem.style.zIndex = '10000000';

                _this.removObject = elem;

                document.body.appendChild( elem );

            });

            this.addEventListener('mouseout', function( e ){

                e.stopPropagation();
                return;
                _this.removObject.parentNode.removeChild( _this.removObject );

            });

        }

	};

export { EditorObject_user };
