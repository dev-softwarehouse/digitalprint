<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOptionDescription;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttribute;

class OptionDescriptionsController extends Controller
{

    /**
     * @var PrintShopConfigOptionDescription
     */
    private $PrintShopConfigOptionDescription;
    /**
     * @var PrintShopConfigAttribute
     */
    private $PrintShopConfigAttribute;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigOptionDescription = PrintShopConfigOptionDescription::getInstance();
        $this->PrintShopConfigAttribute = PrintShopConfigAttribute::getInstance();
    }

    public function optionDescriptions($attrID, $optionID)
    {
        $attribute = $this->PrintShopConfigAttribute->customGet($attrID);
        $this->PrintShopConfigOptionDescription->setAttrID($attrID);
        $this->PrintShopConfigOptionDescription->setOptID($optionID);

        return $this->PrintShopConfigOptionDescription->customGetAll($attribute['function'], $this->domainID);
    }

    public function put_optionDescriptions($attrID, $optionID)
    {
        $this->PrintShopConfigOptionDescription->setAttrID($attrID);
        $this->PrintShopConfigOptionDescription->setOptID($optionID);
        $data = $this->Data->getAllPost();
        foreach ($data as $description) {
            if ($this->PrintShopConfigOptionDescription->customExists($description['ID'], $this->domainID)) {
                $res = $this->PrintShopConfigOptionDescription->customUpdate($description['ID'], $description['value'], $this->domainID);
                if ($res===false) {
                    return ['response' => false];
                }
            } else {
                $res = $this->PrintShopConfigOptionDescription->customCreate($description['ID'], $description['value'], $this->domainID);
                if ($res===false) {
                    return ['response' => false];
                }
            }
        }
        return ['response' => true];
    }

}
