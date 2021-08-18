<?php

namespace DreamSoft\Models\Mail;
/**
 * Description of MailType
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use PDO;

class MailType extends Model
{

    /**
     * MailType constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('mail_types', $prefix);
        if ($prefix) {
            $this->mailTypeNames = $this->prefix . 'mail_typeLangs';
        }
    }

    /**
     * @param int $hidden
     * @return array|bool
     */
    public function getAll($hidden = 0)
    {
        $query = 'SELECT `' . $this->getTableName() . '`.*,
                         `dp_mail_typeLangs`.`lang` as lLang,
                         `dp_mail_typeLangs`.`name` as lName
                 FROM `' . $this->getTableName() . '` 
                 LEFT JOIN `dp_mail_typeLangs` ON `dp_mail_typeLangs`.`mailTypeID` = `' . $this->getTableName() . '`.`ID`
                 WHERE `' . $this->getTableName() . '`.hidden = :hidden
                 ';

        $binds['hidden'] = $hidden;

        if (!$this->db->exec($query, $binds)) return false;

        $res = $this->db->getAll(PDO::FETCH_ASSOC);

        $result = array();
        foreach ($res as $r) {
            $lLang = $lName = null;
            if (!empty($r['lLang'])) {
                $lLang = $r['lLang'];
                $lName = $r['lName'];
            }
            unset($r['lLang']);
            unset($r['lName']);
            $key = $r['ID'];
            if (!isset($result[$key])) {
                $result[$key] = array();
            }
            $result[$key] = array_merge($result[$key], $r);
            if (!empty($lLang)) {
                if (!isset($result[$key]['names'])) {
                    $result[$key]['names'] = array();
                }
                $result[$key]['names'][$lLang] = $lName;
            }
        }

        $data = array();
        foreach ($result as $r) {
            $data[] = $r;
        }

        return $data;
    }
}
