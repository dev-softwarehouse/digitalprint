/* global describe, it */

(function () {
    'use strict';

    describe('Sprawdzam pozycję ', function () {
     	var obj = new Editor.EditorObject();

     	var x = 1;
     	var y = 2;
     	it("powinna być taka jak wejscie czyli "+x+"i"+y, function(){
     		expect(true).toBe(false);
     	});
    });
})();
