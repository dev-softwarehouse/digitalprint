import {UserPage} from './UserPage';


function UserView( editor, userView ){

    this.editor = editor;
    this.init( userView );

};

var p = UserView.prototype;

p.init = function( userView ){

	this._id = userView._id;
	this.order = userView.order;
	this.Pages = [];
	this.createViewElement();

	for( var i=0; i < userView.Pages.length; i++ ){

		userView.Pages[i].width = userView.adminView.Pages[i].width;
		userView.Pages[i].height = userView.adminView.Pages[i].height;
        let page = new UserPage( this.editor, userView.Pages[i], this );
		this.Pages.push( page );

	}

}

p.loadedImage = function(){



}


p.createViewElement = function(){

	this.viewElement = document.createElement('div');
	this.viewElement.className = 'userViewElement';
	this.viewElement.setAttribute('user-view-id', this._id );

}


export { UserView };
