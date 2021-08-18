/**
 * Created by rafal on 20.02.17.
 */
var util = require('util');
var async = require('async');

console.fs = require('../libs/fsconsole.js');

var Q = require('q');

var Cart = require('../models/Cart.js').model;

function CartController( ) {

    this.name = "CartController";

}


CartController.prototype.getByProperty = function( orderID )
{

    var def = Q.defer();

    try {

        console.log( Object.getOwnPropertyNames(Cart) );

        Cart.find({orderID: orderID}, function( err, _carts ) {

            console.log(_carts);

            if( err ){
                console.log(err);
                def.reject(err);
            } else {

                def.resolve(_carts);
            }

        });

    } catch (err) {
        console.log(err);
        def.reject(err);
    }

    return def.promise;

};

CartController.prototype.setDefaultAddress = function( carts, addressID )
{
    var def = Q.defer();

    var counter = 0;
    var cartLen = carts.length;

    def.resolve( async.whilst(function () {
        return counter <= cartLen;
    },
    function (next) {
        carts.forEach(function(cart, cartIndex) {

            cart.ProductAddresses.forEach( function(productAddress, paIndex) {
                productAddress.addressID = addressID;
                productAddress.senderID = 1;
            });

            cart.save( function( err, savedCart ) {
                if(err) {
                    console.log(err);
                } else {
                    counter++;
                }
            })

        });
    },
    function (err) {
        console.log(err);
    }) );

    return def.promise;

};

CartController.prototype.joinAddresses = function( carts, addressID, active, commonDeliveryID, commonRealisationDate )
{
    var def = Q.defer();

    var counter = 0;
    var cartLen = carts.length;
    var firstProductAddress;

    if( commonDeliveryID === undefined ) {
        commonDeliveryID = false;
    }

    def.resolve( async.whilst(function () {
            return counter < cartLen;
        },
        function (next) {
            carts.forEach(function(cart, cartIndex) {

                firstProductAddress = null;
                cart.ProductAddresses.forEach( function(productAddress, paIndex) {

                    if( active ) {
                        if( productAddress.addressID === addressID ) {
                            productAddress.join = true;
                            productAddress.commonDeliveryID = commonDeliveryID;
                            productAddress.commonRealisationTime = new Date(commonRealisationDate);
                        } else {
                            productAddress.commonDeliveryID = null;
                            productAddress.commonRealisationTime = null;
                        }
                    } else {
                        if( productAddress.addressID === addressID ) {
                            productAddress.join = false;
                        }
                        productAddress.commonDeliveryID = null;
                        productAddress.commonRealisationTime = null;
                    }

                });

                cart.save( function( err, savedCart ) {
                    if(err) {
                        console.log(err);
                    } else {
                        counter++;
                    }
                });

            });
        },
        function (err) {
            console.log(err);
        }) );

    return def.promise;

};

CartController.prototype.getJoinedAddress = function( carts, addressID )
{
    var def = Q.defer();


    carts.forEach(function(cart, cartIndex) {

        cart.ProductAddresses.forEach( function(productAddress, paIndex) {

            if( productAddress.addressID === addressID && productAddress.join === true ) {

                def.resolve({
                    'join': productAddress.join,
                    'commonDeliveryID': productAddress.commonDeliveryID,
                    'commonRealisationTime': productAddress.commonRealisationTime
                });
            }

        });

    });


    return def.promise;

};

CartController.prototype.updateProductAddresses = function(orderID, productID, productAddresses)
{
    var def = Q.defer();

    Cart.update({productID: productID, orderID: orderID}, { $set: { ProductAddresses: productAddresses } }, function( err, saved ) {
        if( err ){
            def.reject(err);
        } else {
            def.resolve(saved);
        }

    });

    return def.promise;
};

module.exports = CartController;
