var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema;

var ProductTypeSchema = new Schema({
    typeID: 'Number',
    AdminProjects: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'AdminProject'
    }],
    childTypes: [
        'Number'
    ]

},{usePushEach:true});


ProductTypeSchema.plugin(deepPopulate, {
  /*populate: {
    'Views.Pages': {
      select: 'name rotation width height slope x y'
    }
  }*/
});

ProductTypeSchema.methods.findByType = function (callback) {
    return this.model('ProductType').findOne({ 'typeID': this.typeID }, callback).populate('AdminProjects');
};

ProductTypeSchema.methods.findOneByType = function (callback) {
    return this.model('ProductType').findOne({ 'typeID': this.typeID }, callback);
};

ProductTypeSchema.methods.unactiveAllProjects = function(){
	var _this = this;
	this.model('ProductType').findOne({typeID: this.typeID}, function(err, pt){
		//console.log(pt.AdminProjects);
		var adminProjects = [];
		for(var i = 0;i<pt.AdminProjects.length;i++){
            adminProjects.push(pt.AdminProjects[i]._id);
        }
        console.log(adminProjects);
		console.time('unActive');
        _this.model('AdminProject').update({ _id: { $in: adminProjects }}, { $set: { "active": false }}, { multi: true }, function(numberRows){
        	console.log("Usunięto: "+ numberRows);
        });	
        console.timeEnd('unActive');
	}).lean().populate('AdminProjects','_id');
};

module.exports.model = mongoose.model('ProductType', ProductTypeSchema, 'ProductType');