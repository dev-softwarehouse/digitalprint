<?php

namespace DreamSoft\Models\PrintShop;

use DreamSoft\Core\Model;

/**
 * Class PrintShop
 * @package DreamSoft\Controllers\PrintShop
 */
class PrintShop extends Model
{

    /**
     * @var bool
     */
    protected $groupID = false;
    /**
     * @var bool
     */
    protected $typeID = false;
    /**
     * @var bool
     */
    protected $formatID = false;
    /**
     * @var bool
     */
    protected $attrID = false;
    /**
     * @var bool
     */
    protected $optID = false;
    /**
     * @var bool
     */
    protected $controllerID = false;
    /**
     * @var bool
     */
    public $volume = false;
    /**
     * @var
     */
    public $calcInfo;

    /**
     * PrintShop constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
    }

    /**
     * @param $id
     * @return bool
     */
    public function setGroupID($id)
    {
        $this->groupID = $id;
        return true;
    }

    /**
     * @return bool
     */
    public function getGroupID()
    {
        return $this->groupID;
    }

    /**
     * @param $ID
     * @return bool
     */
    public function setTypeID($ID)
    {
        $this->typeID = $ID;
        return true;
    }

    /**
     * @return bool
     */
    public function getTypeID()
    {
        return $this->typeID;
    }

    /**
     * @param $volume
     * @return bool
     */
    public function setVolume($volume)
    {
        $this->volume = $volume;
        return true;
    }

    /**
     * @return bool
     */
    public function getVolume()
    {
        return $this->volume;
    }

    /**
     * @param $id
     * @return bool
     */
    public function setAttrID($id)
    {
        $this->attrID = $id;
        return true;
    }

    /**
     * @return bool
     */
    public function getAttrID()
    {
        return $this->attrID;
    }

    /**
     * @param $id
     * @return bool
     */
    public function setOptID($id)
    {
        $this->optID = $id;
        return true;
    }

    /**
     * @return bool
     */
    public function getOptID()
    {
        return $this->optID;
    }

    /**
     * @param $id
     * @return bool
     */
    public function setControllerID($id)
    {
        $this->controllerID = $id;
        return true;
    }

    /**
     * @return bool
     */
    public function getControllerID()
    {
        return $this->controllerID;
    }

    /**
     * @param $id
     * @return bool
     */
    public function setFormatID($id)
    {
        $this->formatID = $id;
        return true;
    }

    /**
     * @return bool
     */
    public function getFormatID()
    {
        return $this->formatID;
    }

}



