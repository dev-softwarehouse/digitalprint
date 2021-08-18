var mongoose = require('mongoose');
    deepPopulate = require('mongoose-deep-populate'),
    Schema = mongoose.Schema,
    conf = require('../confs/main.js');

var ThemeSchema = new Schema({
    name: {
        type: 'String',
        required: true
    },
    MainTheme: {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'MainTheme'
    },
    ThemePages: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'ThemePage'
    }],
    url: 'String',
    toCopy: {
        type: 'Boolean',
        default: false
    },
    backgroundFrames: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Frame'
    }],
    fonts : [{
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Font'    
    }]
},{usePushEach:true});

ThemeSchema.plugin(deepPopulate, {
    
});

ThemeSchema.pre('remove', function(next){
    var _this = this;
    var themePages = [];
    var removedAllPages = false;
    var removedAllImages = false;

    var myObj = {
        result: function async1() {
            console.fs('removedAllPages: ');
            console.fs(removedAllPages);

            console.fs('removedAllImages: ');
            console.fs(removedAllImages);
            if( removedAllPages && removedAllImages ){
                
                console.fs( _this._id );
                _this.model('Format').update(
                    {Themes:  _this._id}, 
                    {$pull: {'Themes': _this._id}}, 
                    {multi: true},
                    function(err, _updated){
                        if( err ){
                            console.fs(err);
                        }
                        console.fs( " -=--==--=-==-=-=- (0*o) =-=-=-=--=-==-=-=- " );
                        console.fs( _updated );
                        console.fs( _this._id );
                    }
                );

                console.fs('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Wszystko usunięte!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

                
                console.timeEnd('removeThemePages');
                next();
                
            } else {
                console.log('Jeszcze nie wszystko się usunęło!');
            }
        }
    }

    console.time('removeThemePages');
    this.model('Theme').findOne({ '_id': this._id }, function(err, th){
        for(var i = 0;i<th.ThemePages.length;i++){
            themePages.push(th.ThemePages[i]._id);
        }

        _this.model('Theme').update({ _id: _this._id }, {'$pullAll': {ThemePages: themePages }})
          .exec(function(err) {

            console.fs('themePages: ');
            console.fs(themePages);
            _this.model('ThemePage').find({ _id: { $in: themePages } }, function(err, pages){
               
                if(pages.length > 0 && pages !== null){
                    var countPages = pages.length;
                    var countImages = pages.length;
                } else {
                    var countPages = 0;
                    var countImages = 0;
                    removedAllPages = true;
                    removedAllImages = true;
                }
                
                console.fs('Długość: ');
                console.fs(pages.length);
                
                for(var i = 0;i<pages.length;i++){
                    console.fs(pages[i]);
                    themePages.push(pages[i]._id);
                    pages[i].remove(function(err, removed){
                        console.fs('usunięto stronę: '+removed);
                        if(err){
                            console.fs(err);
                        } else {
                            countPages--;
                            if(countPages === 0){
                                removedAllPages = true;
                            }
                        }
                        myObj.result();
                    });
                }

                for(var i = 0;i<themePages.length;i++){
                    var fPath = conf.staticDir+'themes/themeMin/'+th._id+'/'+themePages[i]+'.jpg';
                    console.fs('link obrazka '+i+': ');
                    console.fs(fPath);
                    fs.unlink(fPath, function(err){
                        if(err){
                            console.fs(err);
                        }
                        console.fs('usunięto obrazek: ');
                        console.fs(themePages[i]+'.jpg');
                        countImages--;
                        if(countImages === 0){
                            removedAllImages = true;
                        }
                        myObj.result();
                    });
                }

                if(pages.length === 0){
                    myObj.result();
                }

            });
            // { $in: themePages }
            /*_this.model('ThemePage').remove({ _id: { $in: themePages } }, function(err, numberRemoved) {
                
                console.fs(themePages);
                for(var i = 0;i<themePages.length;i++){
                    var fPath = conf.staticDir+'min/'+th._id+'/'+themePages[i]+'.jpg';
                    console.fs('link obrazka '+i+': ');
                    console.fs(fPath);
                    var stat = fs.statSync(fPath);
                    console.log(stat);
                    fs.unlinkSync(fPath);
                }
                console.log("Usunieto "+numberRemoved+" stron motywów");
                
                
            });*/
        });

    }).lean().populate('ThemePages', '_id');


    

});


module.exports.model = mongoose.model('Theme', ThemeSchema, 'Theme');