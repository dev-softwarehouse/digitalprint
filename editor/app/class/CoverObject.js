import {EditableArea} from './editablePlane_user';

//console.log( EditableArea );

export default class Cover extends EditableArea {

    constructor( editor, name, width, height, dbId, slope, vacancy, spread, coverHeight ){

        super( editor, name, width, height, dbId, slope, vacancy, spread );

        this.typeName = 'Cover';
        
        this.coverHelper = new createjs.Shape();
        this.addTopCompoundObject( this.coverHelper );
        this.coverHeight = coverHeight;
        //this.prepareCover();

    }

    prepareCover(){

        var stage = this.editor.getStage();

        this.width = this.trueWidth + this.coverHeight;
        
        this.coverHelper.graphics.c().ss(1/stage.scaleY).s("red").mt( (this.width)/2 - this.coverHeight/2, 0).lt((this.width)/2 - this.coverHeight/2, this.height ).mt( this.width/2 + this.coverHeight/2, 0 ).lt( this.width/2 + this.coverHeight/2, this.height).f('#3336').dr( (this.width )/2 - this.coverHeight/2, 0, this.coverHeight, this.height );
        if( this.slopeShape ){
            
            this.slopeShape.graphics.c().ss(1/stage.scaleY).s("#fff").mt(1,1).lt(this.width, 0).lt(this.width, this.height ).lt(0, this.height).cp();
            this.slopeShape.graphics.ss(1/stage.scaleY).s("#F00").mt( this.settings.slope, this.settings.slope).lt(this.width-(this.settings.slope), this.settings.slope).lt( this.width-( this.settings.slope ), this.height-( this.settings.slope ) ).lt( this.settings.slope, this.height - (this.settings.slope)).cp().es();
            this.slopeShape.graphics.f("rgba(0, 0, 0, 0.34)").r(0,0, this.width, this.settings.slope).r( this.width -this.settings.slope, this.settings.slope, this.settings.slope, this.height - this.settings.slope).r( 0, this.height - this.settings.slope, this.width -this.settings.slope, this.settings.slope).r(0, this.settings.slope, this.settings.slope, this.height-(this.settings.slope*2));
        }

        this.borderShape.graphics.c().s("#00d1cd").ss(1/stage.scaleY).mt(0,0).lt(this.width, 0).lt( this.width, this.height ).lt(0, this.height).cp();
        this.shape.c().f("#fff").r( 0, 0, this.width, this.height );
        this.mask.regX = this.width/2;

        this.setBounds( 0, 0, this.width, this.height);
        this.regX = this.width/2;

        this.dispatchEvent( 'stageMove' );

    }

    set coverHeight ( value ){

        this._coverHeight = value;

        this.prepareCover();

    }

    get coverHeight (){
        return this._coverHeight;
    }

    render(){

    }
    
}