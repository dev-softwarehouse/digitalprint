//ComplexProductType.js
var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ComplexProductTypeSchema = new Schema({
    typeID: 'Number',
    ComplexAdminProjects: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ComplexAdminProject'
    }],
},{usePushEach:true});


ComplexProductTypeSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});

ComplexProductTypeSchema.methods.findByType = function (callback) {
    return this.model('ComplexProductType').findOne({ 'typeID': this.typeID }, callback).populate('ComplexAdminProjects');
};

ComplexProductTypeSchema.methods.findOneByType = function (callback) {
    return this.model('ComplexProductType').findOne({ 'typeID': this.typeID }, callback);
};

ComplexProductTypeSchema.methods.unactiveAllProjects = function(){
	var _this = this;
	this.model('ComplexProductType').findOne({typeID: this.typeID}, function(err, pt){
		//console.log(pt.ComplexAdminProjects);
		var adminProjects = [];
		for(var i = 0;i<pt.ComplexAdminProjects.length;i++){
            adminProjects.push(pt.ComplexAdminProjects[i]._id);
        }
        console.log(adminProjects);
		console.time('unActive');
        _this.model('ComplexAdminProject').update({ _id: { $in: adminProjects }}, { $set: { "active": false }}, { multi: true }, function(numberRows){
        	console.log("Usunięto: "+ numberRows);
        });	
        console.timeEnd('unActive');
	}).lean().populate('ComplexAdminProjects','_id');
};

module.exports.model = mongoose.model('ComplexProductType', ComplexProductTypeSchema, 'ComplexProductType');