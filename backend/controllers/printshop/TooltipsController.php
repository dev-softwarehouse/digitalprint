<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Other\Tooltip;

/**
 * Description of Tooltips
 *
 * @author Rafał
 */
class TooltipsController extends Controller
{

    public $useModels = array();

    /**
     * @var Tooltip
     */
    protected $Tooltip;
    /**
     * @var LangSetting
     */
    protected $LangSetting;

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->LangSetting->setDomainID($domainID);
    }

    /**
     * TooltipsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Tooltip = Tooltip::getInstance();
        $this->LangSetting = LangSetting::getInstance();

    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $filters
     * @return array
     */
    public function tooltips($groupID, $typeID, $filters = NULL)
    {
        $this->Tooltip->setGroupID($groupID);
        $this->Tooltip->setTypeID($typeID);

        if (isset($filters['attrID']) && strlen($filters['attrID']) > 0) {
            $attrID = $filters['attrID'];
        } else {
            $attrID = NULL;
        }

        if (intval($attrID) > 0) {
            $data = $this->Tooltip->getOne($attrID);
        } else {
            $list = $this->Tooltip->getAll();

            $data = array();
            if (!empty($list)) {
                foreach ($list as $key => $val) {
                    foreach ($val as $row) {
                        $data[$key]['tooltip'][$row['langCode']] = $row['tooltip'];
                        $data[$key]['attrID'] = $row['attrID'];
                    }
                }
            }

        }
        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return mixed
     */
    public function patch_tooltips($groupID, $typeID)
    {

        $this->Tooltip->setGroupID($groupID);
        $this->Tooltip->setTypeID($typeID);

        $post = $this->Data->getAllPost();

        if ($post['attrID']) {
            $attrID = $post['attrID'];
        } else {
            $return['response'] = false;
            return $return;
        }

        $langList = $this->LangSetting->getAll();
        $langArr = array();
        if (!empty($langList)) {
            foreach ($langList as $row) {
                $langArr[] = $row['code'];
            }
        }

        if (is_array($post['tooltip']) && !empty($post['tooltip'])) {
            foreach ($post['tooltip'] as $lang => $content) {
                $actID = $this->Tooltip->exist($attrID, $lang);
                if (!$actID) {
                    $this->Tooltip->customCreate($attrID, $content, $lang);
                } else {

                    $this->Tooltip->update($actID, 'tooltip', $content);
                }
                if (strlen($content) > 0) {
                    $actKey = array_search($lang, $langArr);
                    unset($langArr[$actKey]);
                }
            }
            if (!empty($langArr)) {
                foreach ($langArr as $l) {
                    $this->Tooltip->deleteByLang($attrID, $l);
                }
            }
            $return['response'] = true;
            return $return;
        }

        $return['response'] = false;
        return $return;
    }


}
