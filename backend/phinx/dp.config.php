<?php

return
    [
        'paths' => [
            'migrations' => '%%PHINX_CONFIG_DIR%%/migrations/dp',
            'seeds' => '%%PHINX_CONFIG_DIR%%/seeds/dp',
        ],
        'environments' => [
            'default_database' => getenv('DB_MASTER_DATABASE'),
            'default_migration_table' => 'phinxlog',
            getenv('DB_MASTER_DATABASE') => [
                'adapter' => 'mysql',
                'host' => getenv('DB_MASTER_HOST'),
                'name' => getenv('DB_MASTER_DATABASE'),
                'user' => getenv('DB_DEVELOPER_USER'),
                'pass' => getenv('DB_DEVELOPER_PASSWORD'),
                'port' => 3306,
                'charset' => 'utf8',
                'collation' => 'utf8_unicode_ci',
            ]
        ]
    ];