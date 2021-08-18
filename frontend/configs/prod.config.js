module.exports = function (appOptions) {

    appOptions.apiUrl = 'https://api.dreamsoft.pro/';
    appOptions.authUrl = 'https://logowanie.dreamsoft.pro/';
    appOptions.staticUrl = 'https://static.dreamsoft.pro/';
    appOptions.socketUrl = 'https://dreamsoft.pro:2600';
    appOptions.gaCodes = {
        'default': '$INDEX_GA_CODE',
        '25': 'UA-36322727-3',
        '35': 'UA-36322727-3',
        '189': 'UA-36322727-3',
        '202': 'UA-34533109-1',
        '684': 'UA-117353052-1',
        '697': 'UA-4459256-5'
    };

    appOptions.mainFolders = {
        'default': 'dist',
        '25': 'dist',
        '35': 'dist',
        '189': 'dist',
        '202': 'dist',
        '684': 'dist',
        '697': 'dist'
    };

    appOptions.seo = {
        'default': {
            title: '$INDEX_SEO_TITLE',
            description: '$INDEX_SEO_DESCRIPTION',
            keywords: '$INDEX_SEO_KEYWORDS'
        },
        '25': {
            title: 'web-to-print Oprogramowanie dla drukarni - Printworks.pl',
            description: 'program do wyceny produktów poligraficznych działający online',
            keywords: 'web2print, wyceny poligraficzne, kalkulator poligraficzny'
        },
        '35': {
            title: 'akipka - web-to-print Oprogramowanie dla drukarni',
            description: 'program do wyceny produktów poligraficznych działający online',
            keywords: 'web2print, wyceny poligraficzne, kalkulator poligraficzny'
        },
        '189': {
            title: 'Drukarnia Internetowa Printum Online',
            description: 'Ulotki Plakaty Wizytówki Katalogi Kalendarze',
            keywords: 'Ulotki, Plakaty, Wizytówki, Katalogi, Kalendarze'
        },
        '202': {
            title: 'CYFRUS.PL - Drukarnia Wrocław',
            description: 'drukarnia, drukarnia Wrocław, drukarnia internetowa, drukarnia online, drukarnia cyfrowa, druk, druk Wrocław,  druk cyfrowy, druk online',
            keywords: 'Drukarnia CYFRUS.PL - Wrocław ★★★★★ Najwyższa jakość druku, ekspresowa realizacja i niskie ceny! Zapraszamy do sprawdzenia cen i składania zamówień online lub bezpośrednio w biurze drukarni.'
        },
        '684': {
            title: 'goprint24.pl - Drukarnia cyfrowa i wielkoformatowa on-line',
            description: 'Wszystkie usługi poligraficzne w jednym miejscu. Drukarnia cyfrowa i wielkoformatowa online.',
            keywords: 'drukarnia cyfrowa, drukarnia wielkoformatowa, drukarnia online, drukowanie online, copynet, kielce'
        },
        '697': {
            title: 'Unidruk - drukarnia internetowa',
            description: 'tanie kalendarze, drukarnia internetowa, szybka realizacja',
            keywords: 'kalendarze, kalendarze trójdzielne, kalendarze planszowe, kalendarze biurkowe'
        }
    };

    appOptions.googleWebTools = {
        'default': '$INDEX_SEARCH_CONSOLE_CODE',
        '25': 'XGsJT-j-17p9TvIqZWlH75avc1mmqhTmCbUbs1_V_DU',
        '35': '8vFjBFykaB6iFex6D3vxJMHkX3wgnRCh-ceGVIkDv5I',
        '189': '',
        '202': '',
        '684': '',
        '697': ''
    };

    function get() {
        return appOptions;
    }

    return {
        get: get
    }
};
