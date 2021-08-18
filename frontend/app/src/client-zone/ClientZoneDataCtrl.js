/**
 * Created by rafal on 02.02.17.
 */
'use strict';

angular.module('dpClient.app')
    .controller('client-zone.ClientZoneDataCtrl', function ($scope, $rootScope, DpAddressService, CountriesService,
                                                            Notification, $filter, PhotoFolderService, $cookieStore,
                                                            RegisterWidget, UserService) {

    $scope.countries = [];
    $scope.photoForm = {};
    $scope.form = {};
    $scope.actualUser = {};

    function init() {
        getImportantData();
    }

    function getImportantData() {
        UserService.getImportantData().then(function(data) {
            $scope.form = data;
            $scope.actualUser.login = data.login;
            $scope.form.smsAgree = !!data.sms;
            $scope.form.advAgree = !!data.advertising;

            showCountries(data.countryCode);

        });
    }

    function showCountries(countryCode) {
        CountriesService.getAll().then(function (dataCountries) {
            $scope.countries = dataCountries;

            RegisterWidget.findFormAreaCode(
                $scope,
                'form',
                countryCode,
                ''
            );
        });
    }

    init();

    $scope.edit = function () {

        var data = _.clone($scope.form);
        data.sms = data.smsAgree ? 1 : 0;
        delete data.smsAgree;
        data.advertising = data.advAgree ? 1 : 0;
        delete data.advAgree;

        UserService.editImportantData(data).then( function(data) {

            if(data.response === true) {
                Notification.success($filter('translate')('successfully_edited'));
            } else {
                Notification.error($filter('translate')('error'));
            }

        }, function() {
            Notification.error($filter('translate')('error'));
        });
        
    };

    $scope.addPhotoFolder = function() {
        console.log($scope.photoForm);
        PhotoFolderService.add($scope.photoForm.name).then( function(data) {
           console.log(data);
        });
    };

    $scope.getFolders = function() {
        PhotoFolderService.get().then( function(data) {
            $scope.folders = data;
        });
    };

    $scope.$watch('form.countryCode', function (code, oldVal) {
        RegisterWidget.findFormAreaCode(
            $scope,
            'form',
            code,
            oldVal
        );
    }, true);

});
