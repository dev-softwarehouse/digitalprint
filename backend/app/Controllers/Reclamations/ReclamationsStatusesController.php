<?php
/**
 * Programmer Rafał Leśniak - 7.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 07-09-2017
 * Time: 16:32
 */

namespace DreamSoft\Controllers\Reclamations;


use DreamSoft\Core\Controller;
use DreamSoft\Models\Reclamation\ReclamationStatus;
use DreamSoft\Models\Reclamation\ReclamationStatusLang;
use DreamSoft\Controllers\Components\Standard;

/**
 * Class ReclamationStatusesController
 * @package DreamSoft\controllers\Reclamations
 */
class ReclamationsStatusesController extends Controller
{
    /**
     * @var ReclamationStatus
     */
    protected $ReclamationStatus;
    /**
     * @var ReclamationStatusLang
     */
    protected $ReclamationStatusLang;
    /**
     * @var Standard
     */
    protected $Standard;

    /**
     * ReclamationStatusController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->ReclamationStatus = ReclamationStatus::getInstance();
        $this->ReclamationStatusLang = ReclamationStatusLang::getInstance();
        $this->Standard = Standard::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->ReclamationStatus->setDomainID($domainID);
    }

    /**
     * @param $active
     * @return array|bool
     */
    public function index( $active = NULL )
    {

        if($active) {
            $active = true;
        } else {
            $active = false;
        }
        $list = $this->ReclamationStatus->getAll( $active );

        if (empty($list)) {
            $list = array();
        }

        return $list;

    }

    /**
     * @return array
     */
    public function post_index()
    {
        $langs = $this->Data->getPost('langs');
        if (!is_array($langs)) {
            $langs = json_decode($langs);
        }
        $active = $this->Data->getPost('active');
        $return = false;
        if (!empty($langs)) {
            if (!$active) {
                $active = 1;
            }
            $params = array(
                'active' => $active,
                'domainID' => $this->getDomainID(),
                'sort' => $this->ReclamationStatus->getMaxOrder()+1
            );
            $lastID = $this->ReclamationStatus->create($params);
            if ($lastID > 0) {
                $statusID = $lastID;
                $savedLangs = 0;
                foreach ($langs as $lang => $names) {
                    foreach ($names as $name) {
                        $savedLangs += intval($this->ReclamationStatusLang->set($statusID, $lang, $name));
                    }
                }

                $return['savedLangs'] = $savedLangs;
                $item = $this->ReclamationStatus->getOne($lastID);
                $return['item'] = $item;
                $return['response'] = true;
            }
            if (!$return) {
                $return = $this->sendFailResponse('03');
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('02');
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $langs = $this->Data->getPost('langs');
        if (!is_array($langs)) {
            $langs = json_decode($langs);
        }
        $active = $this->Data->getPost('active');
        $ID = $this->Data->getPost('ID');

        if (!$ID) {
            $return = $this->sendFailResponse('04');
            return $return;
        }

        $res = false;

        $langUpdated = 0;
        if (!empty($langs)) {
            foreach ($langs as $lang => $value) {
                $langUpdated += intval($this->ReclamationStatusLang->set($ID, $lang, $value['name']));
            }
        }

        if ($active !== NULL) {
            if ($this->ReclamationStatus->update($ID, 'active', $active)) {
                $res = true;
            }
        }

        if ($res) {
            $return['langUpdated'] = $langUpdated;
            $return['response'] = true;
            return $return;
        } else {
            $return = $this->sendFailResponse('03');
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->ReclamationStatus->delete('ID', $ID)) {
                $this->ReclamationStatusLang->delete('statusID', $ID);
                $data['response'] = true;
                return $data;
            } else {
                $data = $this->sendFailResponse('03');
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
    public function patch_sort()
    {
        $post = $this->Data->getAllPost();
        $this->Standard->setModel($this->ReclamationStatus);
        return $this->Standard->sort($post, $func = 'sort');
    }

    /**
     * @return array|bool
     */
    public function forClient()
    {
        $list = $this->ReclamationStatus->getAll( 1 );

        if (empty($list)) {
            $list = array();
        }

        return $list;
    }

}