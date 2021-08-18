/**
 * Created by Rafał on 08-03-2017.
 */
var mongoose = require('mongoose');
var conf = require('./mainConf.js');

//Object holding all your connection strings
var connection = {};

exports.countConnections = function() {
    var count = 0;

    /*for(var conn in connections){
        if( connections[conn] !== undefined ) {
            count += connections[conn].connections.length;
        }
    }*/

    count = mongoose.connections.length;

    return count;
};

exports.getDatabaseConnection = function(databaseName) {

    if( mongoose.connection.readyState > 0 ) {

        connection = mongoose.connect("mongodb://"+conf.mongoUser+":"+conf.mongoPwd+"@"+conf.mongoHost+":"+conf.mongoPort+"/"+databaseName + "?authSource=admin", function(err) {
            if( err ){
                console.fs( {"error": err, 'info': '#1 problem with connection with: ' + databaseName} );
                //connections[databaseName] = mongoose.createConnection("mongodb://localhost:27017/"+databaseName);
                //return connections[databaseName];
            }
        });

        return connection;

    } else {
        connection = mongoose.connect("mongodb://"+conf.mongoUser+":"+conf.mongoPwd+"@"+conf.mongoHost+":"+conf.mongoPort+"/"+databaseName+"?authSource=admin", function(err) {
            if( err ){
                console.fs( {"error": err, 'info': '#2 problem with connection with: ' + databaseName} );
                //connections[databaseName] = mongoose.createConnection("mongodb://localhost:27017/"+databaseName);
                //return connections[databaseName];
            }
        });
        return connection;
    }

    return connection;

};