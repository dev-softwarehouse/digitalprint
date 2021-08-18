import React from "react";
import _ from "lodash";

export default class ProductAttributes extends React.Component {

    constructor( params ){

        super( params );
        this.editor = params.editor;
        this.state = { 
            selected : params.selectedAttributes
        }

        this.getSelected = this.getSelected.bind( this );

    }
    
    change( e ){


        let state = JSON.parse( JSON.stringify( this.state ) );
        state.selected[ "" + e.target.getAttribute('data-attribute-index') ][ "" + e.target.getAttribute('data-attribute-id') ] = e.target.value;

        this.setState( state );
        

    }

    getSelected(){

        return this.state.selected;

    }

    selectsForProduct( productType, index ){

        var product = null;
        var selects = [];

        for( var i=0; i< this.editor.productData[index].products.length; i++){

            if( this.editor.productData[index].products[i].typeID == productType )
                product = this.editor.productData[index].products[i];

        }

        if( product ){

            var format = this.editor.complexProduct[1][index];
            
            var attributes = product.formats[""+ format].attributes;
            var excludes = [];
            for( var key in attributes ){

                
                var options = [];

                for( var optKey in attributes["" + key ].options ){
                    
                    if( optKey == this.state.selected[index][ ""+ key ] ){
                        
                        excludes = excludes.concat( attributes["" + key ].options[""+optKey].excludes );

                    }

                    if( excludes.indexOf( parseInt( optKey ) ) < 0 ){

                        options.push( <option value={optKey} key={optKey}>{ attributes["" + key ].options[""+optKey].name }</option> );

                    }
                    
                }

                selects.push( 
                    <div className="attribute-selector-simple" key={key}>
                        <label>{attributes["" + key ].name}</label>
                        <select name="attribute" data-attribute-index={index} data-attribute-id={key} value={ this.state.selected[index][ ""+ key ] } onChange={this.change.bind( this )}>
                            {options}
                        </select>
                    </div>
                );

            }

        }

        if( product ){
            return(
                <div className='product-attributes' key={index}>
                    <h2 className="product-attributes-title">{product.typeName}</h2>
                    {selects}
                </div>

            );
        }else {
            
            return( <div key={index}></div> );

        }

    }


    render (){

        var selects = [];
        this.editor.services.calculatePrice();
        selects = this.editor.complexProduct[0].map( ( elem, index ) => {

            return this.selectsForProduct( elem, index );

        });

        return(

            <div>
                {selects}
            </div>

        );

    }

}