module.exports = function arrEq(arr1, arr2) {

	if(arr2.length !== arr1.length){
		return false;
	}
	arr1 = arr1.sort();
	arr2 = arr2.sort();
	for (var i = 0; i < arr1.length; i++){
		if (arr1[i] != arr2[i]){
			return false;
		}
	}
  	return true;
}