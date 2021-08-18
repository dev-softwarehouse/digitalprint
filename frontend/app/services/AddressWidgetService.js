angular.module('digitalprint.services')
    .factory('AddressWidgetService', function (TemplateRootService, CountriesService, $modal, AddressService) {

        function AddressWidgetService(json) {
            angular.extend(this, json);
        }

        function addressesEdit(applicationScope) {

            TemplateRootService.getTemplateUrl(31).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: applicationScope,
                    size: 'lg',
                    resolve: {
                        countries: function () {
                            return CountriesService.getAll().then(function (data) {
                                return data;
                            });
                        }
                    },
                    controller: function ($scope, $modalInstance, countries) {

                        $scope.countries = countries;
                        $scope.form = {};

                        $scope.addAddress = function () {
                            $scope.form.saving = true;
                            $scope.form.type = 1;
                            AddressService.addAddress($scope.form).then(function (data) {

                                if (data.response === true) {
                                    $scope.form = {};
                                    $scope.form.saving = false;
                                    $scope.addresses.push(data.item);
                                    AddressService.saveAddressToSession(data.addressID).then(function (data) {
                                        if (data.response) {
                                            Notification.success($filter('translate')('saved'));
                                        }
                                    });
                                }


                            });

                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }

                    }
                });
            });
        }

        return {
            addressesEdit: addressesEdit
        };

    });
