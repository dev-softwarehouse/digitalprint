<?php

namespace DreamSoft\Models\Editor;

/**
 * @class Font
 * @extends EditorInterface
 */


class Font extends EditorInterface
{

    /**
     * @var string
     */
    private $fontTypes;
    /**
     * @var array
     */
    public $types = array('Regular', 'Italic', 'Bold', 'BoldItalic');

    /**
     * Font constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('fonts', true);
        $this->fontTypes = $this->prefix . 'fontTypes';
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function getOne($ID)
    {
        $query = ' SELECT * FROM `' . $this->getTableName() . '` as f '
            . ' LEFT JOIN `' . $this->fontTypes . '` as ft ON f.ID = ft.fontID '
            . ' WHERE f.ID = :ID ';
        $binds['ID'] = $ID;
        $this->db->exec($query, $binds);
        return $this->db->getRow();
    }

    /**
     * @return array|bool
     */
    public function getAll()
    {

        $query = ' SELECT * FROM `' . $this->getTableName() . '` as f '
            . ' LEFT JOIN `' . $this->fontTypes . '` as ft ON f.ID = ft.fontID ORDER BY f.`name` ';
        $binds = array();
        $this->db->exec($query, $binds);
        return $this->db->getAll();

    }

    /**
     * @param $key
     * @param $value
     * @return mixed
     */
    public function existFont($key, $value)
    {
        $query = 'SELECT ID FROM `' . $this->getTableName() . '` WHERE `' . $key . '` = :' . $key . ' ';
        $binds[':' . $key] = $value;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

}
