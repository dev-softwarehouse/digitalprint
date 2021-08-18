<?php

namespace DreamSoft\Models\Content;
/**
 * Description of CategoryContent
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;

class MainContent extends Model
{

    protected $mainContentLangs;
    protected $routeContents;

    public function __construct()
    {
        parent::__construct();
        $this->setTableName('mainContents', true);
        $this->mainContentLangs = $this->prefix . 'mainContentLangs';
        $this->routeContents = $this->prefix . 'routeContents';
    }

    /**
     * @param $routeID
     * @return array|bool
     */
    public function getAll($routeID)
    {
        $query = 'SELECT cc.*, GROUP_CONCAT( DISTINCT CONCAT_WS("::", ccl.lang, ccl.title, ccl.content) SEPARATOR "||" ) as langs '
            . ' FROM `' . $this->getTableName() . '` AS cc '
            . ' LEFT JOIN `' . $this->mainContentLangs . '` AS ccl ON ccl.mainContentID = cc.ID '
            . ' LEFT JOIN `' . $this->routeContents . '` AS ctc ON ctc.contentID = cc.ID '
            . ' WHERE ctc.`routeID` = :routeID'
            . ' GROUP BY cc.ID '
            . ' ORDER BY cc.order ASC ';
        $binds['routeID'] = $routeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        if (!$res) return false;

        foreach ($res as $row) {
            $result[] = $row;
        }
        return $result;
    }

    public function getLastOrder($routeID)
    {
        $query = 'SELECT MAX(`order`) FROM `' . $this->getTableName() . '` as cc '
            . ' LEFT JOIN `' . $this->routeContents . '` AS ctc ON ctc.contentID = cc.ID '
            . 'WHERE ctc.`routeID` = :routeID '
            . ' ORDER BY cc.order ASC ';
        $binds['routeID'] = $routeID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $max = $this->db->getOne();
        if (intval($max) > 0) {
            return $max + 1;
        } else {
            return 1;
        }
    }

    public function sort($list)
    {
        $result = true;
        foreach ($list as $index => $ID) {

            $query = 'UPDATE `' . $this->getTableName() . '` SET `order` = :index WHERE `ID` = :ID ';

            $binds[':ID'] = array($ID, 'int');
            $binds[':index'] = $index;
            if (!$this->db->exec($query, $binds)) {
                $result = false;
            }
        }
        return $result;
    }
}
