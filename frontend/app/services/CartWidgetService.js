angular.module('digitalprint.services')
    .factory('CartWidgetService', function ($rootScope, $q, $modal, TemplateRootService, DpProductService,
                                            PsGroupService, CalculateDataService, $q, $timeout, DeliveryWidgetService,
                                            CalculationService, DeliveryService, AuthService, $filter, Notification,
                                            $config, CountService, CalcSimplifyWidgetService, $cookieStore,
                                            MainWidgetService, $cookies ) {

        var deletedAttrs;

        function copyProduct(scope, product, onlyVolumeChange)
        {
            TemplateRootService.getTemplateUrl(115).then(function (response) {
                $modal.open({
                    templateUrl: response.url,
                    scope: scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        if(onlyVolumeChange) {
                            $scope.onlyVolumeChange = true;
                        } else {
                            $scope.onlyVolumeChange = false;
                        }

                        var stopSelectAttr = null;
                        var stopSelect = null;

                        $scope.volumes = [];
                        $scope.complexProducts = [];
                        $scope.productItem = {};
                        $scope.emptyProduct = true;
                        $scope.productItem.amount = product.amount;
                        $scope.productItem.volume = product.volume;
                        $scope.productItem.realisationTime = product.realizationTimeID;
                        $scope.customVolume = {};
                        $scope.technologies = [];
                        $scope.rememberVolume = {};
                        $scope.summaryThickness = {};
                        $scope.loadVolumes = false;
                        $scope.productAddresses = [];
                        $scope.deliveries = [];
                        $scope.filteredDeliveries = [];
                        $scope.activeVolume = {};
                        $scope.currentGroupID = null;
                        $scope.currentTypeID = null;
                        $scope.productAddresses = [];
                        $scope.copyInProgress = false;


                        getData(product.typeID).then( function(data) {

                            if (angular.isDefined($cookies['customVolumes'])) {
                                var cookieCustomVolumes = angular.fromJson($cookies['customVolumes']);
                                if (angular.isDefined(cookieCustomVolumes[product.typeID])) {
                                    $scope.customVolume = cookieCustomVolumes[product.typeID];
                                }
                            }

                            $scope.type = data.type;
                            $scope.type.formats = data.formats[data.type.typeID];

                            $scope.currentGroupID = data.type.groupID;
                            $scope.currentTypeID = data.type.ID;
                            $scope.type = data;

                            selectComplexProduct($scope, data, product).then( function() {

                                selectDefaultFormats($scope).then(function () {

                                    _.each($scope.complexProducts, function(oneComplex) {

                                        _.each(oneComplex.products, function(oneProduct) {

                                            setExclusionsAsync($scope, oneComplex.selectedProduct.data).then(function (exclusionEnd) {

                                                if (exclusionEnd) {

                                                    setOptions(product, oneComplex.selectedProduct.data).then( function() {
                                                        $scope.getVolumes(product, $scope.productItem.amount);
                                                    });

                                                    setFormats($scope, product, oneComplex.selectedProduct.data).then( function() {

                                                    });

                                                }
                                            });

                                        });
                                    });

                                }, function (data) {
                                    console.log(data);
                                });

                            });

                        });

                        $scope.selectFormat = function(selectProduct, format, noReload) {

                            selectProduct.currentFormat = format;

                            if (!!format.custom ) {
                                if( !selectProduct.currentFormat.customWidth ) {
                                    selectProduct.currentFormat.customWidth = format.minWidth - format.slope * 2;
                                }
                                if( !selectProduct.currentFormat.customHeight  ) {
                                    selectProduct.currentFormat.customHeight = format.minHeight - format.slope * 2;
                                }
                            }

                            $scope.checkRelatedFormats(selectProduct, format);

                            $scope.filterRelatedFormats();

                            $scope.selectDefaultFormats().then(function () {

                                CalcSimplifyWidgetService.checkFormatExclusions(selectProduct).then(function() {

                                    setExclusionsAsync($scope, selectProduct).then(function (exclusionEnd) {

                                        if (exclusionEnd) {
                                            $scope.selectDefaultOptions(selectProduct);
                                            if( noReload === undefined || noReload === false ) {
                                                $scope.getVolumes(selectProduct, $scope.productItem.amount);
                                            }
                                        }
                                    });
                                });

                            }, function (data) {
                                console.log(data);
                            });

                        };

                        $scope.selectCustomFormat = function (complexProduct) {

                            var stopSelect;

                            complexProduct.selectedProduct.data.currentFormat.customHeight = Number(complexProduct.selectedProduct.data.currentFormat.customHeight);
                            complexProduct.selectedProduct.data.currentFormat.customWidth = Number(complexProduct.selectedProduct.data.currentFormat.customWidth);

                            if (angular.isDefined(stopSelect)) {
                                $timeout.cancel(stopSelect);
                                stopSelect = undefined;
                            }

                            stopSelect = $timeout(function () {

                                var minHeight = complexProduct.selectedProduct.data.currentFormat.minHeight - complexProduct.selectedProduct.data.currentFormat.slope * 2;
                                var minWidth = complexProduct.selectedProduct.data.currentFormat.minWidth - complexProduct.selectedProduct.data.currentFormat.slope * 2;

                                var maxHeight = complexProduct.selectedProduct.data.currentFormat.maxHeight - complexProduct.selectedProduct.data.currentFormat.slope * 2;
                                var maxWidth = complexProduct.selectedProduct.data.currentFormat.maxWidth - complexProduct.selectedProduct.data.currentFormat.slope * 2;

                                if (complexProduct.selectedProduct.data.currentFormat.customHeight > maxHeight) {
                                    Notification.info($filter('translate')('value_greater_than_maximum') + ' ' + maxHeight);
                                    complexProduct.selectedProduct.data.currentFormat.customHeight = maxHeight;
                                }

                                if (complexProduct.selectedProduct.data.currentFormat.customHeight < minHeight) {
                                    Notification.info($filter('translate')('value_lower_than_minimum') + ' ' + minHeight);
                                    complexProduct.selectedProduct.data.currentFormat.customHeight = minHeight;
                                }

                                if (complexProduct.selectedProduct.data.currentFormat.customWidth > maxWidth) {
                                    Notification.info($filter('translate')('value_greater_than_maximum') + ' ' + maxWidth);
                                    complexProduct.selectedProduct.data.currentFormat.customWidth = maxWidth;
                                }

                                if (complexProduct.selectedProduct.data.currentFormat.customWidth < minWidth) {
                                    Notification.info($filter('translate')('value_lower_than_minimum') + ' ' + minWidth);
                                    complexProduct.selectedProduct.data.currentFormat.customWidth = minWidth;
                                }

                                $scope.getVolumes(product, $scope.productItem.amount);

                            }, 1500);
                        };

                        $scope.getVolumes = function (selectedProduct, amount) {

                            $scope.loadVolumes = true;

                            getPreparedProduct($scope, product, amount).then(function (preparedProduct) {

                                preparedProduct.customVolumes = $scope.customVolume.volumes;

                                CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);

                                CalculateService.getVolumes(preparedProduct).then(function (data) {

                                    if( data.technologies && $scope.technologies.length === 0 ) {
                                        $scope.technologies = data.technologies;
                                    }

                                    data.volumes.filter(function (element) {
                                        return element.active === true;
                                    });

                                    $scope.showVolumes(data);

                                    /**
                                     * @param {Object} data.volumeInfo
                                     */
                                    if (angular.isDefined(data.volumeInfo)) {
                                        $scope.customVolume.custom = data.volumeInfo.custom;
                                        $scope.customVolume.maxVolume = data.volumeInfo.maxVolume;
                                    }

                                    $scope.getMinVolume();

                                }, function (data) {
                                    console.log(data);
                                    Notification.error($filter('translate')('error'));
                                });
                            });

                        };

                        $scope.showVolumes = function (data) {

                            $scope.volumes = data.volumes;
                            $scope.realisationTimes = data.realisationTimes;

                            if (angular.isDefined($scope.rememberVolume.volume)) {
                                $scope.calculate($scope.productItem.amount, $scope.rememberVolume.volume.volume);
                            } else {
                                if (angular.isDefined($scope.volumes[0])) {
                                    $scope.loadVolumes = false;
                                    $scope.calculate($scope.productItem.amount, $scope.volumes[0].volume);
                                } else {
                                    console.log('volumes: ', $scope.volumes);
                                }
                            }

                        };

                        $scope.getMinVolume = function () {

                            if( $scope.volumes.length === 0 ) {
                                return;
                            }

                            $scope.customVolume.minVolume = $scope.volumes[0].volume;

                            if (!angular.isDefined($scope.customVolume.newVolume)) {
                                $scope.customVolume.newVolume = $scope.volumes[0].volume;
                            }
                        };

                        $scope.selectDefaultOptions = function (product) {

                            _.each(product.attributes, function (item) {

                                if (!product.selectedOptions[item.attrID]) {

                                    var tmp;
                                    _.each(item.options, function (option) {

                                        if (!_.contains(product.excludedOptions, option.ID)) {
                                            tmp = option;
                                            return false;
                                        }
                                    });

                                    var defaultOption = _.findWhere(item.options, {default: 1});

                                    if (defaultOption && !_.contains(product.excludedOptions, defaultOption.ID)) {
                                        tmp = defaultOption;
                                    }

                                    $scope.selectOption(product, item.attrID, tmp, true);

                                }
                            });

                        };

                        $scope.selectOption = function (selectedProductData, attrID, item, noReload) {

                            var itemExist = true;

                            if (item === undefined) {
                                itemExist = false;
                                var optID = selectedProductData.selectedOptions[attrID];

                                item = getOption(selectedProductData, optID);

                                if (item === undefined) {
                                    return false;
                                }
                            }

                            selectedProductData.selectedOptions[attrID] = parseInt(item.ID);

                            setRangePages(selectedProductData, attrID);

                            if (selectedProductData.thickness.minAttr === attrID) {
                                selectedProductData.thickness.min = null;
                                selectedProductData.thickness.minAttr = null;
                            }

                            if (selectedProductData.thickness.maxAttr === attrID) {
                                selectedProductData.thickness.max = null;
                                selectedProductData.thickness.maxAttr = null;
                            }

                            /**
                             * @param {Object} item
                             * @param {number|null} item.minThickness
                             * @param {number|null} item.maxThickness
                             * @param {number} item.sizePage
                             */
                            if (Number(item.minThickness) > 0 && ( Number(item.minThickness) > selectedProductData.thickness.min || item.minThickness === null)) {
                                selectedProductData.thickness.min = item.minThickness;
                                selectedProductData.thickness.minAttr = attrID;
                            }

                            if (Number(item.maxThickness) > 0 && ( Number(item.maxThickness) < selectedProductData.thickness.max || selectedProductData.thickness.max === null)) {

                                selectedProductData.thickness.max = item.maxThickness;
                                selectedProductData.thickness.maxAttr = attrID;
                            }

                            selectedProductData.thickness.values[attrID] = item.sizePage;

                            if (selectedProductData.pages.length) {
                                $scope.calcProductThickness(selectedProductData);
                                $scope.getMinimumThickness(selectedProductData);
                                $scope.getMaximumThickness(selectedProductData);
                            }

                            setExclusionsAsync($scope, selectedProductData).then(function (exclusionEnd) {

                                if (exclusionEnd) {
                                    $scope.selectDefaultOptions(selectedProductData);
                                    if (!itemExist) {
                                        selectedProductData.typeID = selectedProductData.info.typeID;
                                        selectedProductData.groupID = selectedProductData.info.groupID;
                                        selectedProductData.taxID = $scope.productItem.taxID;
                                        selectedProductData.name = $scope.productItem.name;
                                        selectedProductData.realizationTimeID = $scope.productItem.realizationTimeID;

                                        if( noReload === undefined || noReload === false) {
                                            $scope.getVolumes(selectedProductData, $scope.productItem.amount);
                                        }
                                    }
                                }

                            });


                        };

                        $scope.calcProductThickness = function (product) {

                            var sheets = product.currentPages / 2;

                            // condition concerns minimal and maximal number of pages it is given for every single option
                            if (!_.keys(product.thickness.values).length) {
                                product.thickness.current = null;
                                return true;
                            }
                            /**
                             * @param {number} product.pages[].doublePage
                             */
                            var doublePage = !!product.pages[0].doublePage;

                            if (doublePage) {
                                sheets /= 2;
                            }

                            var value = 0;
                            var keyThickness = _.keys(product.thickness.values);
                            var tmpAttrID = null;
                            _.each(_.values(product.thickness.values), function (one, index) {
                                tmpAttrID = keyThickness[index];
                                if (Number(one) > 0 && _.has(product.selectedOptions, tmpAttrID)) {
                                    value += one;
                                }
                            });

                            product.thickness.current = sheets * value;

                            // show thickness in summary od product
                            $scope.summaryThickness[product.typeID] = product.thickness.current;

                            return true;
                        };

                        $scope.getMinimumThickness = function (type) {

                            if (!_.keys(type.thickness.values).length || !type.thickness.min) {

                                var minPages = getMinPages(type);

                                if (minPages > type.pages[0].minPages) {
                                    return minPages;
                                }

                                return type.pages[0].minPages || 0;
                            }

                            var value = 0;
                            _.each(_.values(type.thickness.values), function (one) {
                                if (Number(one) > 0) {
                                    value += one;
                                }
                            });

                            var sheets = type.thickness.min / value;
                            var pages = Math.ceil(sheets) * 2;
                            var doublePage = !!type.pages[0].doublePage;
                            if (doublePage) {
                                pages *= 2;
                            }

                            if (!!type.pages[0].step) {
                                var modulo = pages % type.pages[0].step;
                                if (modulo) {
                                    pages += type.pages[0].step - modulo;
                                }
                            }

                            if (type.currentPages < pages) {
                                // show that pages was change
                                $scope.selectPages(type, pages);
                            }

                            return pages;
                        };

                        $scope.getMaximumThickness = function (product) {

                            if (!_.keys(product.thickness.values).length || !product.thickness.max) {
                                return product.pages[0].maxPages || 9999999;
                            }

                            var value = 0;
                            _.each(_.values(product.thickness.values), function (one) {
                                if (Number(one) > 0) {
                                    value += one;
                                }
                            });

                            var sheets = product.thickness.max / value;
                            var pages = Math.floor(sheets) * 2;
                            var doublePage = !!product.pages[0].doublePage;
                            if (doublePage) {
                                pages *= 2;
                            }

                            if (!!product.pages[0].step) {
                                var modulo = pages % product.pages[0].step;
                                if (modulo) {
                                    pages -= modulo;
                                }
                            }

                            if (product.currentPages > pages) {
                                $scope.selectPages(product, pages);
                            }

                            return pages;
                        };

                        $scope.filterByThickness = function (product) {

                            var exclusions = {};

                            _.each(product.attributes, function (attribute) {

                                exclusions[attribute.attrID] = [];
                                var idx;
                                _.each(attribute.options, function (option) {

                                    if (angular.isDefined(option.maxThickness) && Number(option.maxThickness) > 0) {

                                        if (product.thickness.current > option.maxThickness) {

                                            idx = product.excludedOptions.indexOf(option.ID);
                                            if (idx === -1) {
                                                exclusions[attribute.attrID].push(option.ID);
                                            }

                                        }
                                    }

                                    if (angular.isDefined(option.minThickness) && Number(option.minThickness) > 0) {

                                        if (product.thickness.current < option.minThickness) {

                                            idx = product.excludedOptions.indexOf(option.ID);
                                            if (idx === -1) {
                                                exclusions[attribute.attrID].push(option.ID);
                                            }

                                        }

                                    }

                                });

                            });

                            return exclusions;
                        };

                        $scope.filterByOptionsPages = function (product) {

                            var exclusions = {};

                            _.each(product.attributes, function (attribute) {

                                exclusions[attribute.attrID] = [];

                                _.each(attribute.options, function (option) {

                                    /**
                                     * @param {number} option.maxPages
                                     */

                                    if (product.currentPages && angular.isDefined(option.maxPages) && Number(option.maxPages) > 0) {

                                        if (product.currentPages > option.maxPages) {

                                            idx = product.excludedOptions.indexOf(option.ID);
                                            if (idx === -1) {
                                                exclusions[attribute.attrID].push(option.ID);
                                            }

                                        }
                                    }

                                    if (product.currentPages && angular.isDefined(option.minPages) && Number(option.minPages) > 0) {

                                        if (product.currentPages < option.minPages) {

                                            var idx = product.excludedOptions.indexOf(option.ID);

                                            if (idx === -1) {
                                                exclusions[attribute.attrID].push(option.ID);
                                            }

                                        }

                                    }

                                });

                            });

                            return exclusions;
                        };

                        $scope.countAttrNotExcludedOptions = function (product, attr) {

                            var count = 0;
                            _.each(attr.options, function (option) {

                                if (!_.contains(product.excludedOptions, option.ID)) {
                                    count++;
                                }

                            });
                            return count;
                        };

                        $scope.calculate = function (amount, volume) {

                            $scope.calculation = {};

                            $scope.calculationInfo = [];

                            getPreparedProduct($scope, product, amount, volume).then(function (preparedProduct) {

                                CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);
                                CalculateService.calculate(preparedProduct).then(function (data) {
                                    $scope.showCalculation(data);

                                    if( $scope.deliveries.length > 0 ) {
                                        $scope.productAddresses[0].deliveryID = $scope.deliveries[0].ID;
                                        $scope.productAddresses[0].index = 0;
                                        $scope.productAddresses[0].ID = 1;

                                        var address = $scope.productAddresses[0];
                                        address.weight = data.weight;
                                        address.volume = volume;
                                        address.amount = amount;
                                        address.allVolume = volume * amount;

                                        excludeDeliveries();

                                        if ($rootScope.logged !== false) {
                                            address = DeliveryWidgetService.getPkgWeightCalc(
                                                address,
                                                $scope
                                            );
                                        } else {
                                            address = DeliveryWidgetService.getPkgWeightLite(
                                                address,
                                                DeliveryWidgetService.selectVolume($scope, address),
                                                $scope
                                            );
                                        }
                                    }

                                }, function (data) {
                                    console.error(data);
                                    Notification.error($filter('translate')('error'));
                                });

                            });

                        };

                        $scope.checkRelatedFormats = function (product, format) {

                            if (!format.relatedFormats) {
                                return true;
                            }
                            $scope.relatedFormats = [];
                            _.each(format.relatedFormats, function (item) {
                                $scope.relatedFormats.push({ID: item.formatID, typeID: item.typeID});
                            });

                        };

                        $scope.checkEmptyChoice = function (complexProduct, attributeID) {

                            var attrIdx = _.findIndex(complexProduct.selectedProduct.data.attributes, {attrID: parseInt(attributeID)});

                            if (attrIdx > -1) {
                                var attribute = complexProduct.selectedProduct.data.attributes[attrIdx];

                                var optionID = complexProduct.selectedProduct.data.selectedOptions[attribute.attrID];

                                var optIdx = _.findIndex(attribute.filteredOptions, {ID: parseInt(optionID)});
                                if (optIdx > -1) {
                                    var option = attribute.filteredOptions[optIdx];
                                    return option.emptyChoice;
                                }

                                return false;
                            }

                            return false;
                        };

                        $scope.showAttribute = function (complexProduct, attrID) {
                            var attrIdx = _.findIndex(complexProduct.selectedProduct.data.attributes, {attrID: parseInt(attrID)});
                            var attrName;
                            if (attrIdx > -1) {
                                var attribute = complexProduct.selectedProduct.data.attributes[attrIdx];

                                var optID = complexProduct.selectedProduct.data.selectedOptions[attribute.attrID];

                                var optIdx = _.findIndex(attribute.filteredOptions, {ID: parseInt(optID)});
                                if (optIdx > -1) {
                                    var option = attribute.filteredOptions[optIdx];

                                    if (option.invisible === 1) {
                                        return '';
                                    }

                                } else {
                                    return '';
                                }

                                if (attribute.names[$rootScope.currentLang.code].name !== undefined) {
                                    attrName = attribute.names[$rootScope.currentLang.code].name
                                } else {
                                    attrName = attribute.attrName;
                                }

                                return attrName;

                            }
                            return '';
                        };

                        $scope.showOption = function (complexProduct, attrID) {
                            var attrIdx = _.findIndex(complexProduct.selectedProduct.data.attributes, {attrID: parseInt(attrID)});
                            var optionName;
                            if (attrIdx > -1) {
                                var attribute = complexProduct.selectedProduct.data.attributes[attrIdx];

                                var optID = complexProduct.selectedProduct.data.selectedOptions[attribute.attrID];

                                var optIdx = _.findIndex(attribute.filteredOptions, {ID: parseInt(optID)});
                                if (optIdx > -1) {
                                    var option = attribute.filteredOptions[optIdx];

                                    if (option.invisible === 1) {
                                        return '';
                                    }

                                    if (option.names[$rootScope.currentLang.code].name !== undefined) {
                                        optionName = option.names[$rootScope.currentLang.code].name;
                                    } else {
                                        optionName = option.name;
                                    }

                                    return optionName;
                                }
                            }
                            return '';
                        };

                        $scope.showCalculation = function (data) {

                            $scope.calculation = data.calculation;

                            $scope.calculationInfo = data.info;
                            $scope.prepareUrl();

                            if (!_.isEmpty($scope.rememberVolume)) {

                                var idxRT = _.findIndex($scope.realisationTimes, {ID: $scope.rememberVolume.realisationTime.ID});
                                if (idxRT !== -1) {
                                    var idxVol = _.findIndex($scope.realisationTimes[idxRT].volumes, {volume: $scope.rememberVolume.volume.volume});
                                    if (idxVol !== -1) {

                                        $scope.checkVolume($scope.rememberVolume.realisationTime, $scope.realisationTimes[idxRT].volumes[idxVol]);
                                    } else {
                                        // return to 0 index because volume is excluded
                                        $scope.checkVolume($scope.realisationTimes[0], $scope.realisationTimes[0].volumes[0]);
                                    }

                                } else {
                                    $scope.checkVolume($scope.rememberVolume.realisationTime, $scope.rememberVolume.volume);
                                }


                            } else {

                                var sortRealisationTimes = _.sortBy($scope.realisationTimes, 'order');

                                if( $scope.productItem.volume === undefined ) {
                                    var activeVolume = getActiveVolume(sortRealisationTimes[0].volumes, 0);
                                    $scope.checkVolume(sortRealisationTimes[0], activeVolume);
                                    $scope.productItem.volume = activeVolume.volume;
                                } else {
                                    var sortRealisationTimes = _.sortBy($scope.realisationTimes, 'order');
                                    var actualRealisationTime = _.findWhere(sortRealisationTimes, {ID: $scope.productItem.realisationTime});
                                    var activeVolume = getActiveVolumeByVolume(actualRealisationTime.volumes, $scope.productItem.volume);
                                    $scope.checkVolume(actualRealisationTime, activeVolume);
                                    $scope.productItem.volume = activeVolume.volume;
                                }

                            }

                        };

                        $scope.prepareUrl = function () {

                            if ($scope.complexProducts.length === 1 && $scope.calculation.amount > 0) {

                                getPreparedProduct($scope, product, $scope.calculation.amount).then(function (preparedProduct) {
                                    var returnedProduct = preparedProduct.products[0];

                                    /**
                                     * @param {string} $config.EDITOR_URL
                                     */

                                    $scope.editorUrl = $config.EDITOR_URL + '?' + 'typeID=' + returnedProduct.typeID +
                                        '&formatID=' + returnedProduct.formatID + '&pages=' + returnedProduct.pages;

                                    _.each(returnedProduct.options, function (opt) {
                                        $scope.editorUrl += '&' + opt.attrID + '=' + opt.optID;
                                    });
                                });

                            }
                        };

                        $scope.checkVolume = function (realisationTime, volume) {

                            _.each($scope.realisationTimes, function (val) {
                                val.overwriteDate = null;
                            });

                            var idxRT = _.findIndex($scope.realisationTimes, {ID: realisationTime.ID});

                            if (idxRT !== -1) {

                                $scope.rememberVolume.realisationTime = $scope.realisationTimes[idxRT];

                                $scope.realisationTimes[idxRT].overwriteDate = volume.date;

                                var idxV = _.findIndex($scope.realisationTimes[idxRT].volumes, {volume: volume.volume});
                                if (idxV !== -1) {

                                    $scope.rememberVolume.volume = volume;

                                    $scope.activeVolume.rtID = $scope.realisationTimes[idxRT].ID;
                                    $scope.activeVolume.volume = $scope.calculation.volume = $scope.realisationTimes[idxRT].volumes[idxV].volume;

                                    $scope.calculation.priceTotal = $scope.realisationTimes[idxRT].volumes[idxV].price;

                                    /**
                                     * @param {number} $scope.realisationTimes[].volumes[].priceBrutto
                                     */
                                    $scope.calculation.priceTotalBrutto = $scope.realisationTimes[idxRT].volumes[idxV].priceBrutto;
                                    $scope.calculation.weight = $scope.realisationTimes[idxRT].volumes[idxV].weight;
                                    if ($scope.realisationTimes[idxRT].overwriteDate) {
                                        $scope.calculation.realisationTime = $scope.realisationTimes[idxRT].overwriteDate;
                                    } else {
                                        $scope.calculation.realisationTime = $scope.realisationTimes[idxRT].date;
                                    }

                                    _.each($scope.realisationTimes[idxRT].volumes, function (actVolume) {


                                        var idxVol = _.findIndex($scope.volumes, {volume: actVolume.volume});

                                        if (idxVol !== -1) {
                                            $scope.volumes[idxVol].active = actVolume.active;
                                        }

                                    });

                                    $scope.productItem.volume = volume.volume;

                                    _.each($scope.realisationTimes, function (realisationTime, rIndex) {
                                        var idxVol = _.findIndex(realisationTime.volumes, {volume: volume.volume});
                                        if (idxVol !== -1) {
                                            $scope.realisationTimes[rIndex].active = realisationTime.volumes[idxVol].active;
                                        }
                                    });

                                    $scope.productItem.realisationTime = realisationTime.ID;

                                    $scope.loadVolumes = false;
                                    $scope.getTotalThickness();
                                }
                            } else {
                                $scope.rememberVolume = {};
                            }

                        };

                        $scope.getTotalThickness = function () {

                            var tmp = 0;
                            _.each($scope.summaryThickness, function (th) {
                                tmp += th;
                            });
                            return tmp.toFixed(2);

                        };

                        $scope.changeRealisationTime = function () {

                            var idxRT = _.findIndex($scope.realisationTimes, {ID: $scope.productItem.realisationTime});

                            if (idxRT !== -1) {

                                var volume = $scope.productItem.volume;

                                var idx = _.findIndex($scope.realisationTimes[idxRT].volumes, {volume: volume});
                                if (idx !== -1) {
                                    $scope.checkVolume($scope.realisationTimes[idxRT], $scope.realisationTimes[idxRT].volumes[idx]);
                                }

                            }

                        };

                        $scope.showSumPrice = function () {
                            var price = 0;
                            var net_per_pcs = 0;

                            $scope.allDeliveryPrice();

                            if (angular.isDefined($scope.calculation)) {

                                var tmpDeliveryPrice;
                                var i = 0;
                                if ($scope.productAddresses !== undefined) {
                                    for (i === 0; i < $scope.productAddresses.length; i++) {
                                        tmpDeliveryPrice = 0;

                                        var tmp_price = $scope.productAddresses[i].price.toString();
                                        tmpDeliveryPrice += parseFloat(tmp_price.replace(',', '.'));

                                        price += Number(tmpDeliveryPrice);
                                        if ($scope.calculation.volume !== undefined) {
                                            net_per_pcs = price / $scope.calculation.volume;
                                        }
                                    }
                                }

                                var tmpPriceTotal;
                                if ($scope.calculation.priceTotal !== undefined) {

                                    if (typeof($scope.calculation.priceTotal) === 'string') {
                                        tmpPriceTotal = $scope.calculation.priceTotal.replace(',', '.');
                                    } else {
                                        tmpPriceTotal = $scope.calculation.priceTotal;
                                    }

                                    price += parseFloat(tmpPriceTotal);
                                    if ($scope.calculation.volume !== undefined) {
                                        net_per_pcs = price / $scope.calculation.volume;
                                    }
                                }
                            }

                            $scope.net_per_pcs = net_per_pcs.toFixed(2).replace('.', ',');

                            return price.toFixed(2).replace('.', ',');
                        };

                        $scope.showSumGrossPrice = function () {

                            var price = 0;
                            var gross_per_pcs = 0;

                            $scope.allDeliveryPrice();

                            if (angular.isDefined($scope.calculation)) {

                                var tmpDeliveryPrice;
                                var tax;
                                var deliveryIdx;

                                var i = 0;
                                if ($scope.productAddresses !== undefined) {
                                    for (i = 0; i < $scope.productAddresses.length; i++) {
                                        tmpDeliveryPrice = 0;
                                        var tmp_price = $scope.productAddresses[i].price.toString();
                                        tmpDeliveryPrice += parseFloat(tmp_price.replace(',', '.'));

                                        deliveryIdx = _.findIndex($scope.deliveries, {ID: $scope.productAddresses[i].deliveryID});
                                        if (deliveryIdx > -1) {
                                            tax = Number($scope.deliveries[deliveryIdx].price.tax / 100) + 1;

                                            price += Number(tmpDeliveryPrice) * tax;
                                        }

                                        if ($scope.calculation.volume !== undefined) {
                                            gross_per_pcs = price / $scope.calculation.volume;
                                        }
                                    }
                                }

                                var tmpPriceTotal;
                                if ($scope.calculation.priceTotalBrutto !== undefined) {
                                    if (typeof($scope.calculation.priceTotalBrutto) === 'string') {
                                        tmpPriceTotal = $scope.calculation.priceTotalBrutto.replace(',', '.');
                                    } else {
                                        tmpPriceTotal = $scope.calculation.priceTotalBrutto;
                                    }

                                    price += parseFloat(tmpPriceTotal);
                                    if ($scope.calculation.volume !== undefined) {
                                        gross_per_pcs = price / $scope.calculation.volume;
                                    }
                                }

                            }

                            $scope.gross_per_pcs = gross_per_pcs.toFixed(2).replace('.', ',');
                            return price.toFixed(2).replace('.', ',');
                        };

                        $scope.changeAmount = function () {

                            if( $scope.productItem.amount === '' ) {
                                $scope.productItem.amount = 1;
                            }
                            if( typeof $scope.productItem.amount === 'string' ) {
                                if( isNaN(parseInt($scope.productItem.amount)) ) {
                                    $scope.productItem.amount = 1;
                                } else {
                                    $scope.productItem.amount = parseInt($scope.productItem.amount);
                                }
                            }
                            if( $scope.productItem.amount < 1 ) {
                                $scope.productItem.amount = 1;
                            }
                            $scope.getVolumes(product, $scope.productItem.amount);
                        };

                        $scope.filterRelatedFormats = function () {

                            _.each($scope.complexProducts.slice(1), function (oneProduct) {
                                if (oneProduct.selectedProduct) {
                                    oneProduct.selectedProduct.data.relatedFormats = filterFormats(oneProduct.selectedProduct.data.formats, $scope.relatedFormats);
                                }
                            });

                        };

                        $scope.selectDefaultFormats = function () {

                            var def = $q.defer();
                            var formatChange = false;

                            _.each($scope.complexProducts.slice(1), function (oneProduct) {

                                if (!oneProduct.selectedProduct) {
                                    return true;
                                }

                                var product = oneProduct.selectedProduct.data;

                                var currentFormat = product.currentFormat;

                                var find = -1;
                                if (!!currentFormat) {
                                    find = _.findIndex($scope.relatedFormats, {ID: currentFormat.ID, typeID: product.info.typeID});
                                }

                                if (find === -1) {

                                    if (!angular.isDefined(product.relatedFormats) || product.relatedFormats.length === 0) {
                                        product.currentFormat = null;
                                        return true;
                                    } else {
                                        var searchFormat = filterFormats(product.formats, $scope.relatedFormats)[0];

                                        if (searchFormat) {
                                            product.currentFormat = searchFormat;
                                            if (!!searchFormat.custom) {
                                                product.currentFormat.customWidth = searchFormat.minWidth - searchFormat.slope * 2;
                                                product.currentFormat.customHeight = searchFormat.minHeight - searchFormat.slope * 2;
                                            }
                                        }
                                    }

                                    if (!product.currentFormat) {
                                        def.reject({'info': 'select another format'});
                                        Notification.error($filter('translate')('not_related_format_for_product') + ' - ' + product.info.typeName);
                                    }

                                } else {
                                    var idx = _.findIndex(product.relatedFormats, {ID: currentFormat.ID});
                                    if (idx > -1) {
                                        product.currentFormat = product.relatedFormats[idx];
                                    }
                                }

                                CalcSimplifyWidgetService.checkFormatExclusions(product).then(function() {

                                    setExclusionsAsync($scope, product).then(function (exclusionEnd) {

                                        if (exclusionEnd) {
                                            $scope.selectDefaultOptions(product);
                                        }
                                    });
                                });

                            });

                            if (!formatChange) {
                                def.resolve();
                            } else {
                                console.log('Format zmieniony ale czemu tu doszło :o')
                            }

                            return def.promise;
                        };

                        $scope.releaseSpinner = function (complexProduct, attrID, direct) {

                            if (complexProduct.selectedProduct.data.attrPages[attrID] <= 0 && direct === 0) {
                                return;
                            }

                            var attrIdx = _.findIndex(complexProduct.selectedProduct.data.attributes, {attrID: parseInt(attrID)});

                            if (attrIdx > -1) {
                                var attribute = complexProduct.selectedProduct.data.attributes[attrIdx];

                                var step = attribute.step;

                                var maxPages = attribute.maxPages;
                                if (maxPages === null) {
                                    maxPages = complexProduct.selectedProduct.data.currentPages;
                                }

                                if ((complexProduct.selectedProduct.data.attrPages[attrID] + step) > maxPages && direct === 1) {
                                    Notification.info($filter('translate')('maximum_number_of_pages') + ' ' + maxPages);
                                    return;
                                }

                                if ((complexProduct.selectedProduct.data.attrPages[attrID] - step) < attribute.minPages && direct === 0) {
                                    Notification.info($filter('translate')('minimum_number_of_pages') + ' ' + attribute.minPages);
                                    return;
                                }
                            }

                            if (direct) {
                                complexProduct.selectedProduct.data.attrPages[attrID] += step;
                            } else {
                                complexProduct.selectedProduct.data.attrPages[attrID] -= step;
                            }

                            $scope.selectAttrPages(complexProduct, attrID);
                        };

                        $scope.selectAttrPages = function (complexProduct, attrID) {

                            if (angular.isDefined(stopSelectAttr)) {
                                $timeout.cancel(stopSelectAttr);
                            }

                            stopSelectAttr = $timeout(function () {

                                if (complexProduct.selectedProduct.data.attrPages[attrID] <= 0) {
                                    complexProduct.selectedProduct.data.attrPages[attrID] = 0;
                                }

                                var attrIdx = _.findIndex(complexProduct.selectedProduct.data.attributes, {attrID: parseInt(attrID)});

                                if (attrIdx > -1) {
                                    var attribute = complexProduct.selectedProduct.data.attributes[attrIdx];

                                    var maxPages = attribute.maxPages;
                                    if (maxPages === null) {
                                        maxPages = complexProduct.selectedProduct.data.currentPages;
                                    }

                                    if (complexProduct.selectedProduct.data.attrPages[attrID] > maxPages) {
                                        Notification.info($filter('translate')('maximum_number_of_pages') + ' ' + maxPages);
                                        complexProduct.selectedProduct.data.attrPages[attrID] = maxPages;
                                        return;
                                    }

                                    if (complexProduct.selectedProduct.data.attrPages[attrID] < attribute.minPages) {
                                        Notification.info($filter('translate')('minimum_number_of_pages') + ' ' + attribute.minPages);
                                        complexProduct.selectedProduct.data.attrPages[attrID] = attribute.minPages;
                                        return;
                                    }
                                }


                                $scope.getVolumes($scope.productItem.amount);
                            }, 1500);

                        };

                        $scope.spinCustomWidth = function (complexProduct, direct) {

                            if (direct) {
                                complexProduct.selectedProduct.data.currentFormat.customWidth = complexProduct.selectedProduct.data.currentFormat.customWidth + 1;
                            } else {
                                complexProduct.selectedProduct.data.currentFormat.customWidth = complexProduct.selectedProduct.data.currentFormat.customWidth - 1;
                            }

                            $scope.selectCustomFormat(complexProduct);

                        };

                        $scope.spinCustomHeight = function (complexProduct, direct) {

                            if (direct) {
                                complexProduct.selectedProduct.data.currentFormat.customHeight = complexProduct.selectedProduct.data.currentFormat.customHeight + 1;
                            } else {
                                complexProduct.selectedProduct.data.currentFormat.customHeight = complexProduct.selectedProduct.data.currentFormat.customHeight - 1;
                            }

                            $scope.selectCustomFormat(complexProduct);

                        };

                        $scope.spinPage = function (complexProduct, direct) {

                            var min = $scope.getMinimumThickness(complexProduct.selectedProduct.data);
                            var max = $scope.getMaximumThickness(complexProduct.selectedProduct.data);

                            if (complexProduct.selectedProduct.data.currentPages <= min && direct === 0) {
                                return;
                            }
                            if (complexProduct.selectedProduct.data.currentPages >= max && direct === 1) {
                                Notification.info($filter('translate')('maximum_number_of_pages') + ' ' + max);
                                return;
                            }
                            if (direct) {
                                complexProduct.selectedProduct.data.currentPages = complexProduct.selectedProduct.data.currentPages + complexProduct.selectedProduct.data.pages[0].step;
                            } else {
                                complexProduct.selectedProduct.data.currentPages = complexProduct.selectedProduct.data.currentPages - complexProduct.selectedProduct.data.pages[0].step;
                            }


                            $scope.selectPages(complexProduct.selectedProduct.data, complexProduct.selectedProduct.data.currentPages);
                        };

                        $scope.selectPages = function (product, pages) {

                            pages = Number(pages);

                            if (product.pages[0].pages) {

                                product.currentPages = pages;

                                $scope.calcProductThickness(product);
                                setExclusionsAsync($scope, product).then(function (exclusionEnd) {
                                    if (exclusionEnd) {
                                        _.each(product.attrPages, function (oneAttrPage, attrID) {
                                            if (product.currentPages < oneAttrPage) {
                                                product.attrPages[attrID] = product.currentPages;
                                            }
                                        });

                                        $scope.getVolumes($scope.productItem.amount);
                                    }
                                });

                            } else {
                                if (product.pages[0].step !== null) {
                                    var step = Number(product.pages[0].step);
                                }

                                if (angular.isDefined(stopSelect)) {
                                    $timeout.cancel(stopSelect);
                                    stopSelect = undefined;
                                }

                                stopSelect = $timeout(function () {
                                    var maxPages = $scope.getMaximumThickness(product);
                                    var minPages = $scope.getMinimumThickness(product);

                                    if( parseInt(product.pages[0].maxPages) > 0 &&  maxPages > parseInt(product.pages[0].maxPages)  ) {
                                        maxPages = parseInt(product.pages[0].maxPages);
                                    }

                                    if( product.pages[0].minPages !== null &&  minPages < parseInt(product.pages[0].minPages)  ) {
                                        minPages = parseInt(product.pages[0].minPages);
                                    }

                                    if (product.pages[0].step !== null) {
                                        if (pages % step !== 0) {
                                            if ((pages % step) > (step / 2)) {
                                                pages = pages + (step - (pages % step));
                                            } else {
                                                pages -= pages % step;
                                            }
                                        }
                                    }

                                    if (pages > maxPages) {
                                        Notification.info($filter('translate')('maximum_number_of_pages') + ' ' + maxPages);
                                        product.currentPages = maxPages;
                                        pages = maxPages;
                                    } else if (pages < minPages) {
                                        Notification.info($filter('translate')('minimum_number_of_pages') + ' ' + minPages);
                                        product.currentPages = minPages;
                                        pages = minPages;
                                    } else if (pages === undefined) {
                                        Notification.info($filter('translate')('range_of_pages') + ' ' + minPages + ' - ' + maxPages);
                                    } else {
                                        product.currentPages = pages;
                                    }

                                    $scope.calcProductThickness(product);

                                    setExclusionsAsync($scope, product).then(function (exclusionEnd) {

                                        if (exclusionEnd) {
                                            _.each(product.attrPages, function (oneAttrPage, attrID) {
                                                if (product.currentPages < oneAttrPage) {
                                                    product.attrPages[attrID] = product.currentPages;
                                                }
                                            });

                                            if (pages <= maxPages && pages >= minPages && pages !== undefined) {
                                                $scope.getVolumes($scope.productItem.amount);
                                            }
                                        }

                                    });

                                }, 1500);
                            }
                        };

                        $scope.confirmCopy = function () {

                            $scope.copyInProgress = true;

                            getPreparedProduct($scope, product, $scope.productItem.amount, $scope.productItem.volume).then(function (preparedProduct) {
                                preparedProduct.copyFromID = product.productID;

                                var CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);
                                CalculateService.saveCalculation(preparedProduct).then(function (data) {

                                    if( data.orderID ) {
                                        $rootScope.orderID = data.orderID;
                                    }
                                    data.volume = preparedProduct.volume;

                                    copyAddressesToNewProduct(product, data).then(function(data) {

                                        AuthService.addToCart(data).then(function (cartsData) {
                                            $rootScope.carts = cartsData.carts;
                                            if (onlyVolumeChange) {
                                                deleteProduct($scope.$parent, product, true).then(function() {
                                                    $rootScope.$emit('Cart:copied', true);
                                                });
                                            } else {
                                                $rootScope.$emit('Cart:copied', true);
                                            }

                                            $modalInstance.close();
                                        });

                                    });

                                }, function () {
                                    Notification.error($filter('translate')('error'));
                                });



                            });
                        };

                        $scope.changeVolume = function () {

                            var volume = $scope.productItem.volume;
                            var idx;

                            if (!_.isEmpty($scope.rememberVolume)) {

                                idx = _.findIndex($scope.rememberVolume.realisationTime.volumes, {volume: volume});

                                if (idx !== -1) {
                                    $scope.checkVolume($scope.rememberVolume.realisationTime, $scope.rememberVolume.realisationTime.volumes[idx]);
                                } else {
                                    idx = _.findIndex($scope.realisationTimes[0].volumes, {volume: volume});
                                    if (idx !== -1) {
                                        $scope.checkVolume($scope.realisationTimes[0], $scope.realisationTimes[0].volumes[idx]);
                                    }
                                }

                            } else {

                                idx = _.findIndex($scope.realisationTimes[0].volumes, {volume: volume});
                                if (idx !== -1) {
                                    $scope.checkVolume($scope.realisationTimes[0], $scope.realisationTimes[0].volumes[idx]);
                                }

                            }

                            if (typeof $scope.scrollbarVolume.update === 'function') {
                                $scope.scrollbarVolume.update("scrollTo", "#row-volume-" + $scope.productItem.volume);
                            }

                        };

                        $scope.selectOptionImage = function (complexProductData, item, attribute) {
                            complexProductData.selectedOptions[attribute.attrID] = item.ID;
                            $scope.selectOption(complexProductData, attribute.attrID);
                        };

                        $scope.addVolume = function () {

                            if (parseInt($scope.customVolume.maxVolume) < parseInt($scope.customVolume.newVolume)) {
                                $scope.customVolume.newVolume = $scope.customVolume.maxVolume;
                                Notification.error($filter('translate')('to_high_volume') + ' - ' + $scope.customVolume.maxVolume);
                                return;
                            }

                            if (parseInt($scope.customVolume.minVolume) > parseInt($scope.customVolume.newVolume)) {
                                $scope.customVolume.newVolume = $scope.customVolume.minVolume;
                                Notification.error($filter('translate')('to_low_volume') + ' - ' + $scope.customVolume.minVolume);
                                return;
                            }

                            if ($scope.customVolume.newVolume === undefined) {
                                $scope.customVolume.newVolume = $scope.customVolume.minVolume;
                                Notification.error($filter('translate')('incorrect_volume'));
                                return;
                            }

                            var newVolume = {'volume': $scope.customVolume.newVolume, 'active': true};
                            if (!angular.isDefined($scope.customVolume.volumes)) {
                                $scope.customVolume.volumes = [];
                            }

                            var idxV = _.findIndex($scope.volumes, {volume: $scope.customVolume.newVolume});
                            var idxCV = _.findIndex($scope.customVolume.volumes, {volume: $scope.customVolume.newVolume});

                            if (idxV === -1 && idxCV === -1) {

                                $scope.customVolume.volumes.push(newVolume);
                                $scope.rememberVolume.volume = newVolume;
                                $scope.getVolumes($scope.productItem.amount);

                                var customVolumesFromCookie = MainWidgetService.getCookie('customVolumes');

                                if( customVolumesFromCookie.length > 0 ) {
                                    var cookieCustomVolumes = angular.fromJson(customVolumesFromCookie);
                                }

                                if (!cookieCustomVolumes) {
                                    cookieCustomVolumes = {};
                                }

                                cookieCustomVolumes[$scope.currentTypeID] = $scope.customVolume;

                                console.log( angular.toJson(cookieCustomVolumes) );

                                MainWidgetService.setCookie('customVolumes', angular.toJson(cookieCustomVolumes), 7);

                            } else {
                                Notification.error($filter('translate')('volume_exist'));
                            }
                        };

                    }
                });
            });
        }

        function copyAddressesToNewProduct(product, savedProduct) {
            var def = $q.defer();

            savedProduct.productAddresses = [];
            var newAddressItem;
            var volumeSum = 0;
            var volumeDiff = 0;
            var actualVolume = 0;
            _.each(product.addresses, function(oneAddress, index) {
                newAddressItem = {};
                volumeSum += oneAddress.volume;
                newAddressItem.deliveryID = oneAddress.deliveryID;
                newAddressItem.volume = oneAddress.volume;
                newAddressItem.allVolume = oneAddress.allVolume;
                newAddressItem.senderID = oneAddress.senderID;
                newAddressItem.addressID = oneAddress.addressID;
                newAddressItem.commonDeliveryID = oneAddress.commonDeliveryID;
                newAddressItem.commonRealisationTime = oneAddress.commonRealisationTime;
                if( oneAddress.join === undefined ) {
                    newAddressItem.join = false;
                } else {
                    newAddressItem.join = oneAddress.join;
                }
                if( savedProduct.newVolumesProductAddresses[index] > 0 ) {
                    newAddressItem.volume = newAddressItem.allVolume = savedProduct.newVolumesProductAddresses[index];
                    savedProduct.productAddresses.push(newAddressItem);
                }

                if( (product.addresses.length - 1) === index) {
                    def.resolve(savedProduct);
                }
            });

            return def.promise;
        }

        var getActiveVolume = function (volumes, index) {

            var actVolume = volumes[index];

            if (actVolume) {
                if (actVolume.active === false) {
                    return getActiveVolume(volumes, (index + 1));
                } else {
                    return actVolume;
                }
            } else {
                console.error('Problem with realization time!');
            }
        };

        var getActiveVolumeByVolume = function (volumes, volume) {

            var volumeIndex = _.findIndex(volumes, {volume: volume});

            if (volumeIndex > -1) {
                if (volumes[volumeIndex].active === false) {
                    return getActiveVolume(volumes, (volumeIndex + 1));
                } else {
                    return volumes[volumeIndex];
                }
            } else {
                console.error('Problem with realization time!');
            }
        };

        function selectDefaultFormats(scope) {

            var def = $q.defer();
            var productData;

            _.each(scope.complexProducts, function (oneProduct, complexIndex) {

                if (!oneProduct.selectedProduct) {
                    return true;
                }

                if( complexIndex === 0 ) {
                    _.each(oneProduct.selectedProduct.data.attributes, function(attribute, index) {
                        setRangePages(oneProduct.selectedProduct.data, attribute.attrID);
                    });
                }

                productData = oneProduct.selectedProduct.data;

                if( !productData.currentFormat ) {
                    productData.currentFormat = _.first(productData.formats);
                }

                if( complexIndex > 0 ) {
                    filterRelatedFormats(scope, oneProduct);
                }

                CalcSimplifyWidgetService.checkFormatExclusions(productData).then(function() {

                    setExclusionsAsync(scope, productData).then(function (exclusionEnd) {

                        if (exclusionEnd) {
                            scope.selectDefaultOptions(productData);

                            if ((scope.complexProducts.length - 1) === complexIndex) {
                                def.resolve(true);
                            }

                        }
                    });
                });

            });

            return def.promise;
        }

        function setOptions(product, oneProduct) {
            var def = $q.defer();

            var index = _.findIndex(product.calcProducts, {typeID: oneProduct.info.typeID});

            if( index > -1 ) {
                _.each(product.calcProducts[index].attributes, function(attribute, attributeIndex) {
                    if( attribute ) {
                        oneProduct.selectedOptions[attribute.attrID] = attribute.optID;
                    }
                    if( (product.calcProducts[index].attributes.length - 1) === attributeIndex ) {
                        def.resolve(true);
                    }
                });
            }


            return def.promise;
        }

        function setFormats(scope, product, oneProduct) {
            var def = $q.defer();

            var index = _.findIndex(product.calcProducts, {typeID: oneProduct.info.typeID});

            if(index > -1) {
                var indexFormat = _.findIndex(oneProduct.formats, {ID: product.calcProducts[index].formatID});

                if( indexFormat > -1 ) {
                    if( product.calcProducts[index].customFormat ) {
                        oneProduct.formats[indexFormat].custom = 1;
                        oneProduct.formats[indexFormat].customWidth = product.calcProducts[index].formatWidth;
                        oneProduct.formats[indexFormat].customHeight = product.calcProducts[index].formatHeight;
                    }
                    scope.selectFormat(oneProduct, oneProduct.formats[indexFormat], true);
                }
            }

            def.resolve(true);

            return def.promise;
        }

        var getMinPages = function (type) {

            /**
             * @param {Array} type.minOptionPages
             */

            if (_.size(type.minOptionPages)) {
                return _.min(_.values(type.minOptionPages));
            }

            return false;
        };

        var getOption = function (product, optID) {

            var item = undefined;
            _.each(product.attributes, function (attribute) {
                var idx = _.findIndex(attribute.options, {ID: optID});

                if (idx > -1) {
                    item = attribute.options[idx];
                    return false;
                }

            });

            return item;
        };

        var setRangePages = function (product, attrID) {

            var idx = _.findIndex(product.attributes, {attrID: attrID});
            if (idx > -1) {
                if (product.attributes[idx].minPages !== null) {
                    if (!product.attrPages[attrID]) {
                        product.attrPages[attrID] = product.attributes[idx].minPages;
                    }
                }
            } else {
                console.error('Some functions may not work well.');
            }
        };

        function setExclusionsAsync(scope, product) {

            var def = $q.defer();

            product.excludedOptions = _.clone(product.formatExcluded);

            // filtered options set by clone
            _.each(product.attributes, function (attribute) {
                attribute.filteredOptions = _.clone(attribute.options, true);
            });

            var optID = {};
            var activeAttrID;
            _.each(product.attributeMap, function (attrID) {

                activeAttrID = attrID;
                optID = product.selectedOptions[attrID];

                if (optID) {
                    var item = {};

                    if (_.isObject(optID)) {
                        item = optID;
                    } else {
                        item = getOption(product, optID);
                    }

                    var tmpExclusions = {};

                    var exclusionsThickness = scope.filterByThickness(product);
                    var exclusionsThicknessPages = scope.filterByOptionsPages(product);

                    /**
                     * @param {Object} item
                     * @param {Array} item.exclusions
                     */
                    if (item.exclusions) {
                        tmpExclusions = _.merge({}, item.exclusions, exclusionsThickness, exclusionsThicknessPages);
                    }

                    if (tmpExclusions) {

                        setOptionExclusionsAsync(product, activeAttrID, tmpExclusions).then(function (isEnd) {
                            if (isEnd) {
                                checkAttrSelectAsync(product).then(function (isAttrSelectEnd) {
                                    if (isAttrSelectEnd) {
                                        if (_.last(product.attributeMap) === activeAttrID) {
                                            def.resolve(true);
                                        }
                                    }
                                });
                            } else {
                                if (_.last(product.attributeMap) === activeAttrID) {
                                    def.resolve(true);
                                }
                            }
                        });

                    } else {
                        if (_.last(product.attributeMap) === activeAttrID) {
                            def.resolve(true);
                        }
                    }
                } else {

                    if (_.last(product.attributeMap) === activeAttrID) {
                        def.resolve(true);
                    }
                }
            });

            if( product.attributeMap.length === 0 ) {
                def.resolve(false);
            }

            return def.promise;

        }

        function checkAttrSelectAsync(product) {
            var def = $q.defer();

            var firstFilteredOption = null;

            _.each(product.attributes, function (attribute) {
                if (_.contains(deletedAttrs, attribute.attrID)) {
                    if (product.selectedOptions[attribute.attrID]) {
                        firstFilteredOption = _.first(attribute.filteredOptions);
                        if (firstFilteredOption) {
                            product.selectedOptions[attribute.attrID] = firstFilteredOption.ID;
                        }
                    } else {

                        attribute.filteredOptions = _.filter(attribute.options, function (opt) {
                            return !_.contains(product.excludedOptions, opt.ID);
                        });

                        firstFilteredOption = _.first(attribute.filteredOptions);
                        if (firstFilteredOption) {
                            product.selectedOptions[attribute.attrID] = firstFilteredOption.ID;
                        }

                    }
                }

                if (_.last(product.attributeMap) === attribute.attrID) {
                    def.resolve(true);
                }

            });

            return def.promise;
        }

        function setOptionExclusionsAsync(product, attrID, exclusions) {

            var def = $q.defer();

            deletedAttrs = [];

            var attribute = _.findWhere(product.attributes, {attrID: attrID});

            var allExclude = [];
            _.each(exclusions, function (exc) {

                _.each(exc, function (optID) {

                    allExclude.push(optID);

                    product.excludedOptions.push(optID);

                    _.each(product.selectedOptions, function (selectedOptID) {

                        if (_.contains(allExclude, selectedOptID)) {
                            getAttributeFromOption(product, selectedOptID).then(function (actAttrID) {
                                if (actAttrID > 0 && _.indexOf(deletedAttrs, actAttrID) === -1) {
                                    delete product.selectedOptions[actAttrID];
                                    deletedAttrs.push(actAttrID);
                                }
                            });

                        }

                    });

                });
            });

            attribute.filteredOptions = _.filter(attribute.options, function (opt) {
                return !_.contains(product.excludedOptions, opt.ID);
            });

            def.resolve(true);

            return def.promise;
        }

        function getPreparedProduct(scope, selectedProduct, amount, volume) {

            var def = $q.defer();

            var newItem = {};

            newItem.amount = amount;
            if (!(volume === undefined)) newItem.volume = volume;

            var rIdx = -1;

            if( selectedProduct !== null ) {
                newItem.groupID = selectedProduct.groupID;
                newItem.typeID = selectedProduct.typeID;
                newItem.taxID = selectedProduct.taxID;
                newItem.name = selectedProduct.name;
                newItem.realizationTimeID = selectedProduct.realizationTimeID;
                newItem.productAddresses = selectedProduct.addresses;
                rIdx = _.findIndex(scope.realisationTimes, {ID: selectedProduct.realizationTimeID});
            } else {
                newItem.groupID = scope.currentGroupID;
                newItem.typeID = scope.currentTypeID;
                newItem.taxID = scope.productItem.taxID;
                newItem.name = scope.productItem.name;
                newItem.realizationTimeID = scope.productItem.realisationTime;
                rIdx = _.findIndex(scope.realisationTimes, {ID: scope.realizationTimeID});
            }

            if( scope.selectedTechnology ) {
                newItem.selectedTechnology = scope.selectedTechnology;
            }

            if (rIdx > -1) {
                if (scope.realisationTimes[rIdx].overwriteDate !== undefined && scope.realisationTimes[rIdx].overwriteDate !== null) {
                    newItem.realizationDate = scope.realisationTimes[rIdx].overwriteDate;
                } else {
                    newItem.realizationDate = scope.realisationTimes[rIdx].date;
                }
            }

            DeliveryWidgetService.reducePostData(scope.productAddresses).then(function(productAddresses) {

                newItem.productAddresses = productAddresses;

                if (scope.calculation !== undefined) {
                    newItem.weight = scope.calculation.weight;
                }

                newItem.currency = $rootScope.currentCurrency.code;

                CalcSimplifyWidgetService.prepareProductPromise(scope, newItem).then(function (newItemPrepared) {
                    if(newItemPrepared) {
                        def.resolve(newItemPrepared);
                    }
                });

            });

            return def.promise;

        }

        function selectComplexProduct(scope, data, originalProduct) {

            var def = $q.defer();

            var emptyProducts = 0;

            scope.complexProducts = data.complex;

            _.each(scope.complexProducts, function(oneComplex, complexIndex) {
                _.each(oneComplex.products, function(product, productIndex) {

                    initSelectedProduct(oneComplex, product);

                    var originalCalcProduct = _.findWhere(originalProduct.calcProducts, {
                        typeID: oneComplex.selectedProduct.typeID
                    });

                    addSelectedProductFormats(oneComplex, data.formats[product.typeID]);

                    var attributesData = data.selectOptions[product.typeID];

                    if (attributesData.length === 0) {
                        emptyProducts++;
                    }

                    if (emptyProducts === data.complex.length) {
                        scope.emptyProduct = true;
                    }

                    addSelectProductCustomFormat(oneComplex, attributesData);

                    addSelectProductCustomPageInfo(oneComplex, attributesData);

                    addSelectProductMaps(oneComplex, attributesData);

                    oneComplex.selectedProduct.data.attributes = attributesData;

                    oneComplex.selectedProduct.data.pages = data.pages[product.typeID];

                    if( originalCalcProduct !== undefined ) {
                        addSelectProductCurrentPages(oneComplex, originalProduct);

                        addSelectProductAttrPages(oneComplex, originalProduct);
                    }

                    oneComplex.selectedProduct.data.relatedFormats = _.clone(oneComplex.selectedProduct.data.formats);

                    if( (scope.complexProducts.length - 1) == complexIndex &&
                        (oneComplex.products.length - 1) == productIndex ) {
                        def.resolve(true);
                    }

                });
            });

            return def.promise;
        }

        function filterRelatedFormats(scope, oneComplex) {

            changeRelatedFormats(scope, oneComplex).then( function(result) {

                oneComplex.selectedProduct.data.relatedFormats = result;

                var index = _.findIndex(oneComplex.selectedProduct.data.relatedFormats, {ID: oneComplex.selectedProduct.data.currentFormat.ID});

                if( index === -1 ) {
                    oneComplex.selectedProduct.data.currentFormat = _.first(oneComplex.selectedProduct.data.relatedFormats);
                }

                var format = oneComplex.selectedProduct.data.currentFormat;

                if (!!format.custom) {
                    oneComplex.selectedProduct.data.currentFormat.customWidth = format.minWidth - format.slope * 2;
                    oneComplex.selectedProduct.data.currentFormat.customHeight = format.minHeight - format.slope * 2;
                }
            });
        }

        function changeRelatedFormats(scope, oneComplex) {
            var def = $q.defer();

            var result = [];

            _.each(scope.complexProducts[0].selectedProduct.data.currentFormat.relatedFormats, function(oneRelatedFormat, relatedFormatIndex) {

                var index = _.findIndex(oneComplex.selectedProduct.data.formats, {ID: oneRelatedFormat.formatID});

                if(index > -1) {
                    result.push(oneComplex.selectedProduct.data.formats[index]);
                }

                if( (scope.complexProducts[0].selectedProduct.data.relatedFormats.length - 1) === relatedFormatIndex ) {
                    def.resolve(result);
                }
            });

            return def.promise;
        }

        function init() {

        }

        function getData(typeID) {
            var def = $q.defer();

            var CalculateData = new CalculateDataService(typeID);

            CalculateData.getData().then( function(data) {
                def.resolve(data);
            }, function(error) {
                def.reject(error);
            });

            return def.promise;
        }

        function getTaxes() {

            var def = $q.defer();
            TaxService.getForProduct($scope.currentGroupID, $scope.currentTypeID).then(function (data) {
                def.resolve(data);
            });
            return def.promise;
        }

        function prepareProductPromise(scope, newItem) {

            var def = $q.defer();

            newItem.products = [];

            _.each(scope.complexProducts, function (complexProduct, index) {

                var selectedProductData = complexProduct.selectedProduct.data;

                var newProduct = {};

                newProduct.groupID = selectedProductData.info.groupID;
                newProduct.typeID = selectedProductData.info.typeID;
                newProduct.name = selectedProductData.info.typeName;

                if (!selectedProductData.currentFormat) {
                    console.error('Formats must be assign!');
                }

                newProduct.formatID = selectedProductData.currentFormat.ID;

                if (!complexProduct.selectedProduct.data.currentFormat.custom) {
                    newProduct.width = selectedProductData.currentFormat.width;
                    newProduct.height = selectedProductData.currentFormat.height;
                } else {
                    newProduct.width = selectedProductData.currentFormat.customWidth + selectedProductData.currentFormat.slope * 2;
                    newProduct.height = selectedProductData.currentFormat.customHeight + selectedProductData.currentFormat.slope * 2;
                }

                if (selectedProductData.currentPages) {
                    newProduct.pages = selectedProductData.currentPages;
                } else {
                    newProduct.pages = 2;
                }
                newProduct.options = [];
                _.each(selectedProductData.selectedOptions, function (optID, attrID) {
                    if (!optID) {
                        console.log('Lack of optID: ', optID);
                        console.log('attrID is:', attrID);
                    } else {
                        newProduct.options.push({
                            attrID: parseInt(attrID),
                            optID: optID
                        });
                    }

                });

                newProduct.attrPages = selectedProductData.attrPages;

                newItem.products.push(newProduct);

                if ((scope.complexProducts.length - 1) === index) {
                    $timeout(function() {
                        def.resolve(newItem);
                    }, 1000);
                }

            });

            return def.promise;
        }

        function getAttributeFromOption(product, optionID) {

            var def = $q.defer();

            _.each(product.optionMap, function (options, attrID) {
                if (_.contains(options, optionID)) {
                    def.resolve(parseInt(attrID));
                }
            });

            return def.promise;
        }

        function filterFormats(input, ids) {

            var result = [];

            _.each(input, function (item) {
                var idx = _.findIndex(ids, {ID: item.ID});
                if (idx > -1) {
                    result.push(item);
                }
            });
            return result;

        }

        function initSelectedProduct(complexProduct, baseProduct) {

            var copyBaseProduct = _.clone(baseProduct);
            var copyProductInfo = _.clone(baseProduct);

            complexProduct.selectedProduct = copyBaseProduct;
            complexProduct.selectedProduct.data = {
                info: copyProductInfo,
                selectedOptions: {},
                attrPages: {},
                attributes: {},
                attributeMap: [],
                optionMap: {},
                currentFormat: false,
                currentPages: false,
                excludedOptions: [],
                formatExcluded: [],
                thickness: {
                    values: {},
                    min: null,
                    max: null,
                    current: null
                }
            };
        }

        function addSelectedProductFormats(complexProduct, formats) {
            complexProduct.selectedProduct.data.formats = formats;
        }

        function addSelectProductCustomFormat(complexProduct, attributesData) {
            var customFormatIndex = _.findIndex(attributesData, {attrID: -1});
            if (customFormatIndex > -1) {
                complexProduct.selectedProduct.data.customFormatInfo = attributesData[customFormatIndex];
                attributesData.splice(1, customFormatIndex);
            }
        }

        function addSelectProductCustomPageInfo(complexProduct, attributesData) {
            var customPageIndex = _.findIndex(attributesData, {attrID: -2});
            if (customPageIndex > -1) {
                complexProduct.selectedProduct.data.customPageInfo = attributesData[customPageIndex];
                attributesData.splice(1, customPageIndex);
            }
        }

        function addSelectProductMaps(complexProduct, attributesData) {
            _.each(attributesData, function (attr) {
                complexProduct.selectedProduct.data.attributeMap.push(attr.attrID);
                complexProduct.selectedProduct.data.optionMap[attr.attrID] = [];
                _.each(attr.options, function (opt) {
                    complexProduct.selectedProduct.data.optionMap[attr.attrID].push(opt.ID);
                });
            });
        }

        function addSelectProductCurrentPages(complexProduct, originalProduct) {
            if ( !complexProduct.selectedProduct.data.currentPages ) {
                var originalCalcProduct = _.findWhere(originalProduct.calcProducts, {
                    typeID: complexProduct.selectedProduct.typeID
                });

                if( originalCalcProduct.pages ) {
                    complexProduct.selectedProduct.data.currentPages = originalCalcProduct.pages;
                } else if( _.first(complexProduct.selectedProduct.data.pages) ) {
                    complexProduct.selectedProduct.data.currentPages = _.first(complexProduct.selectedProduct.data.pages).minPages;
                } else {
                    complexProduct.selectedProduct.data.currentPages = 2;
                }
            }
        }

        function addSelectProductAttrPages(complexProduct, originalProduct) {
            var calcProduct = _.findWhere(originalProduct.calcProducts, {typeID: complexProduct.selectedProduct.typeID});
            _.each(calcProduct.attributes, function(attribute) {
                if( attribute.attrPages > 0  ) {
                    complexProduct.selectedProduct.data.attrPages[attribute.attrID] = attribute.attrPages;
                }
            });
        }

        function deleteProduct(scope, product, inModal) {

            var def = $q.defer();

            DpProductService.delete(product).then(function (data) {
                if (data.response === true) {
                    DpProductService.deleteFromMongo(product).then(function (mData) {
                        if (mData.response === true) {
                            var idx = _.findIndex(scope.cart.products, {productID: product.productID});
                            if (idx > -1) {
                                scope.cart.products.splice(idx, 1);
                                $rootScope.carts = mData.carts;
                                if( mData.carts.length < 2 ) {
                                    scope.canJoinAddresses = false;
                                }
                                deleteProductFromJoinedDelivery(scope, product.productID).then(function() {
                                    if( _.isEmpty(scope.addressToJoin) ) {
                                        scope.canJoinAddresses = false;
                                    }
                                });
                            }
                            var cartData = scope.cart;
                            CountService.restorePricesCart(cartData).then( function(responseData) {
                                if( !inModal ) {
                                    $rootScope.$emit('Cart:deleted', true);
                                }
                                def.resolve(true);
                            });
                        }
                    });
                }
            });

            return def.promise;

        }

        function deleteProductFromJoinedDelivery(scope, productID) {
            var def = $q.defer();

            _.each(scope.addressToJoin, function(oneJoinedDelivery, addressID) {
                var idx = _.findIndex(oneJoinedDelivery, {productID: productID});
                if( idx > -1 ) {
                    scope.addressToJoin[addressID].splice(idx, 1);

                    if(scope.addressToJoin[addressID].length < 2) {
                        delete scope.addressToJoin[addressID];
                        def.resolve(true);
                    }
                } else {
                    def.resolve(false);
                }
            });

            return def.promise;
        }

        return {
            copyProduct: copyProduct,
            deleteProduct: deleteProduct
        };
    });
