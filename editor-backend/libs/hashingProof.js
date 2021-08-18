var _ = require('underscore');
var possible = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports.hash = function hash( text, time ) {



    var splited = text.split("");
    
    var min = 0;
    var max = possible.length;

    
    time = time*1000;

    var dt = new Date(time);

    var text = "";
    var newNum;
    var index;
    for(var i=0;i<splited.length;i++){
        //console.fs(splited[i].charCodeAt(0));
        index = _.indexOf(possible, splited[i]);
   		if( i<5 ){
   			newNum = index+dt.getUTCMonth();
   		}
   		if( i >= 5 && i < 10 ){
   			newNum = index+dt.getDate();
   		}
   		if( i >= 10 && i<15 ){
   			newNum = index+dt.getHours();
   		}
   		if( i >= 15 && i<20 ){
   			newNum = index+dt.getMinutes();
   		}
   	    newNum = newNum % max;
   		
   		text += possible[newNum];
    }
    return text;
};

module.exports.unhash = function unhash( text, time ) {

    var splited = text.split("");
    var min = 0;
    var max = possible.length;


    time = time*1000;

    var dt = new Date(time);

    var text = "";
    var newNum;
    var index;
    for(var i=0;i<splited.length;i++){
        index = _.indexOf(possible, splited[i]);
   		if( i<5 ){
   			newNum = index-dt.getUTCMonth();
   		}
   		if( i >= 5 && i<10 ){
   			newNum = index-dt.getDate();
   		}
   		if( i >= 10 && i<15 ){
   			newNum = index-dt.getHours();
   		}
   		if( i >= 15 && i<20 ){
   			newNum = index-dt.getMinutes();
   		}
        if(newNum < 0){
            newNum+=max;
        }
   	    newNum = newNum%max;

   		text += possible[newNum];
    }
  	return text;  
};

module.exports.generate = function generate(num){
    var text = "";

    var newChar;
    for( var i=0; i < num-1; i++ ){
    	newChar = possible[_.random(0, possible.length-1)];
        text += newChar;
    }
    return text;
};