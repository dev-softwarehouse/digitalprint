'use strict';

angular.module('dpClient.app')
    .controller('category.CalcCtrl', function ($scope, $rootScope, $config, $filter, $cookies, $timeout, $state,
                                               PsTypeService, PsGroupService, PsAttributeService, PsFormatService,
                                               PsPageService, PsComplexService, CalculationService, TaxService,
                                               PsTypeDescriptionService, $stateParams, Notification, AuthService,
                                               AuthDataService, DeliveryService, AddressService, DpCategoryService,
                                               DeliveryWidgetService, TemplateRootService, DpOrderService, TokenService,
                                               SettingService, localStorageService, $modal, $q, TextWidgetService,
                                               CountriesService, DomWidgetService, CalculateDataService, $window,
                                               AddressWidgetService, CalcSimplifyWidgetService, $sce, $location, MainWidgetService ) {
        // TODO Remove fragment while transfer to webpack
        try {
            var log = anylogger('Calc');
        } catch (e) {
            var log = {
                info: function () {
                },
                debug: function () {
                }
            };
        }
        /**
         *
         * @param {Object} $scope
         */
        $scope.type = {};
        $scope.group = {};
        $scope.volumes = [];
        $scope.complexProducts = [];

        $scope.currentTypeID = null;
        $scope.currentGroupID = null;

        /**
         * @param $stateParams
         * @param $stateParams.typeurl
         * @param $stateParams.groupurl
         */
        $scope.currentTypeUrl = $stateParams.typeurl;
        $scope.currentGroupUrl = $stateParams.groupurl;

        var countProducts;
        var productsLoaded=false;
        var stopSelect;
        var stopSelectAttr;
        var deletedAttrs = [];

        var AttributeService;
        var FormatService;
        var PagesService;
        var ComplexService;
        var CalculateService;

        var _timeout;

        $scope.editorUrl = '';
        $scope.currentType = {};
        $scope.realisationTimes = [];
        $scope.activeVolume = {};
        $scope.rememberVolume = {};
        $scope.customVolume = {};
        $scope.taxes = [];
        $scope.loadVolumes = false;
        $scope.summaryThickness = {};
        $scope.allThickness = 0;
        $scope.complexID = 0;
        $scope.productItem = {};
        $scope.hideAmount = true;
        $scope.deliveryLackOfVolume = 0;

        $scope.addresses = [];
        $scope.senders = [];
        $scope.productAddresses = [];
        $scope.deliveries = [];
        $scope.filteredDeliveries = [];
        $scope.technologies = [];
        $scope.optionPicture = {};
        $scope.query = {};

        // Galerie
        $scope.galleries = [];
        // Tekst
        $scope.descriptions = [];
        // Miniatura
        $scope.thumbnails = [];
        // makieta
        $scope.patterns = [];

        $scope.actualFile = null;

        $scope.showPattern = false;
        $scope.showSummary = true;


        $scope.scrollbarVolume = {
            config: {
                autoHideScrollbar: false,
                advanced: {
                    updateOnContentResize: true
                },
                setHeight: $('#panel-product-parameters').height(),
                scrollInertia: 0
            },
            update: null
        };

        var emptyProducts = 0;
        var countGroups = 0;
        $scope.emptyProduct = false;
        $scope.selectedTechnology = false;

        function init() {
            $scope.productAddresses[0] = {
                ID: 1,
                deliveryID: 0,
                index: 0,
                price: 0,
                volume: 1,
                weight: 0
            };
            $(':not(.select-product-form)').on('click', function () {
                if( $scope.currentType.names !== undefined ) {
                    $('#changeProductInput').attr('placeholder', $scope.currentType.names[$rootScope.currentLang.code]);
                }
            });

            var def = $q.defer();

            var sequences = [];

            sequences.push(getType('', $scope.currentTypeUrl));
            sequences.push(getDeliveries());
            sequences.push(getAddress());

            if( $stateParams.categoryurl ) {
                sequences.push(getCategory($stateParams.categoryurl));
            }

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

        init();

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
                                        var word = '';
                                        if( oneDesc.langs[$rootScope.currentLang.code] !== undefined ) {
                                            word = TextWidgetService.findWord(
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

                                                var firstMatch = -1;
                                                if( oneDesc.langs[$rootScope.currentLang.code].description !== null ) {
                                                    var withNoBreaks = oneDesc.langs[$rootScope.currentLang.code].description.replace(/(\r\n|\n|\r|\<br\>|\<br \/\>)/gm,"");
                                                    firstMatch = withNoBreaks.indexOf(word);
                                                }

                                                if( firstMatch > -1 ) {
                                                    var finalCut = firstMatch + word.length;
                                                    oneDesc.showLess = oneDesc.langs[$rootScope.currentLang.code].description.slice(0, finalCut)
                                                        + '...</p>';
                                                    oneDesc.initHide = true;
                                                } else {
                                                    oneDesc.showLess = false;
                                                }
                                            }
                                        }
                                    }

                                    if( oneDesc.langs[$rootScope.currentLang.code].description ) {
                                        oneDesc.langs[$rootScope.currentLang.code].description = $sce.trustAsHtml(
                                            oneDesc.langs[$rootScope.currentLang.code].description
                                        );
                                    }

                                    if( oneDesc.showLess ) {
                                        oneDesc.showLess = $sce.trustAsHtml(oneDesc.showLess);
                                    }

                                    if( oneDesc.showLess && oneDesc.visible === 1 ) {
                                        oneDesc.initHide = false;
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

        var selectType = function (type) {

            $scope.currentType = type;

            if( $rootScope.currentLang && $rootScope.currentLang.code && type.names ) {
                $rootScope.customBreadcrumbs.calculate = type.names[$rootScope.currentLang.code];
            } else {
                $rootScope.customBreadcrumbs.calculate = $filter('translate')('product');
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
            $q.all(promises).then(function (data) {

                getFormat();

                log.info('100% - loaded');
                updateLinkToCopy();
                setupClipboardJS();
                DomWidgetService.pinElementWhenScroll(
                    ".panel-summary",
                    ".panel-summary .panel-heading",
                    ".panel-configuration"
                );
            }, function (data) {
                console.error('ERR: Problem with products load', data);
            });

        };

        function getType(groupUrl, typeUrl) {

            PsTypeService.getOneForView(groupUrl, typeUrl).then(function (data) {
                if( data && data.active === 0 ) {
                    Notification.error($filter('translate')('product_currently_not_available'));
                    $state.go('home');
                    return;
                }
                $scope.currentGroupID = data.groupID;
                $scope.currentTypeID = data.ID;
                MainWidgetService.includeTemplateVariables($scope, 'calc', $scope.currentGroupID, $scope.currentTypeID);
                $scope.type = data;

                if( $rootScope.currentLang && $rootScope.currentLang.code && $rootScope.customBreadcrumbs.group === undefined ) {
                    $rootScope.customBreadcrumbs.group = data.group.slugs[$rootScope.currentLang.code];
                }

                if( $rootScope.customBreadcrumbs.group === undefined ){
                    $rootScope.customBreadcrumbs.group = $filter('translate')('group');
                }

                getDescriptions();

                if( $stateParams.categoryurl === undefined && $scope.currentTypeID ) {
                    getFirstCategory($scope.currentTypeID);
                }

                ComplexService = new PsComplexService(data.groupID,  data.ID);

                var getTaxes = function () {

                    var def = $q.defer();
                    TaxService.getForProduct($scope.currentGroupID, $scope.currentTypeID).then(function (data) {
                        def.resolve(data);
                    });
                    return def.promise;
                };

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

                selectType(data);

            }, function (data) {
                console.error(data);
                Notification.error($filter('translate')('error'));
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
                        log.info('Another product loaded!')
                        $timeout(function() {
                            $rootScope.$emit('stopPreLoader', true);
                            $scope.selectFormatSync(group.selectedProduct.data, group.selectedProduct.data.currentFormat).then(function () {
                                if (countProducts === index) {
                                    productsLoaded=true;
                                    for(var i=0;i<$scope.complexProducts.length;i++){
                                        setFromCalculationUrl($scope.complexProducts[i].selectedProduct.data, 'currentFormat', 'format', _.find($scope.complexProducts[i].selectedProduct.data.formats, function (item) {
                                            return item.ID == getCalculationUrlParam('formatID.'+i)
                                        }));
                                        $scope.selectFormat($scope.complexProducts[i], $scope.complexProducts[i].selectedProduct.data.currentFormat)
                                    }
                                    if(getCalculationUrlParam('customVolumes')){
                                        var customVolumes=angular.fromJson(getCalculationUrlParam('customVolumes'));
                                        if (angular.isDefined(customVolumes[$scope.currentTypeID])) {
                                            $scope.customVolume = customVolumes[$scope.currentTypeID];
                                        }
                                    }
                                    $scope.getVolumes($scope.productItem.amount);
                                    setFromCalculationUrl($scope.productItem, 'name', 'name');
                                    setFromCalculationUrl($scope.productItem, 'selectedTechnologyID', 'technologyID',null,parseInt);
                                    setFromCalculationUrl($scope.productItem, 'realisationTime', 'realisationTime', null, parseInt)
                                    setFromCalculationUrl($scope.productItem, 'taxID', 'tax', null, parseInt)
                                    setFromCalculationUrl($scope.complexProducts, 'selectedProduct.data.currentFormat.customWidth', 'customWidth[]', 'customWidth', parseInt);
                                    setFromCalculationUrl($scope.complexProducts, 'selectedProduct.data.currentFormat.customHeight', 'customHeight[]', 'customHeight',  parseInt);
                                    setFromCalculationUrl($scope.complexProducts, 'selectedProduct.data.selectedOptions', 'attrID[]', null, parseInt);
                                    setFromCalculationUrl($scope.complexProducts, 'selectedProduct.data.attrPages', 'attrPages[]', null, parseInt);
                                    setFromCalculationUrl($scope.complexProducts, 'selectedProduct.data.currentPages', 'pages[]', null, parseInt);
                                    setFromCalculationUrl($scope.productAddresses[0], 'deliveryID', 'deliveryID', null, parseInt);
                                }
                                def.resolve(data);
                                }, function (errorData) {
                                console.log('selectFormatSyncReject', errorData);
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

        $scope.selectDefaultOptions = function (product) {
            // product.attributes[2]=
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

        function getCurrentCalcProduct(product) {
            var currentCalcProduct = null;
            if ($scope.currentCalc) {
                currentCalcProduct = _.findWhere($scope.currentCalc.calcProducts, {typeID: product.typeID});
            }
            return currentCalcProduct;
        }

        $scope.getProduct = function (product) {

            var def = $q.defer();

            emptyProducts = 0;

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
                excludedByAttribute: {},
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

        function getAttributeFromOption(product, optionID) {

            var def = $q.defer();

            _.each(product.optionMap, function (options, attrID) {
                if (_.contains(options, optionID)) {
                    def.resolve(parseInt(attrID));
                }
            });

            return def.promise;
        }

        $scope.selectFormat = function (product, format) {
            updateCalculationUrl('formatID', format.ID,null, productIndex(product));
            product.currentFormat = format;
            if (!!format.custom) {
                product.currentFormat.customWidth = format.minWidth - format.slope * 2;
                product.currentFormat.customHeight = format.minHeight - format.slope * 2;
            }

            $scope.checkRelatedFormats(product, format);

            $scope.filterRelatedFormats();

            $scope.selectDefaultFormats().then(function () {


                CalcSimplifyWidgetService.checkFormatExclusions(product).then(function() {

                    setExclusionsAsync(product).then(function (exclusionEnd) {

                        if (exclusionEnd) {

                            descriptionTabResetActive();

                            $scope.selectDefaultOptions(product);
                            $scope.getVolumes($scope.productItem.amount);
                        }
                    });

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

                CalcSimplifyWidgetService.checkFormatExclusions(product).then(function() {

                    setExclusionsAsync(product).then(function (exclusionEnd) {
                        if (exclusionEnd) {
                            descriptionTabResetActive();

                            $scope.selectDefaultOptions(product);

                            product.info.noCalculate = false;
                            def.resolve();
                        } else {
                            product.info.noCalculate = true;
                            def.resolve();
                        }
                    });

                });

            }, function (data) {
                console.log(data);
            });

            return def.promise;
        };

        function setExclusionsAsync(product) {

            var def = $q.defer();

            product.excludedOptions = _.clone(product.formatExcluded);
            product.excludedByAttribute = {};

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
                    if(!item)
                        return
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

                    product.excludedByAttribute[activeAttrID] = _.merge({}, item.exclusions);

                    setOptionExclusionsAsync(product, activeAttrID, tmpExclusions).then(function (isEnd) {
                        if (isEnd) {

                            checkAttrSelectAsync(product).then(function (isAttrSelectEnd) {
                                if (isAttrSelectEnd) {
                                    if (_.last(product.attributeMap) === activeAttrID) {

                                        var attrIndex = _.findIndex(product.attributes, {'attrID': attrID});

                                        if( attrIndex > -1 ) {
                                            if( product.attributes[attrIndex].filteredOptions.length !==
                                                $('#select-attribute-' + attrID + " option" ).length ) {
                                                product.attributes[attrIndex].filteredOptions = angular.copy(
                                                    product.attributes[attrIndex].filteredOptions
                                                );
                                            }
                                        }

                                        def.resolve(true);
                                    }
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
                    });

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

        function setOptionExclusionsAsync(product, attrID, exclusions) {

            var def = $q.defer();

            var attribute = _.findWhere(product.attributes, {attrID: attrID});

            addExcludesFromFormatAndPages(product, exclusions).then(function() {

                addExcludedOptions(product, attribute).then(function() {

                    attribute.filteredOptions = _.filter(attribute.options, function (opt) {
                        return !_.contains(product.excludedOptions, opt.ID);
                    });

                    var selectedOption = _.findWhere(attribute.filteredOptions, {ID: product.selectedOptions[attribute.attrID]});

                    if( selectedOption === undefined ) {
                        if( attribute.filteredOptions.length > 0 ) {

                            var oldSelectedOptionID = product.selectedOptions[attribute.attrID];

                            var oldOptionIndex = _.findIndex(attribute.options, {ID: oldSelectedOptionID});

                            if( oldOptionIndex > -1 ) {
                                var flatExclusions = _.reduceRight(attribute.options[oldOptionIndex].exclusions, function(a, b) { return a.concat(b); }, []);
                                product.excludedOptions = product.excludedOptions.filter( function (item) {
                                    return !flatExclusions.includes(item);
                                });
                            }

                            var flatNewExclusions = _.reduceRight(attribute.filteredOptions[0].exclusions, function(a, b) { return a.concat(b); }, []);

                            _.each(flatNewExclusions, function( oneOptionID ) {
                                if( !_.contains(product.excludedOptions, oneOptionID) ) {
                                    product.excludedOptions.push(oneOptionID);
                                }
                            });

                            product.selectedOptions[attribute.attrID] = attribute.filteredOptions[0].ID;

                            CalcSimplifyWidgetService.removeUnActiveOptions(product).then(function(removedStatus) {
                                setExclusionsAsync(product).then(function (exclusionEnd) {
                                    def.resolve(true);
                                });
                            });

                        } else {
                            console.log('Wykluczamy: ', attribute.attrID);
                            delete product.selectedOptions[attribute.attrID];
                            def.resolve(true);
                        }
                    } else {
                        def.resolve(true);
                    }

                });

            });

            return def.promise;
        }

        function addExcludesFromFormatAndPages(product, exclusions)
        {
            var def = $q.defer();

            var sizeOutside = _.size(exclusions);
            var iteratorOutside = 0;
            var iteratorInside;
            var sizeInside;

            if( _.size(exclusions) > 0 ) {
                _.each(exclusions, function (exc) {

                    sizeInside = exc.length;
                    iteratorInside = 0;

                    if( sizeInside > 0 ) {
                        _.each(exc, function (optID) {
                            product.excludedOptions.push(optID);

                            if( iteratorOutside === (sizeOutside -1) && (sizeInside - 1 ) === iteratorInside ) {
                                def.resolve(true);
                            }

                            iteratorInside++;

                        });
                    } else {

                        if( iteratorOutside ===  (sizeOutside - 1) ) {
                            def.resolve(true);
                        }

                    }


                    iteratorOutside++;
                });
            } else {
                def.resolve(true);
            }

            return def.promise;
        }

        function aggregateSelectedOptions(product) {
            var def = $q.defer();

            var aggregateSelectedOptions = [];

            var counter = 0;
            var size = _.size(product.selectedOptions);

            _.each(product.selectedOptions, function (selectedOptID) {
                aggregateSelectedOptions.push(selectedOptID);

                if ( counter === (size - 1) ) {
                    def.resolve(aggregateSelectedOptions);
                }

                counter++;
            });

            return def.promise;
        }

        function addExcludedOptions(product, attribute) {
            var def = $q.defer();

            aggregateSelectedOptions(product).then(function(aggregateSelectedOptions) {

                deletedAttrs = [];

                var counter = 0;
                var size = _.size(attribute.options);

                _.each(attribute.options, function(option) {



                    if( _.size(_.intersection(aggregateSelectedOptions, option.excludesOptions)) > 0) {

                        if( _.indexOf(Object.values(product.excludedOptions), option.ID) === -1 ) {
                            product.excludedOptions.push(option.ID);
                        }

                        if ( counter === (size - 1) ) {
                            def.resolve(true);
                        }

                    } else {

                        if ( counter === (size - 1) ) {
                            def.resolve(true);
                        }

                    }

                    counter++;
                });

            });

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

                            var flat = _.reduceRight(firstFilteredOption.exclusions, function(a, b) { return a.concat(b); }, []);
                            product.excludedOptions = _.merge({}, product.excludedOptions, flat);

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

                    setExclusionsAsync(product).then(function (exclusionEnd) {

                        if (exclusionEnd) {
                            $scope.selectDefaultOptions(product);
                        }
                    });

                });

            });

            if (!formatChange) {
                def.resolve();
            } else {
                console.log('Format change error!');
            }

            return def.promise;
        };

        /*
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
                            if (product.selectedOptions[attribute.attrID] === option.ID) {
                                delete product.selectedOptions[attribute.attrID];
                            }
                        }
                    }
                });
            });

        };


         */

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

        function getFirstCategory(typeID) {
            DpCategoryService.getFirstByType(typeID).then(function(data) {
                if( $rootScope.currentLang && $rootScope.currentLang.code && data.langs ) {
                    $rootScope.customBreadcrumbs.category = data.langs[$rootScope.currentLang.code].name;
                } else {
                    $rootScope.customBreadcrumbs.category = $filter('translate')('category');
                }
            }, function (data) {
                console.error(data);
            });
        }

        function getFormat() {

            FormatService = new PsFormatService($scope.currentGroupID, $scope.currentTypeID);
            FormatService.getPublic($scope.complexID).then(function (data) {

                $scope.type.formats = data;
                $scope.type.currentFormat = $scope.type.formats[0];

            }, function (data) {
                console.error('format err: ', data);
            });
        }

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
            if(productsLoaded){
                updateCalculationUrl('attrID', product.selectedOptions[attrID], attrID, productIndex(product));
            }
        };

        function productIndex(productOrGroup){
            var idInItem=productOrGroup.selectedProduct ? productOrGroup.selectedProduct.ID : (productOrGroup.productID || productOrGroup.info.ID || productOrGroup.info.typeID);
            return _.findIndex($scope.complexProducts,function(item){
                if(item.selectedProduct && item.selectedProduct.ID){
                    return item.selectedProduct.ID==idInItem;
                }
                return item.productID==idInItem;
            })
        }

        function excludeDeliveries() {

            $scope.filteredDeliveries = _.clone($scope.deliveries);

            var optID;

            _.each($scope.complexProducts, function (complexProduct, index) {

                var product = complexProduct.selectedProduct.data;

                _.each(product.attributeMap, function (attrID) {

                    optID = product.selectedOptions[attrID];

                    if (optID) {
                        var item = getOption(product, optID);

                        if(item && item.deliveries ) {

                            _.each(item.deliveries, function(deliveryID) {

                                var deliveryIndex = _.findIndex($scope.filteredDeliveries, {ID: deliveryID});

                                if( deliveryIndex > -1 ) {

                                    $scope.filteredDeliveries.splice(deliveryIndex, 1);

                                    _.each($scope.productAddresses, function(productAddress, index){

                                        if( productAddress.deliveryID === deliveryID && !_.isEmpty($scope.filteredDeliveries) ) {
                                            productAddress.deliveryID = _.first($scope.filteredDeliveries).ID;
                                        }
                                    });

                                }
                            });
                        }
                    }

                });

            });

        }

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

        $scope.selectPagesSync = function (product, pages) {
            product.currentPages = pages;
            $scope.calcProductThickness(product);
        };

        $scope.selectPages = function (product, pages) {
            updateCalculationUrl('pages', pages, null, productIndex(product));
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

        $scope.selectAttrPages = function (complexProduct, attrID) {
            updateCalculationUrl('attrPages',complexProduct.selectedProduct.data.attrPages[attrID],attrID,productIndex(complexProduct))
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

        $scope.calcProductThickness = function (product) {

            var sheets = product.currentPages / 2;

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
                $scope.selectPages(type, pages);
            }

            return pages;
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

        $scope.count = function (volume) {

            if (volume === undefined) {
                volume = $scope.productItem.volume;
            }

            getPreparedProduct(volume).then(function (data) {

                CalculationService.calculate($scope.currentTypeID, $scope.currentGroupID, data).then(function (data) {

                    $scope.info = data.info;
                    $scope.calculation = data.calculation;

                }, function (data) {
                    console.error('calc err: ', data);
                });
            });

        };

        function checkForAuth() {
            var authorizedOnlyCalculation = false;
            if (!$rootScope.logged) {
                _.each($scope.complexProducts, function (cp) {
                    _.each(cp.products, function (p) {
                        if(p.data) {
                            for (var kAttr in p.data.selectedOptions) {
                                kAttr = Number(kAttr);
                                var kOpt = p.data.selectedOptions[kAttr]
                                var attrIndx = p.data.attributeMap.indexOf(kAttr)
                                var attr = p.data.attributes[attrIndx]
                                var opt = _.find(attr.options, function (op) {
                                    return op.ID == kOpt
                                });
                                authorizedOnlyCalculation = authorizedOnlyCalculation || opt.authorizedOnlyCalculation
                            }
                        }
                    });
                })
            }
            $scope.authorizedOnlyCalculation = authorizedOnlyCalculation;
        }

        $scope.calculate = function (amount, volume) {
            checkForAuth()
            $scope.calculation = {};

            $scope.calculationInfo = [];
            getPreparedProduct(amount, volume).then(function (preparedProduct) {

                CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);
                CalculateService.calculate(preparedProduct).then(function (data) {
                    $scope.showCalculation(data);
                    if(!$scope.productAddresses[0].deliveryID) {
                        $scope.productAddresses[0].deliveryID = $scope.deliveries[0].ID;
                        $scope.productAddresses[0].index = 0;
                        $scope.productAddresses[0].ID = 1;
                    }
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

                    $('#scrollbar-volume').height(
                        $('#panel-product-parameters').outerHeight() - ($('#panel-product-volumes').outerHeight() - $('.mCustomScrollbar').outerHeight())
                    );

                }, function (data) {
                    console.error(data);
                    Notification.error($filter('translate')('error'));
                });

            });


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
                        $scope.checkVolume($scope.realisationTimes[0], $scope.realisationTimes[0].volumes[0]);
                    }

                } else {
                    $scope.checkVolume($scope.rememberVolume.realisationTime, $scope.rememberVolume.volume);
                }


            } else {
                if(getCalculationUrlParam('realisationTime')){
                    var realisationTime =_.find($scope.realisationTimes,function(item){
                        return item.ID==getCalculationUrlParam('realisationTime');
                    });
                }else{
                    var realisationTime = _.sortBy($scope.realisationTimes, 'order')[0];
                }

                if(getCalculationUrlParam('volume')){
                    var volumeIdx =_.findIndex(realisationTime.volumes,function(item){
                        return item.volume==getCalculationUrlParam('volume');
                    });
                }else{
                    var volumeIdx = 0;
                }
                var activeVolume = getActiveVolume(realisationTime.volumes, volumeIdx);

                $scope.checkVolume(realisationTime, activeVolume);
                if(getCalculationUrlParam('volume')){
                    setFromCalculationUrl($scope.productItem, 'volume', 'volume', null, parseInt)
                }else{
                    $scope.productItem.volume =  activeVolume.volume;
                }
            }

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
            if( $scope.selectedTechnology ) {
                newItem.selectedTechnology = $scope.selectedTechnology;
            }

            var rIdx = _.findIndex($scope.realisationTimes, {ID: $scope.productItem.realisationTime});

            if (rIdx > -1) {
                if ($scope.realisationTimes[rIdx].overwriteDate !== undefined && $scope.realisationTimes[rIdx].overwriteDate !== null) {
                    newItem.realizationDate = $scope.realisationTimes[rIdx].overwriteDate;
                } else {
                    newItem.realizationDate = $scope.realisationTimes[rIdx].date;
                }
            }

            DeliveryWidgetService.reducePostData($scope.productAddresses).then(function(productAddresses) {

                newItem.productAddresses = productAddresses;
                if ($scope.calculation !== undefined) {
                    newItem.weight = $scope.calculation.weight;
                }

                newItem.currency = $rootScope.currentCurrency.code;

                prepareProductPromise(newItem).then(function (newItemPrepared) {
                    if(newItemPrepared) {
                        def.resolve(newItemPrepared);
                    }
                });

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

                CalcSimplifyWidgetService.removeEmptyOptionFromSelected(product, newProduct).then( function() {

                    newProduct.attrPages = product.attrPages;

                    if( product.info.noCalculate !== true) {
                        newItem.products.push(newProduct);
                    }

                    if (($scope.complexProducts.length - 1) === index) {
                        def.resolve(newItem);
                    }

                });

            });

            return def.promise;
        }

        $scope.getVolumes = function (amount) {

            $scope.loadVolumes = true;

            getPreparedProduct(amount).then(function (preparedProduct) {

                preparedProduct.customVolumes = $scope.customVolume.volumes;
                CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);

                CalculateService.getVolumes(preparedProduct).then(function (data) {

                    if( data.technologies && data.technologies.length > 0 ) {
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
                    console.log('volumes: ', $scope.volumes);
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
                    updateCalculationUrl('volume', volume.volume);
                    _.each($scope.realisationTimes, function (realisationTime, rIndex) {
                        var idxVol = _.findIndex(realisationTime.volumes, {volume: volume.volume});
                        if (idxVol !== -1) {
                            $scope.realisationTimes[rIndex].active = realisationTime.volumes[idxVol].active;
                        }
                    });
                    $scope.productItem.realisationTime = realisationTime.ID;
                    updateCalculationUrl('realisationTime', $scope.productItem.realisationTime);
                    $scope.loadVolumes = false;
                    $scope.getTotalThickness();
                }
            } else {
                $scope.rememberVolume = {};
            }
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

                var cookieCustomVolumes = angular.fromJson($cookies['customVolumes']);

                if (!cookieCustomVolumes) {
                    cookieCustomVolumes = {};
                }

                cookieCustomVolumes[$scope.currentTypeID] = $scope.customVolume;

                $cookies['customVolumes'] = angular.toJson(cookieCustomVolumes);

                updateCalculationUrl('customVolumes', $cookies['customVolumes']);
            } else {
                Notification.error($filter('translate')('volume_exist'));
            }
        };

        $scope.getMinVolume = function () {

            $scope.customVolume.minVolume = $scope.volumes[0].volume;

            if (!angular.isDefined($scope.customVolume.newVolume)) {
                $scope.customVolume.newVolume = $scope.volumes[0].volume;
            }
        };

        $scope.changeTax = function () {
            updateCalculationUrl('tax', $scope.productItem.taxID);
            $scope.getVolumes($scope.productItem.amount);
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

        $scope.filterRealisationTime = function (rt) {
            return rt.active ? 1 : 0;
        };

        $scope.getTotalThickness = function () {

            var tmp = 0;
            _.each($scope.summaryThickness, function (th) {
                tmp += th;
            });
            return tmp.toFixed(2);

        };

        $scope.toCart = function () {

            if ($scope.deliveryLackOfVolume > 0) {
                Notification.error($filter('translate')('delivery_lack_of_volume') + ': ' + $scope.deliveryLackOfVolume);
                return;
            }

            getPreparedProduct($scope.productItem.amount, $scope.productItem.volume).then(function (preparedProduct) {
                if ($rootScope.orderID !== undefined) {
                    preparedProduct.orderID = $rootScope.orderID;
                }

                DeliveryWidgetService.reducePostData($scope.productAddresses).then(function(productAddresses) {
                    DeliveryWidgetService.checkParcelShopSelected(productAddresses).then( function( productAddressesChecked ) {

                        if( productAddressesChecked ) {

                            CalculateService = new CalculationService(preparedProduct.groupID, preparedProduct.typeID);
                            CalculateService.saveCalculation(preparedProduct).then(function (data) {

                                if( data.orderID ) {
                                    $rootScope.orderID = data.orderID;
                                }

                                data.productAddresses = productAddresses;

                                AuthService.addToCart(data).then(function (cartsData) {

                                    $rootScope.carts = cartsData.carts;

                                    checkMatchAddress(cartsData.carts, productAddresses).then(function (cartToJoin) {

                                        if (cartToJoin) {
                                            addToJoinedDelivery(productAddresses[0].addressID, $rootScope.currentCurrency.code).then(function (joinData) {

                                                if (joinData.response) {
                                                    var tokenParams = {};

                                                    tokenParams['addressID'] = joinData.paramsToCopy.addressID;
                                                    tokenParams['active'] = true;
                                                    tokenParams['commonDeliveryID'] = joinData.paramsToCopy.commonDeliveryID;
                                                    tokenParams['commonRealisationTime'] = new Date(joinData.paramsToCopy.commonRealisationTime.sec * 1000);
                                                    TokenService.joinAddresses(tokenParams).then(function (data) {
                                                        $state.go('cart');
                                                    });
                                                } else {
                                                    $state.go('cart');
                                                }
                                            });
                                        } else {
                                            $state.go('cart');
                                        }

                                    });

                                });

                            }, function () {
                                Notification.error($filter('translate')('error'));
                            });

                        } else {
                            Notification.error($filter('translate')('select_missing_parcel_shop'));
                        }


                    });
                });

            });

        };

        function checkMatchAddress(carts, productAddresses) {

            var def = $q.defer();

            if (productAddresses.length > 1) {
                def.resolve(false);
            }

            carts.pop();

            var addressID = productAddresses[0].addressID;
            var cartLen = carts.length;

            if (cartLen === 0) {
                def.resolve(false);
            }

            _.each(carts, function (cart, index) {
                if (cart.ProductAddresses.length === 1 && cart.ProductAddresses[0].addressID === addressID && cart.ProductAddresses[0].join === true) {
                    def.resolve(cart);
                }

                if (cartLen === index + 1) {
                    def.resolve(false);
                }
            });

            return def.promise;

        }

        function addToJoinedDelivery(addressID, currency) {
            var def = $q.defer();
            DpOrderService.addToJoinedDelivery(addressID, currency).then(function (data) {
                def.resolve(data);
            });
            return def.promise;
        }

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
            $scope.getVolumes($scope.productItem.amount);
        };

        $scope.hasFormats = function (desc) {

            var complexProducts = $scope.complexProducts;

            if (desc.formats.length > 0) {

                if (!angular.isDefined(complexProducts[0])) {
                    return true;
                }

                return _.contains(desc.formats, complexProducts[0].selectedProduct.data.currentFormat.ID);

            } else {
                return true;
            }

        };

        $scope.hasOneFormat = function (pattern) {

            if (!$scope.complexProducts || !$scope.complexProducts[0]) {
                return false;
            }

            return pattern.formatID === $scope.complexProducts[0].selectedProduct.data.currentFormat.ID;


        };

        function getDeliveries() {

            var def = $q.defer();

            DeliveryService.getAll($rootScope.currentCurrency.code).then(function (data) {//TODO currentCurrency can not exist
                $scope.deliveries = data;
                $scope.filteredDeliveries = _.clone(data);
                def.resolve(data);
            });

            return def.promise;

        }

        function getAddress() {
            var def = $q.defer();

            if ($rootScope.logged) {

                AddressService.getForUser().then(function (data) {
                    setAddress(data);
                    def.resolve(data);
                });

            } else {
                AddressService.getAddressesFromSession().then(function (addresses) {
                    AddressService.getAll(addresses).then(function (data) {
                        setAddress(data);
                        def.resolve(data);
                    });
                });
            }

            return def.promise;
        }

        function setAddress(allAddress) {
            $scope.addresses = allAddress.addresses;

            if (_.size(allAddress.senders) > 0) {
                $scope.senders = [];
                _.each(allAddress.senders, function (item) {
                    item.name = $filter('translate')(item.name);
                    $scope.senders.push(item);
                });
            }
        }

        $scope.addressesEdit = function () {

            /**
             * @param {string} $config.API_URL
             */

            AddressWidgetService.addressesEdit($scope);

        };

        $scope.allDeliveryPrice = function () {

            if ($scope.calculation === undefined) {
                return;
            }
            var deliveryPrice = 0;
            var deliveryGrossPrice = 0;

            _.each($scope.productAddresses, function (address) {

                var idx = _.findIndex($scope.filteredDeliveries, {ID: address.deliveryID});

                if (idx > -1) {

                    if( address && address.oldDeliveryID !== address.deliveryID ) {
                        updateCalculationUrl('deliveryID', address.deliveryID);
                        address.oldDeliveryID = address.deliveryID;

                        if( $scope.filteredDeliveries[idx].module.func === 'collectionAttributes' ) {
                            address.turnOffAddress = true;
                            address.collectionPoints = $scope.filteredDeliveries[idx].collectionPoints;
                            address.collectionPointID = $scope.filteredDeliveries[idx].collectionPoints[0].ID;
                        } else {
                            address.turnOffAddress = false;
                            address.collectionPoints = [];
                            delete address.collectionPointID;
                        }

                        if( $scope.filteredDeliveries[idx].hasParcelShops && address.parcelShops ) {

                            address.hasParcelShops = true;

                        } else if( $scope.filteredDeliveries[idx].hasParcelShops && !address.parcelShops ) {

                            address.hasParcelShops = true;
                            address.parcelShops = null;

                            DeliveryWidgetService.findParcelShops(
                                address.addressID,
                                $scope.filteredDeliveries[idx].ID,
                                $scope.filteredDeliveries[idx].courierID,
                                address
                            ).then( function(result) {
                                console.log('findParcelShops ??? ' +result);
                            });

                        } else {
                            address.hasParcelShops = false;
                            address.parcelShops = null;
                        }

                        if (angular.isDefined($scope.filteredDeliveries[idx].price)) {

                            DeliveryWidgetService.checkExclusions($scope, address);

                            /**
                             * @param {number} $scope.deliveries[].price.priceGross
                             */
                            //address.price = parseFloat($scope.filteredDeliveries[idx].price.priceGross);
                            deliveryPrice += parseFloat($scope.filteredDeliveries[idx].price.price);
                            deliveryGrossPrice += parseFloat($scope.filteredDeliveries[idx].price.priceGross);

                            if ($rootScope.logged !== true) {
                                address = DeliveryWidgetService.getPkgWeightLite(
                                    address,
                                    DeliveryWidgetService.selectVolume($scope, address),
                                    $scope
                                );
                            } else {
                                address = DeliveryWidgetService.getPkgWeightCalc(
                                    address,
                                    $scope
                                );
                            }

                        } else {
                            address.price = 0;
                        }

                    }

                } else {
                    address.price = 0;
                }

            });

            $scope.calculation.deliveryPrice = 0;
            $scope.calculation.deliveryPrice = deliveryPrice.toFixed(2).replace('.', ',');
            $scope.calculation.deliveryGrossPrice = 0;
            $scope.calculation.deliveryGrossPrice = deliveryGrossPrice.toFixed(2).replace('.', ',');
        };

        $scope.emptyArray = function (value) {
            return _.isArray(value) && _.isEmpty(value);
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

        $scope.$watch('calculation.volume', function (value) {
            if (value === undefined) {
                return;
            }

            if( $scope.calculation.amount > 1 ) {
                value *= $scope.calculation.amount;
            }

            var address = $scope.productAddresses[0];

            DeliveryWidgetService.checkExclusions($scope, address);

            var existVolume = 0;
            _.each($scope.productAddresses, function (oneAddress, index) {
                if (index > 0) {
                    existVolume += Number(oneAddress.allVolume);
                }
            });

            if (existVolume >= value) {
                $scope.productAddresses.splice(1, $scope.productAddresses.length);
                existVolume = 0;
            }
            if (address !== undefined) {
                address.allVolume = (value - existVolume);
                if( typeof($scope.calculation.weight) ===  'number' ) {
                    address.weight = $scope.calculation.weight.toFixed(2).replace('.', ',');
                } else {
                    address.weight = parseFloat($scope.calculation.weight).toFixed(2).replace('.', ',');
                }
                if ($scope.senders[0] !== undefined) {
                    address.senderID = $scope.senders[0].type;
                }
                if ($scope.addresses[0] !== undefined) {
                    address.addressID = $scope.addresses[0].ID;
                }
                address = DeliveryWidgetService.getPkgWeightLite(
                    address,
                    DeliveryWidgetService.selectVolume($scope, address),
                    $scope
                );
            }
        });

        $scope.changeVolumes = function () {

            var _this = this;
            if (_timeout) {
                $timeout.cancel(_timeout);
            }

            var allVolumes = 0;
            _.each($scope.productAddresses, function (oneAddress) {
                allVolumes += parseInt(oneAddress.allVolume);
                if (oneAddress.index) {
                    oneAddress = DeliveryWidgetService.getPkgWeightCalc(
                        oneAddress,
                        $scope
                    );
                }
            });

            _timeout = $timeout(function () {

                var selectedVolume = $scope.productItem.volume * $scope.productItem.amount;

                if (allVolumes > selectedVolume) {
                    var over = allVolumes - selectedVolume;

                    $scope.productAddresses[_this.$index].allVolume -= Number(over);
                    $scope.deliveryLackOfVolume = 0;

                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);
                    $scope.blockCart = true;

                } else if (allVolumes <= selectedVolume) {

                    $scope.deliveryLackOfVolume = Number(selectedVolume - allVolumes);
                    $scope.blockCart = true;

                } else {
                    $scope.blockCart = false;
                }

                _timeout = null;
            }, 500);
        };

        $scope.separateDelivery = function () {

            /**
             * @param {number|string} $scope.separateVolume
             */
            var newVolume = Number(this.separateVolume);

            if ($scope.deliveryLackOfVolume < 0) {
                $scope.deliveryLackOfVolume = 0;
            }
            if (newVolume <= 0 || _.isNaN(newVolume)) {
                Notification.error($filter('translate')('enter_volume'));
                return;
            }

            var availableVolumes = Number($scope.productAddresses[0].allVolume + $scope.deliveryLackOfVolume);

            var diffVolume;

            if (newVolume === availableVolumes) {
                Notification.error($filter('translate')('enter_less_volume'));
                return;
            }
            if (newVolume > availableVolumes) {
                diffVolume = newVolume - availableVolumes;
                Notification.error($filter('translate')('volume_exceeded_by') + ' ' + diffVolume);
                return;
            }

            if (newVolume <= $scope.deliveryLackOfVolume) {
                $scope.deliveryLackOfVolume = Number($scope.deliveryLackOfVolume - newVolume);
            } else {

                diffVolume = Number(newVolume - $scope.deliveryLackOfVolume);

                if (diffVolume === $scope.productAddresses[0].allVolume) {
                    Notification.error($filter('translate')('enter_less_volume'));
                    return;
                }

                if (diffVolume > $scope.productAddresses[0].allVolume) {
                    var over = Number(diffVolume - $scope.productAddresses[0].allVolume);
                    Notification.error($filter('translate')('volume_exceeded_by') + ' ' + over);
                    return;
                }

                $scope.deliveryLackOfVolume = 0;
                if (diffVolume > 0 && diffVolume < $scope.productAddresses[0].allVolume) {
                    $scope.productAddresses[0].volume = Number($scope.productAddresses[0].volume - diffVolume);
                    $scope.productAddresses[0].allVolume = Number($scope.productAddresses[0].allVolume - diffVolume);
                }

            }

            var newIndex = _.findLast($scope.productAddresses).index + 1;
            var lastIndex = $scope.productAddresses.push(
                {'volume': newVolume, 'allVolume': newVolume, 'index': newIndex}
                ) - 1;
            $scope.productAddresses[lastIndex].deliveryID = $scope.productAddresses[0].deliveryID;
            $scope.productAddresses[lastIndex].addressID = $scope.productAddresses[0].addressID;
            $scope.productAddresses[lastIndex].senderID = $scope.productAddresses[0].senderID;
            $scope.productAddresses[lastIndex].parcelShops = $scope.productAddresses[0].parcelShops;
            $scope.productAddresses[lastIndex].parcelShopID = $scope.productAddresses[0].parcelShopID;

            $scope.changeVolumes($scope.productAddresses[lastIndex]);
        };

        $scope.removeProductAddress = function (idx) {
            var oldVolume = Number($scope.productAddresses[idx].allVolume);
            $scope.productAddresses.splice(idx, 1);
            $scope.productAddresses[0].allVolume = Number($scope.productAddresses[0].allVolume) + oldVolume;
        };

        $scope.getToken = function () {
            return AuthDataService.getAccessToken();
        };

        function getJson() {

            getPreparedProduct($scope.productItem.amount, $scope.productItem.volume).then(function (preparedProduct) {

                var result = {
                    typeID: preparedProduct.typeID,
                    products: [],
                    formats: [],
                    pages: [],
                    attributes: [],
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
                updateCalculationUrl('name', $scope.productItem.name);
                $scope.productItem.jsonText = JSON.stringify(result);

            });

        }

        $scope.changeUserProductName = function() {
            getJson();
        };

        $scope.printOffer = function () {

            TemplateRootService.getTemplateUrl(73).then(function (response) {

                $modal.open({
                    templateUrl: response.url,
                    scope: $scope,
                    size: 'lg',
                    controller: function ($scope) {

                        var Setting = new SettingService('general');

                        var numberOfVolumes = 5;

                        $scope.offerdate = new Date();
                        $scope.offer_exp_date = new Date();
                        $scope.offer_exp_date = $scope.offer_exp_date.setDate($scope.offerdate.getDate() + 30);

                        var url = '';
                        if (typeof $scope.galleries !== "undefined") {
                            if ( $scope.galleries.length > 0 && $scope.galleries[0].files ) {
                                url = $scope.galleries[0].files[0].url;
                            }
                        }

                        $scope.po_logo = url;

                        Setting.getPublicSettings().then(function (settingsData) {
                            if (settingsData.numberOfVolumesInOffer) {
                                numberOfVolumes = settingsData.numberOfVolumesInOffer.value;
                            }
                            getPreparedProduct($scope.productItem.amount, $scope.productItem.volume).then(function (data) {

                                $scope.offerdata = data;

                                if (data.products.length > 0 && $scope.complexProducts.length > 0) {
                                    var cps = new Array(data.products.length);

                                    for (var _idx = 0; _idx < data.products.length; ++_idx) {
                                        var _groupID = data.products[_idx].groupID;
                                        for (var i = 0; i < $scope.complexProducts.length; ++i) {

                                            var cp = $scope.complexProducts[i].selectedProduct;
                                            if (cp.groupID === _groupID) {
                                                cps[_idx] = cp;
                                            }
                                        }
                                    }

                                    $scope.offerdata.cps = cps;
                                }

                                if (typeof $scope.taxes !== "undefined") {
                                    if ($scope.taxes.length > 0) {
                                        var tax = "";
                                        for (i = 0; i < $scope.taxes.length; ++i) {
                                            if ($scope.taxes[i].ID === data.taxID) {
                                                tax = $scope.taxes[i].name;
                                            }
                                        }
                                        $scope.offerdata.tax = tax;
                                    }
                                }

                                var rt;
                                if ($scope.realisationTimes !== undefined) {
                                    if (data.realizationTimeID !== undefined) {
                                        rt = _.findWhere($scope.realisationTimes, {ID: data.realizationTimeID});
                                        $scope.offerdata.realizationTime = rt.name;
                                    } else {
                                        $scope.offerdata.realizationTime = "";
                                    }

                                }

                                var index = 0;

                                rt.volumes = _(rt.volumes).chain().filter(function(oneVolume) {
                                    return oneVolume.active === true;
                                }).sortBy(function(oneVolume) {
                                    return oneVolume.volume;
                                }).value();

                                var actualVolumeIndex = _.findIndex(rt.volumes, {volume: data.volume});

                                var halfOfVolumes;
                                var firstIndex;
                                var lastIndex;

                                if (numberOfVolumes >= (rt.volumes.length - 1)) {
                                    firstIndex = 0;
                                    lastIndex = rt.volumes.length - 1;
                                } else {

                                    halfOfVolumes = parseInt(numberOfVolumes / 2);
                                    firstIndex = actualVolumeIndex - halfOfVolumes;
                                    lastIndex = firstIndex + (numberOfVolumes - 1);

                                    if (firstIndex < 0) {
                                        firstIndex = 0;
                                        lastIndex = firstIndex + (numberOfVolumes - 1);
                                    }

                                    if (lastIndex > (rt.volumes.length-1)) {
                                        lastIndex = rt.volumes.length-1;
                                        firstIndex = lastIndex - (numberOfVolumes - 1);
                                    }

                                }

                                var filteredVolumes = {};
                                var tmpPrice;
                                var tmpPriceGross;

                                for (index; index < rt.volumes.length; ++index) {

                                    if (index >= firstIndex && index <= lastIndex) {
                                        var q = rt.volumes[index].volume;
                                        var n = rt.volumes[index].price;
                                        var g = rt.volumes[index].priceBrutto;
                                        var ns = n;
                                        var gs = g;
                                        if (q > 1) {
                                            if( typeof n === 'string' ) {
                                                n = n.replace(',', '.');
                                            }
                                            if( typeof g === 'string' ) {
                                                g = g.replace(',', '.');
                                            }
                                            ns = parseFloat(n) / q;
                                            gs = parseFloat(g) / q;
                                            ns = ns.toFixed(2);
                                            gs = gs.toFixed(2);
                                        }

                                        tmpPrice = ns;
                                        if (typeof tmpPrice === 'string') {
                                            tmpPrice = tmpPrice.replace(".", ",");
                                        }
                                        tmpPriceGross = gs;
                                        if (typeof tmpPriceGross === 'string') {
                                            tmpPriceGross = tmpPriceGross.replace(".", ",");
                                        }
                                        filteredVolumes[index] = {
                                            qty: q,
                                            net: n,
                                            gross: g,
                                            netunit: tmpPrice,
                                            grossunit: tmpPriceGross
                                        };
                                    }

                                    if( rt.volumes[index].active === false ) {
                                        --lastIndex;
                                    }

                                }

                                $scope.rtVolumes = filteredVolumes;

                                $scope.print = function () {

                                    var CalculateDataObject = new CalculateDataService(data.typeID);

                                    var dataForPrint = {
                                        amount: data.amount,
                                        groupID: data.groupID,
                                        typeID: data.typeID,
                                        products: data.products,
                                        customVolumes: data.customVolumes,
                                        taxID: data.taxID,
                                        currency: data.currency,
                                        productAddresses: data.productAddresses,
                                        activeVolume: data.volume,
                                        realizationTimeID: data.realizationTimeID
                                    };
                                    if( data.userID ) {
                                        dataForPrint.userID = data.userID;
                                    }
                                    if( data.selectedTechnology ) {
                                        dataForPrint.selectedTechnology = data.selectedTechnology;
                                    }
                                    CalculateDataObject.printOffer(dataForPrint).then(function(processedData) {
                                        if (processedData.success === true) {
                                            $window.open(processedData.link, '_blank');
                                        }
                                    });

                                }

                            });

                        });

                    }
                });

            });
        };

        $scope.showRealizationTime = function (realizationTimeID) {
            var rIdx = _.findIndex($scope.realisationTimes, {ID: realizationTimeID});
            var resDate = '';
            if (rIdx > -1) {
                if ($scope.realisationTimes[rIdx].overwriteDate !== undefined && $scope.realisationTimes[rIdx].overwriteDate !== null) {
                    resDate = $scope.realisationTimes[rIdx].overwriteDate;
                } else {
                    resDate = $scope.realisationTimes[rIdx].date;
                }
            }
            return resDate;
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

        $scope.selectCustomFormat = function (complexProduct) {

            complexProduct.selectedProduct.data.currentFormat.customHeight = Number(complexProduct.selectedProduct.data.currentFormat.customHeight);
            complexProduct.selectedProduct.data.currentFormat.customWidth = Number(complexProduct.selectedProduct.data.currentFormat.customWidth);
            updateCalculationUrl('customWidth', complexProduct.selectedProduct.data.currentFormat.customWidth,null,productIndex(complexProduct));
            updateCalculationUrl('customHeight', complexProduct.selectedProduct.data.currentFormat.customHeight,null,productIndex(complexProduct));
            if (angular.isDefined(stopSelect)) {
                $timeout.cancel(stopSelect);
                stopSelect = undefined;
            }

            stopSelect = $timeout(function () {

                // check maximal and minimal customSize
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

                $scope.getVolumes($scope.productItem.amount);

            }, 1500);
        };

        $scope.spinCustomHeight = function (complexProduct, direct) {

            if (direct) {
                complexProduct.selectedProduct.data.currentFormat.customHeight = complexProduct.selectedProduct.data.currentFormat.customHeight + 1;
            } else {
                complexProduct.selectedProduct.data.currentFormat.customHeight = complexProduct.selectedProduct.data.currentFormat.customHeight - 1;
            }

            $scope.selectCustomFormat(complexProduct);

        };

        $scope.spinCustomWidth = function (complexProduct, direct) {

            if (direct) {
                complexProduct.selectedProduct.data.currentFormat.customWidth = complexProduct.selectedProduct.data.currentFormat.customWidth + 1;
            } else {
                complexProduct.selectedProduct.data.currentFormat.customWidth = complexProduct.selectedProduct.data.currentFormat.customWidth - 1;
            }

            $scope.selectCustomFormat(complexProduct);

        };

        $scope.spinCustomAmount = function (direct) {

            if (direct) {
                $scope.productItem.amount = $scope.productItem.amount + 1;
            } else {

                if( $scope.productItem.amount === 1 ) {
                    return;
                }

                $scope.productItem.amount = $scope.productItem.amount - 1;
            }

            $scope.changeAmount();

        };

        $scope.spinWingtip = function (complexProduct, direction, field) {
            complexProduct.selectedProduct.data.currentFormat[field] = Number(complexProduct.selectedProduct.data.currentFormat[field]) + direction;
            $scope.selectWingtip(complexProduct);
        };

        $scope.selectWingtip = function (complexProduct) {
            complexProduct.selectedProduct.data.currentFormat.wingtipFront = Number(complexProduct.selectedProduct.data.currentFormat.wingtipFront);
            complexProduct.selectedProduct.data.currentFormat.wingtipBack = Number(complexProduct.selectedProduct.data.currentFormat.wingtipBack);
            updateCalculationUrl('wingtipFront', complexProduct.selectedProduct.data.currentFormat.wingtipFront, null, productIndex(complexProduct));
            updateCalculationUrl('wingtipBack', complexProduct.selectedProduct.data.currentFormat.wingtipBack, null, productIndex(complexProduct));
            if (angular.isDefined(stopSelect)) {
                $timeout.cancel(stopSelect);
                stopSelect = undefined;
            }
            var minSize=[complexProduct.selectedProduct.data.currentFormat.wingtipFrontMin,complexProduct.selectedProduct.data.currentFormat.wingtipBackMin];
            var maxWidth=complexProduct.selectedProduct.data.currentFormat.width-2*10;
            stopSelect = $timeout(function () {
                if (complexProduct.selectedProduct.data.currentFormat.wingtipFront < minSize[0]) {
                    Notification.info($filter('translate')('value_lower_than_minimum') + ' ' + minSize[0]);
                    complexProduct.selectedProduct.data.currentFormat.wingtipFront = minSize[0];
                }
                if (complexProduct.selectedProduct.data.currentFormat.wingtipBack < minSize[1]) {
                    Notification.info($filter('translate')('value_lower_than_minimum') + ' ' + minSize[1]);
                    complexProduct.selectedProduct.data.currentFormat.wingtipBack = minSize[1];
                }
                if (complexProduct.selectedProduct.data.currentFormat.wingtipFront > maxWidth) {
                    Notification.info($filter('translate')('value_greater_than_maximum') + ' ' + maxWidth);
                    complexProduct.selectedProduct.data.currentFormat.wingtipFront = maxWidth;
                }
                if (complexProduct.selectedProduct.data.currentFormat.wingtipBack > maxWidth) {
                    Notification.info($filter('translate')('value_greater_than_maximum') + ' ' + maxWidth);
                    complexProduct.selectedProduct.data.currentFormat.wingtipBack = maxWidth;
                }
                $scope.getVolumes($scope.productItem.amount);

            }, 1500);
        };

        $scope.optionsSort = function (option) {
            return option.sort;
        };

        $rootScope.$on('Currency.changed', function (e, currency) {

            $scope.getVolumes($scope.productItem.amount);
            getDeliveries().then(function () {
                $scope.allDeliveryPrice();
            });

        });

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

        $scope.showTax = function (taxID) {

            var idxTax = _.findIndex($scope.taxes, {ID: taxID});

            if (idxTax > -1) {
                return $scope.taxes[idxTax].value + ' %';
            }
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

        $scope.toggleShowPattern = function () {
            $scope.showPattern = true;
            $scope.showSummary = false;
        };

        $scope.toggleShowSummary = function () {
            $scope.showSummary = true;
            $scope.showPattern = false;
        };

        $scope.selectType = function (item) {
            if (item) {

                PsTypeService.getOneForView(
                    item.group.slugs[$rootScope.currentLang.code],
                    item.slugs[$rootScope.currentLang.code]
                ).then(function (typeInfo) {

                    var categorySlugs = {};
                    _.each(typeInfo.category.langs, function(langObject, lang) {
                        categorySlugs[lang] = langObject.url;
                    });
                    if( $rootScope.urlParams === undefined ) {
                        $rootScope.urlParams = {};
                    }
                    $rootScope.urlParams.category = categorySlugs;
                    $rootScope.urlParams.group = typeInfo.group.slugs;
                    $rootScope.urlParams.type = typeInfo.slugs;

                    var urlParams = {};

                    if( $stateParams.categoryurl === undefined && $stateParams.groupurl === undefined ) {
                        urlParams = {
                            typeurl: typeInfo.slugs[$rootScope.currentLang.code]
                        }
                    } else if ( $stateParams.categoryurl === undefined && $stateParams.groupurl !== undefined ) {
                        urlParams = {
                            groupurl: typeInfo.group.slugs[$rootScope.currentLang.code],
                            typeurl: typeInfo.slugs[$rootScope.currentLang.code]
                        };
                    } else {
                        urlParams = {
                            categoryurl: typeInfo.category.langs[$rootScope.currentLang.code].url,
                            groupurl: typeInfo.group.slugs[$rootScope.currentLang.code],
                            typeurl: typeInfo.slugs[$rootScope.currentLang.code]
                        };
                    }

                    if( typeInfo.isEditor ) {
                        $state.go('select-project', urlParams);
                    } else {
                        $state.go('calculate', urlParams);
                    }

                });
            }
        };

        function descriptionTabResetActive() {
            $timeout(function () {
                $('.with-nav-tabs .nav-tabs li').removeClass('active');
                $('.with-nav-tabs .tab-content div.tab-pane').removeClass('active');

                $('.with-nav-tabs .nav-tabs li').first().addClass('active');
                $('.with-nav-tabs .tab-content div.tab-pane').first().addClass('active');
            }, 300);
        }

        function updateCalculationUrl(name, value, nameGroup, index) {
            if(arguments.length > 2 && nameGroup){
               name+= '.' + nameGroup
            }
            if(arguments.length > 3){
                name+= '.' + index
            }
            $location.search(name, value);
            updateLinkToCopy();
        }

        function setFromCalculationUrl(item, propertyName, storedPropertyName, defaultValue, converter, reset){
            var formatValue=function(value){
                if(converter){
                    value=converter(value)
                }
                return value
            }
            if(storedPropertyName.indexOf('[]')>-1){
                var params= $location.search();
                storedPropertyName=storedPropertyName.replace('[]','');
                for(var key in params){
                    var keyParts =key.split('.')
                    if(keyParts[0]===storedPropertyName){
                        if(keyParts.length==2){
                            var index=keyParts[1]
                            var path=propertyName.split('.')
                            var goal=item[index];
                            for(var i=0;i<path.length-1;i++){
                                goal=goal[path[i]]
                            }
                            goal[path[path.length-1]]=formatValue(params[key]);
                            log.debug('setFromCalculationUrl',index, path, key,params);
                        }
                        if(keyParts.length==3){
                            var propertyNameParts=propertyName.split('.')
                            var goal=item[keyParts[2]]
                            for(var i=0;i<propertyNameParts.length;i++){
                                if(goal){
                                    goal=goal[propertyNameParts[i]]
                                }else{
                                    throw new Error('Wrong goal for propertyName '+propertyName);
                                }

                            }
                            goal[keyParts[1]]=formatValue(params[key]);
                            log.debug('setFromCalculationUrl',index, propertyNameParts, key,params);
                        }

                    }
                }
            }else{
                var value=$location.search()[storedPropertyName] || defaultValue
                if(value){
                    item[propertyName]=formatValue(value);
                    log.debug('setFromCalculationUrl',propertyName,value);
                }
            }
            if(reset){
                updateCalculationUrl(storedPropertyName,null)
            }
        }

        function getCalculationUrlParam(storedPropertyName){
            return $location.search()[storedPropertyName]
        }

        function setupClipboardJS(){
            var clipboardJS=new ClipboardJS('#copyCalculationUrlBtn')
            clipboardJS.on('success', function(e) {
                log.info('Url copied');
            });
            clipboardJS.on('error', function(e) {
                log.error('Copy Url', e);
            });
        }

        function updateLinkToCopy(){
            var elRef=document.querySelector('#copyCalculationUrlBtn')
            if(elRef){
                elRef.setAttribute('data-clipboard-text', $location.absUrl())
            }
        }

        $scope.selectOptionImage = function (complexProductData, item, attribute) {
            complexProductData.selectedOptions[attribute.attrID] = item.ID;
            $scope.selectOption(complexProductData, attribute.attrID);
        };

        $scope.setOptionPicture = function ($event, item) {
            $scope.optionPicture = item.icon;
            setTimeout(function () {
                $('#showOptionPicture').modal('show');
                $event.stopPropagation();
            }, 100);

        };

        $scope.filterSearchProduct = function () {

            var _that = this;

            if( this.query === undefined ) {
                return;
            }

            if (!this.query.productName) {
                $scope.filteredProducts = $rootScope.allTypes;
            } else {
                $('.dropdown-menu.option:hidden').dropdown("toggle");
                $scope.filteredProducts = _.filter($rootScope.allTypes, function (one) {

                    if (one.names === undefined || one.names[$rootScope.currentLang.code] === undefined) {
                        return false;
                    }

                    return one.names[$rootScope.currentLang.code].toLowerCase().search(_that.query.productName.toLowerCase()) > -1;

                });
            }
        };

        $scope.getFlagClass = function(addresses, addressID) {
            var selectedAddress = _.findWhere(addresses, {ID: addressID});
            if( selectedAddress ) {
                return 'flag-icon-' + selectedAddress.countryCode.toLowerCase();
            }
            return '';
        };

        $scope.selectTechnology = function(technology) {
            updateCalculationUrl('technologyID',this.productItem.selectedTechnologyID);
            var idx;
            if( technology === undefined && this.productItem.selectedTechnologyID ) {

                idx = _.findIndex($scope.technologies, {ID: this.productItem.selectedTechnologyID});
                if( idx > -1 ) {
                    $scope.selectedTechnology = $scope.technologies[idx];
                }

                $scope.getVolumes($scope.productItem.amount);
                return;
            }

            if( !technology ) {
                $scope.selectedTechnology = false;
                $scope.getVolumes($scope.productItem.amount);
                return;
            }


            idx = _.findIndex($scope.technologies, {ID: technology.ID});
            if( idx > -1 ) {
                $scope.selectedTechnology = $scope.technologies[idx];
                $scope.productItem.selectedTechnologyID = $scope.technologies[idx].ID;
            }

            $scope.getVolumes($scope.productItem.amount);
        };

        $scope.showTechnologyTooltip = function(technology) {

            if( !technology || technology.names === undefined ) {
                return '';
            }

            if( !technology.selected ) {
                return $filter('translate')('count_only_for') + ' ' + technology.names[$rootScope.currentLang.code];
            }

            return $filter('translate')('count_for_all_technologies');
        };

    });
