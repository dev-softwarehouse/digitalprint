var complexAdminProject = function(){
    
    var id = null;
    var products = {};
    var complexViews = [];
    var productsViews = [];   
    var productGroups = [];
    var productsFormats = {};
    var groupsOptions = {};
    var productGroupLayers = {};


    var setComplexProduct = function( complexProductID ){

        id = complexProductID;

    };


    var getComplexViews = function(){

        return complexViews;

    };


    var getProductsWithSelectedOptions = function(){

        var options = {};

        for( var key in groupsOptions ){

            options[key] = {

                attributes : groupsOptions[key].attributes,
                formatID   : groupsOptions[key].format,
                typeID     : groupsOptions[key].product

            };

        }

        return options;

    };


    var getSelectedProducts = function(){   

        //console.log( productGroups );

        var selectedProducts = [];  

        for( var key in groupsOptions ){

            //console.log( groupsOptions[key] );
            selectedProducts.push( { product: products[ groupsOptions[ key ].product ], formatID :  groupsOptions[ key ].format,  groupID : key } );

        }

        return selectedProducts;

    };


    // loadProduct
    var load = function( data ){

        productGroups = data;

        for( var i=0; i < data.length; i++ ){
            
            groupsOptions[ data[i].ID ] = null;

            //console.log( data );
            //console.log( groupsOptions );

            for( var p=0; p < data[i].products.length; p++){

                products[ data[i].products[p].typeID ] = data[i].products[p];

                for( var fKey in products[ data[i].products[p].typeID ].formats ){

                    productsFormats[ fKey ] = products[ data[i].products[p].typeID ].formats[ fKey ];

                }

            }

        }

        //update();

    };


    var update = function(){

        Editor.stage.resetScene();

        var mainLayer = Editor.stage.getMainLayer();

        Editor.templateAdministaration.updateComplexLayers();
        Editor.stage.updateComplexView();

    };


    var loadWS = function( data ){

        //console.log( data );
        complexViews = data.ComplexViews;
        id = data._id;
        active = data.active;

        Editor.complexAdminProject.complexView.init( complexViews[0] );

        Editor.templateAdministaration.updateComplexViews( complexViews );
        Editor.template.selectComplexProductAttibutes();
        Editor.templateAdministaration.updateProductsViews( productGroups );

    };

    var getSelectedOptions = function(){

        return groupsOptions;

    };


    var getSelectedOptionsForGroup = function( groupID ){

        return groupsOptions[ groupID ].attributes;

    };


    var getProductGroups = function(){

        return productGroups;

    };


    var getSelectForAttribute = function( attributeID, attributeInfo, groupID, selectedOptions ){

        var selectedOptions = getSelectedOptionsForGroup( groupID );

        //console.log( attributeInfo );

        var attributeLabel = document.createElement('label');
        attributeLabel.innerHTML = attributeInfo.name;
        var attribute = document.createElement('select');
        attributeLabel.appendChild( attribute );

        var selectIndex = 0;

        for( var attOpt in attributeInfo.options ){

            if( groupsOptions[ groupID ].excludes.indexOf( attOpt )  < 0  ){

                selectIndex++;
                var attOption = document.createElement('option');
                attOption.value = attOpt;
                attOption.innerHTML = attributeInfo.options[ attOpt ].name;

                if( selectedOptions[ attributeID ] == attOpt ){

                    attOption.setAttribute('selected', 'selected');

                }

                attribute.appendChild( attOption );

            }
            else {

                console.log('opcaj zostala wykluczona');

            }

        }

        attribute.addEventListener('change', function( e ){

            groupsOptions[ groupID ].attributes[ attributeID ] = e.target.value; 
            var attributesSelection = this.parentNode.parentNode;
            var groupParent = attributesSelection.parentNode;
            var formatID = attributesSelection.getAttribute( 'format-id' );
            $( attributesSelection ).remove();
            groupParent.appendChild( getSelectsAttributesForFormat( formatID, groupID ) );

        });

        //console.log( 'jakie mamy wykluczenia' );
        //console.log( groupsOptions[ groupID ].excludes );
        groupsOptions[ groupID ].excludes = groupsOptions[ groupID ].excludes.concat( attributeInfo.options[ attribute.value ].excludes );
        groupsOptions[ groupID ].attributes[ attributeID ] = attribute.value;

        return attributeLabel;

    };


    var getSelectsAttributesForFormat = function( formatID, groupID ){

        groupsOptions[ groupID ].excludes = [];
        var attributes = document.createElement('div');
        attributes.className = 'attributesList';
        attributes.setAttribute( 'format-id', formatID );

        var formatInfo = Editor.complexAdminProject.getFormatInfo( formatID );

        for( var attKey in formatInfo.attributes ){
            
            var attibuteInfo = formatInfo.attributes[ attKey ];
            attributes.appendChild( getSelectForAttribute(  attKey, attibuteInfo, groupID ) );

        }

        return attributes;

    };


    var getSelectsForProduct = function( productID, groupID ){

        var productInfos = getProductInfo( productID );

        var productSelects = document.createElement('div');
        productSelects.className = 'productSelects';
        productSelects.setAttribute( 'group-id', groupID );

        var formatLabel = document.createElement('label');
        formatLabel.className = 'formatLabel';
        formatLabel.innerHTML = 'format';
        var formatSelect = document.createElement('select');

        formatLabel.appendChild( formatSelect );

        for( var fKey in productInfos.formats ){

            var fOption = document.createElement('option');
            fOption.innerHTML = productInfos.formats[fKey].name + " ("+productInfos.formats[fKey].width+" x " + productInfos.formats[fKey].height +" )";
            fOption.value = fKey;

            formatSelect.appendChild( fOption );

        }

        formatSelect.addEventListener('change', function( e ){

            groupsOptions[ groupID ].excludes = [];
            $( this.parentNode.parentNode ).children('.attributesList').remove();
            this.parentNode.parentNode.appendChild( getSelectsAttributesForFormat( e.target.value, groupID ) );

        });

        groupsOptions[ groupID ].excludes = [];
        productSelects.appendChild( formatLabel );
        productSelects.appendChild( getSelectsAttributesForFormat( formatSelect.value, groupID ) );

        groupsOptions[ groupID ].format = formatSelect.value;

        return productSelects;

    };


    var getSelectsForProductGroup = function( group ){

        var productGroup = document.createElement('div');
        productGroup.className = 'productGroup';
        productGroup.setAttribute( 'group-id', productGroups[group].ID );
        var productGroupTitle = document.createElement('h3');
        productGroupTitle.innerHTML = productGroups[group].name;

        var label = document.createElement('label');
        var select = document.createElement('select');
        select.setAttribute( 'group-id', productGroups[group].ID );
        label.innerHTML = 'Rodzaj';
        label.className = 'product';
        label.appendChild( select );

        productGroup.appendChild( productGroupTitle );
        productGroup.appendChild( label );


        var products = productGroups[ group ].products;
        
        for( var p=0; p< products.length; p++ ){

            var option = document.createElement('option');
            option.value = products[p].typeID;
            option.innerHTML = products[p].typeName;
            select.appendChild( option );

        }

        select.addEventListener('change', function( e ){

            groupsOptions[ this.getAttribute( 'group-id' ) ] = { 'product' : this.value, 'attributes' : {}, 'excludes' : [] };
            $(productGroup).children('.productSelects').remove();
            productGroup.appendChild( getSelectsForProduct( select.value , productGroup.getAttribute( 'group-id' ) ) );


            Editor.templateAdministaration.updateProductsViews();

        });

        groupsOptions[ productGroup.getAttribute( 'group-id' ) ] = { 'product' : select.value, 'attributes' : {}, 'excludes' : [] };
        productGroup.appendChild( getSelectsForProduct( select.value , productGroup.getAttribute( 'group-id' ) ) );

        //console.log( groupsOptions );

        return productGroup;

    };


    var getFormatInfo = function( formatID ){

        return productsFormats[ formatID ];

    };


    var getProductInfo = function( productID ){

        return products[ productID ];

    };


    var add = function(){



    };


    var generateOptions = function(){



    };


    var loadProject = function( complexAdminProjectID ){


    };


    var addView = function(){


    };


    var removeView = function(){



    };


    var getProductGroups = function(){

        return productGroups;

    };


    var getID = function(){

        return id;

    };


    return {

        load : load,
        loadWS : loadWS,
        getComplexViews : getComplexViews,
        getID : getID,
        getFormatInfo : getFormatInfo,
        getProductGroups : getProductGroups,
        getProductInfo : getProductInfo,
        getProductGroups : getProductGroups,
        getSelectedOptions : getSelectedOptions,
        getSelectsForProductGroup : getSelectsForProductGroup,
        getSelectedProducts : getSelectedProducts,
        getProductsWithSelectedOptions : getProductsWithSelectedOptions,    
        update : update

    };

};

var complex = complexAdminProject();

export { complex };