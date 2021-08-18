'use strict'

angular.module('digitalprint.services')
    .service('socketService', function ($q, $config, socketFactory, $rootScope) {

        var host = $config.SOCKET_URL;

        var socketService = function (port) {
            var ioSocket = io.connect([host, port].join(':'));
            this.mySocket = socketFactory({
                ioSocket: ioSocket,
                prefix: ''
            });
        };

        socketService.prototype.emit = function (eventName, data) {
            return this.mySocket.emit(eventName, data);
        };

        socketService.prototype.broadcastEmit = function (eventName, data) {
            return this.mySocket.broadcast.emit(eventName, data);
        };

        socketService.prototype.remove = function (eventName) {
            return this.mySocket.removeListener(eventName);
        };

        socketService.prototype.on = function (eventName, callback) {
            var _this = this;
            return this.mySocket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(_this.mySocket, args);
                });
            });
        };

        return socketService;
    });