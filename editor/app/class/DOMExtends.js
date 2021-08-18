( function(){
	
	
	Array.prototype.remove = function(from, to) {

	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);

	};


	Element.prototype.hasClass = function( className ){

		var classes = this.className.split(' ');
		var newClassName = '';

		for( var i=0; i < classes.length; i++ ){

			if( className == classes[i] ){

				return true;

			}

		}		

		return false;

	};

	Element.prototype.addClass = function( className ){

		if( !this.hasClass( className ) ){

			this.className += ' ' + className;

		}

		return this;

	};

	Element.prototype.removeClass = function( className ) {

		var classes = this.className.split(' ');
		var newClassName = '';

		for( var i=0; i < classes.length; i++ ){

			newClassName += ( ( classes[i] != className ) ? (" " + classes[i] ): ("") );

		}

		this.className = newClassName;

		return this;

	};


})();