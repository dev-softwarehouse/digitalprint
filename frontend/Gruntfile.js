/* global require: true, console:true, module:true */

module.exports = function (grunt) {

    var path = require('path');

    var config = require('./configs/prod.config')({});

    var appOptions = config.get();

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var versionHash = '';
    if( grunt.option('versionHash') !== undefined ) {
        versionHash = grunt.option('versionHash');
    } else {
        var actDate = new Date();
        versionHash = actDate.getHours() + actDate.getMinutes() + actDate.getSeconds();
    }

    var gruntConfigs = {
        'hash': versionHash,
        'apiUrl': appOptions.apiUrl,
        'authUrl': appOptions.authUrl,
        'staticUrl': appOptions.staticUrl,
        'socketUrl': appOptions.socketUrl,
        'id': appOptions.id,
        'domainID': appOptions.domainID
    };

    if( grunt.option('apiUrl') !== undefined ) {
        gruntConfigs.apiUrl = grunt.option('apiUrl');
    }

    if( grunt.option('authUrl') !== undefined ) {
        gruntConfigs.authUrl = grunt.option('authUrl');
    }

    if( grunt.option('staticUrl') !== undefined ) {
        gruntConfigs.staticUrl = grunt.option('staticUrl');
    }

    if( grunt.option('domainID') !== undefined ) {
        gruntConfigs.domainID = grunt.option('domainID');
    }

    if( grunt.option('robots') !== undefined ) {
        gruntConfigs.robots = grunt.option('robots');
    } else {
        gruntConfigs.robots = 'all';
    }

    if( grunt.option('socketUrl') !== undefined ) {
        gruntConfigs.socketUrl = grunt.option('socketUrl');
    }

    if( grunt.option('id') !== undefined ) {
        gruntConfigs.id = grunt.option('id');
    }

    if( grunt.option('id') !== undefined &&
        appOptions.gaCodes[grunt.option('id')] !== undefined ) {
        gruntConfigs.mainFolder = appOptions.mainFolders[grunt.option('id')];
    } else {
        gruntConfigs.mainFolder = appOptions.mainFolders.default;
    }

    gruntConfigs.seo = appOptions.seo.default;
    gruntConfigs.gaCode = appOptions.gaCodes.default;
    gruntConfigs.googleToolId = appOptions.googleWebTools.default;

    grunt.initConfig({
        gruntConfigs: gruntConfigs,
        watch: {
            less: {
                files: [
                    'app/assets/less/**/*.less',
                    'app/assets/less/**/**/.less'
                ],
                tasks: [
                    'less:dev',
                    'replace:stylefonts'
                ]
            },
            templates: {
                files: [
                    'app/src/category/templates/calc/*.html',
                    'app/src/category/templates/panels/*.html',
                    'app/src/cart/templates/_cart.html',
                    'app/src/index/templates/_login.html',
                    'app/src/index/templates/_register.html',
                    'app/src/views/_forms/*.html',
                    'app/src/category/templates/modalboxes/_printoffer.html',
                    'app/src/category/templates/_configure-project.html',
                    'app/src/category/templates/_custom-product.html',
                    'app/src/cart/templates/_copy-product-modal.html',
                ],
                tasks: [
                    'processhtml:templates'
                ]
            },
            livereload: {
                options: {
                    livereload: 35729,
                    debounceDelay: 500
                },
                files: [
                    'app/{,**/}*.html',
                    'app/styles/{,**/}*.css',
                    'app/images/{,**/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        express: {
            dev: {
                options: {
                    port: 9001,
                    server: path.resolve('./server-dev')
                }
            },
            https: {
                options: {
                    port: 9001,
                    server: path.resolve('./server-dev-https')
                }
            },
            prod: {
                options: {
                    port: 9010,
                    server: path.resolve('./server-prod')
                }
            },
            ng2:{
                options: {
                    port: 9011,
                    server: path.resolve('./server-ng2')
                }
            }
        },

        clean: {
            js: ['./<%= gruntConfigs.mainFolder %>', './.tmp']
        },

        less: {
            options:{},
            dev: {
                files: [
                    {
                        expand: true,
                        cwd: './app/assets/less/skins',
                        src: [
                            '**/style.less'
                        ],
                        dest: './app/css/skins/',
                        ext: '.css'
                    }
                ],
                options: {
                    sourceMap: true,
                    sourceMapFilename: './app/css/digitalprint.css.map',
                    sourceMapURL: '/digitalprint.css.map',
                    sourceMapBasepath: 'app/css',
                    sourceMapRootpath: 'http://localhost:9001/'
                }
            },
            prod: {
                files: [
                    {
                        expand: true,
                        cwd: './app/assets/less/skins',
                        src: [
                            '**/style.less'
                        ],
                        dest: './.tmp/skins/',
                        ext: '.css'
                    }
                ]
            }
        },

        uncss: {
            dev: {
                options: {
                    ignore: [
                        '.breadcrumb',
                        '.breadcrumb > li',
                        '.breadcrumb > .active'
                    ],
                    uncssrc: 'uncssrc.json'
                },
                files: {
                    'app/digitalprint.uncss.css': [
                        'app/index.html',
                        'app/views/**/*.html',
                        'app/src/**/*.html'
                    ]
                }
            },
            prod: {
                options: {
                    ignore: ['.breadcrumb'],
                    uncssrc: 'uncssrc.json'
                },
                files: {
                    '.tmp/digitalprint.uncss.css': [
                        '<%= gruntConfigs.mainFolder %>/index.html',
                        '<%= gruntConfigs.mainFolder %>/views/**/*.html',
                        '<%= gruntConfigs.mainFolder %>/src/**/*.html'
                    ]
                }
            }
        },

        postcss: {
            dev: {
                options: {
                    map: false,
                    processors: [
                        require('pixrem')(), // add fallbacks for rem units
                        require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
                        require('cssnano')() // minify the result
                    ]
                },
                files: {
                    'app/digitalprint-<%= gruntConfigs.hash %>.css': '.tmp/digitalprint.uncss.css'
                }
            },
            prod: {
                options: {
                    map: false,
                    processors: [
                        require('pixrem')(), // add fallbacks for rem units
                        require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
                        require('cssnano')() // minify the result
                    ]
                },
                files: [
                    {
                        expand: true,
                        cwd: './.tmp/skins',
                        src: [
                            '**/style.css'
                        ],
                        dest: './<%= gruntConfigs.mainFolder %>/css/skins/',
                        rename: function (dest, src) {
                            return dest + src.replace('style', 'style-' + gruntConfigs.hash);
                        }
                    }
                ]
            }
        },

        replace: {
            stylefonts: {
                src: ['./app/css/skins/**/style.css'],
                overwrite: true,
                replacements: [{
                    from: '../fonts/',
                    to: '/assets/node_modules/font-awesome/fonts/'
                }, {
                    from: 'mCSB_buttons.png',
                    to: '../mCSB_buttons.png'
                }]
            },
            'stylefonts-prod': {
                //src: ['./.tmp/digitalprint.css'],
                src: ['./.tmp/skins/**/style.css'],
                overwrite: true,
                replacements: [{
                    from: '../fonts/',
                    to: '/assets/node_modules/font-awesome/fonts/'
                }]
            }
        },

        'sails-linker': {
            routes: {
                options: {
                    startTag: '<!--ROUTES-->',
                    endTag: '<!--ROUTES END-->',
                    appRoot: 'app'
                },
                files: {
                    './app/index.html': 'app/routes/**/*.js'
                }
            },
            helpers: {
                options: {
                    startTag: '<!--HELPERS-->',
                    endTag: '<!--HELPERS END-->',
                    appRoot: 'app'
                },
                files: {
                    './app/index.html': 'app/assets/helpers/**/*.js'
                }
            },
            modules: {
                options: {
                    startTag: '<!--MODULES-->',
                    endTag: '<!--MODULES END-->',
                    appRoot: 'app'
                },
                files: {
                    './app/index.html': ['app/src/**/*.js']
                }
            },
            services: {
                options: {
                    startTag: '<!--SERVICES-->',
                    endTag: '<!--SERVICES END-->',
                    appRoot: 'app'
                },
                files: {
                    './app/index.html': 'app/services/**/*.js'
                }
            },
            filters: {
                options: {
                    startTag: '<!--FILTERS-->',
                    endTag: '<!--FILTERS END-->',
                    appRoot: 'app'
                },
                files: {
                    './app/index.html': 'app/filters/**/*.js'
                }
            }
        },

        copy: {
            'build-dev': {
                files: [
                    {
                        expand: true,
                        dest: 'app/assets/',
                        cwd: '',
                        src: [
                            'node_modules/**/*.{js,css,map,png,jpg,woff,ttf,eot,svg,woff2}'
                        ]
                    },
                    {
                        src: 'node_modules/malihu-custom-scrollbar-plugin/mCSB_buttons.png',
                        dest: 'app/css/skins/mCSB_buttons.png'
                    },
                    {
                        src: 'libraries/uploaderStandalone.min.js',
                        dest: 'app/assets/libraries/uploaderStandalone.min.js'
                    },
                    {
                        src: 'libraries/turnjs/modernizr.2.5.3.min.js',
                        dest: 'app/assets/libraries/turnjs/modernizr.2.5.3.min.js'
                    },
                    {
                        src: 'libraries/turnjs/turn.min.js',
                        dest: 'app/assets/libraries/turnjs/turn.min.js'
                    },
                    {
                        src: 'libraries/turnjs/basic.css',
                        dest: 'app/assets/libraries/turnjs/basic.css'
                    },
                    {
                        src: 'node_modules/angular-recaptcha/release/angular-recaptcha.min.js',
                        dest: 'app/assets/node_modules/angular-recaptcha/release/angular-recaptcha.min.js'
                    },
                    {
                        src: 'libraries/socket/socket.io.slim.js',
                        dest: 'app/assets/libraries/socket/socket.io.slim.js'
                    },
                    {
                        src: 'node_modules/ulog/ulog.min.js',
                        dest: 'app/assets/libraries/ulog.min.js'
                    }
                ]
            },
            build: {
                files: [
                    {
                        src: 'node_modules/ulog/ulog.min.js',
                        dest: '<%= gruntConfigs.mainFolder %>/assets/libraries/ulog.min.js'
                    },
                    // scrollbar
                    {
                        src: 'node_modules/malihu-custom-scrollbar-plugin/mCSB_buttons.png',
                        dest: '<%= gruntConfigs.mainFolder %>/css/skins/mCSB_buttons.png'
                    },
                    // assets: angular helpers, images
                    {
                        expand: true,
                        cwd: 'app/',
                        dest: '<%= gruntConfigs.mainFolder %>/',
                        src: [
                            'assets/{helpers,img}/**/*.{js,png,jpg}'
                        ]
                    },
                    {
                        expand: true,
                        cwd: 'app/',
                        dest: '<%= gruntConfigs.mainFolder %>/',
                        src: [
                            'assets/libraries/*.js',
                            'assets/libraries/turnjs/*.js',
                            'assets/libraries/turnjs/*.css',
                            'assets/libraries/socket/*.js'
                        ]
                    },
                    {
                        expand: true,
                        cwd: 'app/',
                        dest: '<%= gruntConfigs.mainFolder %>/',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            'index.html'
                        ]
                    },
                    //todo: do usuniecia - po przeniesieniu .htacces i robots.txt do /app
                    {
                        expand: true,
                        dest: '<%= gruntConfigs.mainFolder %>/',
                        cwd: 'copy_prod/',
                        dot: true,
                        src: [
                            '404.html',
                            '\.htaccess',
                            'robots.txt'
                        ]
                    },
                    //todo: docelowo do usunięcia - po skompresowaniu skryptów
                    {
                        expand: true,
                        dest: '<%= gruntConfigs.mainFolder %>/assets/',
                        cwd: '',
                        src: [
                            'node_modules/**/*.{css,woff,ttf,eot,svg,woff2}'
                        ]
                    },
                    {
                        expand: true,
                        dest: '<%= gruntConfigs.mainFolder %>/assets/',
                        cwd: 'app/',
                        dot: true,
                        src: [
                            'node_modules/flag-icon-css/flags/*/*.svg'
                        ]
                    }
                ]
            },
            deploy: {
                files: [
                    {
                        expand: true,
                        cwd: 'app',
                        src: [
                            '*.html',
                            '{src,views}/**/*.html',
                            'views/backend/*.html'
                        ],
                        dest: '.tmp/deploy/'
                    }
                ]
            }
        },
        mkdir: {
            options: {},
            deploy: {
                options: {
                    create: [
                        '.tmp/' + grunt.option('id') + '/1/',
                        '.tmp/' + grunt.option('id') + '/2/',
                        '.tmp/' + grunt.option('id') + '/3/',
                        '.tmp/' + grunt.option('id') + '/4/',
                        '.tmp/' + grunt.option('id') + '/5/',
                        '.tmp/' + grunt.option('id') + '/6/',
                        '.tmp/' + grunt.option('id') + '/8/',
                        '.tmp/' + grunt.option('id') + '/9/',
                        '.tmp/' + grunt.option('id') + '/10/',
                        '.tmp/' + grunt.option('id') + '/11/',
                        '.tmp/' + grunt.option('id') + '/12/',
                        '.tmp/' + grunt.option('id') + '/13/',
                        '.tmp/' + grunt.option('id') + '/14/',
                        '.tmp/' + grunt.option('id') + '/22/',
                        '.tmp/' + grunt.option('id') + '/24/',
                        '.tmp/' + grunt.option('id') + '/26/',
                        '.tmp/' + grunt.option('id') + '/27/',
                        '.tmp/' + grunt.option('id') + '/28/',
                        '.tmp/' + grunt.option('id') + '/29/',
                        '.tmp/' + grunt.option('id') + '/30/',
                        '.tmp/' + grunt.option('id') + '/31/',
                        '.tmp/' + grunt.option('id') + '/33/',
                        '.tmp/' + grunt.option('id') + '/34/',
                        '.tmp/' + grunt.option('id') + '/35/',
                        '.tmp/' + grunt.option('id') + '/37/',
                        '.tmp/' + grunt.option('id') + '/62/',
                        '.tmp/' + grunt.option('id') + '/63/',
                        '.tmp/' + grunt.option('id') + '/64/',
                        '.tmp/' + grunt.option('id') + '/65/',
                        '.tmp/' + grunt.option('id') + '/66/',
                        '.tmp/' + grunt.option('id') + '/67/',
                        '.tmp/' + grunt.option('id') + '/68/',
                        '.tmp/' + grunt.option('id') + '/72/',
                        '.tmp/' + grunt.option('id') + '/73/',
                        '.tmp/' + grunt.option('id') + '/74/',
                        '.tmp/' + grunt.option('id') + '/75/',
                        '.tmp/' + grunt.option('id') + '/76/',
                        '.tmp/' + grunt.option('id') + '/77/',
                        '.tmp/' + grunt.option('id') + '/78/',
                        '.tmp/' + grunt.option('id') + '/79/',
                        '.tmp/' + grunt.option('id') + '/80/',
                        '.tmp/' + grunt.option('id') + '/81/',
                        '.tmp/' + grunt.option('id') + '/82/',
                        '.tmp/' + grunt.option('id') + '/83/',
                        '.tmp/' + grunt.option('id') + '/84/',
                        '.tmp/' + grunt.option('id') + '/85/',
                        '.tmp/' + grunt.option('id') + '/86/',
                        '.tmp/' + grunt.option('id') + '/87/',
                        '.tmp/' + grunt.option('id') + '/88/',
                        '.tmp/' + grunt.option('id') + '/89/',
                        '.tmp/' + grunt.option('id') + '/90/',
                        '.tmp/' + grunt.option('id') + '/91/',
                        '.tmp/' + grunt.option('id') + '/92/',
                        '.tmp/' + grunt.option('id') + '/93/',
                        '.tmp/' + grunt.option('id') + '/94/',
                        '.tmp/' + grunt.option('id') + '/95/',
                        '.tmp/' + grunt.option('id') + '/96/',
                        '.tmp/' + grunt.option('id') + '/97/',
                        '.tmp/' + grunt.option('id') + '/98/',
                        '.tmp/' + grunt.option('id') + '/99/',
                        '.tmp/' + grunt.option('id') + '/100/',
                        '.tmp/' + grunt.option('id') + '/101/',
                        '.tmp/' + grunt.option('id') + '/102/',
                        '.tmp/' + grunt.option('id') + '/103/',
                        '.tmp/' + grunt.option('id') + '/104/',
                        '.tmp/' + grunt.option('id') + '/105/',
                        '.tmp/' + grunt.option('id') + '/106/',
                        '.tmp/' + grunt.option('id') + '/108/',
                        '.tmp/' + grunt.option('id') + '/109/',
                        '.tmp/' + grunt.option('id') + '/110/',
                        '.tmp/' + grunt.option('id') + '/111/',
                        '.tmp/' + grunt.option('id') + '/112/',
                        '.tmp/' + grunt.option('id') + '/114/',
                        '.tmp/' + grunt.option('id') + '/115/',
                        '.tmp/' + grunt.option('id') + '/116/',
                        '.tmp/' + grunt.option('id') + '/117/',
                        '.tmp/' + grunt.option('id') + '/118/',
                        '.tmp/' + grunt.option('id') + '/119/',
                        '.tmp/' + grunt.option('id') + '/120/',
                        '.tmp/' + grunt.option('id') + '/121/',
                    ]
                }
            }
        },
        rename: {
            deploy: {
                files: [
                    {
                        src: '.tmp/deploy/views/footer.html',
                        dest: '.tmp/' + grunt.option('id') + '/1/footer.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/content.html',
                        dest: '.tmp/' + grunt.option('id') + '/2/content.html'
                    },
                    {
                        src: '.tmp/deploy/views/header.html',
                        dest: '.tmp/' + grunt.option('id') + '/3/header.html'
                    },
                    {
                        src: '.tmp/deploy/views/slider.html',
                        dest: '.tmp/' + grunt.option('id') + '/4/slider.html'
                    },
                    {
                        src: '.tmp/deploy/views/footer-news.html',
                        dest: '.tmp/' + grunt.option('id') + '/5/footer-news.html'
                    },
                    {
                        src: '.tmp/deploy/views/footer-links.html',
                        dest: '.tmp/' + grunt.option('id') + '/6/footer-links.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/cart.html',
                        dest: '.tmp/' + grunt.option('id') + '/8/cart.html'
                    },
                    {
                        src: '.tmp/deploy/views/main.html',
                        dest: '.tmp/' + grunt.option('id') + '/9/main.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/login.html',
                        dest: '.tmp/' + grunt.option('id') + '/10/login.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/register.html',
                        dest: '.tmp/' + grunt.option('id') + '/11/register.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/password-remind.html',
                        dest: '.tmp/' + grunt.option('id') + '/12/password-remind.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/news.html',
                        dest: '.tmp/' + grunt.option('id') + '/13/news.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/contact.html',
                        dest: '.tmp/' + grunt.option('id') + '/14/contact.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone.html',
                        dest: '.tmp/' + grunt.option('id') + '/22/client-zone.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-orders.html',
                        dest: '.tmp/' + grunt.option('id') + '/24/client-zone-orders.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-offers.html',
                        dest: '.tmp/' + grunt.option('id') + '/26/client-zone-offers.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-reclamations.html',
                        dest: '.tmp/' + grunt.option('id') + '/27/client-zone-reclamations.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/category.html',
                        dest: '.tmp/' + grunt.option('id') + '/28/category.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/group.html',
                        dest: '.tmp/' + grunt.option('id') + '/29/group.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/calc.html',
                        dest: '.tmp/' + grunt.option('id') + '/30/calc.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/modalboxes/address-modal.html',
                        dest: '.tmp/' + grunt.option('id') + '/31/address-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/cart-verify.html',
                        dest: '.tmp/' + grunt.option('id') + '/33/cart-verify.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/modalboxes/upload-files.html',
                        dest: '.tmp/' + grunt.option('id') + '/34/upload-files-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/logout-in-progress.html',
                        dest: '.tmp/' + grunt.option('id') + '/37/logout-in-progress.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-data.html',
                        dest: '.tmp/' + grunt.option('id') + '/62/client-zone-data.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-change-pass.html',
                        dest: '.tmp/' + grunt.option('id') + '/63/client-zone-change-pass.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-invoice-data.html',
                        dest: '.tmp/' + grunt.option('id') + '/64/client-zone-invoice-data.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/edit-delivery-address.html',
                        dest: '.tmp/' + grunt.option('id') + '/65/edit-delivery-address.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-delivery-data.html',
                        dest: '.tmp/' + grunt.option('id') + '/66/client-zone-delivery-data.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/modalboxes/show-delivery.html',
                        dest: '.tmp/' + grunt.option('id') + '/67/show-delivery-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/order-addresses-list.html',
                        dest: '.tmp/' + grunt.option('id') + '/68/order-addresses-list.html'
                    },
                    {
                        src: '.tmp/deploy/views/modalboxes/confirm.html',
                        dest: '.tmp/' + grunt.option('id') + '/35/confirm-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/payment.html',
                        dest: '.tmp/' + grunt.option('id') + '/72/payment-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/modalboxes/printoffer.html',
                        dest: '.tmp/' + grunt.option('id') + '/73/printoffer-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-my-folders.html',
                        dest: '.tmp/' + grunt.option('id') + '/74/client-zone-my-folders.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/add-folder.html',
                        dest: '.tmp/' + grunt.option('id') + '/75/add-folder-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-my-photos.html',
                        dest: '.tmp/' + grunt.option('id') + '/76/client-zone-my-photos.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/edit-photo.html',
                        dest: '.tmp/' + grunt.option('id') + '/77/edit-photo-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/move-photo.html',
                        dest: '.tmp/' + grunt.option('id') + '/78/move-photo-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/photo-map.html',
                        dest: '.tmp/' + grunt.option('id') + '/79/photo-map-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/photo-map-folder.html',
                        dest: '.tmp/' + grunt.option('id') + '/80/photo-map-folder-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/folder-share.html',
                        dest: '.tmp/' + grunt.option('id') + '/81/folder-share-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/folder-facebook.html',
                        dest: '.tmp/' + grunt.option('id') + '/82/folder-facebook-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/photo-folders/templates/shared-folder.html',
                        dest: '.tmp/' + grunt.option('id') + '/83/shared-folder.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-my-projects.html',
                        dest: '.tmp/' + grunt.option('id') + '/84/client-zone-my-projects.html'
                    },
                    {
                        src: '.tmp/deploy/src/photo-folders/templates/shared-photo.html',
                        dest: '.tmp/' + grunt.option('id') + '/85/shared-photo.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/photo-share.html',
                        dest: '.tmp/' + grunt.option('id') + '/86/photo-share-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/photo-facebook.html',
                        dest: '.tmp/' + grunt.option('id') + '/87/photo-facebook-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/photo-map-global.html',
                        dest: '.tmp/' + grunt.option('id') + '/88/photo-map-global-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/photo-masks.html',
                        dest: '.tmp/' + grunt.option('id') + '/89/photo-masks-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/photo-add-tags.html',
                        dest: '.tmp/' + grunt.option('id') + '/90/photo-add-tags-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/search.html',
                        dest: '.tmp/' + grunt.option('id') + '/91/search.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/modalboxes/join-deliveries.html',
                        dest: '.tmp/' + grunt.option('id') + '/92/join-deliveries-modal.html'
                    },
                    {
                        src: '.tmp/deploy/views/_forms/contact-form.html',
                        dest: '.tmp/' + grunt.option('id') + '/93/contact-form.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/project-share.html',
                        dest: '.tmp/' + grunt.option('id') + '/94/project-share-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/photo-folders/templates/shared-project.html',
                        dest: '.tmp/' + grunt.option('id') + '/95/shared-project.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/project-facebook.html',
                        dest: '.tmp/' + grunt.option('id') + '/96/project-facebook-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/modalboxes/add-reciever-address.html',
                        dest: '.tmp/' + grunt.option('id') + '/97/add-reciever-address-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/modalboxes/add-invoice-address.html',
                        dest: '.tmp/' + grunt.option('id') + '/98/add-invoice-address-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-search.html',
                        dest: '.tmp/' + grunt.option('id') + '/99/client-zone-search.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/create-reclamation.html',
                        dest: '.tmp/' + grunt.option('id') + '/100/create-reclamation.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/reclamation-messages.html',
                        dest: '.tmp/' + grunt.option('id') + '/101/reclamation-messages-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/sitemap.html',
                        dest: '.tmp/' + grunt.option('id') + '/102/sitemap.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/order-messages.html',
                        dest: '.tmp/' + grunt.option('id') + '/103/order-messages-modal.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/modalboxes/addresses.html',
                        dest: '.tmp/' + grunt.option('id') + '/104/addresses-modal.html'
                    },
                    {
                        src: '.tmp/deploy/views/backend/products-list-mail.html',
                        dest: '.tmp/' + grunt.option('id') + '/105/products-list-mail.html'
                    },
                    {
                        src: '.tmp/deploy/views/backend/product-files-list.html',
                        dest: '.tmp/' + grunt.option('id') + '/106/product-files-list.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/select-project.html',
                        dest: '.tmp/' + grunt.option('id') + '/108/select-project.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/configure-project.html',
                        dest: '.tmp/' + grunt.option('id') + '/109/configure-project.html'
                    },
                    {
                        src: '.tmp/deploy/views/backend/invoice-print.html',
                        dest: '.tmp/' + grunt.option('id') + '/110/invoice-print.html'
                    },
                    {
                        src: '.tmp/deploy/views/backend/card-product-print.html',
                        dest: '.tmp/' + grunt.option('id') + '/111/card-product-print.html'
                    },
                    {
                        src: '.tmp/deploy/src/category/templates/custom-product.html',
                        dest: '.tmp/' + grunt.option('id') + '/112/custom-product.html'
                    },
                    {
                        src: '.tmp/deploy/src/client-zone/templates/client-zone-offers.html',
                        dest: '.tmp/' + grunt.option('id') + '/114/client-zone-offers.html'
                    },
                    {
                        src: '.tmp/deploy/src/cart/templates/modalboxes/copy-product-modal.html',
                        dest: '.tmp/' + grunt.option('id') + '/115/copy-product-modal.html'
                    },
                    {
                        src: '.tmp/deploy/views/header-in-cart.html',
                        dest: '.tmp/' + grunt.option('id') + '/116/header-in-cart.html'
                    },
                    {
                        src: '.tmp/deploy/views/footer-in-calc.html',
                        dest: '.tmp/' + grunt.option('id') + '/117/footer-in-calc.html'
                    },
                    {
                        src: '.tmp/deploy/views/footer-in-cart.html',
                        dest: '.tmp/' + grunt.option('id') + '/118/footer-in-cart.html'
                    },
                    {
                        src: '.tmp/deploy/views/backend/print-offer.html',
                        dest: '.tmp/' + grunt.option('id') + '/119/print-offer.html'
                    },
                    {
                        src: '.tmp/deploy/views/errors/404.html',
                        dest: '.tmp/' + grunt.option('id') + '/120/404.html'
                    },
                    {
                        src: '.tmp/deploy/src/index/templates/confirm-newsletter.html',
                        dest: '.tmp/' + grunt.option('id') + '/121/confirm-newsletter.html'
                    },
                ]
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            dist: {
                src: [
                    'app/*.js',
                    'app/routes/**/*.js',
                    'app/assets/helpers/**/*.js',
                    'app/src/**/*.js',
                    'app/services/**/*.js',
                    'app/filters/**/*.js'
                ],
                dest: '.tmp/scripts.js'
            },
            extras: {
                src: [
                    //external
                    'node_modules/lodash/index.js',
                    'node_modules/jquery/dist/jquery.min.js',
                    'app/assets/libraries/jquery-ui/jquery-ui.js',
                    'node_modules/bootstrap/dist/js/bootstrap.min.js',
                    'node_modules/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js',
                    //angular
                    'node_modules/angular/angular.js',
                    'node_modules/angular-ui-router/release/angular-ui-router.js',
                    'node_modules/restangular/dist/restangular.min.js',
                    'node_modules/angular-local-storage/dist/angular-local-storage.js',
                    'node_modules/angular-bootstrap/ui-bootstrap.js',
                    'node_modules/angular-bootstrap/ui-bootstrap-tpls.js',
                    'node_modules/angular-animate/angular-animate.js',
                    'node_modules/angular-breadcrumb/dist/angular-breadcrumb.js',
                    'node_modules/angular-translate/dist/angular-translate.js',
                    'node_modules/angular-translate/dist/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
                    'node_modules/rangy/lib/rangy-core.js',
                    'node_modules/rangy/lib/rangy-selectionsaverestore.js',
                    'node_modules/textangular/dist/textAngular-sanitize.min.js',
                    'node_modules/textangular/dist/textAngular.min.js',
                    'node_modules/angular-cookies/angular-cookies.js',
                    'node_modules/angular-ui-sortable/dist/sortable.js',
                    'node_modules/angular-socket-io/socket.js',
                    'node_modules/angular-file-upload/angular-file-upload.js',
                    'node_modules/angular-carousel/dist/angular-carousel.min.js',
                    'node_modules/angular-touch/angular-touch.min.js',
                    'node_modules/angular-ui-notification/src/angular-ui-notification.js',
                    'node_modules/angular-recaptcha/release/angular-recaptcha.min.js',
                    'node_modules/angular-ui-notification/dist/angular-ui-notification.min.js',
                    'node_modules/angular-paging/dist/paging.min.js',
                    'node_modules/angular-responsive-tables/release/angular-responsive-tables.min.js',
                    'node_modules/moment/min/moment-with-locales.js',
                    'node_modules/bootstrap-daterangepicker/daterangepicker.js',
                    'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
                    'node_modules/ng-scrollbars/dist/scrollbars.min.js',
                    'node_modules/angularjs-slider/dist/rzslider.min.js',
                    'node_modules/angular-recaptcha/release/angular-recaptcha.min.js',
                    'node_modules/angular-update-meta/dist/update-meta.min.js',
                    //helpers
                    'app/assets/helpers/angular-api-collection/angular-api-collection.js',
                    'app/assets/helpers/angular-api-collection/angular-api-pagination.js',
                    // libraries
                    'app/assets/libraries/uploaderStandalone.min.js',
                    'app/assets/libraries/turnjs/modernizr.2.5.3.min.js',
                    'app/assets/libraries/turnjs/turn.min.js',
                    'node_modules/clipboard/dist/clipboard.js',
                    'app/assets/libraries/ngGallery/src/js/ngGallery.js'
                ],
                dest: '.tmp/scripts-extras.js',
                nonull: true
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app1: {
                files: {
                    '.tmp/scripts.js': ['.tmp/scripts.js'],
                    '.tmp/scripts-extras.js': ['.tmp/scripts-extras.js']
                }
            }
        },

        uglify: {
            options: {
            },
            build: {
                files: {
                    '<%= gruntConfigs.mainFolder %>/scripts/scripts-<%= gruntConfigs.hash %>.min.js': ['.tmp/scripts.js'],
                    '<%= gruntConfigs.mainFolder %>/scripts/scripts.extras-<%= gruntConfigs.hash %>.min.js': ['.tmp/scripts-extras.js']
                }
            }
        },

        processhtml: {
            options: {
                data: {
                    message: '<%= gruntConfigs.hash %>',
                    staticUrl: '<%= gruntConfigs.staticUrl %>',
                    apiUrl:  '<%= gruntConfigs.apiUrl %>',
                    id: '<%= gruntConfigs.id %>',
                    gaCode: '<%= gruntConfigs.gaCode %>',
                    seoTitle: '<%= gruntConfigs.seo.title %>',
                    seoDescription: '<%= gruntConfigs.seo.description %>',
                    seoKeywords: '<%= gruntConfigs.seo.keywords %>',
                    googleToolId: '<%= gruntConfigs.googleToolId %>',
                    domainID: '<%= gruntConfigs.domainID %>',
                    robots: '<%= gruntConfigs.robots %>'
                },
                recursive: true
            },
            '<%= gruntConfigs.mainFolder %>': {
                files: {
                    '<%= gruntConfigs.mainFolder %>/index.tmp.html': ['app/index.html']
                }
            },
            templates: {
                files: {
                    'app/src/category/templates/calc.html': ['app/src/category/templates/calc/default.html'],
                    'app/src/category/templates/calc-10.html': ['app/src/category/templates/calc/10.html'],
                    'app/src/category/templates/calc-unidruk.html': ['app/src/category/templates/calc/unidruk.html'],
                    'app/src/cart/templates/cart.html': ['app/src/cart/templates/_cart.html'],
                    'app/src/index/templates/login.html': ['app/src/index/templates/_login.html'],
                    'app/src/index/templates/register.html': ['app/src/index/templates/_register.html'],
                    'app/src/category/templates/modalboxes/printoffer.html': ['app/src/category/templates/modalboxes/_printoffer.html'],
                    'app/src/category/templates/configure-project.html': ['app/src/category/templates/_configure-project.html'],
                    'app/src/category/templates/custom-product.html': ['app/src/category/templates/_custom-product.html'],
                    'app/src/cart/templates/modalboxes/copy-product-modal.html': ['app/src/cart/templates/modalboxes/_copy-product-modal.html'],
                }
            }
        },
        'string-replace': {
            dist: {
                files: {
                    '.tmp/scripts.js': ['.tmp/scripts.js'],
                    '<%= gruntConfigs.mainFolder %>/assets/libraries/metaTags.js': ['<%= gruntConfigs.mainFolder %>/assets/libraries/metaTags.js']
                },
                options: {
                    replacements: [
                        {
                            pattern: /REPLACE_API_URL/i,
                            replacement: '<%= gruntConfigs.apiUrl %>'
                        },
                        {
                            pattern: /REPLACE_AUTH_URL/i,
                            replacement: '<%= gruntConfigs.authUrl %>'
                        },
                        {
                            pattern: /REPLACE_STATIC_URL/i,
                            replacement: '<%= gruntConfigs.staticUrl %>'
                        },
                        {
                            pattern: /REPLACE_SOCKET_URL/i,
                            replacement: '<%= gruntConfigs.socketUrl %>'
                        }
                    ]
                }
            }
        },
        fetchJson: {
            options: {
                method: 'GET'
            },
            files: {
                '<%= gruntConfigs.mainFolder %>/snapshots/tmp.json': 'https://static.digitalprint.pro/' + grunt.option('id') + '/sitemaps/' + grunt.option('domainID') + '.json'
            }
        },
        htmlSnapshot: {
            all: {
                options: {
                    snapshotPath: '<%= gruntConfigs.mainFolder %>/snapshots/' + grunt.option('id') + '/' + grunt.option('domainID') + '/',
                    //This should be either the base path to your index.html file
                    //or your base URL. Currently the task does not use it's own
                    //webserver. So if your site needs a webserver to be fully
                    //functional configure it here.
                    sitePath: grunt.option('site'),
                    //you can choose a prefix for your snapshots
                    //by default it's 'snapshot_'
                    fileNamePrefix: '',
                    //by default the task waits 500ms before fetching the html.
                    //this is to give the page enough time to to assemble itself.
                    //if your page needs more time, tweak here.
                    msWaitForPages: 3000,
                    //sanitize function to be used for filenames. Converts '#!/' to '_' as default
                    //has a filename argument, must have a return that is a sanitized string
                    sanitize: function (requestUri) {

                        //returns 'index.html' if the url is '/', otherwise a prefix
                        if (/\/$/.test(requestUri)) {
                            return '_';
                        } else {
                            return requestUri.replace(/\//g, '_');
                        }
                    },
                    //if you would rather not keep the script tags in the html snapshots
                    //set `removeScripts` to true. It's false by default
                    removeScripts: false,
                    //set `removeLinkTags` to true. It's false by default
                    removeLinkTags: false,
                    //set `removeMetaTags` to true. It's false by default
                    removeMetaTags: false,
                    //Replace arbitrary parts of the html
                    replaceStrings:[
                        //{'this': 'will get replaced by this'},
                        //{'/old/path/': '/new/path'}
                    ],
                    // allow to add a custom attribute to the body
                    bodyAttr: 'data-prerendered',
                    //here goes the list of all urls that should be fetched
                    urls: grunt.file.readJSON('copy_prod/tmp.json'),/*[
                        '/',
                        '/pl/strona/kontakt'
                    ],*/
                    // a list of cookies to be put into the phantomjs cookies jar for the visited page
                    cookies: [
                        {"path": "/", "lang": "pl", "value": "en-gb"}
                    ],
                    // options for phantomJs' page object
                    // see http://phantomjs.org/api/webpage/ for available options
                    pageOptions: {
                        viewportSize : {
                            width: 1200,
                            height: 800
                        }
                    }
                }
            }
        }
    });

    grunt.registerTask('build', [
        'clean',
        'sails-linker',
        'less:prod',
        'copy:build',
        'concat',
        'string-replace',
        'ngAnnotate',
        'uglify:build',
        'replace:stylefonts-prod',
        'postcss:prod',
        'processhtml'
    ]);

    grunt.registerTask('serve', [
        'sails-linker',
        'less:dev',
        'copy:build-dev',
        'replace:stylefonts',
        'express:dev',
        'watch',
        'processhtml'
    ]);

    grunt.registerTask('serve-dev2', [
        'express:dev',
        'watch'
    ]);

    grunt.registerTask('serve-https', [
        'express:https',
        'watch'
    ]);

    grunt.registerTask('serve-prod', [
        'build',
        'express:prod',
        'watch'
    ]);

    grunt.registerTask('serve-prod2', [
        'express:prod',
        'watch'
    ]);

    grunt.registerTask('serve-ng2', [
        'express:ng2',
        'watch'
    ]);

    grunt.registerTask('minify', [
        'clean',
        'concat',
        'ngAnnotate',
        'uglify:build'
    ]);

    grunt.registerTask('deploy-ftp', [
        'build',
        'copy:deploy',
        'mkdir:deploy',
        'rename:deploy'
    ]);

    grunt.registerTask('deploy-cloud', [
        'build'
    ]);

    grunt.registerTask('pre-render', [
        'fetchJson',
        'htmlSnapshot'
    ]);

    grunt.registerTask('default', ['serve']);

    grunt.registerTask('test', ['processhtml']);
};
