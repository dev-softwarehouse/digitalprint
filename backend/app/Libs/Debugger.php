<?php
/**
 * Programista Rafał Leśniak - 31.3.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 31-03-2017
 * Time: 15:24
 */

namespace DreamSoft\Libs;


class Debugger extends Singleton
{
    private $debugFile;
    private $trace;
    private $scriptTime;

    /**
     * @return mixed
     */
    public function getDebugFile()
    {
        return $this->debugFile;
    }

    /**
     * Debugger constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setDebugFile('common');
    }

    /**
     * @param mixed $debugFile
     */
    public function setDebugFile($debugFile)
    {
        $this->debugFile = $debugFile;
    }

    /**
     * @return mixed
     */
    public function getTrace()
    {
        return $this->trace;
    }

    /**
     * @param mixed $trace
     */
    public function setTrace($trace)
    {
        $this->trace = $trace;
    }

    /**
     * @return mixed
     */
    public function getScriptTime()
    {
        return $this->scriptTime;
    }

    /**
     * @param mixed $scriptTime
     */
    public function setScriptTime($scriptTime): void
    {
        $this->scriptTime = $scriptTime;
    }

    /**
     * @return bool
     */
    public function debug()
    {
        if( DEBUG_MODE ) {

            ini_set('error_log', ERROR_LOG_DESTINATION );

            $arguments = func_get_args();

            $trace = debug_backtrace();
            $this->setTrace($trace);

            $error = PHP_EOL . '----------------------------------------------------------------------------' . PHP_EOL;
            if( defined('companyID') ) {
                $error .= '[COMPANY] '. companyID . PHP_EOL;
            } else {
                $error .= '[COMPANY] '. ' EMPTY ' . PHP_EOL;
            }
            $error .= '[CALLER_CLASS] ' . $this->getCallingValue('class', 1) . PHP_EOL;
            $error .= '[LINE] '.$this->getCallingValue('line', 1) . PHP_EOL;
            $error .= '[FILE] '.$this->getCallingValue('file', 1) . PHP_EOL;
            $error .= '[URL]' . $_SERVER['REQUEST_URI'] .'[/URL]' . PHP_EOL . PHP_EOL;

            foreach ($arguments as $argument) {
                if (!$argument) {
                    $error .= 'Empty element: ' . gettype($argument);
                } else {
                    $error .= var_export($argument, true) . PHP_EOL . PHP_EOL;
                    $error .= 'type: ' . gettype($argument) . PHP_EOL ;
                }
            }

            $error .= PHP_EOL . '----------------------------------------------------------------------------';

            return error_log($error);
        } else {
            return false;
        }
    }

    /**
     * @return bool
     */
    public function updateTrace()
    {
        $trace = debug_backtrace();
        $this->setTrace($trace);

        return true;
    }

    /**
     * @param string $key
     * @param int $level
     * @return int
     */
    private function getCallingValue($key = 'class', $level = 1)
    {
        if( $level < 0 ) {
            return -1;
        }
        $trace = $this->getTrace();

        $class = false;
        if( array_key_exists($level, $trace) ) {
            $class = $trace[$level][$key];
        }

        if( $class ) {
            return $class;
        } else {
            return $this->getCallingValue($key, --$level);
        }
    }

    public function estimateTimeStart()
    {
        $now = microtime(true);
        $this->setScriptTime($now);
    }

    /**
     * @return string
     */
    public function estimateTimeEnd()
    {
        $startTime = $this->getScriptTime();

        $endTime = microtime(true);

        $estimatedTime = $endTime - $startTime;

        return 'Estimated Time: ' . $estimatedTime;
    }
}