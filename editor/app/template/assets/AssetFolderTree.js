import React from 'react';
import AssetFolder from './AssetFolder.js';
import Q from 'q';
import {ProjectImage} from './../../class/ProjectImage.js';
import _ from 'lodash';


export default class AssetFolderTree extends React.Component {

    constructor( props ){

        super( props );

        this.state = {
            currentFolder: null,
            assets: [],
            folders: [],
            newFolderName:'',
            fetchingFolders: true,
            uploadFile: 'false',
            parent: null,
            filesToUpload: 0,
            selected: [],
            breadcrumbs: []
        }

    }

    goToFolderFromBreadCrumbs( e ){

        var index;

        for( var i=0; i < this.state.breadcrumbs.length; i++ ){

            if( this.state.breadcrumbs.folderID == e.target.getAttribute('data-folder-id') ){

                index = i

            }

        }

        let state = JSON.parse( JSON.stringify( this.state ) );
        state.breadcrumbs.splice( index+1, this.state.breadcrumbs.length );
        this.setState( state );

        this.getFolder( e.target.getAttribute('data-folder-id') ).then(

            ( data ) => {

                //console.log( data );
                //console.log('aktualizacja z pomoca breadcrumbsów :)');

                this.updateCurrentFolder( data );

            }

        )


    }

    renderBreadCrumbs(){

        var elems = [];

        elems.push( <div onClick={this.goToFolderFromBreadCrumbs.bind( this )} className="breadcrumb" data-folder-id={null}>Katalog główny</div> );

        for( var i=0; i < this.state.breadcrumbs.length; i++ ){

            elems.push( <div onClick={this.goToFolderFromBreadCrumbs.bind( this )} className="breadcrumb" data-folder-id={this.state.breadcrumbs[i].folderID }>{ this.state.breadcrumbs[i].name }</div> );

        }

        return <div className="breadcrumbsPath">{elems}</div>

    }

    componentDidMount(){

        var _this = this;

        this.getFolder( null ).then(

            function( data ){

                //console.log( data );
                _this.updateCurrentFolder( data );

            }

        );

    }

    updateCurrentFolder( data ){

        let state = JSON.parse( JSON.stringify( this.state ) );

        if( !data._id ){
            
            state.currentFolder= null;
            state.assets = data.assets;
            state.folders = data.assetsFolder;
            state.parent = null;
            state.breadcrumbs = [];

        }else {

            state.currentFolder= data._id;
            state.assets = data.assets;
            state.folders = data.folders;
            state.parent = data.parent;
            state.breadcrumbs.push( { name: data.name, folderID: data._id} );

        }

        state.selected = [];

        //console.log( state );
        //console.log('(((((((((((((((((((((((((((((((((((((((((((((((((((');

        this.setState( state );

    }

    getFolder( parentID ){

        var def = Q.defer();

        var dataFolder = {}

        if( parentID )
            dataFolder.parent= parentID;

        this.props.editor.webSocketControllers.adminAssets.getFolder(
            dataFolder, 
            function(data){
                def.resolve( data );
            }
        );

        return def.promise;

    }

    newFolderName( e ){

        let state = JSON.parse( JSON.stringify( this.state ) );
        state.newFolderName = e.target.value;

        this.setState( state );

    }

    addFolder(){

        var folderName = this.state.newFolderName;
        let state = JSON.parse( JSON.stringify( this.state ) );
        state.folders.push( {title: this.state.newFolderName } );
        state.newFolderName = '';
        this.setState( state );

        var folderData = {
            name: folderName
        }

        if( this.state.currentFolder ){
            folderData.parent = this.state.currentFolder;
        }

        this.props.editor.webSocketControllers.adminAssets.addFolder( folderData );

    }

    dragOver( e ){
        e.preventDefault();
        //console.log( e );
        //console.log( 'DRAGOVER' );
        let state = JSON.parse( JSON.stringify( this.state ) );
        state.uploadFile = 'dragover';
        this.setState( state );

    }

    dragLeave( e ){
        e.preventDefault();
        let state = JSON.parse( JSON.stringify( this.state ) );
        state.uploadFile = 'dragleave'
        this.setState( state );

    }

    addAsset( assetData, projectImage ){

        let state = JSON.parse( JSON.stringify( this.state ) );

        assetData.asset.reference.minUrl = projectImage.miniature;
        state.assets.push( assetData.asset );
        this.setState( state );

        //console.log( projectImage );

    }

    uploadFile ( file ){

        var _this =this;
        var Editor = this.props.editor;
        var url = URL.createObjectURL( file );
        
        var isSVG = false;

        if( file.name.indexOf('.svg') > -1 ){
            isSVG = true;
        }

        var loadedImage = new createjs.Bitmap( url );

        loadedImage.image.onload = function(){

            loadedImage.origin = loadedImage.getBounds();

            var assetData = {};

            var miniature64 = Editor.ThumbsMaker.generateThumb( loadedImage )

            var bitmap = new createjs.Bitmap( miniature64.min );

            bitmap.image.onload = function(){

            var origin = bitmap.getBounds();

            var projectImage = new ProjectImage();



            if( isSVG ){
                projectImage.editor = Editor;
                projectImage.initForTheme( file, loadedImage, loadedImage, loadedImage.origin.width,  loadedImage.origin.height, loadedImage.origin.width, loadedImage.origin.height, Editor );
                projectImage.minSize = { width: loadedImage.origin.width, height: loadedImage.origin.height };
                projectImage.thumbSize = { width: loadedImage.origin.width, height: loadedImage.origin.height };
                projectImage.name = file.name;
            }else {

                projectImage.editor = Editor;
                projectImage.initAsset( file, miniature64.min, miniature64.thmb, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height, Editor );
                projectImage.minSize = miniature64.minSize;
                projectImage.thumbSize = miniature64.thumbSize;
                projectImage.name = file.name;

            }

            Editor.webSocketControllers.adminAssets.uploadImageAsset( 
                projectImage.uid, 
                projectImage.name, 
                'Bitmap', 
                projectImage.width, 
                projectImage.height, 
                projectImage.trueWidth, 
                projectImage.trueHeight, 
                _this.state.currentFolder, 
                function( assetData ){

                    projectImage.addEventListener('uploaded', function(){

                        _this.addAsset( assetData, projectImage );
                        let state = JSON.parse( JSON.stringify( _this.state ) );
                        state.filesToUpload--;
                        _this.setState( state );
                    })
                    
                } 
            );

            Editor.uploader.addItemToUpload( projectImage );
            Editor.uploader.upload();

            projectImage.addEventListener( 'uploaded', function( data ){

                //projectImage.updateHTML();

                var dataToUpload = {

                    projectImageUID : projectImage.uid,
                    minUrl : projectImage.miniatureUrl,
                    thumbnail : projectImage.thumbnail,
                    imageUrl : projectImage.imageUrl,
                    uploadID : projectImage.uploadID

                };

                assetData.projectImageUID = projectImage.uid;

                //Editor.webSocketControllers.adminAssets.addImageAsset( assetData );
                Editor.webSocketControllers.projectImage.update( dataToUpload );

            });

                


            }

        }

    }

    drop( e ){

        e.preventDefault();
        e.stopPropagation();
            
        var files = e.target.files || e.dataTransfer.files;
        //console.log( files  );

        for( var i=0; i < files.length; i++  ){

            this.uploadFile( files[i] );

        }

        let state = JSON.parse( JSON.stringify( this.state ) );
        state.filesToUpload = files.length;
        state.uploadFile = 'drop';
        this.setState( state );

    }

    removeAsset( e ){

        var _this = this;

        var asset = e.target.getAttribute('data-asset');        

        this.props.editor.webSocketControllers.adminAssets.removeAsset({
            
            id: asset

        }, function( result ){

            let state = JSON.parse( JSON.stringify( _this.state ) );

            state.assets = _.filter( state.assets, function( elem ){
                if( elem._id != asset ) 
                    return true;
                else 
                    return false;
            });

            _this.setState( state );

        });

    }

    backToParent(  ){

        var _this = this;

        let state = JSON.parse( JSON.stringify( this.state ) );
        state.breadcrumbs.splice( this.state.breadcrumbs.length-2,  this.state.breadcrumbs.length );
        this.setState( state );

        this.getFolder( this.state.parent ).then(

            function( data ){

                //console.log( data );
                _this.updateCurrentFolder( data );

            }

        );

    }

    addToSelected( e ){

        var id = e.target.getAttribute('data-id');

        let state = JSON.parse( JSON.stringify( this.state ) );
        
        if( _.find( state.selected, { _id: id} ) ){
            state.selected = _.filter( state.selected, function( elem ){

                if( elem._id != id )
                    return true;
                else 
                    return false

            });
        }else {
            state.selected.push( _.find( state.assets, { _id: id } ) );
        }

        this.setState( state );  

    }

    addToMainThemeBackgrounds(){

        var ids = [];

        for( var i=0; i < this.state.selected.length; i ++){

            ids.push( this.state.selected[i]._id );

        }

        this.props.editor.webSocketControllers.mainTheme.addBackgroundsFromAssets( ids, this.props.editor.adminProject.format.theme.parentThemeID  );

    }

    addToMainThemeImages(){
        
        var ids = [];

        for( var i=0; i < this.state.selected.length; i ++){

            ids.push( this.state.selected[i]._id );

        }

        this.props.editor.webSocketControllers.mainTheme.addImagesFromAssets( ids, this.props.editor.adminProject.format.theme.parentThemeID  );

    }

    addToMainThemeCliparts(){
        
        var ids = [];

        for( var i=0; i < this.state.selected.length; i ++){

            ids.push( this.state.selected[i]._id );

        }

        this.props.editor.webSocketControllers.mainTheme.addClipartsFromAssets( ids, this.props.editor.adminProject.format.theme.parentThemeID  );

    }

    addToMainThemeMasks(){

        var ids = [];
        
        for( var i=0; i < this.state.selected.length; i ++){

            ids.push( this.state.selected[i]._id );

        }

        this.props.editor.webSocketControllers.mainTheme.addMasksFromAssets( ids, this.props.editor.adminProject.format.theme.parentThemeID );

    }

    removeFolder( id ){

        var _this = this;

        this.props.editor.webSocketControllers.adminAssets.removeFolder( { id: id }, ( data ) => {

            let state = JSON.parse( JSON.stringify( _this.state ) );
            
            state.folders = _.filter( state.folders, function( elem ){
                if( elem._id != data.id ) 
                    return true;
                else 
                    return false;
            });

            _this.setState( state );

        });

    }

    renderTopMenu(){

        var folders = this.state.folders.map( ( elem, index ) => {

            return <AssetFolder remove={this.removeFolder.bind( this )} updateCurrentFolder={ this.updateCurrentFolder.bind(this)} id={elem._id} title={elem.name } editor={ this.props.editor } key={elem._id} />

        } );

        var assets = this.state.assets.map( ( elem, index ) => {
        
            if( elem.reference && elem.reference.minUrl ){
                return <div  data-id={elem._id} key={elem._id} onClick={this.addToSelected.bind( this )} className={ "projectAsset" + ( ( _.find(this.state.selected, { _id: elem._id }) )? " selected" : "" ) } style={ {backgroundImage: 'url(' + elem.reference.minUrl + ')'} }><div className="assetRemover" data-asset={ elem._id } onClick={this.removeAsset.bind( this )}>x</div></div>;
            }else {
                return null;
            }

        });

        var backButton = <button className="backToParentFolder" onClick={this.backToParent.bind( this )}>Powrót</button>

        var addToBackgrounds = <button className="backToParentFolder" onClick={ this.addToMainThemeBackgrounds.bind( this ) } >Dodaj zaznaczone do teł motywu</button>
        var addToImages = <button className="backToParentFolder" onClick={ this.addToMainThemeImages.bind( this ) } >Dodaj zaznaczone do obrazów motywu</button>
        var addToCliparts = <button className="backToParentFolder" onClick={ this.addToMainThemeCliparts.bind( this ) } >Dodaj zaznaczone do clipartow motywu</button>
        var filesToUpload = <div className="uploadingInfoReact">{ this.state.filesToUpload }</div>
        var addToMasks = <button className="backToParentFolder" onClick={ this.addToMainThemeMasks.bind( this ) } >Dodaj zaznaczone do masek motywu</button>

        if( this.state.filesToUpload == 0 ){
            filesToUpload = null;
        }

        return (

            <div>
                <div className="closeModel" onClick={this.props.close}>x</div>
                {filesToUpload}
                <div className='folder-tree-menu'>
                    <input type="text" value={this.state.newFolderName} onChange={ this.newFolderName.bind( this ) } />
                    <div className="add-new-folder" onClick={ this.addFolder.bind( this )} >Dodaj folder</div>
                </div>
                <div className="row">
                    {this.renderBreadCrumbs()}{backButton}
                </div>
                <div className='row'>
                    {addToBackgrounds}{addToImages}{addToCliparts}{addToMasks}
                </div>
                <div className={ "folder-tree" + " " + this.state.uploadFile } onDragLeave={ this.dragLeave.bind( this )} onDragOver={ this.dragOver.bind( this )} onDrop={ this.drop.bind( this )} >
                    
                    { folders }
                    {assets}
                </div>
            </div>

        );

    }

    render () {

        return this.renderTopMenu();

    }

}