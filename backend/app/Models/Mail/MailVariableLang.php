<?php

namespace DreamSoft\Models\Mail;
/**
 * Description of MailVariableLang
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class MailVariableLang extends Model
{

    /**
     * MailVariableLang constructor.
     */
    public function __construct()
    {
        parent::__construct(true);
        $this->setTableName('mail_variableLangs', true);
    }

    /**
     * @param $variableID
     * @param $lang
     * @param $desc
     * @return bool
     */
    public function set($variableID, $lang, $desc)
    {
        $response = false;
        $updated = 0;
        $actID = $this->exist($variableID, $lang);

        if (intval($actID) > 0) {
            if ($this->update($actID, 'desc', $desc)) {
                $updated++;
            }

            if ($updated == 1) {
                $response = true;
            }
        } else {
            $params['desc'] = $desc;
            $params['lang'] = $lang;
            $params['variableID'] = $variableID;

            $actID = $this->create($params);
            if (intval($actID) > 0) {
                $response = true;
            }
        }
        return $response;
    }

    /**
     * @param $variableID
     * @param $lang
     * @return bool|mixed
     */
    public function exist($variableID, $lang)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE variableID = :variableID AND '
            . ' lang = :lang ';

        $binds['variableID'] = $variableID;
        $binds['lang'] = $lang;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param $variableID
     * @return array|bool
     */
    public function getByVariable($variableID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE variableID = :variableID ';

        $binds['variableID'] = $variableID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['lang']] = $row['desc'];
        }
        return $result;
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function customGetByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE variableID IN (' . implode(',', $list) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();

        if (!$res) {
            return false;
        }
        $result = array();
        foreach ($res as $row) {
            $result[$row['variableID']][$row['lang']] = $row['desc'];
        }
        return $result;
    }

}
