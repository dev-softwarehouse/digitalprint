<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigConnectOption;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigDetailPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigExclusion;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigIncrease;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOption;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOptionLang;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPaperPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrice;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigRealizationTime;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\ProductionPath\OperationOption;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Core\Controller;

/**
 * Description of OptionsController
 *
 * @class OptionsController
 * @author Rafał
 */
class OptionsController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopConfigOption
     */
    protected $PrintShopConfigOption;
    /**
     * @var PrintShopConfigOptionLang
     */
    protected $PrintShopConfigOptionLang;
    /**
     * @var PrintShopOption
     */
    protected $PrintShopOption;
    /**
     * @var PrintShopConfigPrice
     */
    protected $PrintShopConfigPrice;
    /**
     * @var PrintShopConfigDetailPrice
     */
    protected $PrintShopConfigDetailPrice;
    /**
     * @var PrintShopConfigExclusion
     */
    protected $PrintShopConfigExclusion;
    /**
     * @var PrintShopConfigRealizationTime
     */
    protected $PrintShopConfigRealizationTime;
    /**
     * @var OperationOption
     */
    protected $OperationOption;
    /**
     * @var PrintShopConfigIncrease
     */
    protected $PrintShopConfigIncrease;
    /**
     * @var PrintShopConfigPaperPrice
     */
    protected $PrintShopConfigPaperPrice;
    /**
     * @var PrintShopConfigConnectOption
     */
    protected $PrintShopConfigConnectOption;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var Standard
     */
    protected $Standard;
    /**
     * @var Uploader
     */
    protected $Uploader;

    /**
     * @var string
     */
    private $iconFolder;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigOption = PrintShopConfigOption::getInstance();
        $this->PrintShopConfigOptionLang = PrintShopConfigOptionLang::getInstance();
        $this->PrintShopOption = PrintShopOption::getInstance();
        $this->PrintShopConfigPrice = PrintShopConfigPrice::getInstance();
        $this->PrintShopConfigDetailPrice = PrintShopConfigDetailPrice::getInstance();
        $this->PrintShopConfigExclusion = PrintShopConfigExclusion::getInstance();
        $this->PrintShopConfigRealizationTime = PrintShopConfigRealizationTime::getInstance();
        $this->OperationOption = OperationOption::getInstance();
        $this->PrintShopConfigIncrease = PrintShopConfigIncrease::getInstance();
        $this->PrintShopConfigPaperPrice = PrintShopConfigPaperPrice::getInstance();
        $this->PrintShopConfigConnectOption = PrintShopConfigConnectOption::getInstance();
        $this->Standard = Standard::getInstance();
        $this->UploadFile = UploadFile::getInstance();

        $this->Uploader = Uploader::getInstance();

        $this->iconFolder = 'uploadedFiles/' . companyID . '/icons/';
    }

    /**
     * @param $attrID
     * @param null $optionID
     * @return array
     */
    public function options($attrID, $optionID = NULL)
    {

        if ($attrID > 0) {
            $this->PrintShopConfigOption->setAttrID($attrID);
        }

        if (intval($optionID) > 0) {
            $data = $this->PrintShopConfigOption->customGet($optionID);
        } else {
            $data = $this->PrintShopConfigOption->getAll();

            if (!empty($data)) {
                $optionsArr = array();
                $aggregateIcons = array();
                foreach ($data as $row) {
                    if ($row['iconID']) {
                        $aggregateIcons[] = $row['iconID'];
                    }
                    $optionsArr[] = $row['ID'];
                }

                $icons = $this->UploadFile->getFileByList($aggregateIcons);

                if ($icons) {
                    foreach ($icons as $key => $icon) {
                        $minFolder = current(explode('/', $icon['path']));
                        $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                        $icons[$key]['minUrl'] = STATIC_URL . $this->iconFolder . $minFolder . '/' . THUMB_IMAGE_PREFIX . $icon['name'];
                    }
                }

                $connectList = $this->PrintShopConfigConnectOption->getByList($optionsArr);
                foreach ($data as $key => $opt) {
                    $data[$key]['connectID'] = isset($connectList[$opt['ID']]) ? $connectList[$opt['ID']] : 0;
                    if ($opt['iconID']) {
                        $data[$key]['icon'] = $icons[$opt['iconID']];
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
     * @param $attrID
     * @return array
     */
    public function post_options($attrID)
    {

        $name = $this->Data->getPost('name');
        $adminName = $this->Data->getPost('adminName');
        $oneSide = $this->Data->getPost('oneSide');
        $names = $this->Data->getPost('names');

        if ($attrID > 0) {
            $this->PrintShopConfigOption->setAttrID($attrID);
        }

        if (($name || $names)) {
            $lastID = $this->PrintShopConfigOption->customCreate($name, $adminName, $oneSide);
            $return = $this->PrintShopConfigOption->customGet($lastID);
            if (!$return) {
                $return['response'] = false;
                return $return;
            }
            if (!empty($names)) {
                $return['names'] = array();
                foreach ($names as $lang => $name) {
                    $res = $this->PrintShopConfigOptionLang->set($lang, $name, $lastID);
                    if (!$res) {
                        $return = $this->sendFailResponse('09');
                        return $return;
                    }
                    $return['names'][$lang] = $name;
                }
            }
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @param $attrID
     * @return mixed
     */
    public function put_options($attrID)
    {

        $post = $this->Data->getAllPost();

        $names = $post['names'];
        unset($post['names']);
        if ($attrID > 0) {
            $this->PrintShopConfigOption->setAttrID($attrID);
        }
        $goodKeys = array(
            'name',
            'adminName',
            'minPages',
            'maxPages',
            'weight',
            'sizePage',
            'active',
            'sort',
            'oneSide',
            'special',
            'minVolume',
            'printRotated',
            'rollLength',
            'itemWeight',
            'maxFolds',
            'minThickness',
            'maxThickness',
            'weightPerMeter',
            'emptyChoice',
            'doubleSidedSheet',
            'repeatedOperation',
            'authorizedOnlyCalculation'
        );

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        $res = false;
        $floatKeys = array('weight', 'sizePage', 'minThickness', 'maxThickness', 'itemWeight');

        foreach ($post as $key => $value) {
            if (in_array($key, $goodKeys)) {
                if (in_array($key, $floatKeys)) {
                    $value = $this->Standard->getValidNumber(str_replace(',', '.', $value));
                }
                $res = $this->PrintShopConfigOption->update($ID, $key, $value);
                if(!$res){
                    break;
                }
            }
        }

        if ($res) {
            $return['response'] = true;
        } else {
            $return['response'] = false;
        }

        if (!empty($names)) {
            foreach ($names as $lang => $name) {
                $res = $this->PrintShopConfigOptionLang->set($lang, $name, $ID);
                if (!$res) {
                    $return = $this->sendFailResponse('09');
                    return $return;
                }
            }
        }

        return $return;

    }

    /**
     * @param $ID
     * @param $optionID
     * @return mixed
     */
    public function delete_options($ID, $optionID)
    {

        $data['attrID'] = $ID;
        $data['optID'] = $optionID;
        if (intval($ID) > 0) {
            $oneOption = $this->PrintShopConfigOption->customGet($optionID);
            if ($this->PrintShopConfigOption->delete('ID', $optionID)) {
                $allProductOptions = $this->PrintShopOption->getAllInProduct($oneOption['attrID'], $oneOption['ID']);
                $data['dumpAll'] = $allProductOptions;
                $iOpt = 0;
                $iOptF = 0;
                if (!empty($allProductOptions) && is_array($allProductOptions)) {
                    foreach ($allProductOptions as $apo) {
                        $data['productOption'] = $apo;
                        $this->PrintShopOption->setGroupID($apo['groupID']);
                        $this->PrintShopOption->setTypeID($apo['typeID']);
                        $iOptF += intval($this->PrintShopOption->deleteFormats($apo['ID']));
                        $iOpt += intval($this->PrintShopOption->delete($oneOption['attrID'], $oneOption['ID']));
                    }
                }
                $data['infoPrdOptFormats'] = 'Remove all formats for options in products.';
                $data['infoPrdOpts'] = 'Remove ' . $iOpt . ' options in products.';

                $iRealizationTimes = 0;
                $oldRealizationTimes = $this->PrintShopConfigRealizationTime->customGetAll($optionID);
                foreach ($oldRealizationTimes as $or) {
                    $iRealizationTimes += intval($this->PrintShopConfigRealizationTime->delete('ID', $or['ID']));
                }
                $data['infoRealizationTimes'] = 'Remove ' . $iRealizationTimes . ' realisation times in options.';

                $this->PrintShopConfigPrice->setAttrID($oneOption['attrID']);
                $this->PrintShopConfigPrice->setOptID($oneOption['ID']);
                $iPrices = 0;

                $controllers = $this->PrintShopConfigPrice->countByController();
                if (!empty($controllers)) {
                    foreach ($controllers as $co) {
                        $this->PrintShopConfigPrice->setControllerID($co['controllerID']);

                        $prices = $this->PrintShopConfigPrice->getAll();
                        foreach ($prices as $op) {
                            $iPrices += intval($this->PrintShopConfigPrice->delete('ID', $op['ID']));
                        }
                    }
                }
                $data['infoPrices'] = 'Remove ' . $iPrices . ' prices from option.';

                $iDetailPrices = 0;
                $this->PrintShopConfigDetailPrice->setAttrID($oneOption['attrID']);
                $this->PrintShopConfigDetailPrice->setOptID($oneOption['ID']);
                $details = $this->PrintShopConfigDetailPrice->getAll();
                if (!empty($details)) {
                    foreach ($details as $d) {
                        $iDetailPrices += intval($this->PrintShopConfigDetailPrice->delete('ID', $d['ID']));
                    }
                }

                $data['infoDetailPrices'] = 'Remove ' . $iDetailPrices . ' detail prices from option.';

                $this->PrintShopConfigExclusion->setAttrID($oneOption['attrID']);
                $this->PrintShopConfigExclusion->setOptID($oneOption['ID']);
                $iExclusions = $this->PrintShopConfigExclusion->customDelete();

                $data['infoExclusions'] = 'Remove: ' . $iExclusions . ' exclusions.';

                $iOperations = $this->OperationOption->delete('optionID', $oneOption['ID']);

                $this->PrintShopConfigIncrease->setAttrID($oneOption['attrID']);
                $this->PrintShopConfigIncrease->setOptID($oneOption['ID']);
                $iIncreases = $this->PrintShopConfigIncrease->deleteBy();
                $data['infoIncreases'] = 'Remove: ' . strval($iIncreases) . ' increases.';

                $data['infoOperations'] = 'Remove: ' . strval($iOperations) . ' operations.';

                if (!$this->PrintShopConfigOptionLang->delete('optionID', $optionID)) {
                    $data = $this->sendFailResponse('09');
                    return $data;
                }

                $data['infoPaperPrice'] = $this->PrintShopConfigPaperPrice->delete('optID', $ID);
            }

            $data['response'] = true;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $attrID
     * @return mixed
     */
    public function patch_sortOptions($attrID)
    {

        if ($attrID > 0) {
            $this->PrintShopConfigOption->setAttrID($attrID);
        }

        $post = $this->Data->getAllPost();

        $response = $this->PrintShopConfigOption->sort($post);
        $return['response'] = $response;
        return $return;

    }

    /**
     * @param $attrID
     * @param $optID
     * @return array|bool
     */
    public function countPrices($attrID, $optID)
    {
        $this->PrintShopConfigPrice->setAttrID($attrID);
        $this->PrintShopConfigPrice->setOptID($optID);
        $counts = $this->PrintShopConfigPrice->countByController();
        if (empty($counts)) {
            $counts = array();
        }
        return $counts;
    }

    /**
     * @param $attrID
     * @param $optID
     * @return mixed
     */
    public function copy($attrID, $optID)
    {
        $option = $this->PrintShopConfigOption->customGet($optID);

        $this->PrintShopConfigOption->setAttrID($option['attrID']);

        $newOptionID = $this->PrintShopConfigOption->customCreate($option['name'] . ' - ' . ' COPY ', $option['adminName'], $option['oneSide']);

        $fields = array('adminName', 'minPages', 'maxPages', 'weight', 'sizePage', 'active',
            'sort', 'oneSide', 'special', 'minVolume', 'rollLength', 'printRotated',
            'itemWeight', 'maxFolds', 'minThickness', 'maxThickness');
        foreach ($fields as $f) {
            $this->PrintShopConfigOption->update($newOptionID, $f, $option[$f]);
        }

        $setRealizations = array();
        $realizationTimes = $this->PrintShopConfigRealizationTime->customGetAll($optID);
        if (!empty($realizationTimes)) {
            foreach ($realizationTimes as $rt) {
                $setRealizations[] = $this->PrintShopConfigRealizationTime->set($newOptionID, $rt['volume'], $rt['days']);
            }
        }

        $newPrices = array();
        $this->PrintShopConfigPrice->setAttrID($option['attrID']);
        $this->PrintShopConfigPrice->setOptID($option['ID']);

        $controllers = $this->PrintShopConfigPrice->countByController();

        if (!empty($controllers)) {
            foreach ($controllers as $co) {

                $this->PrintShopConfigPrice->setControllerID($co['controllerID']);
                $this->PrintShopConfigPrice->setAttrID($option['attrID']);
                $this->PrintShopConfigPrice->setOptID($option['ID']);
                $oldPrices = $this->PrintShopConfigPrice->getAll();

                $this->PrintShopConfigPrice->setAttrID($option['attrID']);
                $this->PrintShopConfigPrice->setOptID($newOptionID);
                foreach ($oldPrices as $op) {
                    $newPrices[] = $this->PrintShopConfigPrice->customCreate(
                        $op['amount'],
                        $op['value'],
                        $op['priceType'],
                        $op['expense']
                    );
                }
            }
        }

        $newDetailPrices = array();
        $this->PrintShopConfigDetailPrice->setAttrID($option['attrID']);
        $this->PrintShopConfigDetailPrice->setOptID($option['ID']);
        $details = $this->PrintShopConfigDetailPrice->getAll();
        if (!empty($details)) {
            foreach ($details as $d) {
                $this->PrintShopConfigDetailPrice->setAttrID($option['attrID']);
                $this->PrintShopConfigDetailPrice->setOptID($newOptionID);
                $this->PrintShopConfigDetailPrice->setControllerID($d['controllerID']);
                $newDetailPrices[] = $this->PrintShopConfigDetailPrice->createAll($d['minPrice'], $d['basePrice'], $d['startUp']);
            }
        }

        $newExclusions = array();
        $this->PrintShopConfigExclusion->setAttrID($attrID);
        $this->PrintShopConfigExclusion->setOptID($option['ID']);
        $exclusions = $this->PrintShopConfigExclusion->getAll();
        if (!empty($exclusions)) {
            foreach ($exclusions as $ex) {
                $this->PrintShopConfigExclusion->setAttrID($option['attrID']);
                $this->PrintShopConfigExclusion->setOptID($newOptionID);
                $newExclusions[] = $this->PrintShopConfigExclusion->customCreate($ex['excAttrID'], $ex['excOptID']);
            }
        }

        $newIncreases = array();
        $this->PrintShopConfigIncrease->setAttrID($option['attrID']);
        $this->PrintShopConfigIncrease->setOptID($option['ID']);

        $increaseControllers = $this->PrintShopConfigIncrease->countByController();

        if (!empty($increaseControllers)) {
            foreach ($increaseControllers as $co) {

                $this->PrintShopConfigIncrease->setControllerID($co['controllerID']);
                $this->PrintShopConfigIncrease->setAttrID($option['attrID']);
                $this->PrintShopConfigIncrease->setOptID($option['ID']);
                $oldIncreases = $this->PrintShopConfigIncrease->getAll();

                $this->PrintShopConfigIncrease->setAttrID($option['attrID']);
                $this->PrintShopConfigIncrease->setOptID($newOptionID);
                foreach ($oldIncreases as $oi) {
                    $newIncreases[] = $this->PrintShopConfigIncrease->customCreate(
                        $oi['amount'],
                        $oi['value'],
                        $oi['increaseType']
                    );
                }
            }
        }

        $this->PrintShopConfigPaperPrice->setOptID($option['ID']);

        $paperPrices = $this->PrintShopConfigPaperPrice->getAll();
        $newPaperPrices = array();
        $this->PrintShopConfigPaperPrice->setOptID($newOptionID);
        if (!empty($paperPrices)) {
            foreach ($paperPrices as $pp) {
                $newPaperPrices[] = $this->PrintShopConfigPaperPrice->customCreate($pp['price'], $pp['expense'], $pp['amount']);
            }
        }

        $newOperations = array();
        $operations = $this->OperationOption->getSelectedOperations($option['ID']);
        foreach ($operations as $op) {
            $params['optionID'] = $newOptionID;
            $params['operationID'] = $op['operationID'];
            $newOperations[] = $this->OperationOption->create($params);
        }

        $names = $this->PrintShopConfigOptionLang->get('optionID', $option['ID']);
        foreach ($names as $name) {
            $this->PrintShopConfigOptionLang->set($name['lang'], $name['name'], $newOptionID);
        }

        $data['info'] = 'option copied';
        $data['response'] = true;
        return $data;

    }

    /**
     * @return mixed
     * @throws ImagickException
     */
    public function post_uploadIcon()
    {
        $response['response'] = false;
        $optionID = $this->Data->getPost('optionID');

        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destinationFolder = $this->iconFolder . '/' . $dirNumber . '/';

        $option = $this->PrintShopConfigOption->customGet($optionID);

        $oldIcon = $this->UploadFile->get('ID', $option['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $oldIcon['path'])) {
            $response['minRemoved'] = $this->removeMiniatureIcon($oldIcon);
            $response['removed'] = true;
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

            $lastID = $this->UploadFile->setUpload($filename, 'optionIcon', $dirNumber . '/' . $filename);

            $this->PrintShopConfigOption->update($option['ID'], 'iconID', $lastID);

            $icon = $this->UploadFile->get('ID', $lastID);

            if ($icon) {

                $minFolder = current(explode('/', $icon['path']));
                $minFileName = $minFolder . '/' . THUMB_IMAGE_PREFIX . $icon['name'];

                $fileFullPath = MAIN_UPLOAD . $this->iconFolder . $icon['path'];
                $minFileFullPath = MAIN_UPLOAD . $this->iconFolder . $minFileName;

                $response['fileFullPath'] = $fileFullPath;
                $response['minFileFullPath'] = $minFileFullPath;

                $response['isFile'] = is_file($fileFullPath);
                $response['isWritable'] = is_writable($fileFullPath);

                if (is_file($fileFullPath) && is_writable($fileFullPath)) {

                    $mainImage = $this->Uploader->resizeImage($fileFullPath, 800, 800, false);

                    if ($mainImage->writeImage($fileFullPath)) {
                        $response['mainIconSaved'] = true;

                        $minImage = $this->Uploader->resizeImage($fileFullPath, 200, 200, false);
                        $response['minIconSaved'] = $minImage->writeImage($minFileFullPath);
                    }


                }

                $minFolder = current(explode('/', $icon['path']));
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $icon['minUrl'] = STATIC_URL . $this->iconFolder . $minFolder . '/' . THUMB_IMAGE_PREFIX . $icon['name'];

                $response['icon'] = $icon;
                $response['item'] = $option;
                $response['response'] = true;

            }

        }
        return $response;
    }

    /**
     * @param $optionID
     * @return mixed
     */
    public function delete_uploadIcon($optionID)
    {
        $data['response'] = false;
        $option = $this->PrintShopConfigOption->customGet($optionID);

        $one = $this->UploadFile->get('ID', $option['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {

            $data['minRemoved'] = $this->removeMiniatureIcon($one);

            $data['response'] = $this->UploadFile->delete('ID', $one['ID']);
            $this->PrintShopConfigOption->update($option['ID'], 'iconID', NULL);
            $data['removed'] = true;
        }

        return $data;
    }

    /**
     * @param $iconInstance
     * @return bool
     */
    private function removeMiniatureIcon($iconInstance)
    {
        $minFolder = current(explode('/', $iconInstance['path']));
        $minPath = $minFolder . '/' . THUMB_IMAGE_PREFIX . $iconInstance['name'];

        if ($this->Uploader->remove($this->iconFolder, $minPath)) {
            return true;
        }
        return false;
    }

}
