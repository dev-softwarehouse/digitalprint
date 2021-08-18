<?php

namespace DreamSoft\Core;

use DreamSoft\Libs\ConnectionFactory;
use DreamSoft\Libs\ConnectionSwitchFactory;
use DreamSoft\Libs\Debugger;
use PDO;
use stdClass;
use Exception;
use DreamSoft\Libs\Singleton;

/**
 * Class Model
 * @package DreamSoft\Libs
 */
class Model extends Singleton
{
    /**
     * @var ConnectionFactory
     */
    public $db;
    public $isRoot;
    public $tableName;
    public $prefix;
    public $behaviours;
    protected $isPrefix = true;
    private $behavioursDir;
    public $hasMany = array();
    public $fields = '*';
    public $useBehaviours;
    protected $Errors = array();

    /**
     * Model constructor.
     * @param bool $root
     * @param null $companyID
     */
    public function __construct($root = false, $companyID = NULL)
    {
        parent::__construct();
        $this->isRoot = $root;
        $this->behavioursDir = BASE_DIR . 'models' . '/' . 'behaviours';

        $this->behaviours = new stdClass();

        try {
            $connectionFactory = new ConnectionSwitchFactory($root, $companyID);
            $this->setDb($connectionFactory->getConnection());
            if( $root ) {
                $this->updateTrace();
            }
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

        $this->prefix = 'dp_';
        try {
            $this->useBehaviours();
        } catch (Exception $e) {
            $this->debug($e->getMessage());
        }

    }

    /**
     * @param mixed $db
     */
    public function setDb($db)
    {
        $this->db = $db;
    }

    /**
     * @return ConnectionFactory
     */
    public function getDb()
    {
        return $this->db;
    }

    /**
     *
     */
    public function __destruct()
    {
        if (is_object($this->db)) {
            $allModelErrors = $this->db->getError();
            $this->db->close();
        } else {
            $allModelErrors[] = 'Object $this->db is not an object';
        }

        if (!empty($allModelErrors)) {
            $this->debug($allModelErrors);
        }
    }

    /**
     * @param $newError
     */
    public function setError($newError)
    {
        $this->Errors[] = $newError;
    }

    /**
     * @return array
     */
    public function getErrors()
    {
        return $this->Errors;
    }

    /**
     * @return string
     */
    public function getDbError()
    {
        return $this->db->getError();
    }

    /**
     * @return mixed
     */
    public function getDBName()
    {
        $query = 'SELECT database()';
        $binds = array();
        $this->db->exec($query, $binds);
        return $this->db->getOne();
    }

    /**
     * @param $name
     * @param bool $prefix
     */
    public function setTableName($name, $prefix = true)
    {
        $this->isPrefix = $prefix;
        $this->tableName = $name;
    }

    /**
     * @return string
     */
    public function getTableName()
    {
        if ($this->isPrefix) {
            return $this->prefix . $this->tableName;
        } else {
            return $this->tableName;
        }
    }

    /**
     * @return string
     */
    public function getModelName()
    {
        return get_called_class();
    }

    /**
     * @param $fields
     */
    public function setFields($fields)
    {
        $this->fields = $fields;
    }

    /**
     * @return string
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * @param $key
     * @param $value
     * @param bool $multiple
     * @return mixed
     */
    public function get($key, $value, $multiple = false)
    {
        $fields = $this->getFields();
        if (is_array($fields)) {
            $fieldsStr = '';
            foreach ($fields as $row) {
                $fieldsStr .= '`' . $this->getTableName() . '`.' . $row . ',';
            }
            $fieldsStr = substr($fieldsStr, 0, -1);
        } else {
            $fieldsStr = '*';
        }
        $query = 'SELECT ' . $fieldsStr . ' FROM `' . $this->getTableName() . '` WHERE `' . $key . '` = :' . $key . ' ';

        $binds[':' . $key] = $value;

        $this->db->exec($query, $binds);
        if (!$multiple) {
            return $this->db->getRow();
        } else {
            $response = $this->db->getAll();
            return $response;
        }
    }

    /**
     * @param $ID
     * @param $key
     * @param $value
     * @return bool
     */
    public function update($ID, $key, $value)
    {
        if ($value === '') {
            $value = null;
        }
        $query = 'UPDATE `' . $this->getTableName() . '` SET `' . $key . '` = :' . $key . ' WHERE ID = :ID';
        $binds[':' . $key] = $value;
        $binds[':ID'] = $ID;
        if (!$this->db->exec($query, $binds)) {
            return false;
        } else
            return true;
    }

    /**
     * @param $key
     * @param $value
     * @return bool
     */
    public function exist($key, $value)
    {
        if (!is_array($key)) {
            $key = [$key];
            $value = [$value];
        }
        if (count($key) != count($value)) {
            throw new Exception('keys and values length must be equal');
        }
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE ';
        $where = [];
        $binds = [];
        for ($i = 0; $i < count($key); $i++) {
            $where[] = '`' . $key[$i] . '` = :' . $key[$i] . ' ';
            $binds[':' . $key[$i]] = $value[$i];
        }
        $query .= join(' AND ', $where);

        $this->db->exec($query, $binds);

        return ($this->db->rowCount() > 0);
    }

    /**
     * @throws Exception
     */
    public function useBehaviours()
    {
        if (!empty($this->useBehaviours) && is_array($this->useBehaviours)) {
            foreach ($this->useBehaviours as $row) {
                if (is_file($this->behavioursDir . '/' . $row . '.php')) {
                    include_once($this->behavioursDir . '/' . $row . '.php');
                    $this->behaviours->{$row} = new $row();
                } else {
                    throw new Exception('Problem z behaviorem ' . $row . ' nie istnieje lub ma złą nazwę.');
                }
            }
        }
    }

    /**
     * @param $ID
     * @param bool $recursive
     * @return bool
     */
    public function findByID($ID, $recursive = false)
    {
        if (is_array($this->fields)) {
            $fields = '';
            foreach ($this->fields as $row) {
                $fields .= '`' . $this->getTableName() . '`.' . $row . ',';
            }

        } else {
            $fields = '`' . $this->getTableName() . '`.' . $this->fields . ',';
        }


        if ($recursive) {
            $joins = '';
            if (!empty($this->hasMany)) {
                foreach ($this->hasMany as $model => $row) {
                    $inst = $model::getInstance();
                    $tableName = $inst->getTableName();
                    $modelFields = $inst->getFields();
                    if (is_array($modelFields)) {
                        foreach ($modelFields as $row) {
                            $fields .= '`' . $tableName . '`.' . $row . ',';
                        }

                    } else {
                        $fields .= '`' . $tableName . '`.' . $inst->getFields() . ',';
                    }
                    $joins .= 'LEFT JOIN `' . $tableName . '` ON `' . $this->getTableName() . '`.ID = `' . $tableName . '`.' . $row['key'] . ' ';
                }
            }
        }

        $fields = substr($fields, 0, -1);
        $query = 'SELECT ' . $fields . ' FROM `' . $this->getTableName() . '` ';
        $binds[':ID'] = $ID;
        $query .= $joins;
        $query .= ' WHERE `' . $this->getTableName() . '`.`ID` = :ID ';
        $this->db->exec($query, $binds);
        if ($recursive) {
            $res = $this->db->getAll();
            if (!$res && !is_array($res)) {
                return false;
            }
            return $res;
        } else {
            return $this->db->getRow();
        }
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {
        $fields = $this->getFields();
        if (is_array($fields)) {
            $fieldsStr = '';
            foreach ($fields as $row) {
                $fieldsStr .= '`' . $this->getTableName() . '`.' . $row . ',';
            }
            $fieldsStr = substr($fieldsStr, 0, -1);
        } else {
            $fieldsStr = '*';
        }
        $query = 'SELECT ' . $fieldsStr . ' FROM `' . $this->getTableName() . '` ';
        $binds = array();

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

    public function getAllWithLang($langTable, $joinColumn)
    {
        $query = 'select t1.ID,l.name,l.slug,l.lang from ' . $this->getTableName() . ' t1 join ' . $langTable . ' l on  l.' . $joinColumn . '=t1.ID';
        if (!$this->db->exec($query)) {
            return false;
        }
        $res = $this->db->getAll();
        if (!$res) return false;
        return $res;
    }

    /**
     * @param $key
     * @param $value
     * @return bool
     */
    public function delete($key, $value)
    {
        if (!is_array($key)) {
            $key = [$key];
            $value = [$value];
        }
        if (count($key) != count($value)) {
            throw new Exception('keys and values length must be equal');
        }
        $query = 'DELETE FROM `' . $this->getTableName() . '` WHERE ';
        $where = [];
        $binds = [];
        for ($i = 0; $i < count($key); $i++) {
            $where[] = '`' . $key[$i] . '` = :' . $key[$i] . ' ';
            $binds[':' . $key[$i]] = $value[$i];
        }
        $query .= join(' AND ', $where);

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return true;
    }

    /**
     * @param $params array | object
     * @return bool|string
     */
    public function create($params)
    {

        if (empty($params)) {
            return false;
        }

        $fields = '';
        $values = '';
        $binds = array();
        foreach ($params as $p => $v) {
            $fields .= '`' . $p . '`,';
            $values .= ':' . $p . ',';
            $binds[$p] = $v;
        }
        $fields = substr($fields, 0, strlen($fields) - 1);
        $values = substr($values, 0, strlen($values) - 1);

        $query = 'INSERT INTO `' . $this->getTableName() . '` (
                ' . $fields . '
                ) VALUES (
                 ' . $values . '
                )
              ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->lastInsertID();

    }

    /**
     * @param $ID
     * @param $params array Updated columns
     * @return bool
     */
    public function updateAll($ID, $params)
    {

        if (empty($params)) {
            return false;
        }

        $pairs = array();
        $binds = array();
        foreach ($params as $p => $v) {
            $pairs[] = ' `' . $p . '` = :' . $p;
            $binds[$p] = $v;
        }

        $query = 'UPDATE `' . $this->getTableName() . '` SET ';
        // '`'.$key.'` = :'.$key.' ';
        $query .= implode(',', $pairs);
        $query .= ' WHERE ID = :ID';
        $binds[':ID'] = $ID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        } else
            return true;
    }

    /**
     * @param $list
     * @return array|bool
     */
    public function getByList($list)
    {
        if (empty($list)) {
            return false;
        }

        $query = 'SELECT * FROM `' . $this->getTableName() . '` '
            . ' WHERE `ID` IN ( ' . implode(',', $list) . ' ) ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();
        $result = array();
        foreach ($res as $row) {
            $result[$row['ID']] = $row;
        }
        return $result;
    }

    /**
     * @return bool
     */
    public function debug()
    {
        $Debugger = new Debugger();
        $Debugger->setDebugFile('model');
        $arguments = func_get_args();
        return $Debugger->debug($arguments);
    }

    public function updateTrace()
    {
        $Debugger = new Debugger();
        return $Debugger->updateTrace();
    }

    /**
     * @return mixed
     */
    public static function getInstance()
    {
        $class = get_called_class();
        if (!isset(self::$instances[$class])) {
            self::$instances[$class] = new $class;
        } else if ( isset(self::$instances[$class]) && method_exists(self::$instances[$class],'getDb') ) {
            $pdo = self::$instances[$class]->getDb();
            if( !$pdo ) {
                self::$instances[$class] = new $class;
            } else {
                if( !method_exists($pdo,'getStmt') ) {
                    self::$instances[$class] = new $class;
                } else {
                    $stmt = $pdo->getStmt();
                    if( !$stmt ) {
                        self::$instances[$class] = new $class;
                    }
                }
            }

        }

        return self::$instances[$class];
    }

}
