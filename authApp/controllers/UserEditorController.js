var util = require('util');

console.fs = require('../libs/fsconsole.js');

var Q = require('q');

var UserEditor = require('../models/UserEditor.js').model;

function UserEditorController() {
    this.name = "UserEditorController";
}

UserEditorController.prototype.get = function (userID) {

    var def = Q.defer();

    try {
        UserEditor.findOne({'userID': userID}, function (err, _userEritor) {

            if (err) {
                def.reject(false);
            } else {
                if (_userEritor) {
                    def.resolve(_userEritor);
                } else {
                    def.resolve(false);
                }
            }

        });

    } catch (err) {
        def.reject(false);
    }

    return def.promise;
};

UserEditorController.prototype.getById = function (ID) {

    var def = Q.defer();

    try {

        UserEditor.findById(ID, function (err, _userEritor) {

            if (err) {
                def.reject(false);
            } else {
                if (_userEritor) {
                    def.resolve(_userEritor);
                } else {
                    def.resolve(false);
                }
            }

        });

    } catch (err) {
        def.reject(false);
    }

    return def.promise;
};

UserEditorController.prototype.add = function (userID) {
    var def = Q.defer();

    var userEditor = new UserEditor();
    userEditor.userID = userID;

    userEditor.save(function (err, _savedUserEditor) {

        if (err) {
            def.reject(false);
        }

        if (_savedUserEditor) {
            def.resolve(_savedUserEditor);
        } else {
            def.resolve(false);
        }
    });

    return def.promise;
};

UserEditorController.prototype.update = function (userEditorID, userID) {
    var def = Q.defer();


    UserEditor.update({_id: userEditorID}, {$set: {userID: userID, login: true}}, function (err, _updatedUserEditor) {

        if (err) {
            def.reject(false);
        } else {
            def.resolve(_updatedUserEditor);
        }

    });

    return def.promise;
};

UserEditorController.prototype.check = function (userID, session) {
    var def = Q.defer();

    var _that = this;

    _that.get(userID).then(function (_userEditor) {

        if (_userEditor) {

            console.log('#1');

            def.resolve(_userEditor._id);

        } else {

            console.log('#2');

            console.log(session);

            var sessionData;
            if( session ) {
                sessionData = JSON.parse(session.data);
                console.log(sessionData);
            }

            if (sessionData != undefined && sessionData.userEditorID != undefined) {

                console.log('#3');
                UserEditor.findOne( { _id: sessionData.userEditorID } ).exec( function( err, userData ){
                    console.log( userData );
                    console.log('=-=--=-==-=-=-=-=-=-=-==-=-=-=-=-=-=');
                    userData.userID = userID;
                    userData.login = true;
                    userData.save( function( err, saved ){

                        if( err ){
                            console.log( err );
                        }else {

                            console.log(saved);
                            console.log('=+++++++++++++++++++++++++++++++++++++++++=');
                            def.resolve(saved._id);
                        }
                    });
                });
                /*
                _that.update(sessionData.userEditorID, userID).then(function (_savedUserEditor) {

                    console.log( _savedUserEditor );
                    console.log( 'SADASDSADASDASDASDAS' );
                    if (_savedUserEditor.ok == 1) {
                        def.resolve(sessionData.userEditorID);
                    } else {
                        def.reject(false);
                    }
                    http://digitalprint.pro:1387/folder?sortBy=date&order=-1&page=1&display=10
                });
*/
            } else {

                console.log('#4');

                _that.add(userID).then(function (_userEditor) {
                    if (_userEditor) {
                        def.resolve(_userEditor._id);
                    } else {
                        def.reject(false);
                    }
                });
            }


        }
    });

    return def.promise;
};

module.exports = UserEditorController;