<?php

namespace DreamSoft\Models\User;

/**
 * Description of Superuser
 *
 * @author Właściciel
 */

use DreamSoft\Core\Model;
use DreamSoft\Libs\Auth;

class SuperUser extends Model
{

    private $salt;
    protected $Setting;


    public function __construct()
    {
        parent::__construct(true);
        $prefix = true;
        $this->setTableName('superusers', $prefix);
        $this->salt = Auth::salt;
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
        $binds[':pass'] = hash('sha512', $password . $this->salt);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return true;
    }

    /**
     * @param $login
     * @param $password
     * @return bool|mixed
     */
    public function login($login, $password)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` 
                  WHERE `login` = :login AND `pass` = :pass ';

        $binds[':login'] = $login;
        $binds[':pass'] = hash('sha512', $password . $this->salt);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getRow();
    }

    /**
     * @param $login
     * @return bool
     */
    public function freeLogin($login)
    {

        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE login = :login';
        $binds[':login'] = $login;

        $this->db->exec($query, $binds);

        if ($this->db->rowCount() == 0)
            return true;
        else
            return false;
    }

}
