<?php

return
    [
        'paths' => [
            'migrations' => '%%PHINX_CONFIG_DIR%%/migrations/company-db',
            'seeds' => '%%PHINX_CONFIG_DIR%%/seeds/company-db',
        ],
        'environments' => [
            'default_database' => getenv('PRINTING_HOUSE_DB_NAME'),
            'default_migration_table' => 'phinxlog',
            getenv('PRINTING_HOUSE_DB_NAME') => [
                'adapter' => 'mysql',
                'host' => getenv('DB_SETTINGS_HOST'),
                'name' => getenv('PRINTING_HOUSE_DB_NAME'),
                'user' => getenv('DB_DEVELOPER_USER'),
                'pass' => getenv('DB_DEVELOPER_PASSWORD'),
                'port' => 3306,
                'charset' => 'utf8',
                'collation' => 'utf8_unicode_ci',
            ],
        ]
    ];