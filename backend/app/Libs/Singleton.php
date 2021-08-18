<?php

namespace DreamSoft\Libs;

use Exception;

class Singleton
{

    /**
     * @var array
     */
    protected static $instances = array();

    /**
     * Singleton constructor.
     */
    protected function __construct()
    {

    }

    /**
     *
     */
    protected function __clone()
    {

    }

    /**
     *
     */
    public function __sleep()
    {
        throw new Exception('You cannot serialize me!');
    }

    /**
     * @return mixed
     */
    public static function getInstance()
    {
        $class = get_called_class();
        if (!isset(self::$instances[$class]))
            self::$instances[$class] = new $class;
        return self::$instances[$class];
    }
}