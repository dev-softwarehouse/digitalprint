<?php
/**
 * Programista Rafał Leśniak - 24.3.2017
 */

/**
 * Promotions controller
 *
 * @class PromotionsController
 */

namespace DreamSoft\Controllers\Promotions;

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Models\Module\Module;
use DreamSoft\Models\Module\ModuleKey;
use DreamSoft\Models\Module\ModuleValue;
use DreamSoft\Models\Promotion\Promotion;
use DreamSoft\Models\Promotion\PromotionLang;
use DreamSoft\Controllers\Components\PromotionCalculation;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Controllers\Components\QueryFilter;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Core\Controller;


class PromotionsController extends Controller
{

    public $useModels = array();

    /**
     * @var Promotion
     */
    private $Promotion;
    /**
     * @var PromotionLang
     */
    private $PromotionLang;
    /**
     * @var
     */
    private $LangSetting;
    /**
     * @var Module
     */
    private $Module;
    /**
     * @var ModuleKey
     */
    private $ModuleKey;
    /**
     * @var ModuleValue
     */
    private $ModuleValue;
    /**
     * @var
     */
    private $configs;
    /**
     * @var PrintShopGroup
     */
    private $PrintShopGroup;
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var PrintShopFormat
     */
    private $PrintShopFormat;
    /**
     * @var QueryFilter
     */
    private $QueryFilter;
    /**
     * @var UploadFile
     */
    private $UploadFile;
    /**
     * @var Uploader
     */
    private $Uploader;
    /**
     * @var PromotionCalculation
     */
    private $PromotionCalculation;
    /**
     * @var string
     */
    private $iconFolder;

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Promotion->setDomainID($domainID);
        $this->ModuleValue->setDomainID($domainID);
        $this->PromotionCalculation->setDomainID($domainID);
        parent::setDomainID($domainID);
    }

    /**
     * PromotionsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Promotion = Promotion::getInstance();
        $this->PromotionLang = PromotionLang::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->Module = Module::getInstance();
        $this->ModuleKey = ModuleKey::getInstance();
        $this->ModuleValue = ModuleValue::getInstance();
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->QueryFilter = new QueryFilter();
        $this->UploadFile = UploadFile::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->PromotionCalculation = new PromotionCalculation();
        $this->iconFolder = $this->PromotionCalculation->getIconFolder();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'ps_promotions', 'field' => 'ID', 'sign' => $this->QueryFilter->signs['li']),
            'domainID' => array('type' => 'string', 'table' => 'ps_promotions', 'field' => 'domainID', 'sign' => $this->QueryFilter->signs['e']),
        );
    }

    /**
     * @return array
     */
    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * @param null $params
     * @return array
     */
    public function promotions($params = NULL)
    {
        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $params['domainID'] = $this->getDomainID();

        $sortBy[0] = '-created';

        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);

        $promotions = $this->Promotion->getList($filters, $offset, $limit, $sortBy);

        if (empty($promotions)) {
            return array();
        }

        foreach ($promotions as $key => $promotion) {

            $promotionState = $this->checkPromotionState($promotion);
            $promotions[$key]['state'] = $promotionState['state'];
            if ($promotionState['promotionStart']) {
                $promotions[$key]['promotionStartDate'] = $promotionState['promotionStart'];
            }
            if ($promotionState['promotionEnd']) {
                $promotions[$key]['promotionEndDate'] = $promotionState['promotionEnd'];
            }

            $promotions[$key]['startTimeSeconds'] = strtotime($promotion['startTime']);
        }

        $promotions = $this->PromotionCalculation->fillIcons($promotions);

        return $promotions;
    }

    /**
     * @param $promotion
     * @return array
     */
    private function checkPromotionState($promotion)
    {
        if (!$promotion['timePromotion']) {
            return array(
                'state' => PROMOTION_STATE_PERMANENT
            );
        }

        $endTimeInSeconds = strtotime('+' . $promotion['duration'] . ' seconds', strtotime($promotion['startTime']));
        $startTimeInSeconds = strtotime($promotion['startTime']);

        $promotion['endTime'] = date('Y-m-d H:i:s', strtotime('+' . $promotion['duration'] . ' seconds', strtotime($promotion['startTime'])));
        if (!$promotion['repeat']) {
            if (time() >= $startTimeInSeconds && time() <= $endTimeInSeconds) {
                return array(
                    'state' => PROMOTION_STATE_STARTED,
                    'promotionEnd' => date('Y-m-d H:i:s', $endTimeInSeconds)
                );
            } else {
                return array(
                    'state' => PROMOTION_STATE_ENDED
                );
            }
        } else {
            if (time() >= $startTimeInSeconds && time() <= $endTimeInSeconds) {
                return array(
                    'state' => PROMOTION_STATE_STARTED,
                    'promotionEnd' => date('Y-m-d H:i:s', $endTimeInSeconds)
                );
            } else {
                return $this->checkIntervalPromotion($promotion, $startTimeInSeconds);
            }
        }
    }

    /**
     * @param $promotion
     * @param $start
     * @return array
     */
    private function checkIntervalPromotion($promotion, $start)
    {
        $endTimeInSeconds = strtotime('+' . $promotion['duration'] . ' seconds', $start);

        if (time() >= $start && time() <= $endTimeInSeconds) {
            return array(
                'state' => PROMOTION_STATE_STARTED,
                'promotionEnd' => date('Y-m-d H:i:s', $endTimeInSeconds)
            );
        } else if (time() >= $start) {
            $start = strtotime('+' . $promotion['repeatTime'] . ' seconds', $start);
            return $this->checkIntervalPromotion($promotion, $start);
        } else {
            return array(
                'state' => PROMOTION_STATE_PENDING,
                'promotionStart' => date('Y-m-d H:i:s', $start)
            );
        }
    }

    /**
     * @return array|mixed|null
     */
    public function post_promotions()
    {

        $post = $this->Data->getAllPost();

        if (!$post) {
            return $this->sendFailResponse('01');
        }

        if (!$post['names'] || !$post['percentage']) {
            return $this->sendFailResponse('02');
        }

        $params['percentage'] = $post['percentage'];
        $params['productGroupID'] = NULL;
        if (isset($post['productGroupID']) && $post['productGroupID'] > 0) {
            $params['productGroupID'] = $post['productGroupID'];
        }

        $params['productTypeID'] = NULL;
        if (isset($post['productTypeID']) && $post['productTypeID'] > 0) {
            $params['productTypeID'] = $post['productTypeID'];
        }

        $params['productFormatID'] = NULL;
        if (isset($post['productFormatID']) && $post['productFormatID'] > 0) {
            $params['productFormatID'] = $post['productFormatID'];
        }

        if (isset($post['qtyStart'])) {
            $params['qtyStart'] = $post['qtyStart'];
        }

        if (isset($post['qtyEnd'])) {
            $params['qtyEnd'] = $post['qtyEnd'];
        }

        if (isset($post['metersStart'])) {
            $params['metersStart'] = $post['metersStart'];
        }

        if (isset($post['metersEnd'])) {
            $params['metersEnd'] = $post['metersEnd'];
        }

        $params['timePromotion'] = 0;
        if (isset($post['timePromotion'])) {
            $params['timePromotion'] = $post['timePromotion'];
        }

        if ($params['timePromotion']) {
            if (!$post['startTime']) {
                return $this->sendFailResponse('02');
            }
            if (!$post['durationDay'] && !$post['durationHour']) {
                return $this->sendFailResponse('02');
            }

            if ($post['hourOfStart']) {
                $startTime = $post['startTime'] + (3600 * $post['hourOfStart']);
                $params['startTime'] = date('Y-m-d H:i:s', $startTime);
            } else {
                $params['startTime'] = date('Y-m-d H:i:s', $post['startTime']);
            }

            if ($post['durationHour']) {
                $params['duration'] = intval($post['durationHour']) * 3600;
            } else {
                $params['duration'] = intval($post['durationDay']) * 3600 * 24;
            }

            if ($post['repeatDay'] || $post['repeatHour']) {
                $params['repeat'] = 1;

                if ($post['repeatHour']) {
                    $params['repeatTime'] = intval($post['durationHour']) * 3600;
                } else {
                    $params['repeatTime'] = intval($post['repeatDay']) * 3600 * 24;
                }
            }
        }

        if (isset($params['repeat']) && $params['repeat'] === 1 &&
            $params['duration'] >= $params['repeatTime']) {
            return $this->sendFailResponse('03', 'repeat_interval_info');
        }

        $params['domainID'] = $this->Promotion->getDomainID();
        $params['created'] = date('Y-m-d H:i:s');

        $promotionID = $this->Promotion->create($params);

        if ($promotionID > 0) {

            $names = $post['names'];
            $savedLanguages = 0;
            $updatedLanguages = 0;
            foreach ($names as $lang => $name) {
                $promotionNameID = $this->PromotionLang->existName($promotionID, $lang);
                if ($promotionNameID > 0) {
                    if ($this->PromotionLang->update($promotionNameID, 'name', $name)) {
                        $updatedLanguages++;
                    }
                } else {
                    $paramNames['name'] = $name;
                    $paramNames['lang'] = $lang;
                    $paramNames['promotionID'] = $promotionID;
                    if ($this->PromotionLang->create($paramNames)) {
                        $savedLanguages++;
                    }
                    unset($paramNames);
                }
            }
            return array(
                'response' => true,
                'savedLanguages' => $savedLanguages,
                'item' => $this->Promotion->customGet(array('ID' => $promotionID), false)
            );
        }

        return $this->sendFailResponse('03');
    }

    /**
     * @param null $params
     * @return array
     */
    public function count($params = NULL)
    {
        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);
        $count = $this->Promotion->count($filters);
        return array('count' => $count);
    }

    /**
     * @param $ID
     * @return array|mixed
     */
    public function put_promotions($ID = NULL)
    {

        if (!$ID) {
            $ID = $this->Data->getPost('ID');
        }

        if (!$ID) {
            return $this->sendFailResponse('04');
        }

        $post = $this->Data->getAllPost();
        $languages = $post['promotionLanguages'];

        $updateLanguages = 0;
        $savedLanguages = 0;
        $data['response'] = false;

        $saved = 0;

        if (!empty($languages)) {
            foreach ($languages as $lang => $name) {
                $existID = $this->PromotionLang->existName($ID, $lang);
                if ($existID) {
                    $updateLanguages += intval($this->PromotionLang->update($existID, 'name', $name['name']));
                } else {
                    $param['name'] = $name['name'];
                    $param['lang'] = $lang;
                    $param['promotionID'] = $ID;

                    $lastID = $this->PromotionLang->create($param);
                    if ($lastID > 0) {
                        $savedLanguages++;
                    }
                    unset($param);
                }
            }

            if ($updateLanguages > 0 || $savedLanguages > 0) {
                $saved++;
                $data['languages'] = compact('updateLanguages', 'savedLanguages');
            }
        }


        $productGroupID = $this->Data->getPost('productGroupID');
        $productTypeID = $this->Data->getPost('productTypeID');
        $productFormatID = $this->Data->getPost('productFormatID');
        $qtyStart = $this->Data->getPost('qtyStart');
        $qtyEnd = $this->Data->getPost('qtyEnd');
        $metersStart = $this->Data->getPost('metersStart');
        $metersEnd = $this->Data->getPost('metersEnd');
        $percentage = $this->Data->getPost('percentage');
        $active = $this->Data->getPost('active');

        if (intval($qtyStart) < 1) {
            $qtyStart = NULL;
        }
        if (intval($qtyEnd) < 1) {
            $qtyEnd = NULL;
        }
        if (intval($metersStart) < 1) {
            $metersStart = NULL;
        }
        if (intval($metersEnd) < 1) {
            $metersEnd = NULL;
        }

        $post = $this->Data->getAllPost();

        if ($ID > 0) {
            $saved += intval($this->Promotion->update($ID, 'productGroupID', $productGroupID));
            $saved += intval($this->Promotion->update($ID, 'productTypeID', $productTypeID));
            $saved += intval($this->Promotion->update($ID, 'productFormatID', $productFormatID));
            $saved += intval($this->Promotion->update($ID, 'qtyStart', $qtyStart));
            $saved += intval($this->Promotion->update($ID, 'qtyEnd', $qtyEnd));
            $saved += intval($this->Promotion->update($ID, 'metersStart', $metersStart));
            $saved += intval($this->Promotion->update($ID, 'metersEnd', $metersEnd));
            $saved += intval($this->Promotion->update($ID, 'percentage', $percentage));
            $saved += intval($this->Promotion->update($ID, 'active', $active));

            $saved += $this->saveTimeValues($ID, $post);
        }

        if ($saved > 0) {
            $data['saved'] = $saved;
            $data['item'] = $this->Promotion->customGet(array('ID' => $ID), false);
            $data['response'] = true;
            return $data;
        }

        return $this->sendFailResponse('03');
    }

    private function saveTimeValues($ID, $post)
    {
        $saved = 0;

        if ($post['timePromotion']) {
            if (!$post['startTime']) {
                return $saved;
            }
            if (!$post['durationDay'] && !$post['durationHour']) {
                return $saved;
            }

            if ($post['hourOfStart']) {
                $startTime = $post['startTime'] + (3600 * $post['hourOfStart']);
                $saved += intval($this->Promotion->update($ID, 'startTime', date('Y-m-d H:i:s', $startTime)));
            } else {
                $saved += intval($this->Promotion->update($ID, 'startTime', date('Y-m-d H:i:s', $post['startTime'])));
            }

            if ($post['durationHour']) {
                $saved += intval($this->Promotion->update($ID, 'duration', intval($post['durationHour']) * 3600));
            } else {
                $saved += intval($this->Promotion->update($ID, 'duration', intval($post['durationDay']) * 3600 * 24));
            }

            if ($post['repeatDay'] || $post['repeatHour']) {
                $saved += intval($this->Promotion->update($ID, 'repeat', 1));

                if ($post['repeatHour']) {
                    $saved += intval($this->Promotion->update($ID, 'repeatTime', intval($post['durationHour']) * 3600));
                } else {
                    $saved += intval($this->Promotion->update($ID, 'repeatTime', intval($post['repeatDay']) * 3600 * 24));
                }
            } else {
                $saved += intval($this->Promotion->update($ID, 'repeat', 0));
            }
        }

        if (isset($post['timePromotion'])) {
            $saved += intval($this->Promotion->update($ID, 'timePromotion', $post['timePromotion']));
        }

        return $saved;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_promotions($ID)
    {
        $data['response'] = false;
        if ($ID) {
            $data['message'] = $ID;
            $promotion = $this->Promotion->get('ID', $ID);
            if ($this->Promotion->delete('ID', $ID)) {
                $data['languagesDeleted'] = $this->PromotionLang->delete('promotionID', $ID);

                $one = $this->UploadFile->get('ID', $promotion['iconID']);

                if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
                    $data['removedFile'] = $this->UploadFile->delete('ID', $one['ID']);
                }

                $data['response'] = true;
                return $data;
            } else {
                return $data;
            }
        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    /**
     * @return mixed
     */
    public function post_uploadIcon()
    {
        $response['response'] = false;
        $promotionID = $this->Data->getPost('promotionID');

        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destinationFolder = $this->iconFolder . '/' . $dirNumber . '/';

        $promotion = $this->Promotion->get('ID', $promotionID);

        $one = $this->UploadFile->get('ID', $promotion['iconID']);

        if ($one) {
            $this->Uploader->remove($this->iconFolder, $one['path']);
        }

        $destinationIconPath = MAIN_UPLOAD . $destinationFolder;

        if (!is_dir($destinationIconPath)) {
            mkdir($destinationIconPath, 0755, true);
            chmod($destinationIconPath, 0755);
        }

        if (is_file($destinationIconPath . $filename)) {
            $nameParts = explode('.', $filename);
            for ($i = 1; ; $i++) {
                $newFileName = $nameParts[0] . '_' . $i . '.' . $nameParts[1];
                if (!is_file($destinationIconPath . $newFileName)) {
                    $filename = $newFileName;
                    break;
                }
            }
        }

        $res = $this->Uploader->upload($_FILES, 'file', $destinationFolder, $filename);

        if ($res) {
            $lastID = $this->UploadFile->setUpload($filename, 'promotionIcon', $dirNumber . '/' . $filename);

            $this->Promotion->update($promotion['ID'], 'iconID', $lastID);

            $icon = $this->UploadFile->get('ID', $lastID);

            if ($icon) {
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $response['icon'] = $icon;
                $response['item'] = $promotion;
                $response['response'] = true;
            }

        }
        return $response;
    }

    /**
     * @param $promotionID
     * @return mixed
     */
    public function delete_uploadIcon($promotionID)
    {
        $data['response'] = false;
        $promotion = $this->Promotion->get('ID', $promotionID);

        $one = $this->UploadFile->get('ID', $promotion['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            $data['response'] = $this->UploadFile->delete('ID', $one['ID']);
            $this->Promotion->update($promotion['ID'], 'iconID', NULL);
        }

        return $data;
    }




}
