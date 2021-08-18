<?php
/**
 * Programmer Rafał Leśniak - 11.12.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-12-2017
 * Time: 14:13
 */

namespace DreamSoft\Libs;

use PDO;
use PDOException;
use PDOStatement;

class ConnectionFactory extends Singleton
{
    /**
     * @var PDO
     */
    protected $pdo;
    /**
     * @var PDOStatement
     */
    protected $stmt;
    /**
     * @var string
     */
    private $error = '';

    /**
     * ConnectionFactory constructor.
     */
    public function __construct()
    {

    }

    public function __destruct()
    {
        if( $this->stmt instanceof PDOStatement) {
            $this->stmt->closeCursor();
        }

        if( isset($this->stmt) && $this->stmt ) {
            $this->stmt = NULL;
        }

        if( isset($this->pdo) && $this->pdo ) {
            $this->pdo = NULL;
        }

    }

    public function setError($error)
    {
        $this->error = $error;
    }

    /**
     * @return string
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * @return PDO
     */
    public function getPdo()
    {
        return $this->pdo;
    }

    /**
     * @param PDO $pdo
     */
    public function setPdo($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * @param $query
     * @param array $binds
     * @return bool
     */
    public function exec($query, $binds = array())
    {
        $Debugger = new Debugger();

        if( !$this->pdo ) {
            $Debugger->debug( 'Missing PDO object in: ', get_called_class() );
            return false;
        }
        try {

            $this->stmt = $this->pdo->prepare($query);

            if (!empty($binds))
                foreach ($binds as $key => $bind) {
                    if (!is_array($bind)) {
                        $tmp = $bind;
                        unset($bind);
                        $bind[0] = $tmp;
                    }

                    if (isset($bind[1]) && $bind[1] == 'int')
                        $bind[1] = PDO::PARAM_INT;
                    elseif (isset($bind[1]) && $bind[1] == 3)
                        $bind[1] = PDO::PARAM_LOB;
                    else
                        $bind[1] = PDO::PARAM_STR;

                    $this->stmt->bindValue($key, $bind[0], $bind[1]);
                }

            return $this->stmt->execute();
        } catch (PDOException $e) {
            $Debugger->debug($e->getMessage());
            $error['mysql'] = array('message' => $e->getMessage(), 'code' => $e->getCode());
            $this->setError($error);
            return false;
        }
    }

    /**
     * @param int $fetch_style
     * @return array
     */
    public function getAll($fetch_style = PDO::FETCH_ASSOC)
    {
        return $this->stmt->fetchAll($fetch_style);
    }

    /**
     * @param int $fetch_style
     * @return mixed
     */
    public function getRow($fetch_style = PDO::FETCH_ASSOC)
    {
        return $this->stmt->fetch($fetch_style);
    }

    /**
     * @return mixed
     */
    public function getOne()
    {
        return $this->stmt->fetchColumn();
    }

    /**
     * @return int
     */
    public function rowCount()
    {
        return $this->stmt->rowCount();
    }

    /**
     * @return string
     */
    public function lastInsertId()
    {
        return $this->pdo->lastInsertId();
    }

    /**
     * @return PDOStatement
     */
    public function getStmt()
    {
        return $this->stmt;
    }

    /**
     * @return string
     */
    public function getQuery()
    {
        return $this->stmt->queryString;
    }

    public function beginTransaction()
    {
        $this->pdo->beginTransaction();
    }

    public function commit()
    {
        $this->pdo->commit();
    }

    public function rollBack()
    {
        $this->pdo->rollBack();
    }

    public function close()
    {
        if( $this->stmt instanceof PDOStatement) {
            $this->stmt->closeCursor();
        }
        $this->stmt = null;
        $this->pdo = null;
        unset($this->pdo);
    }

    public function query($query)
    {
        $this->pdo->query($query);
    }

    public function closeCursor()
    {
        $this->stmt->closeCursor();
    }

    public function setAttribute($attribute, $value)
    {
        $this->pdo->setAttribute($attribute, $value);
    }
}