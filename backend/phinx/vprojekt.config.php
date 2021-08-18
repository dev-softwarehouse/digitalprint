<?php

return
    [
        'paths' => [
            'migrations' => '%%PHINX_CONFIG_DIR%%/migrations/vprojekt',
            'seeds' => '%%PHINX_CONFIG_DIR%%/seeds/vprojekt',
        ],
        'environments' => [
            'default_database' => getenv('DB_SETTINGS_DATABASE'),
            'default_migration_table' => 'phinxlog',
            getenv('DB_SETTINGS_DATABASE') => [
                'adapter' => 'mysql',
                'host' => getenv('DB_SETTINGS_HOST'),
                'name' => getenv('DB_SETTINGS_DATABASE'),
                'user' => getenv('DB_DEVELOPER_USER'),
                'pass' => getenv('DB_DEVELOPER_PASSWORD'),
                'port' => 3306,
                'charset' => 'utf8',
                'collation' => 'utf8_unicode_ci',
            ],
        ]
    ];