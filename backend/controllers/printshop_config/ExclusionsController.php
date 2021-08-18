<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigExclusion;

/**
 * Description of ExclusionsController
 *
 * @author Rafał
 */
class ExclusionsController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var PrintShopConfigExclusion
     */
    protected $PrintShopConfigExclusion;

    /**
     * ExclusionsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigExclusion = PrintShopConfigExclusion::getInstance();
    }

    /**
     * @param $attrID
     * @param $optionID
     * @return array
     */
    public function exclusions($attrID, $optionID)
    {
        $this->PrintShopConfigExclusion->setAttrID($attrID);
        $this->PrintShopConfigExclusion->setOptID($optionID);

        $result = $this->PrintShopConfigExclusion->getAll();
        if (!$result) {
            return array();
        } else {
            $res = array();
            if (!empty($result)) {
                foreach ($result as $r) {
                    $res[$r['excAttrID']][$r['excOptID']] = 1;
                }
            }
            $result = $res;
        }
        return $result;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    public function productExclusions($groupID, $typeID)
    {
        return $this->PrintShopConfigExclusion->getForProduct($groupID, $typeID);
    }

    /**
     * @param $attrID
     * @param $optionID
     * @return mixed
     */
    public function patch_exclusions($attrID, $optionID)
    {

        $this->PrintShopConfigExclusion->setAttrID($attrID);
        $this->PrintShopConfigExclusion->setOptID($optionID);

        $post = $this->Data->getAllPost();

        $resultOfSave = false;

        if (!empty($post)) {
            $this->PrintShopConfigExclusion->customDelete();
            foreach ($post as $e) {
                if( is_numeric($e['excAttrID']) && is_numeric($e['excOptID']) ) {
                    $resultOfSave = $this->PrintShopConfigExclusion->customCreate($e['excAttrID'], $e['excOptID']);
                }
            }
        } else {
            $resultOfSave = $this->PrintShopConfigExclusion->customDelete();
        }
        $return['response'] = $resultOfSave;
        return $return;
    }

}
