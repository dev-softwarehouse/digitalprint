export var User = function(){

	var userID;


	var getID = function(){

		return userID;

	};

	var setID = function( id ){

		userID = id;

	};

	return {

		getID : getID,
		setID : setID

	};

}