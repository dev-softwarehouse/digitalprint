var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function (req, res) {

    var options = {
        target: 'http://localhost:9001',
        secure: false,
        ws: false,
        prependPath: false,
        ignorePath: false,
    };
    var url = require('url').parse(req.url);

    switch (url.pathname) {
        case '/35/images/favicon.ico':
            req.url = '/favicon.ico';
            break;
        case '/templates/default/1/footer.html':
            req.url = '/views/footer.html';
            break;
        case '/templates/default/2/content.html':
            req.url = '/src/index/templates/content.html';
            break;
        case '/templates/default/3/header.html':
            req.url = '/views/header.html';
            break;
        case '/templates/default/4/slider.html':
            req.url = '/views/slider.html';
            break;
        case '/templates/default/5/footer-news.html':
            req.url = '/views/footer-news.html';
            break;
        case '/templates/default/6/footer-links.html':
            req.url = '/views/footer-links.html';
            break;
        case '/templates/default/8/cart.html':
            req.url = '/src/cart/templates/cart.html';
            break;
        case '/templates/default/9/main.html':
            req.url = '/views/main.html';
            break;
        case '/templates/default/10/login.html':
            req.url = '/src/index/templates/login.html';
            break;
        case '/templates/default/11/register.html':
            req.url = '/src/index/templates/register.html';
            break;
        case '/templates/default/12/password-remind.html':
            req.url = '/src/index/templates/password-remind.html';
            break;
        case '/templates/default/13/news.html':
            req.url = '/src/index/templates/news.html';
            break;
        case '/templates/default/14/contact.html':
            req.url = '/src/index/templates/contact.html';
            break;
        case '/templates/default/22/client-zone.html':
            req.url = '/src/client-zone/templates/client-zone.html';
            break;
        case '/templates/default/24/client-zone-orders.html':
            req.url = '/src/client-zone/templates/client-zone-orders.html';
            break;
        case '/templates/default/27/client-zone-reclamations.html':
            req.url = '/src/client-zone/templates/client-zone-reclamations.html';
            break;
        case '/templates/default/28/category.html':
            req.url = '/src/category/templates/category.html';
            break;
        case '/templates/default/29/group.html':
            req.url = '/src/category/templates/group.html';
            break;
        case '/templates/default/30/calc.html':
            req.url = '/src/category/templates/calc.html';
            break;
        case '/templates/default/31/address-modal.html':
            req.url = '/src/category/templates/modalboxes/address-modal.html';
            break;
        case '/templates/default/33/cart-verify.html':
            req.url = '/src/cart/templates/cart-verify.html';
            break;
        case '/templates/default/34/upload-files.html':
            req.url = '/src/cart/templates/modalboxes/upload-files.html';
            break;
        case '/templates/default/35/confirm-modal.html':
            req.url = '/views/modalboxes/confirm.html';
            break;
        case '/templates/default/37/logout-in-progress.html':
            req.url = '/src/index/templates/logout-in-progress.html';
            break;
        case '/templates/default/62/client-zone-data.html':
            req.url = '/src/client-zone/templates/client-zone-data.html';
            break;
        case '/templates/default/63/client-zone-change-pass.html':
            req.url = '/src/client-zone/templates/client-zone-change-pass.html';
            break;
        case '/templates/default/64/client-zone-invoice-data.html':
            req.url = '/src/client-zone/templates/client-zone-invoice-data.html';
            break;
        case '/templates/default/65/edit-delivery-address.html':
            req.url = '/src/client-zone/templates/modalboxes/edit-delivery-address.html';
            break;
        case '/templates/default/66/client-zone-delivery-data.html':
            req.url = '/src/client-zone/templates/client-zone-delivery-data.html';
            break;
        case '/templates/default/67/show-delivery-modal.html':
            req.url = '/src/cart/templates/modalboxes/show-delivery.html';
            break;
        case '/templates/default/68/order-address-list.html':
            req.url = '/src/client-zone/templates/modalboxes/order-addresses-list.html';
            break;
        case '/templates/default/72/payment-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/payment.html';
            break;
        case '/templates/default/73/printoffer-modal.html':
            req.url = '/src/category/templates/modalboxes/printoffer.html';
            break;
        case '/templates/default/74/client-zone-my-folders.html':
            req.url = '/src/client-zone/templates/client-zone-my-folders.html';
            break;
        case '/templates/default/75/add-folder-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/add-folder.html';
            break;
        case '/templates/default/76/client-zone-my-photos.html':
            req.url = '/src/client-zone/templates/client-zone-my-photos.html';
            break;
        case '/templates/default/77/edit-photo-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/edit-photo.html';
            break;
        case '/templates/default/78/move-photo-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/move-photo.html';
            break;
        case '/templates/default/79/photo-map-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/photo-map.html';
        break;
        case '/templates/default/80/photo-map-folder-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/photo-map-folder.html';
        break;
        case '/templates/default/81/folder-share-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/folder-share.html';
        break;
        case '/templates/default/82/folder-facebook-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/folder-facebook.html';
            break;
        case '/templates/default/83/shared-folder.html':
            req.url = '/src/photo-folders/templates/shared-folder.html';
            break;
        case '/templates/default/84/client-zone-my-projects.html':
            req.url = '/src/client-zone/templates/client-zone-my-projects.html';
            break;
        case '/templates/default/85/shared-photo.html':
            req.url = '/src/photo-folders/templates/shared-photo.html';
            break;
        case '/templates/default/86/photo-share-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/photo-share.html';
            break;
        case '/templates/default/87/photo-facebook-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/photo-facebook.html';
            break;
        case '/templates/default/88/photo-map-global-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/photo-map-global.html';
            break;
        case '/templates/default/89/photo-masks-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/photo-masks.html';
            break;
        case '/templates/default/90/photo-add-tags-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/photo-add-tags.html';
            break;
        case '/templates/default/91/search.html':
            req.url = '/src/index/templates/search.html';
            break;
        case '/templates/default/92/join-deliveries-modal.html':
            req.url = '/src/cart/templates/modalboxes/join-deliveries.html';
            break;
        case '/templates/default/93/contact-form.html':
            req.url = '/views/_forms/contact-form.html';
            break;
        case '/templates/default/94/project-share-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/project-share.html';
            break;
        case '/templates/default/95/shared-project.html':
            req.url = '/src/photo-folders/templates/shared-project.html';
            break;
        case '/templates/default/96/project-facebook-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/project-facebook.html';
            break;
        case '/templates/default/97/add-reciever-address-modal.html':
            req.url = '/src/cart/templates/modalboxes/add-reciever-address.html';
            break;
        case '/templates/default/98/add-invoice-address-modal.html':
            req.url = '/src/cart/templates/modalboxes/add-invoice-address.html';
            break;
        case '/templates/default/99/client-zone-search.html':
            req.url = '/src/client-zone/templates/client-zone-search.html';
            break;
        case '/templates/default/100/create-reclamation.html':
            req.url = '/src/client-zone/templates/create-reclamation.html';
            break;
        case '/templates/default/101/reclamation-messages-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/reclamation-messages.html';
            break;
        case '/templates/default/102/sitemap.html':
            req.url = '/src/index/templates/sitemap.html';
            break;
        case '/templates/default/103/order-messages-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/order-messages.html';
            break;
        case '/templates/default/104/addresses-modal.html':
            req.url = '/src/client-zone/templates/modalboxes/addresses.html';
            break;

        // modals dev2
        case '/templates/getFile/31':
            req.url = '/src/category/templates/modalboxes/address-modal.html';
            break;
        case '/templates/getFile/34':
            req.url = '/src/cart/templates/modalboxes/upload-files.html';
            break;
        case '/templates/getFile/35':
            req.url = '/views/modalboxes/confirm.html';
            break;
        case '/templates/getFile/65':
            req.url = '/src/client-zone/templates/modalboxes/edit-delivery-address.html';
            break;
        case '/templates/getFile/67':
            req.url = '/src/cart/templates/modalboxes/show-delivery.html';
            break;
        case '/templates/getFile/68':
            req.url = '/src/client-zone/templates/modalboxes/order-addresses-list.html';
            break;
        case '/templates/getFile/72':
            req.url = '/src/client-zone/templates/modalboxes/payment.html';
            break;
        case '/templates/getFile/73':
            req.url = '/src/category/templates/modalboxes/printoffer.html';
            break;

        default:
            console.log('* passthrough: ' + req.url);
            options.target = 'http://' + url.hostname;
            console.log( options.target );
            break;
    }

    proxy.web(req, res, options);
});
server.listen(7777);

proxy.on('error', function (err, req, res) {
    console.log(err);
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end("Oops");
});

proxy.on('proxyRes', function (proxyRes, req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'origin, access-token, domainID, x-requested-with, content-type, lang, sourceApp');
    var date = new Date();
    res.setHeader('X-Proxy-Templates', date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
});
