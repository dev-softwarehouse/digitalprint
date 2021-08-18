<?php

namespace DreamSoft\Models\User;

/**
 * Description of User
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;
use DreamSoft\Libs\Auth;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Behaviours\QueryFilter;
use Exception;

class User extends Model
{

    /**
     * @var int
     */
    private $domainID;

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return int
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param $companyID
     */
    public function setRemote($companyID)
    {
        parent::__construct(false, $companyID);
    }

    /**
     * @var QueryFilter
     */
    protected $QueryFilter;

    protected $addressUsers;

    /**
     * @var Setting
     */
    protected $Setting;

    /**
     * @var string
     */
    protected $userOptions;

    /**
     * User constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->QueryFilter = QueryFilter::getInstance();
        $this->setTableName('users', false);
        $this->addressUsers = 'address_users';
        $this->userOptions = $this->prefix . 'userOptions';
        $this->Setting = new Setting();
        $this->Setting->setModule('config');
        $this->Setting->setDomainID(NULL);
        $this->Setting->setLang(NULL);
        $saltOff = $this->Setting->getValue('saltOff');

        if ($saltOff) {
            $this->salt = '';
        } else {
            $this->salt = Auth::salt;
        }
    }

    /**
     * @param $email
     * @param null $password
     * @param $firstname
     * @param $lastname
     * @param int $group
     * @param int $special
     * @return mixed
     * @throws Exception
     */
    public function customCreate($email, $password = null, $firstname, $lastname, $group = 0, $special = 0)
    {


        if (!$this->freeEmail($email)) {
            throw new Exception('Email zajęty');
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '` (
                `user`,
                `pass`,
                `name`,
                `lastname`,
                `group`,
                `special`,
                `login`,
                `created`
                ) VALUES (
                :user,
                :pass,
                :name,
                :lastname,
                :group,
                :special,
                :login,
                :created
                ) 
              ';

        $binds[':user'] = $email;
        $binds['login'] = $email;
        $binds[':pass'] = null;
        if ($password) {
            $binds[':pass'] = hash('sha512', $password . $this->salt);
        }
        $binds[':group'] = array($group, 'int');
        $binds[':special'] = array($special, 'int');
        $binds[':name'] = $firstname;
        $binds[':lastname'] = $lastname;
        $binds['created'] = date('Y-m-d H:i:s');

        if (!$this->db->exec($query, $binds)) {
            throw new Exception('Nie udało się dodać użytkownika');
        }
        return $this->db->lastInsertID();
    }

    /**
     * @param $email
     * @param $firstName
     * @param null $password
     * @return string
     * @throws Exception
     */
    public function addSimple($email, $firstName, $password = null)
    {
        if (!$this->freeEmail($email)) {
            throw new Exception('Email used');
        }

        $query = 'INSERT INTO `' . $this->getTableName() . '` (
                `user`,
                `pass`,
                `name`,
                `login`,
                `created`,
                `domainID`
                ) VALUES (
                :user,
                :pass,
                :name,
                :login,
                :created,
                :domainID
                ) 
              ';

        $binds['user'] = $binds['login'] = $email;
        $binds['domainID'] = $this->getDomainID();
        $binds['pass'] = '12345';
        if ($password) {
            $binds['pass'] = hash('sha512', $password . DEFAULT_SALT);
        }

        $binds['name'] = $firstName;
        $binds['created'] = date('Y-m-d H:i:s');

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();
    }

    /**
     * @param $ID
     * @param $password
     * @return bool
     */
    public function editPassword($ID, $password)
    {
        $query = 'UPDATE `' . $this->getTableName() . '` SET 
                  `pass` = :pass
                  WHERE ID = :ID
                ';
        $binds[':ID'] = array($ID, 'int');
        $binds[':pass'] = hash('sha512', $password . DEFAULT_SALT);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $email
     * @param $password
     * @return bool|mixed
     */
    public function login($email, $password)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                  WHERE `user` = :user AND `pass` = :pass
                ';

        $binds[':user'] = $email;
        $binds[':pass'] = hash('sha512', $password . $this->salt);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow();
    }

    /**
     * @param $email
     * @return bool
     */
    public function freeEmail($email)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE user = :user AND (`domainID` = :domainID OR `domainID` IS NULL)  ';
        $binds['user'] = $email;
        $binds['domainID'] = $this->getDomainID();

        $this->db->exec($query, $binds);

        if ($this->db->rowCount() == 0)
            return true;
        else
            return false;
    }

    /**
     * @param null $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @param string $logicalOperator
     * @return bool
     */
    public function getList($filters = NULL, $offset = 0, $limit = 30, $orderBy = array(), $logicalOperator = 'AND')
    {

        $query = 'SELECT SQL_NO_CACHE `' . $this->getTableName() . '`.*, uop.sellerID as userSellerID, addressInvoice.companyName, addressInvoice.telephone, addressInvoice.nip '
            . ' FROM `' . $this->getTableName() . '` ';

        $query .= ' 
                LEFT JOIN  `' . $this->userOptions . '` as uop ON uop.`uID` = `' . $this->getTableName() . '`.`ID` 
                LEFT JOIN  `address_users` as addressUser ON addressUser.`userID` = `' . $this->getTableName() . '`.`ID`
                 AND addressUser.`type` = 2 AND addressUser.`default` = 1 
                LEFT JOIN `address` as addressInvoice ON addressInvoice.ID = addressUser.addressID
                LEFT JOIN `dp_userDiscountGroups` as userDiscountGroups ON userDiscountGroups.userID = `' . $this->getTableName() . '`.`ID` 
                 ';

        $prepare = $this->QueryFilter->prepare($filters, $logicalOperator);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        if (empty($orderBy)) {
            $query .= ' ORDER BY `users`.`date` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {

                if (strstr($ord, '.')) {
                    $exp = explode('.', $ord);
                    if (strlen($exp[0]) > 0) {
                        $sortTable = '`' . $exp[0] . '`.';
                    } else {
                        $sortTable = '';
                    }
                    $ord = $exp[1];

                } else {
                    $sortTable = '`users`.';
                }
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' ' . $sortTable . '`' . $ord . '` ' . $direct . ',';

            }
            $query .= substr($orderQuery, 0, -1);
        }

        $query .= ' LIMIT ' . intval($offset) . ',' . intval($limit) . ' ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $filters
     * @return bool
     */
    public function count($filters)
    {
        $query = 'SELECT COUNT(`' . $this->getTableName() . '`.`ID`) as count FROM `' . $this->getTableName() . '` ';

        $query .= ' 
                LEFT JOIN  `' . $this->userOptions . '` as uop ON uop.`uID` = `' . $this->getTableName() . '`.`ID` 
                LEFT JOIN  `address_users` as addressUserDelivery ON addressUserDelivery.`userID` = `' . $this->getTableName() . '`.`ID`
                 AND addressUserDelivery.`type` = 1 AND addressUserDelivery.`default` = 1  
                LEFT JOIN  `address_users` as addressUserInvoice ON addressUserInvoice.`userID` = `' . $this->getTableName() . '`.`ID`
                 AND addressUserInvoice.`type` = 2 AND addressUserInvoice.`default` = 1 
                LEFT JOIN `address` as addressInvoice ON addressInvoice.ID = addressUserInvoice.addressID
                LEFT JOIN `address` as addressDelivery ON addressDelivery.ID = addressUserDelivery.addressID 
                LEFT JOIN `dp_userDiscountGroups` as userDiscountGroups ON userDiscountGroups.userID = `' . $this->getTableName() . '`.`ID` 
                 ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ASC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->rowCount();
    }

    /**
     * @param $email
     * @param $pass
     * @param null $domainID
     * @return bool
     */
    public function setPass($email, $pass, $domainID = NULL)
    {

        $query = 'UPDATE `users` SET `pass` = :pass WHERE `user` = :user';

        $binds[':user'] = $email;
        $binds[':pass'] = $pass;

        if ($domainID) {
            $binds[':domainID'] = $domainID;
            $query .= ' AND (domainID = :domainID OR domainID IS NULL) ';
        } else {
            $query .= ' AND domainID IS NULL';
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @param $userID
     * @return bool
     */
    public function getOne($userID)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE ID = :userID '
            . ' AND ( domainID = :domainID OR domainID IS NULL ) ';

        if ($this->getDomainID() > 0) {
            $binds['domainID'] = $this->getDomainID();
        }

        $binds['userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $userID
     * @return bool
     */
    public function getUserByID($userID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE ID = :userID ';

        $binds['userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $pattern
     * @return bool
     */
    public function getEmails($pattern)
    {
        $query = 'SELECT `user`,`name`,`lastname` 
                        FROM `' . $this->getTableName() . '` 
                        WHERE `user` LIKE "%' . $pattern . '%" AND block = 0 ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    public function getSupervisor()
    {

        $query = ' SELECT u.`user`, u.`name`, u.`lastname` FROM `' . $this->getTableName() . '` as u
            LEFT JOIN `dp_userGroups` as ug ON ug.userID = u.ID
                WHERE u.`thegroup` = 4 AND ug.groupID = 1 AND u.block = 0 AND u.`user` LIKE "%@%"
                GROUP BY u.ID ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getAll();
    }

    public function getAllToUpdate()
    {

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `mongoUpdate` = :mongoUpdate ';
        $binds['mongoUpdate'] = 0;

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

    /**
     * @param $userID
     * @return array|bool
     */
    public function getPass($userID)
    {
        $query = 'SELECT `pass` FROM `' . $this->getTableName() . '` WHERE `ID` = :userID ';
        $binds['userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getOne();
        if (!$res) return false;

        return $res;
    }

    /**
     * @param $email
     * @return bool
     */
    public function getByEmail($email)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE user = :email '
            . ' AND ( domainID = :domainID OR domainID IS NULL ) ';

        if ($this->getDomainID() > 0) {
            $binds['domainID'] = $this->getDomainID();
        }

        $binds['email'] = $email;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $aclType
     * @return bool
     */
    public function getByAclType($aclType)
    {
        $query = 'SELECT u.name, u.lastname, u.user, u.ID FROM `' . $this->getTableName() . '` as u
         LEFT JOIN `dp_userOptions` as uo ON uo.uID = u.ID
          WHERE uo.userTypeID = :aclType AND (`domainID` = :domainID OR `domainID` IS NULL) GROUP BY u.ID ';

        $binds['aclType'] = $aclType;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }
}
