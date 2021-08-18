/**
 * Created by Rafał on 11-09-2017.
 */
var util = require('util');

console.fs = require('../libs/fsconsole.js');

var Q = require('q');

function ReclamationMessageController(mysqPool) {
    this.name = "ReclamationMessageController";
    this.mysqlPool = mysqPool;
}

ReclamationMessageController.prototype.add = function (reclamationID, message, sender, admin) {

    var def = Q.defer();

    if( admin === undefined ) {
        admin = 0;
    }

    this.mysqlPool.getConnection(function(err, connection) {

        var query = 'INSERT INTO  `dp_reclamationMessages` (' +
                '`ID` ,' +
                '`reclamationID` ,' +
                '`content` ,' +
                '`isAdmin` ,' +
                '`senderID` ,' +
            '`read` ,' +
            '`created`' +
            ')' +
            'VALUES (' +
            'NULL ,  ?,  ?,  ?,  ?,  0, NOW() ' +
        ');';

        connection.query(query, [reclamationID, message, admin, sender], function (err, rows) {

            connection.release();

            if (err) {
                def.reject(err);
            }

            if (rows === undefined || rows.length === 0) {
                def.resolve(null);
            } else {
                def.resolve(rows);
            }

        });

    });

    return def.promise;

};

ReclamationMessageController.prototype.get = function (ID) {
    var def = Q.defer();

    this.mysqlPool.getConnection(function(err, connection) {

        var query = 'SELECT  `dp_reclamationMessages` . *, `dp_reclamations`.userID  ' +
        ' FROM  `dp_reclamationMessages` ' +
        ' LEFT JOIN  `dp_reclamations` ON  `dp_reclamations`.ID =  `dp_reclamationMessages`.reclamationID ' +
        ' WHERE  `dp_reclamationMessages`.`ID` = ? '+
        ' LIMIT 1 ';

        connection.query(query, [ID], function (err, rows) {

            connection.release();

            if (err) {
                def.reject(err);
            }

            if (rows === undefined || rows.length === 0) {
                def.resolve(null);
            } else {
                def.resolve(rows[0]);
            }

        });

    });

    return def.promise;
};

module.exports = ReclamationMessageController;