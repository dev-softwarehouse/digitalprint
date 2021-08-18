<?php

define('secretKey', getenv('secretKey') ?: '@!&#*@INNYSECRET');
define('loginType', getenv('loginType') ?: 2);

define('MAIN_TAX', getenv('MAIN_TAX') ?: 1.23);

define('UPLOAD_URL', getenv('UPLOAD_URL') ?: 'http://upload.digitalprint.pro/');

define('STATIC_URL', getenv('STATIC_URL') ?: 'https://static.dreamsoft.pro/');

define('ROOT_DOMAIN', getenv('ROOT_DOMAIN') ?: 'digitalprint.pro');

define('SENDER_PRINTHOUSE', getenv('SENDER_PRINTHOUSE') ?: 1);
define('SENDER_CLIENT', getenv('SENDER_CLIENT') ?: 2);

define('PAYU_NAME_IN_MODULES', getenv('PAYU_NAME_IN_MODULES') ?: 'payu');
define('TINKOFF_NAME_IN_MODULES', getenv('TINKOFF_NAME_IN_MODULES') ?: 'tinkoff');
define('SBERBANK_NAME_IN_MODULES', getenv('SBERBANK_NAME_IN_MODULES') ?: 'sberbank');
define('PAYPAL_NAME_IN_MODULES', getenv('PAYPAL_NAME_IN_MODULES') ?: 'paypal');

define('SOURCE_PRINTHOUSE_ID', getenv('SOURCE_PRINTHOUSE_ID') ?: 35);

define('TEMPLATES_PATH', getenv('TEMPLATES_PATH') ?: '/home/www/data/templates/');

define('STATIC_PATH', getenv('STATIC_PATH') ?: '/home/www/data/');

define('TEMP_PASS', getenv('TEMP_PASS') ?: '12345');

define('ACTIVE_CONST', getenv('ACTIVE_CONST') ?: 1);

define('REL_TYPE_TYPE', getenv('REL_TYPE_TYPE') ?: 2);
define('REL_TYPE_GROUP', getenv('REL_TYPE_GROUP') ?: 1);

define('EDITOR_DEFAULT_SUBDOMAIN', getenv('EDITOR_DEFAULT_SUBDOMAIN') ?: 'edytor.');

define('EDITOR_ADMIN_DEFAULT_SUBDOMAIN', getenv('EDITOR_ADMIN_DEFAULT_SUBDOMAIN') ?: 'editor.admin.');

define('DEBUG_MODE', getenv('DEBUG_MODE') ?: 0);

define('PAYU_COMPLETED', getenv('PAYU_COMPLETED') ?: 'COMPLETED');
define('PAYU_SUCCESS', getenv('PAYU_SUCCESS') ?: 'SUCCESS');

define('CUSTOM_SKIN', getenv('CUSTOM_SKIN') ?: 'clean');

define('DEFAULT_COURSE', getenv('DEFAULT_COURSE') ?: 100);

define('DEFAULT_CURRENCY', getenv('DEFAULT_CURRENCY') ?: 'PLN');

define('MAIN_CSS_FILE', getenv('MAIN_CSS_FILE') ?: 'main.css');

define('TEMPLATE_DEFAULT_FOLDER', getenv('TEMPLATE_DEFAULT_FOLDER') ?: 'default');

define('LOCAL_TEMPLATE_PREFIX', getenv('LOCAL_TEMPLATE_PREFIX') ?: 'local_');

define('TEMPLATE_ROOT_VALUE', getenv('TEMPLATE_ROOT_VALUE') ?: 1);

define('TEMPLATE_LOCAL_VALUE', getenv('TEMPLATE_LOCAL_VALUE') ?: 2);

define('DEFAULT_MY_ZONE_START_POINT', getenv('DEFAULT_MY_ZONE_START_POINT') ?: 'home');

define('THUMB_IMAGE_RESIZE_WIDTH', getenv('THUMB_IMAGE_RESIZE_WIDTH') ?: 200);
define('THUMB_IMAGE_RESIZE_HEIGHT', getenv('THUMB_IMAGE_RESIZE_HEIGHT') ?: 200);
define('THUMB_IMAGE_PREFIX', getenv('THUMB_IMAGE_PREFIX') ?: 'min_');
define('THUMB_IMAGE_ALLOWED_EXTENSION', getenv('THUMB_IMAGE_ALLOWED_EXTENSION') ?: 'jpg,jpeg,png');
define('THUMB_PDF_ALLOWED_EXTENSION', getenv('THUMB_PDF_ALLOWED_EXTENSION') ?: 'pdf');
define('THUMB_IMAGE_DEFAULT', getenv('THUMB_IMAGE_DEFAULT') ?: 'productholder.png');

define('CUSTOM_PREFIX', getenv('CUSTOM_PREFIX') ?: 'dp_');
define('PRINT_SHOP_PREFIX', getenv('PRINT_SHOP_PREFIX') ?: 'ps_');

define('PROFORMA_INVOICE_TYPE', getenv('PROFORMA_INVOICE_TYPE') ?: 1);
define('VAT_INVOICE_TYPE', getenv('VAT_INVOICE_TYPE') ?: 2);
define('DEFAULT_INVOICE_MASK_MONTHLY', getenv('DEFAULT_INVOICE_MASK_MONTHLY') ?: '{nr}/{m}/{r}');
define('DEFAULT_INVOICE_MASK_ANNUALY', getenv('DEFAULT_INVOICE_MASK_ANNUALY') ?: '{nr}/{r}');

define('DHL_PAYMENT_METHOD_SHIPPER', getenv('DHL_PAYMENT_METHOD_SHIPPER') ?: 'SHIPPER');
define('DHL_PAYMENT_METHOD_RECEIVER', getenv('DHL_PAYMENT_METHOD_RECEIVER') ?: 'RECEIVER ');
define('DHL_PAYMENT_METHOD_USER', getenv('DHL_PAYMENT_METHOD_USER') ?: 'USER');

define('DHL_PAYMENT_TYPE_BANK_TRANSFER', getenv('DHL_PAYMENT_TYPE_BANK_TRANSFER') ?: 'BANK_TRANSFER');
define('DHL_PAYMENT_TYPE_CASH', getenv('DHL_PAYMENT_TYPE_CASH') ?: 'CASH');

define('DHL_SAP_TEST_MODE', getenv('DHL_SAP_TEST_MODE') ?: '6000000');

define('DHL_TEST_MODE', getenv('DHL_TEST_MODE') ?: true);

define('DHL_DEFAULT_LABEL_TYPE', getenv('DHL_DEFAULT_LABEL_TYPE') ?: 'LP');

define('MONGO_DB_HOST', getenv('MONGO_DB_HOST') ?: 'localhost');
define('MONGO_DB_USER', getenv('MONGO_DB_USER') ?: 'editorDb');
define('MONGO_DB_PWD', getenv('MONGO_DB_PWD') ?: 'ed1t0rf69b54');

define('EFOTOGALLERY_SELLER_TYPE', getenv('EFOTOGALLERY_SELLER_TYPE') ?: 2);
define('PRINTHIT_SELLER_TYPE', getenv('PRINTHIT_SELLER_TYPE') ?: 2);
define('LOCALHOST_SELLER_TYPE', getenv('LOCALHOST_SELLER_TYPE') ?: 16);
define('DREAMSOFT_SELLER_TYPE', getenv('DREAMSOFT_SELLER_TYPE') ?: 2);
define('TOTEMGROUP_SELLER_TYPE', getenv('TOTEMGROUP_SELLER_TYPE') ?: 1);

define('DEFAULT_RECLAMATION_DAYS', getenv('DEFAULT_RECLAMATION_DAYS') ?: 14);

define('RECLAMATION_FOLDER', getenv('RECLAMATION_FOLDER') ?: 'reclamationFiles');
define('CUSTOM_PRODUCT_FOLDER', getenv('CUSTOM_PRODUCT_FOLDER') ?: 'customProductFiles');

define('UPS_LABELS_DIR', getenv('UPS_LABELS_DIR') ?: 'ups_labels');

define('DPD_LABELS_DIR', getenv('DPD_LABELS_DIR') ?: 'dpd_labels');

define('UPS_SHIP_TEST_URL', getenv('UPS_SHIP_TEST_URL') ?: 'https://wwwcie.ups.com/');
define('UPS_SHIP_URL', getenv('UPS_SHIP_URL') ?: 'https://onlinetools.ups.com/');

define('DPD_SHIP_TEST_URL', getenv('DPD_SHIP_TEST_URL') ?: 'http://wstest.dpd.ru/services/order2?wsdl');
define('DPD_SHIP_URL', getenv('DPD_SHIP_URL') ?: 'http://ws.dpd.ru/services/order2?wsdl');

define('CONNECTION_TYPE_MASTER', getenv('CONNECTION_TYPE_MASTER') ?: 'dp_user');
define('CONNECTION_TYPE_SETTINGS', getenv('CONNECTION_TYPE_SETTINGS') ?: 'vprojekt');
define('CONNECTION_TYPE_USER', getenv('CONNECTION_TYPE_USER') ?: 'company');

define('DB_MASTER_HOST', getenv('DB_MASTER_HOST') ?: 'localhost');
define('DB_MASTER_USER', getenv('DB_MASTER_USER') ?: 'dp_user');
define('DB_MASTER_DATABASE', getenv('DB_MASTER_DATABASE') ?: 'dp');
define('DB_MASTER_PASSWORD', getenv('DB_MASTER_PASSWORD') ?: 'be091eb0189MSQLR');

define('DB_SETTINGS_HOST', getenv('DB_SETTINGS_HOST') ?: 'localhost');
define('DB_SETTINGS_USER', getenv('DB_SETTINGS_USER') ?: 'vprojekt_select');
define('DB_SETTINGS_DATABASE', getenv('DB_SETTINGS_DATABASE') ?: 'vprojekt');
define('DB_SETTINGS_PASSWORD', getenv('DB_SETTINGS_PASSWORD') ?: 'A88d1QWf7e94ef7N');

define('DB_DEVELOPER_HOST', getenv('DB_DEVELOPER_HOST') ?: 'localhost');
define('DB_DEVELOPER_USER', getenv('DB_DEVELOPER_USER') ?: 'dp_developer');
define('DB_DEVELOPER_PASSWORD', getenv('DB_DEVELOPER_PASSWORD') ?: '@r10WiST#dev');

define('DB_PRINT_HOUSE_HOST', getenv('DB_PRINT_HOUSE_HOST') ?: 'localhost');

define('DB_GLOBAL_PERSISTENT', getenv('DB_GLOBAL_PERSISTENT') ?: false);

define('RE_CAPTCHA_VERIFY_URL', getenv('RE_CAPTCHA_VERIFY_URL') ?: 'https://www.google.com/recaptcha/api/siteverify');

define('STATUS_TYPE_ENDED', getenv('STATUS_TYPE_ENDED') ?: 2);

define('SPECIAL_ATTRIBUTE_TYPE_AMOUNT', getenv('SPECIAL_ATTRIBUTE_TYPE_AMOUNT') ?: 1);
define('SPECIAL_ATTRIBUTE_TYPE_METERS', getenv('SPECIAL_ATTRIBUTE_TYPE_METERS') ?: 2);

define('MATH_DIVIDE_SYMBOL', getenv('MATH_DIVIDE_SYMBOL') ?: ',');

define('CUSTOM_JS_FILE', getenv('CUSTOM_JS_SOURCE_DOMAIN') ?: 'main.js');
define('CUSTOM_JS_SOURCE_DOMAIN', getenv('CUSTOM_JS_SOURCE_DOMAIN') ?: 4);

define('CATEGORY_RELATION_TO_GROUP', getenv('CATEGORY_RELATION_TO_GROUP') ?: 1);
define('CATEGORY_RELATION_TO_TYPE', getenv('CATEGORY_RELATION_TO_TYPE') ?: 2);

define('ATTRIBUTE_TYPE_STANDARD', getenv('ATTRIBUTE_TYPE_STANDARD') ?: 1);
define('ATTRIBUTE_TYPE_PRINT', getenv('ATTRIBUTE_TYPE_PRINT') ?: 2);
define('ATTRIBUTE_TYPE_PAPER', getenv('ATTRIBUTE_TYPE_PAPER') ?: 3);

define('THUMB_RESIZE_WIDTH', getenv('THUMB_RESIZE_WIDTH') ?: 100);
define('THUMB_RESIZE_HEIGHT', getenv('THUMB_RESIZE_HEIGHT') ?: 100);

define('OPERATOR_ROLE_NUMBER', getenv('OPERATOR_ROLE_NUMBER') ?: 37);

define('ACCESS_TOKEN_NAME', getenv('ACCESS_TOKEN_NAME') ?: 'access-token');

define('MAIN_UPLOAD', getenv('MAIN_UPLOAD') ?: '/var/www/app/data/');

define('PROMOTION_STATE_PENDING', getenv('PROMOTION_STATE_PENDING') ?: 0);
define('PROMOTION_STATE_STARTED', getenv('PROMOTION_STATE_STARTED') ?: 1);
define('PROMOTION_STATE_PERMANENT', getenv('PROMOTION_STATE_PERMANENT') ?: 2);
define('PROMOTION_STATE_ENDED', getenv('PROMOTION_STATE_ENDED') ?: 3);

define('DATE_FORMAT', getenv('DATE_FORMAT') ?: 'Y-m-d H:i:s');

define('TYPE_OPERATION_ON_SHEET_OBVERSE', getenv('TYPE_OPERATION_ON_SHEET_OBVERSE') ?: 1);
define('TYPE_OPERATION_ON_SHEET_REVERSE', getenv('TYPE_OPERATION_ON_SHEET_REVERSE') ?: 2);

define('CALENDAR_TYPE_CHURCH_HOLY_DAY', getenv('CALENDAR_TYPE_CHURCH_HOLY_DAY') ?: 'churchholiday');

define('PRINTING_HOUSE_DB_NAME', getenv('PRINTING_HOUSE_DB_NAME') ?: '35studioten');
define('PRINTING_HOUSE_DB_USER', getenv('PRINTING_HOUSE_DB_USER') ?: 'v_studioten');
define('PRINTING_HOUSE_DB_PASSWORD', getenv('PRINTING_HOUSE_DB_PASSWORD') ?: '40adae4c4d');
define('PRINTING_HOUSE_ID', getenv('PRINTING_HOUSE_ID') ?: '35');

define('DPD_END_PICKUP_HOUR', getenv('DPD_END_PICKUP_HOUR') ?: 12);

define('DEFAULT_SALT', getenv('DEFAULT_SALT') ?: 'Je$te$my_$-NajLp$I_#A#A!@#$%^&*');

define('UPLOADED_FILES_DIR', getenv('UPLOADED_FILES_DIR') ?: 'uploadedFiles');

define('SOURCE_DOMAIN_ID', getenv('SOURCE_DOMAIN_ID') ?: 4);
define('DEFAULT_LANG',  getenv('DEFAULT_LANG') ?: 'pl');
define('MODULE_TYPE_COURIERS',  getenv('MODULE_TYPE_COURIERS') ?: 1);
define('MODULE_TYPE_PAYMENTS',  getenv('MODULE_TYPE_PAYMENTS') ?: 2);

define('ERROR_LOG_DESTINATION', getenv('ERROR_LOG_DESTINATION') ?: 'php://stderr');
define('PHP_MAILER_TIMEOUT', getenv('PHP_MAILER_TIMEOUT') ?: 20);
define('REQUEST_URI_PREFIX', getenv('REQUEST_URI_PREFIX') ?: '');

define('DEFAULT_MAIL_TO_CC', getenv('DEFAULT_MAIL_TO_CC') ?: '');
