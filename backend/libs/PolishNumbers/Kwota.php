<?php


/**
 * @author Szymon Działowski 2013-06-01  
 * @homepage http://stopsopa.bitbucket.org/?repo=kwotaslownie
 * @version 1.2 - poprawka parametru $float w metodzie ->slownie()
 * @version 1.1 - poprawka _init, poprawki komentarzy
 * @version 1.0 - główna biblioteka
 * 
 * Użycie:
 *   Kwota::getInstance()->slownie('535.445'); -> "pięćset trzydzieści pięć złotych czterdzieści pięć groszy"
 * test: ZXJyb3JfcmVwb3J0aW5nKEVfQUxMKTsNCmluaV9zZXQoJ2Rpc3BsYXlfZXJyb3JzJywxKTsNCiRrID0gS3dvdGE6OmdldEluc3RhbmNlKCk7DQpmb3JlYWNoIChhcnJheSgNCiAgMTU2Ny43LA0KICAxNTY3LjA5LA0KICAxNTY3LjEwLA0KICAxNTY3LjEsDQogICcxMjM0NTY3ODkxMzQwMDU2MDcwMDM0NTY3ODkwLjk5JywNCiAgNTM1LjQ0NSwNCiAgLjY3LA0KICAnLjQ1OCcsDQogIDAsDQogICcwJywNCiAgMSwNCiAgJzEnLA0KICAnMTIzNC45OScsDQogIDEyMzQ1Njc4LjM0NSwNCiAgMTIzNDU2NzguMzQyLA0KICAxMjM0NTY3OC4zLA0KICAnLjk4Jw0KKSBhcyAkZCkgew0KICBkZWJ1ZyhhcnJheSgNCiAgICAkay0+X251bWJlckZvcm1hdCgkZCwyKSwNCiAgICAkay0+c2xvd25pZSgkZCkNCiAgKSwxKTsNCn0NCmRpZSgpOw==
 */
class Kwota {// inspiracja: http://forum.creamsoft.com/kwota-slownie-t5866.html
  protected $zl;
  protected $gr;
  protected $zlparts;
  protected $table;
  protected $jednosciNascie;
  protected $dziesiatki;
  protected $setki;
  protected static $instance;
  /**
   * Singleton
   * @return Kwota
   */
  public static function getInstance() {
    if (!self::$instance) 
      self::$instance = new self();
    return self::$instance;
  }
  protected function __construct() {}

  protected function _init() {
    if (!$this->table) {
      // http://pl.wikipedia.org/wiki/Liczebniki_g%C5%82%C3%B3wne_pot%C4%99g_tysi%C4%85ca
      // google(Liczebniki główne potęg tysiąca)
      // tysiąc milion miliard bilion biliard trylion tryliard kwadrylion kwadryliard kwintylion kwintyliard sekstylion sekstyliard septylion septyliard oktylion      
      // 
      // 10   9   8   7   6   5   4   3   2   1   0
      // 000 000 000 000 000 000 000 000 000 000 000   0-set,0-dzi,0-jedn
      //         kwa trd try bid bil mld mln tys set,dzi,jed
      $this->table = array(
        // odmiana przez przypadki
        0  => explode(',',',,'),
        1  => explode(',','tysiąc,tysiące,tysięcy'),
        2  => explode(',','milion,miliony,milionów'),
        3  => explode(',','miliard,miliardy,miliardów'),
        4  => explode(',','bilion,biliony,bilionów'),
        5  => explode(',','biliard,biliardy,biliardów'),
        6  => explode(',','trylion,tryliony,trylionów'),
        7  => explode(',','tryliard,tryliardy,tryliardów'),
        8  => explode(',','kwadrylion,kwadryliony,kwadrylionów'),
        9  => explode(',','kwadryliard,kwadryliardy,kwadryliardów'),
        10 => explode(',','kwintylion,kwintyliony,kwintylionów'),
        11 => explode(',','kwintyliard,kwintyliardy,kwintyliardów'),
        12 => explode(',','sekstylion,sekstyliony,sekstylionów'),
        13 => explode(',','sekstyliard,sekstyliardy,sekstyliardów'),
        // można rozszerzyć, ale wątpię aby ktoś tego potrzebował...
      );
      $this->jednosciNascie  = explode(",",", jeden , dwa , trzy , cztery , pięć , sześć , siedem , osiem , dziewięć , dziesięć , jedenaście , dwanaście , trzynaście , czternaście , piętnaście , szesnaście , siedemnaście , osiemnaście , dziewiętnaście ");
      $this->dziesiatki      = explode(",",",, dwadzieścia , trzydzieści , czterdzieści , pięćdziesiąt , sześćdziesiąt , siedemdziesiąt , osiemdziesiąt , dziewięćdziesiąt ");
      $this->setki           = explode(",",", sto , dwieście , trzysta , czterysta , pięćset , sześćset , siedemset , osiemset , dziewięćset ");      
    }
    $this->zlparts = array();
  }
  /**
   * 
   * @param float|int        $kwota    - '5435.7665' || 4321.55 || 432 || .45
   * @param null|string      $intEnd   
   *    null  -> 'złoty,złote,złotych'
   *    false -> ',,'
   * @param bool|null        $float    
   *    null, -> ''
   *    false -> zwraca '67/100'
   *    true -> zwraca 'sześćdziesiąt siedem'
   * @param null|true|string $floatEnd 
   *    null  -> 'grosz,grosze,groszy'
   *    false -> ',,'
   */
  public function slownie($kwota,$intEnd = null, $float = true, $floatEnd = null) {
    ($intEnd   === null)  && ($intEnd   = 'złoty,złote,złotych');
    ($intEnd   === false) && ($intEnd   = ',,');
    ($floatEnd === null)  && ($floatEnd = 'grosz,grosze,groszy');
    ($floatEnd === false) && ($floatEnd = ',,');
    $this->_init();
    $this->_rozbij($kwota);
    $i = 0;
    foreach ($this->zl as $d) {
      $a = array(
          'd' => $d,
          's' => $this->_licz($d) // tysiąc dwieście itd..
      );
      // dodaję na koniec bilionów, tysięcy, milionów itd
      $a['s'][] = $this->_mnoznikSlownie($d, $i++);
      $this->zlparts[] = $a;
    }
    
    $return = $this->_getzl().$this->_zlend($intEnd).$this->_getgr($float).$this->_grend($floatEnd);
    
    // usuwam powtarzające się białe znaki i trim dla całości
    return trim(preg_replace('#\s\s+#', ' ', $return));
  }  
  protected function _zlend($intEnd) {
    if (!isset($this->zlparts[0])) return '';
    $last = $this->zlparts[0]['d'];
    if (is_string($intEnd)) {
      if (!preg_match('#[^,]*(,[^,]*,[^,]*)?#', $intEnd)) 
        throw new Exception("\$intEnd has wrong format, should be like: 'złoty,złote,złotych' || true || null");
      $intEnd = explode(',', $intEnd);
      
      if (count($intEnd) < 3) 
        $intEnd[1] = $intEnd[2] = $intEnd[0];
      
      return ' '.$this->_mnoznikSlownie($last, null, $intEnd);
    } 
    return '';
  }
  protected function _grend($floatEnd) {
    if ($floatEnd === true)
      return "{$this->gr}/100";
    if (is_string($floatEnd)) {
      if (!preg_match('#[^,]*(,[^,]*,[^,]*)?#', $floatEnd)) 
        throw new Exception("\$intEnd has wrong format, should be like: 'złoty,złote,złotych' || 'PLN' || true || null");
      $floatEnd = explode(',', $floatEnd);
      
      if (count($floatEnd) < 3) 
        $floatEnd[1] = $floatEnd[2] = $floatEnd[0];
      
      return $this->_mnoznikSlownie($this->gr, null, $floatEnd);
    }  
    return '';
  }

  protected function _getzl() {
    $tmp = '';    
    for ( $i = count($this->zlparts)-1 ; $i > -1 ; $i-- ) 
      $tmp .= join('', $this->zlparts[$i]['s']);  
    return $tmp;
  }
  /**  
   *    null, -> ''
   *    false -> zwraca '67/100'
   *    true -> zwraca 'sześćdziesiąt siedem'
   */
  protected function _getgr($float) {
    if ($float === false) 
      return "{$this->gr}/100 ";
    return join(' ',$this->_licz($this->gr));
  }
  protected function _rozbij($kwota) {
    $d = $this->_numberFormat($kwota,2,',','.');
    $d = explode(',',$d); 
    $this->zl = array_reverse(explode('.', $d[0]));
    $this->gr = $d[1];
  }
  protected function _mnoznikSlownie($licz,$i,$table = null) {
    $table = $table ? $table : $this->table[$i];
    if ($licz == 1) 
      return $table[0];  
    $licz = str_pad($licz, 3, '0',STR_PAD_LEFT);
    $last   = $licz[strlen($licz)-1];
    $second = (isset($licz[1]) && $licz[1] < 2 && $licz[1] > 0) ? true : false ;
    if ( ($second) || ($last < 2 || $last > 4) ) 
      return $table[2];    
    return $table[1];
  }
  protected function _licz($liczba) {
    $liczba = str_pad($liczba, 3, '0',STR_PAD_LEFT);
    $r = array();
    if ($liczba == 0) {
      $r[] = ' zero ';
      return $r;
    }
    if (strlen($liczba) > 2) {
      $r[] = $this->setki[$liczba[0]];
      $liczba = ($liczba-$liczba[0]*100).'';
    }
    if ($liczba < 20) {
      $r[] = $this->jednosciNascie[$liczba];
    }
    else {
      $r[] = $this->dziesiatki[$liczba[0]];
      $r[] = $this->jednosciNascie[$liczba[1]];
    }
    return $r;
  } 
  
  /**
   * http://www.mail-archive.com/php-general@lists.php.net/msg217138.html
   * warto też popatrzeć tu: http://stackoverflow.com/questions/1642614/how-to-ceil-floor-and-round-bcmath-numbers
   * @param type $x
   * @param type $p
   * @return type
   */
  protected function _roundbc($number, $precision = 0) {
    if (strpos($number, '.') !== false) {
        if ($number[0] != '-') return bcadd($number, '0.' . str_repeat('0', $precision) . '5', $precision);
        return bcsub($number, '0.' . str_repeat('0', $precision) . '5', $precision);
    }
    return $number;
  }
  /**
   * Przyjmuje parametry w fromie '54745432.8754545' lub '542654654' lub to samo ujemne
   * @param string $number
   * @param type $decimal
   * @param type $dec_point
   * @param type $thousands_sep
   * @return string
   */
  public function _numberFormat($number,$decimal=0,$dec_point='.',$thousands_sep=',') {
    $number .= '';
    $number = preg_match('#[0-9]#', $number[0]) ? $number : '0'.$number;
    $number = $this->_roundbc($number, $decimal);
    if ($last = strrpos($number, '.')) {
      $int = substr($number, 0, $last);
      $fra = substr($number, $last+1);
    }
    else {
      $int = $number;
      $fra = '';
    }  
    
    if (strlen($fra) < $decimal) 
      $fra = str_pad($fra, $decimal, '0'); 

    $a = array();
    while ( $i = substr($int, -3, 3) ) {
      $int = substr($int, 0, -3);
      array_unshift($a, $i);
    }
    $int = implode($thousands_sep,$a);
    $int = strlen($int) ? $int : '0';
    return $int.$dec_point.$fra;
  }
}