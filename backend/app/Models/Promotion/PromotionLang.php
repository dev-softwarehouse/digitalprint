<?php
/**
 * Description of PromotionLangs
 *
 * @author Rafał
 */

namespace DreamSoft\Models\Promotion;

use DreamSoft\Core\Model;

class PromotionLang extends Model {

    public function __construct() {
	parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName( 'promotionLangs', true );
    }

    /**
     * @param $promotionID
     * @param $lang
     * @return mixed
     */
    public function existName($promotionID, $lang)
    {
        $query = 'SELECT `ID` FROM ' . $this->getTableName() . ' WHERE `promotionID` = :promotionID '
            . ' AND `lang` = :lang ';

        $binds['lang'] = $lang;
        $binds['promotionID'] = $promotionID;

        $this->db->exec($query, $binds);
        return $this->db->getOne();
    }

    public function getNames( $list ){
        if( empty($list) ){
            return false;
        }
        $query = ' SELECT * FROM `'.$this->getTableName().'` WHERE `groupID` IN ('.  implode(',', $list).') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
              return false;
        }

        $res = $this->db->getAll();
        if( !$res ){
            return false;
        }

        $result = array();
        foreach($res as $r){
            $result[$r['lang']] = $r['name'];
        }
        return $result;
    }
}
