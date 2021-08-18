angular.module('digitalprint.services')
    .factory('CalcSimplifyWidgetService', function ($q) {

        function checkFormatExclusions(product) {

            var def = $q.defer();

            if (!product.currentFormat) {
                return false;
            }
            product.formatExcluded = [];

            _.each(product.attributes, function (attribute, attributeIndex) {

                if( !attribute.options && (product.attributes.length - 1) === attributeIndex ) {
                    def.resolve(true);
                }

                _.each(attribute.options, function (option, optionIndex) {

                    if (option && option.formats) {
                        if (!_.contains(option.formats, product.currentFormat.ID)) {
                            product.formatExcluded.push(option.ID);
                            if (product.selectedOptions[attribute.attrID] === option.ID) {
                                delete product.selectedOptions[attribute.attrID];
                            }
                        }
                    }

                    if( (product.attributes.length - 1) === attributeIndex && (attribute.options.length - 1) === optionIndex ) {
                        def.resolve(true)
                    }
                });
            });

            return def.promise;

        }

        function removeUnActiveOptions(product) {

            var def = $q.defer();

            var index = 0;
            _.each(product.attributeMap, function (attrID) {

                var attributeIndex = _.findIndex(product.attributes, {attrID: attrID});

                if (product.selectedOptions[attrID] === undefined) {

                    if( (product.attributeMap.length-1) > index ) {
                        def.resolve(true)
                    }

                } else {

                    if(attributeIndex > -1) {
                        if( product.attributes[attributeIndex].filteredOptions.length === 0 ) {
                            delete product.selectedOptions[attrID];
                        }
                    }

                    if( (product.attributeMap.length-1) > index ) {
                        def.resolve(true)
                    }

                }

                index++;
            });

            return def.promise;
        }

        function markEmptyOptions(product) {

            var def = $q.defer();

            var emptyOptions = [];
            var index = 0;

            if( _.size(product.selectedOptions) === 0 ) {
                def.resolve(emptyOptions);
            }

            _.each(product.selectedOptions, function (optID, attrID) {

                var idx = _.findIndex(product.attributes, {attrID: parseInt(attrID)});

                if (idx > -1) {
                    if (product.attributes[idx].filteredOptions.length === 0) {
                        emptyOptions.push(optID);
                    }

                    if( _.size(product.selectedOptions) -1 > index ) {
                        def.resolve(emptyOptions);
                    }


                } else {

                    if( _.size(product.selectedOptions) -1 > index ) {
                        def.resolve(emptyOptions);
                    }
                }

                index++;
            });

            return def.promise;
        }

        function removeEmptyOptionFromSelected(product, newProduct) {

            var def = $q.defer();

            markEmptyOptions(product).then(function (emptyOptions) {

                var index = 0;

                if( _.size(product.selectedOptions) === 0 ) {
                    def.resolve(false);
                }

                _.each(product.selectedOptions, function (optID, attrID) {

                    if (!optID) {

                        console.log('Lack of optID: ', optID);
                        console.log('attrID is:', attrID);

                        if( _.size(product.selectedOptions) -1 === index ) {
                            def.resolve(true);
                        }

                    } else {

                        if (!_.contains(emptyOptions, optID)) {
                            newProduct.options.push({
                                attrID: parseInt(attrID),
                                optID: optID
                            });

                            if( _.size(product.selectedOptions) -1 === index ) {
                                def.resolve(true);
                            }

                        } else {

                            if( _.size(product.selectedOptions) -1 === index ) {
                                def.resolve(true);
                            }

                        }
                    }

                    index++;
                });

            });

            return def.promise;
        }

        function prepareProductPromise(scope, newItem) {

            var def = $q.defer();

            newItem.products = [];
            _.each(scope.complexProducts, function (complexProduct, index) {

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

                removeEmptyOptionFromSelected(product, newProduct).then( function() {

                    newProduct.attrPages = product.attrPages;

                    if( product.info.noCalculate !== true) {
                        newItem.products.push(newProduct);
                    }

                    if ((scope.complexProducts.length - 1) === index) {
                        def.resolve(newItem);
                    }

                });

            });

            return def.promise;
        }

        return {
            removeEmptyOptionFromSelected: removeEmptyOptionFromSelected,
            checkFormatExclusions: checkFormatExclusions,
            removeUnActiveOptions: removeUnActiveOptions,
            prepareProductPromise: prepareProductPromise
        };

    });
