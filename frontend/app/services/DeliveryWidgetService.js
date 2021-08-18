/**
 * Created by Rafał on 03-03-2017.
 */
angular.module('digitalprint.services')
    .factory('DeliveryWidgetService', function ($rootScope, $q, DeliveryService) {

        function DeliveryWidgetService(json) {
            angular.extend(this, json);
        }

        /**
         * @param product
         * @param address
         * @param deliveries
         * @returns {*}
         */
        function getPkgWeight(product, address, deliveries) {

            var currencyIndex = _.findIndex($rootScope.currencies, {'code': product.currency});

            var course = 1;
            if (currencyIndex > -1) {
                course = $rootScope.currencies[currencyIndex].course;
                if (typeof course === 'string') {
                    course = course.replace(',', '.');
                }
                course = Number(course).toFixed(2);
            }

            var volume = address.allVolume;

            var deliveryID = address.deliveryID;
            var idx = _.findIndex(deliveries, {ID: deliveryID});

            var productVolume = product.volume;
            if (product.amount > 1) {
                productVolume *= product.amount;
            }
            var productWeight = product.weight;

            var productUnitWeight = productWeight / productVolume;
            var aweight = productUnitWeight * volume;

            if (idx > -1) {
                var unit_qty = 0;
                var weight = 0;
                var unitPrice = 0;
                var unitPriceGross = 0;
                var no_of_pkgs = 0;
                var grossweight = 0;

                var _div;
                var _rem;

                if (angular.isDefined(deliveries[idx].price)) {

                    unit_qty = parseFloat(deliveries[idx].price.UnitQty);
                    weight = parseFloat(deliveries[idx].price.weight);
                    unitPrice = parseFloat(deliveries[idx].price.price);
                    unitPriceGross = parseFloat(deliveries[idx].price.priceGross);

                    if (volume <= unit_qty && aweight <= weight) {
                        no_of_pkgs = 1;
                    }
                    else if (volume > unit_qty && aweight <= weight) {
                        _div = Math.floor(volume / unit_qty);
                        _rem = volume % unit_qty;
                        if (_rem > 0) {
                            _div++;
                        }
                        no_of_pkgs += _div;
                    } else if (volume <= unit_qty && aweight > weight) {
                        _div = Math.floor(aweight / weight);
                        _rem = aweight % weight;
                        if (_rem > 0) {
                            _div++;
                        }
                        no_of_pkgs += _div;
                    } else if (volume > unit_qty && aweight > weight) {

                        _div = Math.floor(volume / unit_qty);
                        _rem = volume % unit_qty;
                        if (_rem > 0) {
                            _div++;
                        }

                        var new_weight = aweight / _div;

                        if (new_weight <= weight) {
                            no_of_pkgs = _div;
                        }
                        else {

                            _div = Math.floor(aweight / weight);
                            _rem = aweight % weight;
                            if (_rem > 0) {
                                _div++;
                            }
                            no_of_pkgs = _div;
                        }
                    }

                    grossweight = aweight;

                    if (checkWeightFreeRange(productWeight,
                            deliveries[idx].price.FS_WeightStart,
                            deliveries[idx].price.FS_WeightEnd) ||
                        checkPriceFreeRange(course, product.price,
                            deliveries[idx].price.FS_ValStart,
                            deliveries[idx].price.FS_ValEnd)) {
                        address.price = 0;
                        address.priceGross = 0;
                    } else {
                        address.price = (no_of_pkgs * unitPrice).toFixed(2) / course;
                        address.priceGross = (no_of_pkgs * unitPriceGross).toFixed(2) / course;
                    }

                } else {
                    address.grossweight = 0;
                    address.no_of_pkgs = 0;
                }

                address.no_of_pkgs = no_of_pkgs;
                address.grossweight = grossweight.toFixed(2).replace('.', ',');
                address.price = address.price.toFixed(2).replace('.', ',');
                address.priceGross = address.priceGross.toFixed(2).replace('.', ',');
                return address;
            }
        }

        /**
         *
         * @param product
         * @param address
         * @param deliveries
         * @returns {*}
         */
        function getPkgWeightMyZone(product, address, deliveries) {

            var volume = address.allVolume;

            var deliveryID = address.deliveryID;
            var idx = _.findIndex(deliveries, {ID: deliveryID});

            var productVolume = product.volume;
            if (product.amount > 1) {
                productVolume *= product.amount;
            }
            var productWeight = product.weight;

            var productUnitWeight = productWeight / productVolume;
            var aweight = productUnitWeight * volume;

            if (idx > -1) {
                var unit_qty = 0;
                var weight = 0;
                var unitPrice = 0;
                var unitPriceGross = 0;
                var no_of_pkgs = 0;
                var grossweight = 0;

                var _div;
                var _rem;

                if (angular.isDefined(deliveries[idx].price)) {

                    unit_qty = parseFloat(deliveries[idx].price.UnitQty);
                    weight = parseFloat(deliveries[idx].price.weight);

                    if (volume <= unit_qty && aweight <= weight) {
                        no_of_pkgs = 1;
                    }
                    else if (volume > unit_qty && aweight <= weight) {
                        _div = Math.floor(volume / unit_qty);
                        _rem = volume % unit_qty;
                        if (_rem > 0) {
                            _div++;
                        }
                        no_of_pkgs += _div;
                    } else if (volume <= unit_qty && aweight > weight) {
                        _div = Math.floor(aweight / weight);
                        _rem = aweight % weight;
                        if (_rem > 0) {
                            _div++;
                        }
                        no_of_pkgs += _div;
                    } else if (volume > unit_qty && aweight > weight) {

                        _div = Math.floor(volume / unit_qty);
                        _rem = volume % unit_qty;
                        if (_rem > 0) {
                            _div++;
                        }

                        var new_weight = aweight / _div;

                        if (new_weight <= weight) {
                            no_of_pkgs = _div;
                        }
                        else {

                            _div = Math.floor(aweight / weight);
                            _rem = aweight % weight;
                            if (_rem > 0) {
                                _div++;
                            }
                            no_of_pkgs = _div;
                        }
                    }

                    grossweight = aweight;

                } else {
                    address.grossweight = 0;
                    address.no_of_pkgs = 0;
                }

                address.no_of_pkgs = no_of_pkgs;
                address.grossweight = grossweight.toFixed(2).replace('.', ',');
                return address;
            }
        }

        /**
         *
         * @param address
         * @param scope
         */
        function getPkgWeightCalc(address, scope) {

            var course = 1;
            if ($rootScope.currentCurrency) {
                course = $rootScope.currentCurrency.course;
                if (typeof course === 'string') {
                    course = course.replace(',', '.');
                }
                course = Number(course).toFixed(2);
            }

            var deliveryID = address.deliveryID;
            var idx = _.findIndex(scope.filteredDeliveries, {ID: deliveryID});

            var vol = scope.calculation.volume * scope.calculation.amount;
            var productWeight = scope.calculation.weight;

            if (productWeight === undefined) {
                return;
            }

            var unitWeight = productWeight / vol;
            var totalWeight = unitWeight * address.allVolume;

            var _div;
            var _rem;

            if (idx > -1) {
                var maxPerPackage = 0;
                var weight = 0;
                var unitPrice = 0;
                var unitPriceGross = 0;
                var numberOfPackages = 0;
                var grossWeight = 0;

                if (angular.isDefined(scope.filteredDeliveries[idx].price)) {

                    maxPerPackage = parseFloat(scope.filteredDeliveries[idx].price.UnitQty);
                    weight = parseFloat(scope.filteredDeliveries[idx].price.weight);
                    unitPrice = parseFloat(scope.filteredDeliveries[idx].price.price);
                    unitPriceGross = parseFloat(scope.filteredDeliveries[idx].price.priceGross);

                    if (address.allVolume <= maxPerPackage && totalWeight <= weight) {
                        numberOfPackages = 1;
                    } else if (address.allVolume > maxPerPackage && totalWeight <= weight) {
                        _div = Math.floor(address.allVolume / maxPerPackage);
                        _rem = address.allVolume % maxPerPackage;
                        if (_rem > 0) {
                            _div++;
                        }
                        numberOfPackages += _div;
                    } else if (address.allVolume <= maxPerPackage && totalWeight > weight) {
                        _div = Math.floor(totalWeight / weight);
                        _rem = totalWeight % weight;
                        if (_rem > 0) {
                            _div++;
                        }
                        numberOfPackages += _div;
                    } else if (address.allVolume > maxPerPackage && totalWeight > weight) {

                        _div = Math.floor(address.allVolume / maxPerPackage);
                        _rem = address.allVolume % maxPerPackage;
                        if (_rem > 0) {
                            _div++;
                        }

                        var new_weight = totalWeight / _div;

                        if (new_weight <= weight) {
                            numberOfPackages = _div;
                        }
                        else {

                            _div = Math.floor(totalWeight / weight);
                            _rem = totalWeight % weight;
                            if (_rem > 0) {
                                _div++;
                            }
                            numberOfPackages = _div;
                        }
                    }

                    grossWeight = totalWeight;

                    if (checkWeightFreeRange(totalWeight,
                            scope.filteredDeliveries[idx].price.FS_WeightStart,
                            scope.filteredDeliveries[idx].price.FS_WeightEnd) ||
                        checkPriceFreeRange(course, scope.calculation.priceTotal,
                            scope.filteredDeliveries[idx].price.FS_ValStart,
                            scope.filteredDeliveries[idx].price.FS_ValEnd)) {
                        address.price = 0;
                        address.priceGross = 0;
                    } else {
                        address.price = numberOfPackages * unitPrice;
                        address.priceGross = numberOfPackages * unitPriceGross;
                    }

                } else {
                    address.grossweight = 0;
                    address.no_of_pkgs = 0;
                }

                address.no_of_pkgs = numberOfPackages;
                address.grossweight = grossWeight.toFixed(2).replace('.', ',');
                address.price = address.price.toFixed(2).replace('.', ',');
                address.priceGross = address.priceGross.toFixed(2).replace('.', ',');
            }
        }

        /**
         * @param scope
         * @param address
         * @returns {*}
         */
        function selectVolume(scope, address) {
            var vol;
            if (typeof address === 'undefined') {
                vol = scope.calculation.volume;
                if (scope.calculation.amount > 1) {
                    vol *= scope.calculation.amount;
                }
            } else {
                vol = address.allVolume;
            }
            return vol;
        }

        /**
         *
         * @param address
         * @param volume
         * @param scope
         */
        function getPkgWeightLite(address, volume, scope) {

            var course = 1;
            if ($rootScope.currentCurrency) {
                course = $rootScope.currentCurrency.course;
                if (typeof course === 'string') {
                    course = course.replace(',', '.');
                }
                course = Number(course).toFixed(2);
            }

            var productWeight = scope.calculation.weight;

            if (productWeight === undefined) {
                return;
            }

            //TODO: COMPARE WEIGHT FROM MANAGER TO WEIGHT FROM CALC
            //TODO: ENSURE MAX PRODUCT UNITS IS NOT EXCEEDED

            var maxPerPackage = 0;
            var weight = 0;
            var unitPrice = 0;
            var unitPriceGross = 0;
            var numberOfPackages = 0;

            var idx = _.findIndex(scope.filteredDeliveries, {ID: address.deliveryID});

            var _div;
            var _rem;

            if (angular.isDefined(scope.filteredDeliveries[idx]) &&
                angular.isDefined(scope.filteredDeliveries[idx].price)) {

                /**
                 * @param {number} scope.filteredDeliveries[].price.UnitQty
                 */
                maxPerPackage = parseFloat(scope.filteredDeliveries[idx].price.UnitQty);
                weight = parseFloat(scope.filteredDeliveries[idx].price.weight);
                unitPrice = parseFloat(scope.filteredDeliveries[idx].price.price);
                unitPriceGross = parseFloat(scope.filteredDeliveries[idx].price.priceGross);

                if (volume <= maxPerPackage && productWeight <= weight) {
                    numberOfPackages = 1;
                } else if (volume > maxPerPackage && productWeight <= weight) {
                    _div = Math.floor(volume / maxPerPackage);
                    _rem = volume % maxPerPackage;
                    if (_rem > 0) {
                        _div++;
                    }
                    numberOfPackages += _div;
                } else if (volume <= maxPerPackage && productWeight > weight) {
                    _div = Math.floor(productWeight / weight);
                    _rem = productWeight % weight;
                    if (_rem > 0) {
                        _div++;
                    }
                    numberOfPackages += _div;
                } else if (volume > maxPerPackage && productWeight > weight) {

                    _div = Math.floor(volume / maxPerPackage);
                    _rem = volume % maxPerPackage;
                    if (_rem > 0) {
                        _div++;
                    }

                    var newWeight = productWeight / _div;

                    if (newWeight <= weight) {
                        numberOfPackages = _div;
                    } else {
                        _div = Math.floor(productWeight / weight);
                        _rem = productWeight % weight;
                        if (_rem > 0) {
                            _div++;
                        }
                        numberOfPackages = _div;
                    }
                }

                if (checkWeightFreeRange(productWeight,
                        scope.filteredDeliveries[idx].price.FS_WeightStart,
                        scope.filteredDeliveries[idx].price.FS_WeightEnd) ||
                    checkPriceFreeRange(course, scope.calculation.priceTotal,
                        scope.filteredDeliveries[idx].price.FS_ValStart,
                        scope.filteredDeliveries[idx].price.FS_ValEnd)) {
                    address.price = 0;
                    address.priceGross = 0;
                } else {
                    address.price = numberOfPackages * unitPrice;
                    address.priceGross = numberOfPackages * unitPriceGross;
                }

            } else {
                address.grossweight = 0;
                address.no_of_pkgs = 0;
            }

            address.no_of_pkgs = numberOfPackages;
            address.grossweight = productWeight.toFixed(2).replace('.', ',');
            address.price = address.price.toFixed(2).replace('.', ',');
            address.priceGross = address.priceGross.toFixed(2).replace('.', ',');
        }

        function getJoinWeight(scope, deliveryID) {
            var parentScope = scope.$parent;

            var idx = _.findIndex(parentScope.deliveries, {ID: deliveryID});
            if (idx > -1) {
                var activeDelivery = parentScope.deliveries[idx];
            } else {
                return;
            }

            var maxPerPackage = parseFloat(activeDelivery.price.UnitQty);
            var weight = parseFloat(activeDelivery.price.weight);
            var unitPrice = parseFloat(activeDelivery.price.price);
            var unitPriceGross = parseFloat(activeDelivery.price.priceGross);
            var numberOfPackages = 0;
            var result = {};

            if (angular.isDefined(activeDelivery.price)) {

                result.selectedDelivery = activeDelivery;

                var prdIndex;
                var overallWeight = 0;
                var overallVolume = 0;
                var tmpVolume;
                _.each(scope.activeAddressToJoin, function (oneAddress) {
                    tmpVolume = 0;
                    prdIndex = _.findIndex(parentScope.cart.products, {productID: oneAddress.productID});
                    overallWeight += parentScope.cart.products[prdIndex].weight;
                    tmpVolume = parentScope.cart.products[prdIndex].volume;
                    if( parentScope.cart.products[prdIndex].amount > 1 ) {
                        tmpVolume *= parentScope.cart.products[prdIndex].amount;
                    }
                    overallVolume += tmpVolume;
                });

                result.overallWeight = overallWeight.toFixed(2).replace('.', ',');
                result.overallVolume = overallVolume;

                var _div;
                var _rem;

                if (overallVolume <= maxPerPackage && overallWeight <= weight) {
                    numberOfPackages = 1;
                } else if (overallVolume > maxPerPackage && overallWeight <= weight) {
                    _div = Math.floor(overallVolume / maxPerPackage);
                    _rem = overallVolume % maxPerPackage;
                    if (_rem > 0) {
                        _div++;
                    }
                    numberOfPackages += _div;
                } else if (overallVolume <= maxPerPackage && overallWeight > weight) {
                    _div = Math.floor(overallWeight / weight);
                    _rem = overallWeight % weight;
                    if (_rem > 0) {
                        _div++;
                    }
                    numberOfPackages += _div;
                } else if (overallVolume > maxPerPackage && overallWeight > weight) {

                    _div = Math.floor(overallVolume / maxPerPackage);
                    _rem = overallVolume % maxPerPackage;
                    if (_rem > 0) {
                        _div++;
                    }

                    var newWeight = overallWeight / _div;

                    if (newWeight <= weight) {
                        numberOfPackages = _div;
                    } else {
                        _div = Math.floor(overallWeight / weight);
                        _rem = overallWeight % weight;
                        if (_rem > 0) {
                            _div++;
                        }
                        numberOfPackages = _div;
                    }
                }

                result.numberOfPackages = numberOfPackages;
                result.price = (numberOfPackages * unitPrice).toFixed(2).replace('.', ',');
                result.priceGross = (numberOfPackages * unitPriceGross).toFixed(2).replace('.', ',');
            }

            return result;
        }

        function checkWeightFreeRange(weight, weightMin, weightMax) {

            if (weightMin === null && weightMax === null) {
                return false;
            }

            if (weightMin > 0 && weightMax === null) {
                if (parseFloat(weightMin) <= weight) {
                    return true;
                }
            }

            if (weightMin === null && weightMax > 0) {
                if (parseFloat(weightMax) >= weight) {
                    return true;
                }
            }

            if (parseFloat(weightMin) <= weight &&
                parseFloat(weightMax) >= weight) {
                return true;
            }

            return false;
        }

        function checkPriceFreeRange(course, price, priceMin, priceMax) {

            price = parseFloat(price);
            priceMin = parseFloat(priceMin) / course;
            priceMax = parseFloat(priceMax) / course;

            if (priceMin === null && priceMax === null) {
                return false;
            }

            if (priceMin > 0 && priceMax === null) {
                if (priceMin <= price) {
                    return true;
                }
            }

            if (priceMin === null && priceMax > 0) {
                if (priceMax >= price) {
                    return true;
                }
            }

            if (priceMin <= price &&
                priceMax >= price) {
                return true;
            }

            return false;
        }

        function checkExclusions(scope, address) {

            var course = 1;
            if ($rootScope.currentCurrency) {
                course = $rootScope.currentCurrency.course;
                if (typeof course === 'string') {
                    course = course.replace(',', '.');
                }
                course = Number(course).toFixed(2);
            }

            var excluded = [];
            _.each(scope.filteredDeliveries, function (delivery) {
                if (checkPriceExclusionRange(
                        course,
                        scope.calculation.priceTotal,
                        delivery.price.EX_ValStart,
                        delivery.price.EX_ValEnd
                    )) {
                    excluded.push(delivery.ID);
                } else if (checkWeightExclusionRange(
                        scope.calculation.weight,
                        delivery.price.EX_WeightStart,
                        delivery.price.EX_WeightEnd)) {
                    excluded.push(delivery.ID);
                }
            });

            address.deliveries = [];
            var selectedExcluded = false;

            _.each(scope.filteredDeliveries, function (delivery) {

                if (delivery !== undefined) {
                    if (_.indexOf(excluded, delivery.ID) === -1) {
                        address.deliveries.push(delivery);
                    } else {

                        var filteredIndex = _.findIndex(address.deliveries, {ID: delivery.ID});
                        if (filteredIndex > -1) {
                            address.deliveries.splice(filteredIndex, 1);
                        }

                        if (address.deliveryID === delivery.ID) {
                            selectedExcluded = true;
                        }
                    }
                }

            });

            if (selectedExcluded) {
                address.deliveryID = _.first(address.deliveries).ID;
            }
        }

        function checkExclusionsInCart(product, address) {

            var course = 1;
            if ($rootScope.currentCurrency) {
                course = $rootScope.currentCurrency.course;
                if (typeof course === 'string') {
                    course = course.replace(',', '.');
                }
                course = Number(course).toFixed(2);
            }

            var productPrice = _.clone(product.grossPrice);
            if (typeof product.grossPrice === 'string') {
                productPrice = product.grossPrice.replace(',', '.');
            }
            productPrice = Number(productPrice).toFixed(2);

            var excluded = [];
            _.each(product.filteredDeliveries, function (delivery) {
                if (checkPriceExclusionRange(
                    course,
                    productPrice,
                    delivery.price.EX_ValStart,
                    delivery.price.EX_ValEnd
                )) {
                    excluded.push(delivery.ID);
                } else if (checkWeightExclusionRange(
                    address.grossweight,
                    delivery.price.EX_WeightStart,
                    delivery.price.EX_WeightEnd)) {
                    excluded.push(delivery.ID);
                }
            });

            address.deliveries = [];
            var selectedExcluded = false;

            _.each(product.filteredDeliveries, function (delivery) {

                if (delivery !== undefined) {

                    if (_.indexOf(excluded, delivery.ID) === -1) {
                        address.deliveries.push(delivery);
                    } else {

                        var filteredIndex = _.findIndex(address.deliveries, {ID: delivery.ID});
                        if (filteredIndex > -1) {
                            address.deliveries.splice(filteredIndex, 1);
                        }

                        if (address.deliveryID === delivery.ID) {
                            selectedExcluded = true;
                        }
                    }
                }

            });

            if (selectedExcluded) {
                address.deliveryID = _.first(address.deliveries).ID;
            }
        }

        function checkExclusionsCart(scope, product, address) {

            var course = 1;
            if ($rootScope.currentCurrency) {
                course = $rootScope.currentCurrency.course;
                if (typeof course === 'string') {
                    course = course.replace(',', '.');
                }
                course = Number(course).toFixed(2);
            }

            var excluded = [];

            _.each(scope.filteredDeliveries, function (delivery) {

                if (checkPriceExclusionRange(
                        course,
                        product.price,
                        delivery.price.EX_ValStart,
                        delivery.price.EX_ValEnd
                    )) {
                    excluded.push(delivery.ID);
                } else if (checkWeightExclusionRange(
                        address.grossweight,
                        delivery.price.EX_WeightStart,
                        delivery.price.EX_WeightEnd)) {
                    excluded.push(delivery.ID);
                }
            });


            var selectedExcluded = false;

            var counter = 0;

            if (excluded.length > 0) {
                _.each(excluded, function (excludeDeliveryID) {

                    var filteredIndex = _.findIndex(scope.filteredDeliveries, {ID: excludeDeliveryID});

                    counter++;
                    if (filteredIndex > -1) {

                        if (address.deliveryID === excludeDeliveryID) {
                            selectedExcluded = true;
                        }

                        scope.filteredDeliveries.splice(filteredIndex, 1);

                        if (counter === excluded.length) {
                            address.deliveries = scope.filteredDeliveries;
                        }
                    }

                });
            }

            if (selectedExcluded) {
                address.deliveryID = _.first(scope.filteredDeliveries).ID;
            }
        }

        function checkWeightExclusionRange(weight, weightMin, weightMax) {

            if (typeof weight === 'string') {
                weight = weight.replace(',', '.');
            }
            weight = parseFloat(weight);
            if (weightMin !== null) {
                weightMin = parseFloat(weightMin);
            }
            if (weightMax !== null) {
                weightMax = parseFloat(weightMax);
            }

            if (weightMin === null && weightMax === null) {
                return false;
            }

            if (weightMin > 0 && weightMax === null) {
                if (weightMin <= weight) {
                    return true;
                }
            }

            if (weightMin === null && weightMax > 0) {
                if (weightMax >= weight) {
                    return true;
                }
            }

            if (weightMin <= weight &&
                weightMax >= weight) {
                return true;
            }

            return false;
        }

        function checkPriceExclusionRange(course, price, priceMin, priceMax) {
            if (typeof price === 'string') {
                price = price.replace(',', '.');
            }
            price = parseFloat(price);
            if (priceMin !== null) {
                priceMin = parseFloat(priceMin) / course;
            }
            if (priceMax !== null) {
                priceMax = parseFloat(priceMax) / course;
            }

            if (priceMin === null && priceMax === null) {
                return false;
            }

            if (priceMin > 0 && priceMax === null) {
                if (priceMin <= price) {
                    return true;
                }
            }

            if (priceMin === null && priceMax > 0) {
                if (priceMax >= price) {
                    return true;
                }
            }

            if (priceMin <= price &&
                priceMax >= price) {
                return true;
            }

            return false;
        }

        function reducePostData(productAddresses) {
            var cloned = JSON.parse(JSON.stringify(productAddresses));

            var def = $q.defer();

            if( cloned.length === 0 ) {
                def.resolve([]);
            }

            _.each(cloned, function (one, index) {
                delete one.deliveries;
                delete one.details;
                delete one.senders;
                delete one.deliveryNames;
                delete one.senderName;
                delete one.parcelShops;
                delete one.collectionPoints;
                if (index === cloned.length - 1) {
                    def.resolve(cloned);
                }
            });

            return def.promise;
        }

        function filterDeliveries(scope, product) {

            var def = $q.defer();

            var filteredDeliveries = scope.deliveries;

            var counter = 0;
            var counterCompare = 0;

            _.each(product.calcProducts, function( oneProduct ) {

                counterCompare += oneProduct.attributes.length;
                _.each(oneProduct.attributes, function(attribute) {

                    if( attribute.excludeDeliveries && attribute.excludeDeliveries.length > 0 ) {

                        _.each(attribute.excludeDeliveries, function(deliveryID) {

                            var deliveryIndex = _.findIndex(filteredDeliveries, {ID: deliveryID});

                            if( deliveryIndex > -1 ) {

                                filteredDeliveries.splice(deliveryIndex, 1);
                            }

                        });
                        counter++;
                        if( counter === counterCompare ) {
                            def.resolve(filteredDeliveries);
                        }
                    } else {
                        counter++;
                        if( counter === counterCompare ) {
                            def.resolve(filteredDeliveries);
                        }
                    }
                });
            });

            return def.promise;
        }

        function findParcelShops(addressID, deliveryID, courierID, address) {

            var def = $q.defer();

            DeliveryService.findParcelShops(addressID, deliveryID, courierID).then( function(data) {
                if( data.length > 0 ) {
                    address.parcelShops = data;
                    def.resolve(true);
                } else {
                    address.parcelShops = [];
                    def.resolve(false);
                }
            }, function(error) {
                def.reject(error);
            });

            return def.promise;
        }

        function checkParcelShopSelected(productAddresses) {
            var def = $q.defer();

            _.each(productAddresses, function(oneAddress, index) {
                if( oneAddress.hasParcelShops && !oneAddress.parcelShopID ) {
                    def.resolve(false);
                }
                if( index >= (productAddresses.length - 1) ) {
                    def.resolve(true);
                }
            });

            return def.promise;
        }

        function checkCollectionPoints(scope, deliveryID) {

            var parentScope = scope.$parent;

            var idx = _.findIndex(parentScope.deliveries, {ID: deliveryID});
            if (idx > -1) {
                var activeDelivery = parentScope.deliveries[idx];
            } else {
                return;
            }

            if( activeDelivery.collectionPoints !== undefined && activeDelivery.collectionPoints.length > 0 ) {
                return activeDelivery.collectionPoints;
            }
        }

        return {
            getPkgWeight: getPkgWeight,
            selectVolume: selectVolume,
            getPkgWeightLite: getPkgWeightLite,
            getPkgWeightCalc: getPkgWeightCalc,
            getJoinWeight: getJoinWeight,
            getPkgWeightMyZone: getPkgWeightMyZone,
            checkExclusions: checkExclusions,
            checkExclusionsCart: checkExclusionsCart,
            reducePostData: reducePostData,
            filterDeliveries: filterDeliveries,
            findParcelShops: findParcelShops,
            checkParcelShopSelected: checkParcelShopSelected,
            checkCollectionPoints: checkCollectionPoints,
            checkExclusionsInCart: checkExclusionsInCart
        };
    });
