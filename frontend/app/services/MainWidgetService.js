/**
 * Created by Rafał on 14-03-2017.
 */
angular.module('digitalprint.services')
    .factory( 'MainWidgetService', function (  $rootScope, $q, DpCategoryService, SettingService, PaymentService,
                                               $filter, $config, $http ) {

        function getMegaMenu() {
            var def = $q.defer();

            DpCategoryService.getCategoryTree().then( function(categories) {

                if( _.size(categories) > 0 ) {
                    def.resolve(categories);
                } else {
                    def.reject(false);
                }

            });

            return def.promise;
        }

        function getCreditLimit() {
            var def = $q.defer();

            PaymentService.getCreditLimit().then( function(data) {

                def.resolve(data);

            });

            return def.promise;
        }

        function getSkinName() {
            var def = $q.defer();

            var Setting = new SettingService('general');

            Setting.getSkinName().then( function(response) {

                def.resolve(response.skinName);

            });

            return def.promise;
        }

        function getForms() {

            var def = $q.defer();
            var Setting = new SettingService('forms');

            Setting.getPublicSettings().then( function(response) {

                def.resolve(response);

            });

            return def.promise;
        }

        function formatSizeUnits (bytes) {

            if (bytes >= 1073741824) {
                bytes = (bytes / 1073741824).toFixed(2) + ' GB';
            }
            else if (bytes >= 1048576) {
                bytes = (bytes / 1048576).toFixed(2) + ' MB';
            }
            else if (bytes >= 1024) {
                bytes = (bytes / 1024).toFixed(2) + ' KB';
            }
            else if (bytes > 1) {
                bytes = bytes + ' bytes';
            }
            else if (bytes === 1) {
                bytes = bytes + ' byte';
            }
            else {
                bytes = '0 byte';
            }
            return bytes;
        }

        function handleGoTop () {
            var offset = 300;
            var duration = 500;

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $(window).bind("touchend touchcancel touchleave", function(e){
                    if ($(this).scrollTop() > offset) {
                        $('.scroll-to-top').fadeIn(duration);
                    } else {
                        $('.scroll-to-top').fadeOut(duration);
                    }
                });
            } else {
                $(window).scroll(function() {
                    if ($(this).scrollTop() > offset) {
                        $('.scroll-to-top').fadeIn(duration);
                    } else {
                        $('.scroll-to-top').fadeOut(duration);
                    }
                });
            }
        }

        function getCreditLimitInfo() {

            if( $rootScope.logged ){
                getCreditLimit().then(function(data) {
                    if( data.response ) {


                        var languages = {};
                        languages.days = $filter('translate')('days');
                        languages.deferredPayment = $filter('translate')('deferral_of_payments');
                        languages.creditLimit = $filter('translate')('credit_limit');
                        if(data.limitExceeded) {
                            languages.creditLimit = $filter('translate')('credit_limit_exceeded');
                        }

                        data.tooltipInfo = languages.deferredPayment + '<br>'
                            + data.deferredDays + ' ' + languages.days + '<br>'
                            + languages.creditLimit + '<br>' + data.creditLimit
                            + '/' + data.unpaidValue + ' ' + data.baseCurrency;
                        $rootScope.creditLimit = data;
                    } else {
                        $rootScope.creditLimit = false;
                    }
                });
            } else {
                $rootScope.creditLimit = false;
            }
        }

        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        function setCookie(name, value, days) {
            var domainName = '.' + $rootScope.domainHost;
            if ($rootScope.domainHost == 'localhost') {
                domainName = 'localhost';
            }

            var expiration_date = new Date();
            expiration_date.setTime(expiration_date.getTime()+(days*24*60*60*1000));

            console.log( name + "=" + value + "; domain=" + domainName + "; path=/; expires=" + expiration_date.toUTCString() );

            document.cookie = name + "=" + value + "; domain=" + domainName + "; path=/; expires=" + expiration_date.toUTCString();
        }

        function includeTemplateVariables(scope, templateName, groupID, typeID, categoryID, all) {
            var def = $q.defer();

            var resource = 'templateVariables/getVariables';
            var params=['templateName='+templateName];
            if(groupID!=undefined){
                params.push('groupID='+groupID);
            }
           if(typeID!=undefined){
               params.push('typeID='+typeID);
            }
            if(categoryID!=undefined){
                params.push('categoryID='+categoryID);
            }
            if(all!=undefined){
                params.push('all='+all);
            }
            if(params.length>0){
                resource+='?'+params.join('&');
            }
            $http({
                method: 'GET',
                url: $config.API_URL + resource
            }).success(function (data) {
                if (data.response) {
                    def.resolve(data);
                } else {
                    def.reject(data);
                }
            }).error(function (data) {
                def.reject(data);
            });

            def.promise.then(function (resp) {
                resp.response.map(function (variable) {
                    scope[variable.name] = variable.value;
                })
            }, function (data) {
                console.log('load variables fail', data)
            });
        }

        function getTemplateVariable(scope, collection, itemType,id,variableName,defaultValue){
            var selectedCollection=scope[collection];
            if(selectedCollection){
                for(var i = 0; i<selectedCollection.length;i++){
                    if(selectedCollection[i].name===variableName && selectedCollection[i][itemType+'ID'] ==id){
                        return selectedCollection[i].value;
                    }

                }
            }
                return defaultValue;
        }


        return {
            getMegaMenu: getMegaMenu,
            getSkinName: getSkinName,
            getForms: getForms,
            formatSizeUnits: formatSizeUnits,
            handleGoTop: handleGoTop,
            getCreditLimitInfo: getCreditLimitInfo,
            getCookie: getCookie,
            setCookie: setCookie,
            includeTemplateVariables: includeTemplateVariables,
            getTemplateVariable: getTemplateVariable
        };
    });
