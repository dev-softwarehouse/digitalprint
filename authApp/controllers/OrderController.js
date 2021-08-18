console.fs = require('../libs/fsconsole.js');

var Q = require('q');

function OrderController( mysqPool ) {

    this.name = "OrderController";
    this.mysqlPool = mysqPool;

}

OrderController.prototype.getLastUserOrder = function (userID) {
    var def = Q.defer();

    this.mysqlPool.getConnection(function(err, connection) {

        var query = 'SELECT  `dp_orders`.ID  ' +
            ' FROM  `dp_orders` ' +
            ' WHERE  `dp_orders`.`userID` = ? AND `dp_orders`.production = 0 AND `dp_orders`.ready = 0 ' +
            ' WHERE  `dp_orders`.`isOrder` = 1 ' +
            ' ORDER BY  `dp_orders`.`created` DESC ' +
            ' LIMIT 1 ';

        connection.query(query, [userID], function (err, rows) {

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

module.exports = OrderController;