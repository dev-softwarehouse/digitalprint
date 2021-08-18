<?php

//namespace Core\StringBundle\Lib;

use \DateInterval;
use \DateTime;
use \Exception;


/**
 * @author Szymon Działowski 2013-09-29
 * @version 1.0 - pierwsza wersja
 * @homepage http://stopsopa.bitbucket.org/?repo=kwotaslownie
 * 
 * Klasa do zapisu słownie różnicy między dwiema datami
 * 
 * Podać dwa obiekty DateTime lub jeden DateTime, drugi zostanie wygenerowany automatycznie z
 * czasem teraźniejszym. Można też podać jeden obiekt DateInterval, dodatkowo opcjonalny jest 
 * string z napisem 'temu' lub 'wstecz' lub jakaś inna końcówka
 * Użycie: 
 * CzasTemu::getInstance()->get($date1, $date2, 'temu') -> 2 tygodnie temu
 * CzasTemu::getInstance()->get($date1, $date2)         -> 2 tygodnie
 * CzasTemu::getInstance()->get($date1,'wstecz')        -> 2 tygodnie wstecz
 * CzasTemu::getInstance()->get($interval)              -> 2 tygodnie
 * CzasTemu::getInstance()->get($interval,'wstecz')     -> 2 tygodnie wstecz
 */
class CzasTemu {
  protected $interval;
  protected $itest = array(
      // 1 rok temu, 2/23/44 lata temu, 5/7/10 lat temu
      's' => array('sekundę','sekundy','sekund'),
      'i' => array('minutę','minuty','minut'),
      'h' => array('godzinę','godziny','godzin'),
      'd' => array('dzień','dni','dni'),
      'w' => array('tydzień','tygodnie','tygodni'),
      'm' => array('miesiąc','miesięce','miesięcy'),
      'y' => array('rok','lata','lat')
  );
  protected static $instance;
  protected function __construct() {}
  /**
   * @return CzasTemu
   */
  public static function getInstance() {
    
    if (!self::$instance) 
      self::$instance = new self();
    
    return self::$instance;
  }
  /**
   * @param DateInterval|DateTime $arg1
   * @param DateTime|null|string $arg2 (def: null)
   * @param string|null $arg3 (def: null)
   */
  public function get() {    
    $date     = array();
    $temu     = '';
    $interval = null;
    
    foreach (func_get_args() as $a) {
      switch (true) {
        case $a instanceof DateTime:
          $date[] = $a;
          break;
        case $a instanceof DateInterval:
          $interval = $a;
          break;
        case is_string($a):
          $temu = $a;
          break;
      }
    }
    
    if ($interval) 
      return $this->_get($interval,$temu);
    
    if (!count($date)) 
      throw new Exception('Input DateTime lub DateInterval');
    
    if (count($date) == 1) 
      $date[] = new DateTime();
    
    return $this->_getDiff($date[0], $date[1], $temu);
  }

  /**
   * @param DateInterval $interval
   * @param string $temu (def: '')
   * @return string
   */
  protected function _get(DateInterval $interval ,$temu = '') {  
    $this->interval = $this->_unpack($interval);
    return $this->_trans($temu);
  }
  /**
   * @param DateTime $first
   * @param DateTime $second
   * @param string $temu (def: '')
   * @return string
   */
  protected function _getDiff(DateTime $first, DateTime $second, $temu = '') {  
    return $this->_get($first->diff($second),$temu);
  }
  protected function _unpack(DateInterval $interval) {    
    return array(
        'y'    => $interval->y,
        'm'    => $interval->m,
        'w'    => floor($interval->d/7),
        'd'    => $interval->d,
        'h'    => $interval->h,
        'i'    => $interval->i,
        's'    => $interval->s,        
        'days' => $interval->days        
    );
  }
  protected function _mnoznikSlownie($licz,$table = null) {
  
    if ($licz == 1) 
      return $table[0]; 
      
    $licz = str_pad($licz, 3, '0',STR_PAD_LEFT);
    $last   = $licz[strlen($licz)-1];
    $second = (isset($licz[1]) && $licz[1] < 2 && $licz[1] > 0) ? true : false ;
    
    if ( ($second) || ($last < 2 || $last > 4) ) 
      return $table[2];    
      
    return $table[1];
  }

  protected function _trans($temu = '') {
    $i     = $this->_important();
    $licz  = $this->interval[$i];
    $table = $this->itest[$i];
    $value = $this->_mnoznikSlownie($licz,$table);
    
    if ($licz > 1) 
      return trim($this->interval[$i].' '.$value.' '.$temu);          
    
    return trim($value.' '.$temu);
  }

  protected function _important() {
    $last = 's';
    
    foreach ($this->itest as $i => $d) {
      if ($this->interval[$i] != 0)        
        $last = $i;      
    }
    
    return $last;
  }
}
