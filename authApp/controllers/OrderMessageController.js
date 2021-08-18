/**
 * Created by Rafał on 11-09-2017.
 */
var util = require('util');

console.fs = require('../libs/fsconsole.js');

var Q = require('q');

function OrderMessageController(mysqPool) {
    this.name = "OrderMessageController";
    this.mysqlPool = mysqPool;
}

OrderMessageController.prototype.add = function (orderID, message, sender, admin) {

    var def = Q.defer();

    if( admin === undefined ) {
        admin = 0;
    }

    this.mysqlPool.getConnection(function(err, connection) {

        var query = 'INSERT INTO  `dp_orderMessages` (' +
                '`ID` ,' +
                '`orderID` ,' +
                '`content` ,' +
                '`isAdmin` ,' +
                '`senderID` ,' +
            '`read` ,' +
            '`created`' +
            ')' +
            'VALUES (' +
            'NULL ,  ?,  ?,  ?,  ?,  0, NOW() ' +
        ');';

        connection.query(query, [orderID, message, admin, sender], function (err, rows) {

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

OrderMessageController.prototype.get = function (ID) {
    var def = Q.defer();

    this.mysqlPool.getConnection(function(err, connection) {

        var query = 'SELECT  `dp_orderMessages` . *, `dp_orders`.userID  ' +
        ' FROM  `dp_orderMessages` ' +
        ' LEFT JOIN  `dp_orders` ON  `dp_orders`.ID =  `dp_orderMessages`.orderID ' +
        ' WHERE  `dp_orderMessages`.`ID` = ? '+
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

module.exports = OrderMessageController;