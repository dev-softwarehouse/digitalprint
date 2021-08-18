window.metaTag = (function () {
    function MetaTags() {
        this.gaIdCode = '';
    }

    MetaTags.prototype.getRoute = function (path, accessToken, lang) {

        lang = lang.replace(/["]+/g, '');

        var mainURL = 'REPLACE_API_URL';
        var mainURLTest = 'REPLACE-API-URL';
        var API_URL = null;

        if (mainURL === mainURLTest.replace(/\-/g, '_')) {
            API_URL = 'http://localtest.me/api/';
        } else {
            API_URL = mainURL;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', API_URL + 'routes/getRouteByUrl');
        xhr.setRequestHeader("access-token", accessToken);
        xhr.setRequestHeader("lang", lang);
        xhr.setRequestHeader("x-http-method-override", 'patch');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send('url=' + path);
        xhr.onload = function () {
            if (xhr.status === 200) {

                var mainTags = JSON.parse(xhr.responseText);

                /*setInterval(function() {

                    if( document.body ) {
                        if( typeof globalRoutes === 'undefined' ) {
                            var parentRoutes = document.body;
                            var script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.innerHTML = "var globalRoutes = " + mainTags.routing;
                            parentRoutes.appendChild(script);
                        }
                        clearInterval(this);
                    }

                }, 100);*/

                if (document.title != mainTags.mainTagLanguage.title) {
                    document.title = mainTags.mainTagLanguage.title;
                }

                var metaList = document.getElementsByTagName("META");
                for(var i=0;i<metaList.length;i++) {
                    if( metaList[i].name === 'description') {
                        metaList[i].setAttribute('content', mainTags.mainTagLanguage.description);
                    }
                    if( metaList[i].name === 'keywords') {
                        metaList[i].setAttribute('content', mainTags.mainTagLanguage.keywords);
                    }
                }

                var gaScriptElement = document.getElementById('ga-script');
                if(gaScriptElement) {
                    gaScriptElement.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=' + mainTags.gaIdCode);
                }


                var faviconLinkElement = document.getElementById('favicon-link');
                if( typeof faviconLinkElement !== "undefined" && faviconLinkElement) {
                    faviconLinkElement.setAttribute('href', mainTags.STATIC_URL + mainTags.companyID + '/images/favicon.ico');
                }

                var metaOgImageElement = document.getElementById('meta-og-image');
                if( typeof metaOgImageElement !== "undefined" && metaOgImageElement ) {
                    metaOgImageElement.setAttribute('content', mainTags.STATIC_URL + 'uploadedFiles/' + mainTags.companyID + 'logo');
                }


                window.gaIdCode = mainTags.gaIdCode;
            }
        };
    };

    var metaTag = {
        getPath: function () {
            return window.location.pathname;
        },
        getCookie: function(cname) {
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
        },
        getMeta: function () {
            var path = this.getPath();
            var m = new MetaTags();
            m.getRoute(path, this.getCookie('access-token'), this.getCookie('lang'));
        },
        loop: function() {
            var oldURL = "";
            var currentURL = window.location.pathname;
            var that = this;
            function checkURLchange(currentURL){
                if(currentURL != oldURL){
                    console.log('target');
                    that.getMeta();
                    oldURL = currentURL;
                }
                oldURL = window.location.pathname;
            }

            setInterval(function() {
                checkURLchange(window.location.pathname);
            }, 500);
        },
        init: function() {
            this.getMeta();
        }
    };

    return metaTag;
}());

metaTag.init();
