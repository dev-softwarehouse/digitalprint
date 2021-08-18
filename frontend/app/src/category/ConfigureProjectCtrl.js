'use strict';

angular.module('dpClient.app')
    .controller('category.ConfigureProjectCtrl', function ($scope, PsTypeService, $rootScope, $filter, Notification,
                                                           $stateParams, PsComplexService, TaxService, PsGroupService,
                                                           PsFormatService, $q, PsTypeDescriptionService,
                                                           PsAttributeService, PsPageService, $timeout,
                                                           CalculationService, PhotoFolderService, SettingService,
                                                           TextWidgetService, $config, $state, DpCategoryService) {

        $scope.currentTypeID = null;
        $scope.currentGroupID = null;
        /**
         * @param $stateParams.mainthemeid string
         */
        $scope.currentThemeID = $stateParams.mainthemeid;

        $scope.currentTypeUrl = $stateParams.typeurl;
        $scope.currentGroupUrl = $stateParams.groupurl;

        $scope.type = {};
        $scope.currentType = {};

        $scope.complexProducts = [];
        $scope.summaryThickness = {};
        $scope.descriptions = [];
        $scope.customVolume = {};
        $scope.rememberVolume = {};
        $scope.activeVolume = {};
        $scope.productAddresses = [{}];
        $scope.deliveries = [];
        $scope.volumes = [];
        $scope.hideAmount = true;
        $scope.galleries = [];
        $scope.thumbnails = [];
        var isEditorProject = $scope.isEditorProject = true;

        var CalculateService;
        var PagesService;
        var AttributeService;
        var ComplexService;
        var FormatService;
        var countProducts;

        var stopSelect;
        var _timeout;
        var stopSelectAttr;

        var deletedAttrs = [];
        var countGroups = 0;
        var emptyProducts = 0;

        function init() {

            $(':not(.select-product-form)').on('click', function () {
                $('#changeProductInput').attr('placeholder', $scope.currentType.names[$rootScope.currentLang.code]);
            });



            var def = $q.defer();

            var sequences = [];

            sequences.push(getGroup($scope.currentGroupUrl));
            sequences.push(getProjects());
            sequences.push(getCategory($stateParams.categoryurl));

            $q.all(sequences).then(
                function (results) {
                    def.resolve(results);
                },
                function (errors) {
                    def.reject(errors);
                },
                function (updates) {
                    def.update(updates);
                });

            return def.promise;
        }

        function getProjects() {
            PhotoFolderService.getProjectsForTypes([]).then( function(projectsData) {
                $scope.currentProject = _.findWhere(projectsData, { _id: $scope.currentThemeID });
            });
        }

        function getGroup(currentGroupUrl) {

            PsGroupService.getOneForView(currentGroupUrl).then(function (data) {
                $scope.group = data;
                if( $rootScope.currentLang && $rootScope.currentLang.code ) {
                    $rootScope.customBreadcrumbs.group = data.names[$rootScope.currentLang.code];
                } else {
                    $rootScope.customBreadcrumbs.group = $filter('translate')('group');
                }
                getType(currentGroupUrl, $scope.currentTypeUrl);
            }, function (data) {
                console.error(data);
                Notification.error($filter('translate')('error'));
            });
        }

        function getCategory(currentCategoryUrl) {
            DpCategoryService.getOneForView(currentCategoryUrl).then(function(data) {
                if( $rootScope.currentLang && $rootScope.currentLang.code && data.langs ) {
                    $rootScope.customBreadcrumbs.category = data.langs[$rootScope.currentLang.code].name;
                } else {
                    $rootScope.customBreadcrumbs.category = $filter('translate')('category');
                }
            }, function (data) {
                console.error(data);
                Notification.error($filter('translate')('error'));
            });
        }

        function getFormat() {

            var FormatService = new PsFormatService($scope.currentGroupID, $scope.currentTypeID);
            FormatService.getPublic($scope.complexID).then(function (data) {

                $scope.type.formats = data;
                $scope.type.currentFormat = $scope.type.formats[0];

            }, function (data) {
                console.error('format err: ', data);
            });
        }

        function getType(groupUrl, typeUrl) {

            PsTypeService.getOneForView(groupUrl, typeUrl).then(function (data) {
                if( data && data.active === 0 ) {
                    Notification.error($filter('translate')('product_currently_not_available'));
                    $state.go('home');
                    return;
                }
                $scope.currentGroupID = data.groupID;
                $scope.currentTypeID = data.ID;
                getDescriptions();

                ComplexService = new PsComplexService($scope.currentGroupID, $scope.currentTypeID);

                selectType(data);
            }, function (data) {
                console.error(data);
                Notification.error($filter('translate')('error'));
            });

        }

        var selectType = function (type) {

            $scope.currentType = type;

            if( $rootScope.currentLang && $rootScope.currentLang.code && type.names ) {
                $rootScope.customBreadcrumbs.calc = type.names[$rootScope.currentLang.code];
            } else {
                $rootScope.customBreadcrumbs.calc = $filter('translate')('product');
            }

            var promises = [];

            /**
             * @param {Object} type
             * @param {number} type.complex
             */

            if (!!type.complex) {

                $scope.complexID = type.ID;

                // complex product
                ComplexService.getAllPublic().then(function (data) {
                    countProducts = data.length;
                    var cgIndex = 0;
                    _.each(data, function (item) {
                        cgIndex++;
                        promises.push($scope.getComplexGroup(item, cgIndex));

                    });

                });

            } else {

                // normal product
                countProducts = 1;

                var group = {
                    ID: null,
                    name: type.name,
                    names: type.names,
                    productID: type.ID,
                    type: "other",
                    products: []
                };
                // if not complex type
                var product = {
                    groupID: type.groupID,
                    typeID: type.ID,
                    typeName: type.name,
                    typeNames: type.names
                };
                group.products.push(product);
                promises.push($scope.getComplexGroup(group, 1));

            }
            $q.all(promises).then(function () {

                getFormat();

                getTaxes().then(function (data) {
                    $scope.taxes = data;
                    if (data.length > 1) {
                        _.each($scope.taxes, function (tax) {
                            if (tax.default) {
                                $scope.productItem.taxID = tax.ID;
                            }
                        });
                    } else if (data.length === 1) {
                        $scope.productItem.taxID = $scope.taxes[0].ID;
                    }

                });

                console.log('100% - loaded');
            }, function (data) {
                console.error('ERR: Problem with products load', data);
            });

        };

        function getDescriptions() {

            var SettingView = new SettingService('general');

            var groupID = $scope.currentGroupID;
            var typeID = $scope.currentTypeID;

            SettingView.getPublicSettings().then(function (settingsData) {
                PsTypeDescriptionService.getAll(groupID, typeID).then(function (data) {

                    var sliderData = [];

                    if (!_.isEmpty(data)) {

                        _.each(data, function (oneDesc) {

                            /**
                             * @param {Object} oneDesc
                             * @param {number} oneDesc.descType
                             *
                             */
                            switch (oneDesc.descType) {
                                case 1:
                                    if( settingsData.numberOfLinesInDescription &&
                                        settingsData.numberOfLinesInDescription.value > 0 ) {
                                        var word = TextWidgetService.findWord(
                                            oneDesc.langs[$rootScope.currentLang.code].description,
                                            settingsData.numberOfLinesInDescription.value
                                        );
                                        var paragraphNumber = TextWidgetService.findParagraph(
                                            oneDesc.langs[$rootScope.currentLang.code].description,
                                            word
                                        );
                                        if( paragraphNumber !== false ) {
                                            oneDesc.showLess = TextWidgetService.getLess(
                                                oneDesc.langs[$rootScope.currentLang.code].description,
                                                paragraphNumber
                                            );
                                            oneDesc.initHide = true;
                                        } else {
                                            oneDesc.showLess = false;
                                        }
                                    }

                                    $scope.descriptions.push(oneDesc);
                                    break;
                                case 5:

                                    oneDesc.items = [];

                                    if (!_.isEmpty(oneDesc.files)) {
                                        _.each(oneDesc.files, function (oneFile) {

                                            /**
                                             * @param {Object} oneFile
                                             * @param {string} oneFile.urlCrop
                                             * @param {number} oneFile.fileID
                                             */

                                            oneDesc.items.push({
                                                thumb: oneFile.urlCrop,
                                                img: oneFile.url,
                                                description: 'Image ' + oneFile.fileID
                                            });
                                        });
                                    }

                                    $scope.galleries.push(oneDesc);

                                    break;
                                case 3:

                                    sliderData.push(oneDesc);

                                    break;

                                case 6:

                                    $scope.thumbnails.push(oneDesc);

                                    break;

                                case 7:
                                    $scope.patterns = oneDesc.patterns;

                                    break;
                            }

                        });


                    }

                    $rootScope.$emit('Slider:data', sliderData);

                });
            });
        }

        $scope.getComplexGroup = function (group, index) {

            var def = $q.defer();

            if (group.products.length > 0) {
                countGroups++;
            }

            $scope.complexProducts.push(group);

            _.each(group.products, function (item) {
                if (!group.selectedProduct) {

                    /**
                     * @param {Object} $scope.currentCalc
                     * @param {Array} $scope.currentCalc.calcProducts
                     */
                    if ($scope.currentCalc) {
                        var idx = _.findIndex($scope.currentCalc.calcProducts, {typeID: item.typeID});
                        if (idx === -1) {
                            return true;
                        }
                    }
                    $scope.selectComplexProductSync(group, item).then(function (data) {
                        console.log('Another product loaded!');

                        $timeout(function () {
                            $rootScope.$emit('stopPreLoader', true);
                            $scope.selectFormatSync(group.selectedProduct.data, group.selectedProduct.data.currentFormat).then(function () {
                                if (countProducts === index) {
                                    $scope.getVolumes($scope.productItem.amount);
                                }
                                def.resolve(data);
                            }, function (errorData) {
                                console.log('selectFormatReject', errorData);
                                console.log(group);
                            });
                        }, 100);

                    }, function (data) {
                        console.error('selectComplexProductError');
                        def.reject(data);
                    });
                }
            });

            return def.promise;

        };

        $scope.selectFormat = function (product, format) {

            product.currentFormat = format;
            if (!!format.custom) {
                product.currentFormat.customWidth = format.minWidth - format.slope * 2;
                product.currentFormat.customHeight = format.minHeight - format.slope * 2;
            }

            $scope.checkRelatedFormats(product, format);

            $scope.filterRelatedFormats();

            $scope.selectDefaultFormats().then(function () {

                $scope.checkFormatExclusions(product);

                setExclusionsAsync(product).then(function (exclusionEnd) {

                    if (exclusionEnd) {

                        descriptionTabResetActive();

                        $scope.selectDefaultOptions(product);
                        $scope.getVolumes($scope.productItem.amount);
                    }
                });

            }, function (data) {
                console.log(data);
            });

        };

        $scope.selectFormatSync = function (product, format) {

            var def = $q.defer();

            if (format === null || format === undefined) {
                def.reject(false);
                return def.promise;
            }

            product.currentFormat = format;
            if (format && !!format.custom) {
                product.currentFormat.customWidth = format.minWidth - format.slope * 2;
                product.currentFormat.customHeight = format.minHeight - format.slope * 2;
            }

            $scope.checkRelatedFormats(product, format);
            $scope.filterRelatedFormats();
            $scope.selectDefaultFormats().then(function () {

                $scope.checkFormatExclusions(product);

                setExclusionsAsync(product).then(function (exclusionEnd) {
                    if (exclusionEnd) {

                        descriptionTabResetActive();

                        $scope.selectDefaultOptions(product);
                        def.resolve();
                    }
                });

            }, function (data) {
                console.log(data);
            });

            return def.promise;
        };

        $scope.selectComplexProductSync = function (complexProduct, selectedProduct) {

            var def = $q.defer();
            complexProduct.selectedProduct = selectedProduct;
            $scope.getProduct(selectedProduct).then(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        $scope.selectComplexProduct = function (complexProduct, selectedProduct) {

            var def = $q.defer();
            complexProduct.selectedProduct = selectedProduct;
            $scope.getProduct(selectedProduct).then(function (data) {
                def.resolve(data);
                $scope.getVolumes($scope.productItem.amount);
            }, function (data) {
                def.reject(data);
            });

            return def.promise;
        };

        $scope.getProduct = function (product) {

            var def = $q.defer();

            var newProduct = {
                info: product,
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

            product.data = newProduct;

            AttributeService = new PsAttributeService(product.groupID, product.typeID);
            FormatService = new PsFormatService(product.groupID, product.typeID);
            PagesService = new PsPageService(product.groupID, product.typeID);

            $q.all([
                FormatService.getPublic($scope.complexID),
                PagesService.getPublic(),
                AttributeService.getFullOptions()
            ]).then(function (data) {

                newProduct.formats = data[0];

                var attributesData = data[2];

                if (attributesData.length === 0) {
                    emptyProducts++;
                }

                if (emptyProducts === countGroups) {
                    $scope.emptyProduct = true;
                }

                var customFormatIndex = _.findIndex(attributesData, {attrID: -1});
                if (customFormatIndex > -1) {
                    newProduct.customFormatInfo = attributesData[customFormatIndex];
                    attributesData.splice(1, customFormatIndex);
                }

                var customPageIndex = _.findIndex(attributesData, {attrID: -2});
                if (customPageIndex > -1) {
                    newProduct.customPageInfo = attributesData[customPageIndex];
                    attributesData.splice(1, customPageIndex);
                }

                newProduct.attributes = attributesData;

                _.each(newProduct.attributes, function (attr) {
                    newProduct.attributeMap.push(attr.attrID);
                    newProduct.optionMap[attr.attrID] = [];
                    _.each(attr.options, function (opt) {
                        newProduct.optionMap[attr.attrID].push(opt.ID);
                    });
                });

                newProduct.pages = data[1];

                newProduct.relatedFormats = _.clone(newProduct.formats);

                var currentCalcProduct = getCurrentCalcProduct(product.info);

                var formatIdx = 0;
                if (currentCalcProduct) {
                    formatIdx = _.findIndex(newProduct.relatedFormats, {ID: currentCalcProduct.formatID});
                    // check that actual product is in selected calculation
                    if (formatIdx === -1) {
                        console.error('Can\'t find format like in select calculation.');
                        return true;
                    }
                }

                /**
                 * @param {Object} newProduct
                 * @param {Array} newProduct.pages
                 * @param {number} newProduct.pages[].pages
                 * @param {number|null} newProduct.pages[].minPages
                 */

                $scope.selectFormatSync(newProduct, newProduct.relatedFormats[formatIdx]).then(function () {
                    if (currentCalcProduct) {
                        $scope.selectPagesSync(newProduct, currentCalcProduct.pages);
                    } else {
                        if (newProduct.pages.length && newProduct.pages[0].pages) {
                            $scope.selectPagesSync(newProduct, newProduct.pages[0].pages);
                        }
                        if (newProduct.pages.length && newProduct.pages[0].minPages) {
                            $scope.selectPagesSync(newProduct, newProduct.pages[0].minPages);
                        }
                    }
                    def.resolve(data);
                });

            }, function (data) {
                def.reject(data);
                Notification.error($filter('translate')('data_retrieve_failed'));
            });

            return def.promise;
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

                // first group is that in which they are all formats because that formats are basic
                if (!oneProduct.selectedProduct) {
                    return true;
                }


                var product = oneProduct.selectedProduct.data;

                var currentFormat = product.currentFormat;

                var find = -1;
                if (!!currentFormat) {
                    find = _.findIndex($scope.relatedFormats, {ID: currentFormat.ID, typeID: product.info.typeID});
                }
                // if we don't have select format in related
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
                    // if is in related formats so again assign it than if we change product select can update
                    var idx = _.findIndex(product.relatedFormats, {ID: currentFormat.ID});
                    if (idx > -1) {
                        product.currentFormat = product.relatedFormats[idx];
                    }
                }

                $scope.checkFormatExclusions(product);

                setExclusionsAsync(product).then(function (exclusionEnd) {

                    if (exclusionEnd) {
                        $scope.selectDefaultOptions(product);
                    }
                });

            });
            // if format not change, continue
            if (!formatChange) {
                def.resolve();
            } else {
                console.log('Format zmieniony ale czemu tu doszło :o')
            }

            return def.promise;
        };

        $scope.checkFormatExclusions = function (product) {

            if (!product.currentFormat) {
                return false;
            }
            product.formatExcluded = [];
            _.each(product.attributes, function (attribute) {

                _.each(attribute.options, function (option) {

                    if (option && option.formats) {
                        if (!_.contains(option.formats, product.currentFormat.ID)) {
                            product.formatExcluded.push(option.ID);
                            // remove from selected if exist in it
                            if (product.selectedOptions[attribute.attrID] === option.ID) {
                                delete product.selectedOptions[attribute.attrID];
                            }
                        }
                    }
                });
            });

        };

        $scope.selectDefaultOptions = function (product) {

            var currentCalcProduct = getCurrentCalcProduct(product.info);

            _.each(product.attributes, function (item) {

                if (!product.selectedOptions[item.attrID]) {
                    var currentCalcAttr = null;
                    if (currentCalcProduct) {
                        currentCalcAttr = _.findWhere(currentCalcProduct.attributes, {attrID: item.attrID});
                    }

                    var tmp;
                    _.each(item.options, function (option) {
                        if (currentCalcAttr) {
                            if (currentCalcAttr.optID !== option.ID) {
                                return true;
                            }
                            if (currentCalcAttr.attrPages) {
                                product.attrPages[item.attrID] = currentCalcAttr.attrPages
                            }
                        }

                        if (!_.contains(product.excludedOptions, option.ID)) {
                            tmp = option;
                            return false;
                        }
                    });

                    var defaultOption = _.findWhere(item.options, {default: 1});

                    if (defaultOption && !_.contains(product.excludedOptions, defaultOption.ID)) {
                        tmp = defaultOption;
                    }

                    $scope.selectOption(product, item.attrID, tmp);

                }
            });

        };

        $scope.selectOption = function (product, attrID, item) {

            var itemExist = true;

            if (item === undefined) {
                itemExist = false;
                var optID = product.selectedOptions[attrID];

                item = getOption(product, optID);

                if (item === undefined) {
                    return false;
                }
            }

            product.selectedOptions[attrID] = parseInt(item.ID);

            setRangePages(product, attrID);

            if (product.thickness.minAttr === attrID) {
                product.thickness.min = null;
                product.thickness.minAttr = null;
            }

            if (product.thickness.maxAttr === attrID) {
                product.thickness.max = null;
                product.thickness.maxAttr = null;
            }

            /**
             * @param {Object} item
             * @param {number|null} item.minThickness
             * @param {number|null} item.maxThickness
             * @param {number} item.sizePage
             */
            if (Number(item.minThickness) > 0 && ( Number(item.minThickness) > product.thickness.min || item.minThickness === null)) {
                product.thickness.min = item.minThickness;
                product.thickness.minAttr = attrID;
            }

            if (Number(item.maxThickness) > 0 && ( Number(item.maxThickness) < product.thickness.max || product.thickness.max === null)) {

                product.thickness.max = item.maxThickness;
                product.thickness.maxAttr = attrID;
            }

            product.thickness.values[attrID] = item.sizePage;

            if (product.pages.length) {
                $scope.calcProductThickness(product);
                $scope.getMinimumThickness(product);
                $scope.getMaximumThickness(product);
            }

            setExclusionsAsync(product).then(function (exclusionEnd) {

                if (exclusionEnd) {
                    $scope.selectDefaultOptions(product);
                    if (!itemExist) {
                        $scope.getVolumes($scope.productItem.amount);
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

            $scope.summaryThickness[product.info.typeID] = product.thickness.current;

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

        $scope.selectPagesSync = function (product, pages) {
            product.currentPages = pages;
            $scope.calcProductThickness(product);
        };

        $scope.selectPages = function (product, pages) {

            pages = Number(pages);

            if (product.pages[0].pages) {

                product.currentPages = pages;

                $scope.calcProductThickness(product);
                setExclusionsAsync(product).then(function (exclusionEnd) {
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

                    setExclusionsAsync(product).then(function (exclusionEnd) {

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

        $scope.getVolumes = function (amount) {

            $scope.loadVolumes = true;

            getPreparedProduct(amount).then(function (preparedProduct) {
                preparedProduct.customVolumes = $scope.customVolume.volumes;
                CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);

                CalculateService.getVolumes(preparedProduct).then(function (data) {

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

                    getJson();

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
                    $scope.calculate($scope.productItem.amount, $scope.volumes[0].volume);
                } else {
                    console.log('nakłady: ', $scope.volumes);
                }
            }

        };

        $scope.calculate = function (amount, volume) {

            $scope.calculation = {};

            $scope.calculationInfo = [];
            getPreparedProduct(amount, volume).then(function (preparedProduct) {

                CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);
                CalculateService.calculate(preparedProduct).then(function (data) {
                    $scope.showCalculation(data);


                    if( !isEditorProject ) {
                        if( undefined !==  $scope.deliveries[0]) {
                            $scope.productAddresses[0].deliveryID = $scope.deliveries[0].ID;
                            $scope.productAddresses[0].index = 0;
                        }

                        var address = $scope.productAddresses[0];
                        address.weight = data.weight;
                        address.volume = volume;

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

                    $('#scrollbar-volume').height(
                        $('#panel-product-parameters').outerHeight() - ($('#panel-product-volumes').outerHeight() - $('.mCustomScrollbar').outerHeight())
                    );
                }, function (data) {
                    console.error(data);
                    Notification.error($filter('translate')('error'));
                });

            });


        };

        $scope.getMinVolume = function () {

            $scope.customVolume.minVolume = $scope.volumes[0].volume;

            if (!angular.isDefined($scope.customVolume.newVolume)) {
                $scope.customVolume.newVolume = $scope.volumes[0].volume;
            }
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

                var activeVolume = getActiveVolume(sortRealisationTimes[0].volumes, 0);

                $scope.checkVolume(sortRealisationTimes[0], activeVolume);

                $scope.productItem.volume = activeVolume.volume;
            }

        };

        $scope.prepareUrl = function () {

            if ($scope.complexProducts.length === 1 && $scope.calculation.amount > 0) {

                getPreparedProduct($scope.calculation.amount).then(function (preparedProduct) {
                    var product = preparedProduct.products[0];

                    /**
                     * @param {string} $config.EDITOR_URL
                     */

                    $scope.editorUrl = $config.EDITOR_URL + '?' + 'typeID=' + product.typeID + '&formatID=' + product.formatID + '&pages=' + product.pages;

                    _.each(product.options, function (opt) {
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
                stopSelectAttr = undefined;
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

        $scope.showSumPrice = function () {
            var price = 0;
            var net_per_pcs = 0;

            if( !isEditorProject ) {
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


                }
            }

            if (angular.isDefined($scope.calculation)) {
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

            if( !isEditorProject ) {
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

                }
            }

            if (angular.isDefined($scope.calculation)) {

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

        $scope.checkPrice = function( price ) {
              return parseFloat(price) > 0;
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

            if( !isEditorProject ) {
                if ( typeof $scope.scrollbarVolume.update === 'function') {
                    $scope.scrollbarVolume.update("scrollTo", "#row-volume-" + $scope.productItem.volume);
                }
            }

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

        $scope.countAttrNotExcludedOptions = function (product, attr) {

            var count = 0;
            _.each(attr.options, function (option) {

                if (!_.contains(product.excludedOptions, option.ID)) {
                    count++;
                }

            });
            return count;
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

        $scope.selectOptionImage = function (complexProductData, item, attribute) {
            complexProductData.selectedOptions[attribute.attrID] = item.ID;
            $scope.selectOption(complexProductData, attribute.attrID);
        };

        $scope.setOptionPicture = function ($event, item) {
            $scope.optionPicture = item.icon;
            setTimeout(function () {
                console.log($scope.optionPicture);
                $('#showOptionPicture').modal('show');
                $event.stopPropagation();
            }, 100);

        };

        $scope.filterSearchProduct = function () {
            var _that = this;

            if( this.query === undefined ) {
                filterTypeByEditor();
                return;
            }

            if (!this.query.productName) {
                $("#changeProductInput:input").focus();

                if( !isEditorProject ) {
                    $scope.filteredProducts = $rootScope.allTypes;
                } else {
                    filterTypeByEditor();
                }

            } else {
                $scope.filteredProducts = _.filter($rootScope.allTypes, function (one) {


                    if( isEditorProject && one.isEditor !== 1 ) {
                        return false;
                    }

                    if (one.names === undefined || one.names[$rootScope.currentLang.code] === undefined) {
                        return false;
                    }

                    return one.names[$rootScope.currentLang.code].toLowerCase().search(_that.query.productName.toLowerCase()) > -1;

                });
            }
        };

        $scope.selectType = function (item) {
            if (item && isEditorProject) {
                PsTypeService.getOneForView(
                    item.group.slugs[$rootScope.currentLang.code],
                    item.slugs[$rootScope.currentLang.code]
                ).then(function (typeInfo) {

                    var urlParams = {
                        categoryurl: typeInfo.category.langs[$rootScope.currentLang.code].url,
                        groupurl: typeInfo.group.slugs[$rootScope.currentLang.code],
                        typeurl: typeInfo.slugs[$rootScope.currentLang.code]
                    };

                    $state.go('select-project', {
                        categoryurl: typeInfo.category.langs[$rootScope.currentLang.code].url,
                        groupid: typeInfo.groupID,
                        typeid: typeInfo.ID
                    });
                });
            }
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

        var getMinPages = function (type) {

            /**
             * @param {Array} type.minOptionPages
             */
            if (_.size(type.minOptionPages)) {
                return _.min(_.values(type.minOptionPages));
            }

            return false;
        };

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

        function filterTypeByEditor() {
            $scope.filteredProducts = _.filter($rootScope.allTypes, function (one) {

                return !(isEditorProject && one.isEditor !== 1);

            });
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

        function getJson() {

            getPreparedProduct($scope.productItem.amount, $scope.productItem.volume).then(function (preparedProduct) {

                var result = {
                    typeID: preparedProduct.typeID,
                    products: [],
                    formats: [],
                    pages: [],
                    attributes: [],
                    themeID: $scope.currentThemeID,
                    name: $scope.productItem.name
                };
                _.each(preparedProduct.products, function (product, index) {
                    result.products.push(product.typeID);
                    result.formats.push(product.formatID);
                    result.pages.push(product.pages);
                    result.attributes[index] = [];
                    _.each(product.options, function (option) {
                        result.attributes[index].push(option.attrID + '-' + option.optID);
                    });
                });

                $scope.productItem.jsonText = JSON.stringify(result);

            });

        }

        function getPreparedProduct(amount, volume) {

            var def = $q.defer();

            var newItem = {};

            newItem.amount = amount;
            if (!(volume === undefined)) newItem.volume = volume;
            newItem.groupID = $scope.currentGroupID;
            newItem.typeID = $scope.currentTypeID;
            newItem.taxID = $scope.productItem.taxID;
            newItem.name = $scope.productItem.name;
            newItem.realizationTimeID = $scope.productItem.realisationTime;

            var rIdx = _.findIndex($scope.realisationTimes, {ID: $scope.productItem.realisationTime});

            if (rIdx > -1) {
                if ($scope.realisationTimes[rIdx].overwriteDate !== undefined && $scope.realisationTimes[rIdx].overwriteDate !== null) {
                    newItem.realizationDate = $scope.realisationTimes[rIdx].overwriteDate;
                } else {
                    newItem.realizationDate = $scope.realisationTimes[rIdx].date;
                }
            }

            newItem.productAddresses = $scope.productAddresses;
            if ($scope.calculation !== undefined) {
                newItem.weight = $scope.calculation.weight;
            }

            newItem.currency = $rootScope.currentCurrency.code;

            prepareProductPromise(newItem).then(function (newItemPrepared) {
                def.resolve(newItemPrepared);
            });

            return def.promise;

        }

        function prepareProductPromise(newItem) {

            var def = $q.defer();

            newItem.products = [];
            _.each($scope.complexProducts, function (complexProduct, index) {

                var product = complexProduct.selectedProduct.data;

                var newProduct = {};

                newProduct.groupID = product.info.groupID;
                newProduct.typeID = product.info.typeID;
                newProduct.name = product.info.typeName;

                if (!product.currentFormat) {
                    console.error('Formats must be assign!');
                }

                newProduct.formatID = product.currentFormat.ID;

                if (!product.currentFormat.custom) {

                    newProduct.width = product.currentFormat.width;
                    newProduct.height = product.currentFormat.height;
                } else {
                    newProduct.width = product.currentFormat.customWidth + product.currentFormat.slope * 2;
                    newProduct.height = product.currentFormat.customHeight + product.currentFormat.slope * 2;
                }

                if (product.currentPages) {
                    newProduct.pages = product.currentPages;
                } else {
                    newProduct.pages = 2;
                }
                newProduct.options = [];
                _.each(product.selectedOptions, function (optID, attrID) {
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

                newProduct.attrPages = product.attrPages;

                newItem.products.push(newProduct);

                if (($scope.complexProducts.length - 1) === index) {
                    def.resolve(newItem);
                }
            });

            return def.promise;
        }

        function checkAttrSelectAsync(product) {
            var def = $q.defer();

            _.each(product.attributes, function (attribute) {
                if (_.contains(deletedAttrs, attribute.attrID)) {
                    if (product.selectedOptions[attribute.attrID]) {
                        var firstFilteredOption = _.first(attribute.filteredOptions);
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

        function setExclusionsAsync(product) {

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

                    var exclusionsThickness = $scope.filterByThickness(product);
                    var exclusionsThicknessPages = $scope.filterByOptionsPages(product);

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

            return def.promise;

        }

        function getCurrentCalcProduct(product) {
            var currentCalcProduct = null;
            if ($scope.currentCalc) {
                currentCalcProduct = _.findWhere($scope.currentCalc.calcProducts, {typeID: product.typeID});
            }
            return currentCalcProduct;
        }

        function descriptionTabResetActive() {
            $timeout(function () {
                $('.with-nav-tabs .nav-tabs li').removeClass('active');
                $('.with-nav-tabs .tab-content div.tab-pane').removeClass('active');

                $('.with-nav-tabs .nav-tabs li').first().addClass('active');
                $('.with-nav-tabs .tab-content div.tab-pane').first().addClass('active');
            }, 300);
        }

        var getTaxes = function () {

            var def = $q.defer();
            TaxService.getForProduct($scope.currentGroupID, $scope.currentTypeID).then(function (data) {
                def.resolve(data);
            });
            return def.promise;
        };

        $scope.changeUserProductName = function() {
            getJson();
        };


        init();

    });
