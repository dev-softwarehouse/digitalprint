<?php

namespace DreamSoft\Models\Upload;

use DreamSoft\Core\Model;

class UploadFile extends Model
{

    /**
     * UploadFile constructor.
     */
    public function __construct()
    {

        parent::__construct();
        $this->prefix = '';
        $this->setTableName('uploadedFiles', true);
    }

    /**
     * @param $name
     * @param $destination
     * @param $path
     * @return bool|string
     */
    public function setUpload($name, $destination, $path)
    {
        $query = 'INSERT INTO `' . $this->getTableName() . '` (`name`, `created`, `destination`, `path`) VALUES (:name, :created, :destination, :path)';

        $binds[':name'] = $name;
        $binds[':created'] = date('Y-m-d h:i:s');
        $binds[':destination'] = $destination;
        $binds[':path'] = $path;
        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();

    }

    /**
     * @return bool|mixed
     */
    public function getMaxID()
    {
        $query = 'SELECT MAX(`ID`) AS maximum FROM `' . $this->getTableName() . '`';
        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }

    /**
     * @param null $type
     * @return array|bool
     */
    public function getFiles($type = NULL)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`  ';

        if( $type ) {
            $query .= '  WHERE `destination` = :type ';
            $binds['type'] = $type;
        } else {
            $query .= '  WHERE `destination` != :type ';
            $binds['type'] = 'typePattern';
        }


        $query .= ' ORDER BY `created` DESC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    /**
     * @param $fileID
     * @return bool|mixed
     */
    public function getFileByID($fileID)
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` = :fileID';

        $binds[':fileID'] = $fileID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $filesIds
     * @return array|bool
     */
    public function getFileByList($filesIds)
    {
        if (empty($filesIds) || !is_array($filesIds)) {
            return false;
        }

        $filesIds = array_unique(array_filter($filesIds));

        $query = 'SELECT * FROM `' . $this->getTableName() . '` WHERE `ID` IN (' . implode(',', $filesIds) . ') ';

        $binds = array();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if ($res) {
            $result = array();
            foreach ($res as $row) {
                $result[$row['ID']] = $row;
            }
            return $result;
        }

        return false;
    }
}

