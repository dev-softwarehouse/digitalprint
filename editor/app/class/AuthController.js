
    function setCookie(cname, cvalue, exdays=1) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        const cookieStr=`${cname}=${cvalue};${expires};domain=${EDITOR_ENV.domain};path=/`;
        document.cookie =  cookieStr;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
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

	function AuthController( editor ){

        this.editor = editor;
        this.serviceUrl = `${EDITOR_ENV.authUrl}/`;
        this.checkUrl = `${EDITOR_ENV.frameworkUrl}/auth/check`;

	};

	AuthController.prototype.login = function( email, password ){

	}

    AuthController.prototype.alert = function( name ){



    }

    AuthController.prototype.getNonUserToken = function( callback ){

        var _this = this;

        $.ajax({

            url: this.serviceUrl + 'getNonUserToken',
            data: { domainName: 'dreamsoft.pro'},
            method: 'POST'

        }).done( function( resp ){

            //console.log('ROBIE CIASTECZKO');
            _this.token = resp.token,
            setCookie('access-token', resp.token );
            callback( resp.token );

        })

    }

    AuthController.prototype.getUserData = function( callback ){

        var self = this;
        //console.log('biore info o uzytkowniku');
        $.ajax({

            url: this.checkUrl,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "access-token": getCookie('access-token')
            },
            method: "GET"

        }).done( function( resp ){

            callback( resp['access-token'] );


        }).fail(function( resp ) {

            //console.log('jest wszystko ok');
            self.editor.user.setID( JSON.parse( resp.responseText ).userEditorID );

            if( JSON.parse( resp.responseText ).userEditorID != '' ){

                callback( JSON.parse( resp.responseText ).token );
            }

        });

    }

    AuthController.prototype.checkSession = function(){
        var cookie = getCookie( 'access-token' );
        //console.log('jest ciastko');
        if( cookie ){
            //console.log('zwracam true');
            return true;

        }else {

            return false;

        }

    };

    // Initialize, and display login Window.
    AuthController.prototype.initLoginWindow = function( callback ){

        var _this = this;

        $.ajax({

            url : 'templates/login.html',
            type : 'GET',
            crossDomain : true,
            success : function( data ){

                $('body').append( data );

                $('#loginForm').on('shown.bs.modal', function() {
                    $(this).find('.modal-dialog').css({
                        'margin-top': function () {
                            return (window.innerHeight/2-($(this).outerHeight() / 2));
                        },
                        'margin-left': function () {
                            return (window.innerWidth/2-($(this).outerWidth() / 2));
                        }
                    });
                });

                $('#loginForm').on( 'hidden.bs.modal', function(){
                    $(this).remove();
                });

                $('#loginForm').modal({
                    keyboard: false
                });

                $('#asGuest').on('click', function(){

                    _this.getNonUserToken( callback );

                });

            },

        });


    }

    export {AuthController};
