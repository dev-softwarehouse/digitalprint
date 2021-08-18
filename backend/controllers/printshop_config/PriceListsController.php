<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPriceList;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPriceListLanguage;
use DreamSoft\Models\Upload\UploadFile;

/**
 * Description of PriceListsController
 *
 * @author Rafał
 */
class PriceListsController extends Controller
{

    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var PrintShopConfigPriceList
     */
    protected $PrintShopConfigPriceList;
    /**
     * @var PrintShopConfigPriceListLanguage
     */
    protected $PrintShopConfigPriceListLanguage;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var string
     */
    protected $iconFolder;

    /**
     * PriceListsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopConfigPriceList = PrintShopConfigPriceList::getInstance();
        $this->PrintShopConfigPriceListLanguage = PrintShopConfigPriceListLanguage::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->UploadFile = UploadFile::getInstance();

        $this->iconFolder = 'uploadedFiles/' . companyID . '/priceListIcons/';
    }

    /**
     * @param null $ID
     * @return array
     */
    public function priceList($ID = NULL)
    {

        if (intval($ID) > 0) {
            $data = $this->PrintShopConfigPriceList->get('ID', $ID);

            $data['icon'] = null;
            if( $data['iconID'] > 0 )  {
                $icon = $this->UploadFile->get('ID', $data['iconID']);
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $data['icon'] = $icon;
            }
        } else {
            $data = $this->PrintShopConfigPriceList->getAll();
            $data = $this->fillIcons($data);
        }
        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @return mixed
     */
    public function post_priceList()
    {
        $return = array();
        $name = $this->Data->getPost('name');
        $names = $this->Data->getPost('names');
        $allowJoinProcess = $this->Data->getPost('allowJoinProcess');

        if( $allowJoinProcess === NULL ) {
            $allowJoinProcess = 0;
        }

        if ($name) {
            $lastID = $this->PrintShopConfigPriceList->create(compact('name', 'allowJoinProcess'));

            if (!$lastID) {
                $return['response'] = false;
            }

            $item = $this->PrintShopConfigPriceList->get('ID', $lastID);

            $savedLanguages = 0;
            if($names) {
                foreach ($names as $lang => $oneName) {
                    $params = array();
                    $params['name'] = $oneName;
                    $params['lang'] = $lang;
                    $params['priceListID'] = $lastID;
                    $savedLanguages += intval($this->PrintShopConfigPriceListLanguage->create($params));
                }
            }

            $return['savedLanguages'] = $savedLanguages;

            $item['icon'] = null;
            if( $item['iconID'] > 0 )  {
                $icon = $this->UploadFile->get('ID', $item['iconID']);
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $item['icon'] = $icon;
            }

            $item['names'] = $this->getNames($lastID);

            if( $item ) {
                $return['item'] = $item;
                $return['response'] = true;
            }
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @param $priceListID
     * @return array
     */
    private function getNames($priceListID)
    {
        $allLanguageNames = $this->PrintShopConfigPriceListLanguage->get('priceListID', $priceListID, true);

        if( !$allLanguageNames ) {
            return array();
        }

        $result = array();

        foreach ($allLanguageNames as $oneName) {
            $result[$oneName['lang']] = $oneName['name'];
        }

        return $result;
    }

    /**
     * @return mixed
     */
    public function put_priceList()
    {
        $post = $this->Data->getAllPost();
        $names = $post['names'];
        $allowJoinProcess = $post['allowJoinProcess'];

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        $res = intval($this->PrintShopConfigPriceList->update($ID, 'name', $post['name']));
        $res += intval(
            $this->PrintShopConfigPriceList->update($ID, 'allowJoinProcess', $post['allowJoinProcess'])
        );

        $updateLanguages = 0;
        $savedLanguages = 0;

        if (!empty($names)) {
            foreach ($names as $lang => $name) {
                $existID = $this->PrintShopConfigPriceListLanguage->getOne($ID, $lang);
                if ($existID) {
                    $updateLanguages += intval($this->PrintShopConfigPriceListLanguage->update($existID, 'name', $name));
                } else {
                    $param = array();
                    $param['name'] = $name;
                    $param['lang'] = $lang;
                    $param['priceListID'] = $ID;
                    $lastID = $this->PrintShopConfigPriceListLanguage->create($param);
                    if ($lastID > 0) {
                        $savedLanguages++;
                    }
                }
            }
        }

        if ($res) {
            $return['response'] = true;
            $item = $this->PrintShopConfigPriceList->get('ID', $ID);
            if( $item['iconID'] > 0 )  {
                $icon = $this->UploadFile->get('ID', $item['iconID']);
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $item['icon'] = $icon;
            }

            $item['names'] = $this->getNames($ID);

            $return['item'] = $item;
        } else {
            $return['response'] = false;
        }
        return $return;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_priceList($ID)
    {

        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            $this->PrintShopConfigPriceList->delete('ID', $ID);

            $priceList = $this->PrintShopConfigPriceList->get('ID', $ID);

            $one = $this->UploadFile->get('ID', $priceList['iconID']);

            if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
                $data['iconRemoved'] = true;
            }

            $data['response'] = true;
            return $data;
        } else {
            $data['response'] = false;
            return $data;
        }

    }

    /**
     * @return mixed
     */
    public function post_uploadIcon()
    {
        $response['response'] = false;
        $priceListID = $this->Data->getPost('priceListID');

        $maxID = $this->UploadFile->getMaxID();
        $dirNumber = floor($maxID / 100);
        $filename = $_FILES['file']['name'];
        $destinationFolder = $this->iconFolder . '/' . $dirNumber . '/';

        $priceList = $this->PrintShopConfigPriceList->get('ID', $priceListID);

        $one = $this->UploadFile->get('ID', $priceList['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            $response['oldIconRemoved'] = true;
        }

        $destIconPath = MAIN_UPLOAD . $destinationFolder;

        if (!is_dir($destIconPath)) {
            mkdir($destIconPath, 0755, true);
            chmod($destIconPath, 0755);
        }

        if (is_file($destIconPath . $filename)) {
            $nameParts = explode('.', $filename);
            for ($i = 1; ; $i++) {
                $newFileName = $nameParts[0] . '_' . $i . '.' . $nameParts[1];
                if (!is_file($destIconPath . $newFileName)) {
                    $filename = $newFileName;
                    break;
                }
            }
        }

        $res = $this->Uploader->upload($_FILES, 'file', $destinationFolder, $filename);

        if ($res) {
            $lastID = $this->UploadFile->setUpload($filename, 'priceListIcon', $dirNumber . '/' . $filename);

            $this->PrintShopConfigPriceList->update($priceList['ID'], 'iconID', $lastID);

            $icon = $this->UploadFile->get('ID', $lastID);

            if ($icon) {
                $icon['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
                $response['icon'] = $icon;
                $response['item'] = $priceList;
                $response['response'] = true;
            }

        }
        return $response;
    }

    /**
     * @param $priceListID
     * @return mixed
     */
    public function delete_uploadIcon($priceListID)
    {
        $data['response'] = false;
        $group = $this->PrintShopConfigPriceList->get('ID', $priceListID);

        $one = $this->UploadFile->get('ID', $group['iconID']);

        if ($this->Uploader->remove($this->iconFolder, $one['path'])) {
            $data['response'] = $this->UploadFile->delete('ID', $one['ID']);
            $this->PrintShopConfigPriceList->update($group['ID'], 'iconID', NULL);
            $data['removed'] = true;
        }

        return $data;
    }

    /**
     * @param $priceLists
     * @return mixed
     */
    private function fillIcons($priceLists)
    {

        $aggregateIcons = array();
        foreach ($priceLists as $key => $priceList) {
            if ($priceList['iconID']) {
                $aggregateIcons[] = $priceList['iconID'];
            }
        }

        $icons = $this->UploadFile->getFileByList($aggregateIcons);

        if ($icons) {
            foreach ($icons as $key => $icon) {
                $icons[$key]['url'] = STATIC_URL . $this->iconFolder . $icon['path'];
            }
        }

        foreach ($priceLists as $key => $priceList) {
            if ($priceList['iconID']) {
                $priceLists[$key]['icon'] = $icons[$priceList['iconID']];
            }
        }

        return $priceLists;
    }
}
