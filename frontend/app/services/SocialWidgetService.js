/**
 * Created by Rafał on 21-08-2017.
 */
angular.module('digitalprint.services')
    .factory( 'SocialWidgetService', function ( AuthService, $state, $rootScope ) {

        function DeliveryWidgetService( json ) {
            angular.extend( this, json );
        }

        function loginGoogle() {
            gapi.load('auth2', function () {

                auth2 = gapi.auth2.init({
                    client_id: '345059472892-1fae8hutprcgcg3gk0i1dvdconjarcr0.apps.googleusercontent.com',
                    fetch_basic_profile: true,
                    scope: 'profile'
                });

                auth2.then(

                    function(){

                        if( !auth2.isSignedIn.get() ){

                            auth2.signIn().then(

                                //ok
                                function( user ){

                                    var id_token = user.getAuthResponse().id_token;
                                    var email = user.getBasicProfile().getEmail();
                                    var name = user.getBasicProfile().getGivenName();
                                    var lastName = user.getBasicProfile().getFamilyName();

                                    var data = {
                                        id_token: id_token,
                                        email: email,
                                        service: 'google',
                                        name: name,
                                        lastName: lastName
                                    };

                                    AuthService.loginWithGoogle( data ).then(

                                        //ok
                                        function( data ){
                                            $rootScope.$emit('CreditLimit:reload', true);
                                            $state.go("home");
                                        },

                                        // fial
                                        function( data ){

                                        }

                                    );

                                }

                            );

                        }else {

                            auth2.signIn().then(

                                //ok
                                function( user ){

                                    var id_token = user.getAuthResponse().id_token;
                                    var email = user.getBasicProfile().getEmail();
                                    var name = user.getBasicProfile().getGivenName();
                                    var lastName = user.getBasicProfile().getFamilyName();

                                    var data = {
                                        id_token: id_token,
                                        email: email,
                                        service: 'google',
                                        name: name,
                                        lastName: lastName
                                    };

                                    AuthService.loginWithGoogle( data ).then(
                                        function( data ){
                                            $rootScope.$emit('CreditLimit:reload', true);
                                            $state.go("home");
                                        },
                                        function( data ){



                                        }
                                    );

                                }

                            );

                        }


                    }

                );

            });
        }

        function loginFacebook() {

            FB.getLoginStatus(function(response) {

                if( response.status != 'connected' ){

                    FB.login( function( response ){

                        FB.api('/me?fields=name,email', function( response ){

                            var data = {
                                service: 'google',
                                email: response.email,
                                name: response.name.split(' ')[0],
                                lastName: response.name.split(' ')[1]
                            };

                            AuthService.loginWithFacebook( data ).then(
                                function( data ){
                                    $rootScope.$emit('CreditLimit:reload', true);
                                    $state.go("home");
                                },
                                function( data ){

                                }
                            );

                        }, {scope: 'email'});

                    }, {scope: 'email'});

                }else {

                    FB.api('/me?fields=name,email', function( response ){

                        var data = {
                            service: 'google',
                            email: response.email,
                            name: response.name.split(' ')[0],
                            lastName: response.name.split(' ')[1],
                        };

                        AuthService.loginWithFacebook( data ).then(
                            function( data ){
                                $rootScope.$emit('CreditLimit:reload', true);
                                $state.go("home");
                            },
                            function( data ){

                            }
                        );

                    }, {scope: 'email'});

                }

            });

        }
        
        return {
            loginGoogle: loginGoogle,
            loginFacebook: loginFacebook
        };
    });