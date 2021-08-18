(function(){

    /**
     * Moduł zarządzający widokami produktow zlożonych  administratora
     *
     * @module complexView
     */
    var complexView = function(){
        
        var id = null;
        var groupLayers = {};
        var layer = null;


        var setLayer = function( layer ){

            layer = layer;

        };


        var getLayer = function(){

            return layer;

        };


        var makeLayers = function(){

            var layersObject = null;    

            return layersObject;

        };


        var getGroupLayer = function( groupID ){

            return groupLayers[ groupID ];

        };


        var init = function( complexViewID ){

            var selectedOptions = Editor.complexAdminProject.getSelectedOptions();

            var selections = {};

            for( var key in selectedOptions ){

                selections[ key ] = {

                    'productID' : selectedOptions[ key ].product,
                    'formatID' : selectedOptions[ key ].format,

                }

            }

            Editor.webSocketControllers.complexView.get( complexViewID, Editor.complexAdminProject.getProductsWithSelectedOptions(), function( data ){

                id = data._id;

                var mainLayer = Editor.stage.getMainLayer();

                var sortedGroupLayers = _.sortBy( data.GroupLayers, 'order' );

                for( var i= 0 ; i < data.GroupLayers.length; i++ ){

                    var groupLayer = new EditorLayer( data.GroupLayers[i].name );
                    groupLayer.dbID = groupLayer.dbId = data.GroupLayers[i]._id;
                    groupLayers[ data.GroupLayers[ i ].complexGroupID ] = groupLayer;

                }

                Editor.stage.updateComplexView( data );

            });

        };


        var add = function( name ){
            
            //Editor.templateAdministaration.updateProductsViews( productGroups );
            var viewsLength = Editor.complexAdminProject.getComplexViews().length;   
            Editor.webSocketControllers.complexAdminProject.addComplexView( name, viewsLength, Editor.complexAdminProject.getID(), Editor.complexAdminProject.getProductGroups() );

        };


        var getID = function(){

            return id;

        };


        return {

            add : add,
            getGroupLayer : getGroupLayer,
            getID : getID,
            getLayer : getLayer,
            init : init,
            setLayer : setLayer

        }

    };
    
    Editor.complexAdminProject.complexView = complexView();

})();