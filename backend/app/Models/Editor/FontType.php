<?php

namespace DreamSoft\Models\Editor;

/**
 * @class Font
 * @extends EditorInterface
 */
class FontType extends EditorInterface
{

    /**
     * FontType constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('fontTypes', true);
    }

    /**
     * @param $fontID
     * @param $type
     * @return mixed
     */
    public function existType($fontID, $type)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `fontID` = :fontID AND `type` = :type ';
        $binds['fontID'] = $fontID;
        $binds['type'] = $type;

        $this->db->exec($query, $binds);

        return $this->db->getOne();
    }

    /**
     * @param $fontID
     * @return array
     */
    public function getTypesByFontID($fontID)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE `fontID` = :fontID ';

        $binds['fontID'] = $fontID;

        $this->db->exec($query, $binds);

        return $this->db->getAll();
    }
}