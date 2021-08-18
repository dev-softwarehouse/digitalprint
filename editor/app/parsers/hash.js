function hash( text, time ) {

    var possible = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
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