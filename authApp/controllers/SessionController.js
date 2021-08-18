var util = require('util');

console.fs = require('../libs/fsconsole.js');

var Q = require('q');

var generatorUID = require('../libs/generator.js');

var hashing = require('../libs/hashingProof.js');

var Session = require('../models/Session.js').model;

function SessionController() {
    this.name = "SessionController";
}

SessionController.prototype.get = function (sid) {

    var def = Q.defer();

    try {

        Session.findOne({'sid': sid}, function (err, _session) {

            if (err) {
                console.log(err);
                def.reject(err);
            } else {

                def.resolve(_session);
            }

        }).populate('Carts');

    } catch (err) {
        console.log(err);
        def.reject(err);
    }

    return def.promise;

};

SessionController.prototype.check = function (sid) {

    var def = Q.defer();

    var thisSession = new this.constructor();
    this.get(sid).then(function (_newSession) {

        if (_newSession !== null) {
            sid = hashing.generate(27);
            thisSession.check(sid);
        } else {
            def.resolve(sid);
        }

        def.reject(false);
    }, function (err) {
        console.log('err: ', err);
    });

    return def.promise;
};

SessionController.prototype.add = function (data) {

    var def = Q.defer();

    var newSession = new Session();
    newSession.sid = hashing.generate(27);

    this.check(newSession.sid).then(function (okSid) {

        if (okSid.length > 0) {

            newSession.valid = true;
            var now = new Date();
            newSession.ts = now;
            newSession.data = "";
            newSession.valid = true;
            newSession.save(function (err, saved) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(saved);
                }
            });

        } else {
            def.reject({'error': 'Problem z hashem'});
        }
    });

    return def.promise;

};

SessionController.prototype.add2 = function (data) {

    var def = Q.defer();

    var newSession = new Session();
    newSession.sid = hashing.generate(27);

    this.check(newSession.sid).then(function (okSid) {

        if (okSid.length > 0) {
            var now = new Date();
            newSession.ts = now;
            var newData = {};
            newData.userEditorID = data.userEditorID;
            newData.user = {
                'firstname': data.first_name,
                'lastname': data.last_name,
                'ID': data.userID,
                'super': data.super,
                'user': data.email
            };
            newSession.data = JSON.stringify(newData);
            newSession.valid = true;
            newSession.save(function (err, saved) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(saved);
                }
            });

        } else {
            def.reject({'error': 'Problem z hashem'});
        }
    });

    return def.promise;

};

SessionController.prototype.update = function (sid, data) {

    var def = Q.defer();

    this.get(sid).then(function (session) {

        if (session !== null) {

            var newData = {};
            newData.userEditorID = data.userEditorID;
            newData.service = data.service;
            newData.user = {
                'firstname': data.first_name,
                'lastname': data.last_name,
                'ID': data.userID,
                'super': data.super,
                'user': data.user,
                'login': data.login
            };
            session.data = JSON.stringify(newData);
            session.save(function (err, saved) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(saved);
                }
            });

        } else {
            def.reject({'error': 'Problem z hashem'});
        }
    });

    return def.promise;

};

SessionController.prototype.updateCarts = function (sid, cartID) {

    var def = Q.defer();

    Session.findOneAndUpdate({_id: sid}, {$pull: {Carts: cartID}}, function (err, data) {
        if (err) {
            def.reject(err);
        } else {
            def.resolve(data);
        }
    });

    return def.promise;

};

SessionController.prototype.addNoLogin = function (data) {

    var def = Q.defer();

    var newSession = new Session();
    newSession.sid = hashing.generate(27);

    this.check(newSession.sid).then(function (okSid) {
        if (okSid.length > 0) {

            var now = new Date();
            newSession.ts = now;
            var newData = data;

            newSession.data = JSON.stringify(newData);
            newSession.valid = true;
            newSession.save(function (err, saved) {
                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(saved);
                }
            });

        } else {
            def.reject({'error': 'Problem z hashem'});
        }
    });

    return def.promise;

};

SessionController.prototype.getAll = function () {
    var def = Q.defer();

    Session.find({}, function (err, sessions) {

        if (err) {
            console.log(err);
            def.reject(err);
        } else {
            def.resolve(sessions);
        }

    });

    return def.promise;
};

SessionController.prototype.remove = function (sid) {
    var def = Q.defer();


    this.get(sid).then(function (_session) {

        if (_session) {
            _session.remove();
            console.log(_session);
            def.resolve(true);
        } else {
            def.reject(true);
        }

    });

    return def.promise;
};

SessionController.prototype.getByOrder = function (orderID) {

    var def = Q.defer();

    try {

        Session.findOne({'orderID': orderID}, function (err, _session) {

            if (err) {
                console.log(err);
                def.reject(err);
            } else {

                def.resolve(_session);
            }

        }).populate('Carts');

    } catch (err) {
        console.log(err);
        def.reject(err);
    }

    return def.promise;

};

module.exports = SessionController;