<?php

namespace DreamSoft\Models\Route;

/**
 * Description of Route
 *
 * @author Rafał
 */

use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\LangFilter;
use PDO;
use PDOException;

class Route extends Model
{
    /**
     * @var string
     */
    protected $routeTmp;
    /**
     * @var string
     */
    protected $routeLang;
    /**
     * @var
     */
    protected $domainID;
    /**
     * @var LangFilter
     */
    private $LangFilter;

    /**
     * Route constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->LangFilter = new LangFilter();
        $this->setTableName('routes', true);
        $this->routeTmp = $this->prefix . 'routesTmp';
        $this->routeLang = $this->prefix . 'routeLangs';
    }

    /**
     * @param $companyID
     */
    public function setRemote($companyID)
    {
        parent::__construct(false, $companyID);
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $state
     * @return array|bool
     */
    public function getFullTree($state)
    {
        if (!$state) {
            return false;
        }
        $query = 'SELECT node.state, node.domainID, node.controller, node.name, node.ID, node.abstract, node.skipBreadcrumb, node.parentID, 
            GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.url, cl.name) SEPARATOR "||" ) AS langs 
                FROM `' . $this->getTableName() . '` AS node '
            . ' LEFT JOIN `' . $this->getTableName() . '` AS parent ON node.lft BETWEEN parent.lft AND parent.rgt '
            . ' LEFT JOIN `' . $this->routeLang . '` AS cl ON cl.routeID = parent.ID '
            . ' WHERE parent.state = :state AND node.domainID = :domainID '
            . ' GROUP BY node.ID '
            . ' ORDER BY node.lft ';

        $binds['state'] = $state;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $state
     * @return array|bool
     */
    public function getSinglePath($state)
    {
        if (!$state) {
            return false;
        }
        $query = 'SELECT parent.state, parent.ID, GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang) SEPARATOR "||" ) AS langs 
                FROM `' . $this->getTableName() . '` AS node '
            . ' LEFT JOIN `' . $this->getTableName() . '` AS parent ON node.lft BETWEEN parent.lft AND parent.rgt '
            . ' LEFT JOIN `' . $this->routeLang . '` AS cl ON cl.routeID = parent.ID '
            . ' WHERE node.state = :state AND node.domainID = :domainID '
            . ' GROUP BY parent.ID '
            . ' ORDER BY node.lft ';
        $binds['state'] = $state;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @return bool
     */
    public function getLevel()
    {
        $query = 'SELECT node.name, (COUNT(parent.name) - 1) AS depth
                FROM `' . $this->getTableName() . '` AS node,
                        `' . $this->getTableName() . '` AS parent
                WHERE node.lft BETWEEN parent.lft AND parent.rgt AND parent.domainID = :domainID 
                GROUP BY node.name
                ORDER BY node.lft';
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @return array|bool
     */
    public function getRootChildren()
    {
        $query = 'SELECT node.ID, node.state
                FROM `' . $this->getTableName() . '` AS node
                WHERE node.domainID = :domainID AND node.parentID = 0
                GROUP BY node.ID
                ORDER BY node.lft;';

        $binds = array();
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $state
     * @return bool
     */
    public function getSubChildren($state)
    {
        $query = 'SELECT node.ID, node.state
                FROM `' . $this->getTableName() . '` AS node
                WHERE node.domainID = :domainID AND node.parentID = (
                    SELECT parent.ID FROM `' . $this->getTableName() . '` AS parent
                    WHERE parent.state = :state
                )
                GROUP BY node.ID
                ORDER BY node.lft;';

        $binds = array();
        $binds['domainID'] = $this->getDomainID();
        $binds['state'] = $state;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $state
     * @return bool
     */
    public function getSubTree($state)
    {
        if (!$state) {
            return false;
        }
        $query = 'SELECT node.state, (COUNT(parent.ID) - (sub_tree.depth + 1)) AS depth, 
                node.ID 
                FROM `' . $this->getTableName() . '` AS node,
                        `' . $this->getTableName() . '` AS parent,
                        `' . $this->getTableName() . '` AS sub_parent,
                        (
                                SELECT node.state, (COUNT(parent.state) - 1) AS depth
                                FROM `' . $this->getTableName() . '` AS node,
                                `' . $this->getTableName() . '` AS parent
                                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                                AND node.state = :state
                                GROUP BY node.state
                                ORDER BY node.lft
                        )AS sub_tree
                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                        AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt
                        AND sub_parent.state = sub_tree.state AND node.domainID = :domainID 
                GROUP BY node.ID
                ORDER BY node.lft;';
        $binds['state'] = $state;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @return bool
     */
    public function getRootTree()
    {
        $query = 'SELECT node.ID, node.controller, node.name, node.abstract, node.parentID, node.state  
                FROM `' . $this->getTableName() . '` AS node,
                        `' . $this->getTableName() . '` AS parent,
                        `' . $this->getTableName() . '` AS sub_parent,
                        (
                                SELECT node.state, (COUNT(parent.state) - 1) AS depth
                                FROM `' . $this->getTableName() . '` AS node,
                                `' . $this->getTableName() . '` AS parent
                                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                                AND node.parentID = 0
                                GROUP BY node.state
                                ORDER BY node.lft
                        )AS sub_tree
                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                        AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt
                        AND sub_parent.state = sub_tree.state AND node.domainID = :domainID AND 
                        parent.domainID = :domainID
                GROUP BY node.ID
                ORDER BY node.lft;';
        $binds = array();
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $state
     * @return bool|array
     */
    public function getChilds($state)
    {
        if (!$state) {
            return false;
        }
        $query = 'SELECT node.ID, node.lft, node.rgt, node.parentID, node.state, (COUNT(parent.ID) - (sub_tree.depth + 1)) AS depth
                FROM `' . $this->getTableName() . '` AS node,
                        `' . $this->getTableName() . '` AS parent,
                        `' . $this->getTableName() . '` AS sub_parent,
                        (
                                SELECT node.state, (COUNT(parent.state) - 1) AS depth
                                FROM `' . $this->getTableName() . '` AS node,
                                        `' . $this->getTableName() . '` AS parent
                                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                                        AND node.state = :state
                                GROUP BY node.state
                                ORDER BY node.lft
                        )AS sub_tree
                WHERE node.lft BETWEEN parent.lft AND parent.rgt
                        AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt
                        AND sub_parent.state = sub_tree.state AND node.domainID = :domainID 
                GROUP BY node.ID
                HAVING depth <= 10
                ORDER BY node.lft;';
        $binds['state'] = array($state, PDO::PARAM_STR);
        $binds['domainID'] = array($this->getDomainID(), PDO::PARAM_INT);
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @return bool
     */
    public function checkLevel()
    {
        $query = 'SELECT node.state, node.controller, node.name, node.abstract, node.parentID, node.ID,  
                GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.url, cl.name) SEPARATOR "||" ) AS langs 
                FROM `' . $this->getTableName() . '` AS node '
            . ' LEFT JOIN `' . $this->getTableName() . '` AS parent ON node.lft BETWEEN parent.lft AND parent.rgt '
            . ' LEFT JOIN `' . $this->routeLang . '` AS cl ON cl.routeID = node.ID '
            . ' WHERE node.lft BETWEEN parent.lft AND parent.rgt AND node.domainID = :domainID 
                GROUP BY node.ID
                ORDER BY node.lft';
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * @param $state
     * @return bool|string
     */
    public function addFirst($state)
    {
        $rgt = 0;
        try {
            $this->db->beginTransaction();

            $updateQuery = 'UPDATE `' . $this->getTableName() . '` SET rgt = rgt + 2 WHERE rgt > :rgt AND domainID = :domainID;
                            UPDATE `' . $this->getTableName() . '` SET lft = lft + 2 WHERE lft > :rgt AND domainID = :domainID';
            $binds['rgt'] = array($rgt, PDO::PARAM_INT);
            $binds['domainID'] = $this->getDomainID();
            $this->db->exec($updateQuery, $binds);
            $binds = array();
            $binds['domainID'] = $this->getDomainID();
            $binds['lft'] = array($rgt + 1, PDO::PARAM_INT);
            $binds['rgt'] = array($rgt + 2, PDO::PARAM_INT);
            $binds['state'] = $state;
            $insertQuery = 'INSERT INTO `' . $this->getTableName() . '`(state, lft, rgt,parentID, domainID) VALUES(:state, :lft, :rgt,0,:domainID);';
            $this->db->exec($insertQuery, $binds);
            $lastID = $this->db->lastInsertID();
            $this->db->commit();
            return $lastID;
        } catch (PDOException $e) {
            $this->db->rollBack();
            $this->setError($e->getMessage());
            return false;
        }
    }

    /**
     * @param $lft
     * @param $state
     * @param $parentID
     * @return bool|string
     */
    public function addAnother($lft, $state, $parentID)
    {
        try {
            $this->db->beginTransaction();

            $updateQuery = 'UPDATE `' . $this->getTableName() . '` SET rgt = rgt + 2 WHERE rgt > :myLft AND domainID = :domainID;
                            UPDATE `' . $this->getTableName() . '` SET lft = lft + 2 WHERE lft > :myLft AND domainID = :domainID;';
            $binds['myLft'] = array($lft, PDO::PARAM_INT);
            $binds['domainID'] = $this->getDomainID();
            $this->db->exec($updateQuery, $binds);
            $binds = array();
            $binds['myLeft'] = array($lft + 1, PDO::PARAM_INT);
            $binds['myRight'] = array($lft + 2, PDO::PARAM_INT);
            $binds['state'] = $state;
            $binds['parentID'] = $parentID;
            $binds['domainID'] = $this->getDomainID();
            $insertQuery = 'INSERT INTO `' . $this->getTableName() . '`(state, lft, rgt, parentID, domainID) VALUES(:state, :myLeft, :myRight, :parentID, :domainID);';
            $this->db->exec($insertQuery, $binds);
            $lastID = $this->db->lastInsertId();
            $this->db->commit();
            return $lastID;
        } catch (PDOException $e) {
            $this->db->rollBack();
            $this->setError($e->getMessage());
            return false;
        }
    }

    /**
     * @param $state
     * @return bool
     */
    public function getOne($state)
    {
        $query = 'SELECT ID,parentID,lft,rgt,((rgt - lft) + 1) AS myWidth FROM `' . $this->getTableName() . '` WHERE state = :state AND domainID = :domainID;';
        $binds['state'] = $state;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow();
    }

    /**
     * @param $ID
     * @return array|bool
     */
    public function checkParents($ID)
    {
        $one = $this->get('ID', $ID);
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE lft < :lft AND rgt > :rgt AND domainID = :domainID ORDER BY lft DESC';
        $binds['lft'] = array($one['lft'], PDO::PARAM_INT);
        $binds['rgt'] = array($one['rgt'], PDO::PARAM_INT);
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    /**
     * Dodajemy kategorie
     *
     * @method add
     * @param {String} $state
     * @param {String} $parent
     * @param {String} $leftSide
     * @return {Bool}
     */
    public function add($state, $parent = NULL)
    {
        $one = $this->getOne($parent);
        if ($one) {
            return $this->addAnother($one['lft'], $state, $one['ID']);
        } else {
            return $this->addFirst($state);
        }
    }

    /**
     * @param $state
     * @return bool
     */
    public function customDelete($state)
    {
        $one = $this->getOne($state);
        if (!$one) {
            return false;
        }

        try {
            $this->db->setAttribute(PDO::ATTR_AUTOCOMMIT, false);
            $this->db->beginTransaction();

            $deleteQuery = 'DELETE FROM `' . $this->getTableName() . '` WHERE lft BETWEEN :lft AND :rgt AND domainID = :domainID;';
            $binds['lft'] = array($one['lft'], PDO::PARAM_INT);
            $binds['rgt'] = array($one['rgt'], PDO::PARAM_INT);
            $binds['domainID'] = $this->getDomainID();
            $ok = $this->db->exec($deleteQuery, $binds);
            $this->db->closeCursor();

            $binds = array();
            $updateQuery = ' UPDATE `' . $this->getTableName() . '` SET rgt = rgt - :myWidth WHERE rgt > :rgt AND domainID = :domainID;
                             UPDATE `' . $this->getTableName() . '` SET lft = lft - :myWidth WHERE lft > :rgt AND domainID = :domainID;';
            $binds['myWidth'] = array($one['myWidth'], PDO::PARAM_INT);
            $binds['rgt'] = array($one['rgt'], PDO::PARAM_INT);
            $binds['domainID'] = $this->getDomainID();
            $ok = $this->db->exec($updateQuery, $binds);
            $this->db->closeCursor();

            $this->rebuildParents($state);

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            $this->setError($e->getMessage());
            return false;
        }
    }

    /**
     * @param $fromID
     * @param $toID
     * @return bool
     */
    public function move($fromID, $toID)
    {

        $resultArr = array();
        $parents = $this->checkParents($toID);

        foreach ($parents as $p) {
            if ($p['ID'] == $fromID) {
                return false;
            }
        }

        $select1 = ' SELECT lft, rgt, (rgt - lft + 1) AS width, ID, parentID 
            FROM `' . $this->getTableName() . '` WHERE `ID` = :ID AND domainID = :domainID ';
        $binds['ID'] = $fromID;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($select1, $binds)) {
            return false;
        }
        $actCat = $this->db->getRow();
        $resultArr['actCat'] = $actCat;

        $binds = array();
        $binds['domainID'] = $this->getDomainID();
        $select2 = ' SELECT lft, rgt FROM `' . $this->getTableName() . '` WHERE ID = :ID AND domainID = :domainID; ';
        $binds['ID'] = $toID;
        if (!$this->db->exec($select2, $binds)) {
            return false;
        }
        $parentCat = $this->db->getRow();
        $resultArr['parentCat'] = $parentCat;

        $step = $parentCat['rgt'] - $actCat['lft'];

        try {
            $this->db->beginTransaction();

            $binds = array();
            $insert = 'INSERT INTO `' . $this->routeTmp . '`
                        SELECT * FROM `' . $this->getTableName() . '`
                        WHERE lft >= :myLft AND lft <= :myRgt AND domainID = :domainID;';
            $binds['myLft'] = array($actCat['lft'], PDO::PARAM_INT);
            $binds['myRgt'] = array($actCat['rgt'], PDO::PARAM_INT);
            $binds['domainID'] = array($this->getDomainID(), PDO::PARAM_INT);

            $ok1 = $this->db->exec($insert, $binds);
            $resultArr['ok1'] = $ok1;
            $this->db->closeCursor();

            $binds = array();
            $update = 'UPDATE `' . $this->routeTmp . '`
                        SET lft = (lft + :step), 
                        rgt = (rgt + :step),
                        `ID` = -ID;';
            $binds['step'] = array($step, PDO::PARAM_INT);
            $ok2 = $this->db->exec($update, $binds);
            $this->db->closeCursor();

            $deleteCat = 'DELETE FROM `' . $this->getTableName() . '` WHERE lft BETWEEN ' . intval($actCat['lft']) . ' AND ' . intval($actCat['rgt']) . ' AND domainID = ' . $this->getDomainID() . '; ';
            $okDelete = $this->db->query($deleteCat);
            $resultArr['okDelete'] = $deleteCat;
            $this->db->closeCursor();

            $binds = array();
            $update2 = 'UPDATE `' . $this->getTableName() . '` SET lft = lft + :myWidth WHERE lft >= :parentRgt AND domainID = :domainID ;
                        UPDATE `' . $this->getTableName() . '` SET rgt = rgt + :myWidth WHERE rgt >= :parentRgt AND domainID = :domainID;';
            $binds['myWidth'] = $actCat['width'];
            $binds['parentRgt'] = $parentCat['rgt'];
            $binds['domainID'] = $this->getDomainID();
            $ok3 = $this->db->exec($update2, $binds);
            $resultArr['ok3'] = $ok3;
            $this->db->closeCursor();

            $binds = array();
            $select3 = 'SELECT lft, rgt, (rgt - lft + 1) AS width 
                        FROM `' . $this->getTableName() . '`
                        WHERE ID = :ID AND domainID = :domainID;';
            $binds['ID'] = $fromID;
            $binds['domainID'] = $this->getDomainID();

            $ok4 = $this->db->exec($select3, $binds);
            $resultArr['ok4'] = $ok4;

            $this->db->closeCursor();

            $insert2 = 'INSERT INTO `' . $this->getTableName() . '` SELECT * FROM `' . $this->routeTmp . '` WHERE domainID = ' . $this->getDomainID() . ';';
            $oki = $this->db->query($insert2);

            $resultArr['oki'] = $oki;

            $binds = array();
            $updateParent = ' UPDATE `' . $this->routeTmp . '` SET parentID = :parentID WHERE domainID = :domainID;';
            $binds['parentID'] = $toID;
            $binds['domainID'] = $this->getDomainID();
            $okParent = $this->db->exec($updateParent, $binds);
            $resultArr['okParent'] = $okParent;
            $this->db->closeCursor();

            $binds = array();
            $multiQuery = ' UPDATE `' . $this->getTableName() . '` SET rgt = rgt - :myWidth WHERE rgt > :myRgt AND domainID = :domainID;
                            UPDATE `' . $this->getTableName() . '` SET lft = lft - :myWidth WHERE lft > :myRgt AND domainID = :domainID;';
            $binds['myWidth'] = array($actCat['width'], PDO::PARAM_INT);
            $binds['myRgt'] = array($actCat['rgt'], PDO::PARAM_INT);
            $binds['domainID'] = $this->getDomainID();
            $ok5 = $this->db->exec($multiQuery, $binds);
            $resultArr['ok5'] = $ok5;
            $this->db->closeCursor();

            $update3 = 'UPDATE `' . $this->getTableName() . '` SET `ID` = -ID WHERE `ID` < 0 AND domainID = ' . $this->getDomainID() . ';';
            $ok6 = $this->db->exec($update3);
            $resultArr['ok6'] = $ok6;
            $this->db->closeCursor();

            $deleteTmp = 'DELETE FROM `' . $this->routeTmp . '` WHERE domainID = ' . $this->getDomainID() . ';';
            $deleteOK = $this->db->query($deleteTmp);
            $resultArr['deleteOK'] = $deleteOK;

            $one = $this->get('ID', $toID);
            $this->rebuildParents($one['state']);

            $two = $this->get('ID', $fromID);
            $this->rebuildParents($two['state']);

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            $this->setError($e->getMessage());
            return false;
        }

    }

    /**
     * @param $state
     * @return bool
     */
    public function rebuildParents($state)
    {
        $one = $this->get('state', $state);
        $tree = $this->getParents($one['lft'], $one['rgt'], 'DESC');
        $i = count($tree) - 1;
        foreach ($tree as $t) {
            $this->update($t['ID'], 'parentID', $i);
            $i--;
        }
        return true;
    }

    /**
     * @param $state
     * @return bool
     */
    public function stateExist($state)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE state = :state '
            . ' AND domainID = :domainID ';
        $binds['state'] = $state;
        $binds['domainID'] = $this->getDomainID();
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param $ID
     * @return bool
     */
    public function moveUp($ID)
    {
        $one = $this->get('ID', $ID);
        if (!$one) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE lft < :myLft AND domainID = :domainID  AND parentID = :parentID ORDER BY lft DESC LIMIT 1';
        $binds['myLft'] = array($one['lft'], PDO::PARAM_INT);
        $binds['domainID'] = $this->getDomainID();
        $binds['parentID'] = $one['parentID'];
        $this->db->exec($query, $binds);
        $leftItem = $this->db->getRow();
        $this->db->closeCursor();
        if (!$leftItem) {
            return false;
        }

        $multiQuery = ' UPDATE `' . $this->getTableName() . '` SET rgt = :rgt2, lft = :lft2  WHERE `ID` = :ID1 AND domainID = :domainID;
                        UPDATE `' . $this->getTableName() . '` SET rgt = :rgt1, lft = :lft1 WHERE `ID` = :ID2 AND domainID = :domainID; ';
        $binds = array();
        $binds['rgt1'] = $one['rgt'];
        $binds['lft1'] = $one['lft'];
        $binds['ID1'] = $one['ID'];
        $binds['rgt2'] = $leftItem['rgt'];
        $binds['lft2'] = $leftItem['lft'];
        $binds['ID2'] = $leftItem['ID'];
        $binds['domainID'] = $this->getDomainID();
        $ok = $this->db->exec($multiQuery, $binds);
        $this->db->closeCursor();
        return $ok;
    }

    /**
     * @param $ID
     * @return bool
     */
    public function moveDown($ID)
    {
        $one = $this->get('ID', $ID);
        if (!$one) {
            return false;
        }
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE rgt > :myRgt AND domainID = :domainID  AND parentID = :parentID ORDER BY lft ASC LIMIT 1';
        $binds['myRgt'] = array($one['rgt'], PDO::PARAM_INT);
        $binds['domainID'] = $this->getDomainID();
        $binds['parentID'] = $one['parentID'];
        $this->db->exec($query, $binds);
        $leftItem = $this->db->getRow();
        $this->db->closeCursor();
        if (!$leftItem) {
            return false;
        }

        $multiQuery = ' UPDATE `' . $this->getTableName() . '` SET rgt = :rgt2, lft = :lft2  WHERE `ID` = :ID1 AND domainID = :domainID;
                        UPDATE `' . $this->getTableName() . '` SET rgt = :rgt1, lft = :lft1 WHERE `ID` = :ID2 AND domainID = :domainID; ';
        $binds = array();
        $binds['rgt1'] = $one['rgt'];
        $binds['lft1'] = $one['lft'];
        $binds['ID1'] = $one['ID'];
        $binds['rgt2'] = $leftItem['rgt'];
        $binds['lft2'] = $leftItem['lft'];
        $binds['ID2'] = $leftItem['ID'];
        $binds['domainID'] = $this->getDomainID();
        $ok = $this->db->exec($multiQuery, $binds);
        $this->db->closeCursor();
        return $ok;
    }

    /**
     * @param $lft
     * @param $rgt
     * @param string $direct
     * @return array|bool
     */
    public function getParents($lft, $rgt, $direct = 'ASC')
    {
        $query = 'SELECT c.*,GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.url, cl.name) SEPARATOR "||" ) AS langs FROM `' . $this->getTableName() . '` AS c '
            . ' LEFT JOIN `' . $this->routeLang . '` AS cl ON cl.routeID = c.ID '
            . ' WHERE c.`lft` < :lft AND c.`rgt` > :rgt AND c.`domainID` = :domainID '
            . ' GROUP BY c.ID '
            . ' ORDER BY c.`lft` ' . $direct . ' ';
        $binds['lft'] = array($lft, PDO::PARAM_INT);
        $binds['rgt'] = array($rgt, PDO::PARAM_INT);
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) {
            return false;
        }
        $res = $this->LangFilter->splitArray($res, 'langs');
        return $res;
    }

    /**
     * @param $state
     * @return bool|mixed
     */
    public function getOneWithLang($state)
    {
        $query = 'SELECT c.*,GROUP_CONCAT( DISTINCT CONCAT_WS("::", cl.lang, cl.url, cl.name) SEPARATOR "||" ) AS langs FROM `' . $this->getTableName() . '` AS c '
            . ' LEFT JOIN `' . $this->routeLang . '` AS cl ON cl.routeID = c.ID '
            . ' WHERE c.`state` = :state AND c.`domainID` = :domainID '
            . ' GROUP BY c.ID ';
        $binds['domainID'] = $this->getDomainID();
        $binds['state'] = $state;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        $row = $this->db->getRow();
        if (!$row) {
            return false;
        }
        $row = $this->LangFilter->splitOne($row, 'langs');
        return $row;
    }

    /**
     * @param $last
     * @param $lastButOne
     * @param $domainID
     * @return bool
     */
    public function getByUrl($last, $lastButOne, $domainID)
    {
        $query = 'SELECT c.* FROM `' . $this->getTableName() . '` AS c '
            . ' LEFT JOIN `' . $this->routeLang . '` AS cl ON cl.routeID = c.ID 
            WHERE (cl.`url` = :url || cl.`url` LIKE :urlExtended ) AND c.domainID = :domainID ';

        $binds['url'] = '/' . $last;
        $binds['urlExtended'] = '/' . $lastButOne . '/%';
        $binds['domainID'] = $domainID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $state
     * @param $domainID
     * @return bool
     */
    public function getByState($state, $domainID)
    {
        $query = 'SELECT c.* FROM `' . $this->getTableName() . '` AS c 
        WHERE c.state = :state AND c.domainID = :domainID ';

        $binds['state'] = $state;
        $binds['domainID'] = $domainID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

}
