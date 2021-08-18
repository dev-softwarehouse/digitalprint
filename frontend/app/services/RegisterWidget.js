/**
 * Created by Rafał on 07-04-2017.
 */
angular.module('digitalprint.services').factory("RegisterWidget", function ($rootScope, $filter) {

    function initCodeRegister(scope, countries) {
        var upCode = $filter('uppercase')($rootScope.currentLang.code);

        scope.form.ad_countryCode = upCode;
        scope.form.del_countryCode = upCode;
        scope.form.fv_countryCode = upCode;

        var idx = _.findIndex(countries, {code: upCode});

        if (idx > -1) {
            if (countries[idx].areaCode !== undefined) {
                scope.form.ad_areaCode = countries[idx].areaCode;
                scope.form.del_areaCode = countries[idx].areaCode;
            }
        }
    }

    function initCodeWithoutRegister(scope, countries) {

        var upCode = $filter('uppercase')($rootScope.currentLang.code);

        scope.noRegisterForm.ad_countryCode = upCode;
        scope.noRegisterForm.fv_countryCode = upCode;

        var idx = _.findIndex(countries, {code: upCode});

        if (idx > -1) {
            if (countries[idx].areaCode !== undefined) {
                scope.noRegisterForm.ad_areaCode = countries[idx].areaCode;
            }
        }
    }

    function selectCountryRegister(scope, prefix) {
        var code = scope.form[prefix + '_countryCode'];

        var idx = _.findIndex(scope.countries, {code: code});

        if (idx > -1) {
            if (scope.countries[idx].areaCode !== undefined) {
                scope.form[prefix + '_areaCode'] = scope.countries[idx].areaCode;
            } else {
                scope.form[prefix + '_areaCode'] = '';
            }
        }
    }

    function selectCountryWithoutRegister(scope, prefix) {
        var code = scope.noRegisterForm[prefix + '_countryCode'];

        var idx = _.findIndex(scope.countries, {code: code});

        if (idx > -1) {
            if (scope.countries[idx].areaCode !== undefined) {
                scope.noRegisterForm[prefix + '_areaCode'] = scope.countries[idx].areaCode;
            } else {
                scope.noRegisterForm[prefix + '_areaCode'] = '';
            }
        }
    }

    function findFormAreaCode(scope, formName, code, oldVal) {
        if( code !== oldVal ) {

            var idx = _.findIndex(scope.countries, {code: code});

            if (idx > -1) {
                if (scope.countries[idx].areaCode !== undefined) {
                    scope[formName].areaCode = scope.countries[idx].areaCode;
                } else {
                    scope[formName].areaCode = '';
                }
            }
        }
    }

    return {
        initCodeRegister: initCodeRegister,
        initCodeWithoutRegister: initCodeWithoutRegister,
        selectCountryRegister: selectCountryRegister,
        selectCountryWithoutRegister: selectCountryWithoutRegister,
        findFormAreaCode: findFormAreaCode
    };
});
