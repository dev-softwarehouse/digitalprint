<?php

use DreamSoft\Models\PrintShopProduct\PrintShopPageName;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Core\Controller;

/**
 * Description of PagesController
 *
 * @author Rafał
 */
class PagesController extends Controller
{
    public $useModels = array();
    /**
     * @var PrintShopPage
     */
    protected $PrintShopPage;
    /**
     * @var PrintShopPageName
     */
    protected $PrintShopPageName;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->PrintShopPageName = PrintShopPageName::getInstance();
    }

    public function pages($groupID, $typeID, $ID = NULL)
    {
        $this->PrintShopPage->setGroupID($groupID);
        $this->PrintShopPage->setTypeID($typeID);

        if (intval($ID) > 0) {
            $data = $this->PrintShopPage->get('ID', $ID);
        } else {
            $data = $this->PrintShopPage->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param null $ID
     * @return array
     */
    public function pagesPublic($groupID, $typeID, $ID = NULL)
    {
        $this->PrintShopPage->setGroupID($groupID);
        $this->PrintShopPage->setTypeID($typeID);

        if (intval($ID) > 0) {
            $data = $this->PrintShopPage->get('ID', $ID);
        } else {
            $data = $this->PrintShopPage->getAll();
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
    public function patch_pages($groupID, $typeID)
    {
        $this->PrintShopPage->setGroupID($groupID);
        $this->PrintShopPage->setTypeID($typeID);

        $action = $this->Data->getPost('action');

        $data['response'] = false;
        if ($action == 'pages') {
            $pages = $this->Data->getPost('pages');
            if ($pages) {
                try {
                    $lastID = $this->PrintShopPage->create($pages);
                    if ($lastID > 0) {
                        $data['response'] = true;
                        $data['item'] = $this->PrintShopPage->get('ID', $lastID);
                    } else {
                        $data['response'] = false;
                    }
                } catch (Exception $ex) {
                    $data['error'] = $ex->getMessage();
                }
            }
        } elseif ($action == 'range') {
            $minPages = $this->Data->getPost('minPages');
            $maxPages = $this->Data->getPost('maxPages');
            $step = $this->Data->getPost('step');
            $doublePage = $this->Data->getPost('doublePage');
            if (!$doublePage) {
                $doublePage = 0;
            }

            if ($minPages && $maxPages && $step) {
                try {
                    $lastID = $this->PrintShopPage->createRange($minPages, $maxPages, $step, $doublePage);
                    if ($lastID > 0) {
                        $data['response'] = true;
                        $data['item'] = $this->PrintShopPage->get('ID', $lastID);
                    } else {
                        $data['response'] = false;
                    }
                } catch (Exception $ex) {
                    $data['error'] = $ex->getMessage();
                }
            }

        } elseif ($action == 'similarPage') {
            $similarPage = $this->Data->getPost('similarPage');

            if ($this->PrintShopPage->setPagesSimilar($similarPage)) {
                $data['response'] = true;
            }
        }

        return $data;

    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $ID
     * @return mixed
     */
    public function delete_pages($groupID, $typeID, $ID)
    {
        if (intval($ID) > 0) {
            try {
                $res = $this->PrintShopPage->delete('ID', $ID);
            } catch (Exception $ex) {
                $data['error'] = $ex->getMessage();
            }
            $data['response'] = $res;
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $typeID
     * @return array
     */
    public function customName($typeID)
    {
        $customNames = $this->PrintShopPageName->getByType($typeID);
        return $this->prepareCustomNames($customNames);
    }

    /**
     * @param $data
     * @return array
     */
    private function prepareCustomNames($data)
    {
        if( !$data ) {
            return array();
        }
        $list = array();
        foreach ($data as $row) {
            $list[$row['lang']] = $row['name'];
        }

        return $list;

    }

    /**
     * @param $typeID
     * @return mixed
     */
    public function patch_customName( $typeID )
    {
        $post = $this->Data->getAllPost();
        $return['response'] = false;

        if ($post['names'] === NULL) {
            $return = $this->sendFailResponse('02');
        }

        $updated = $saved = $deleted = 0;

        if( empty($post['names']) ) {
            $deleted += $this->PrintShopPageName->delete('typeID', $typeID);
        }

        foreach ($post['names'] as $lang => $name) {
            $existPageNameID = $this->PrintShopPageName->nameExist($typeID, $lang);
            if ($existPageNameID) {
                if( strlen($name) == 0 ) {
                    $deleted += $this->PrintShopPageName->delete('ID', $existPageNameID);
                } else {
                    $updated += $this->PrintShopPageName->update($existPageNameID, 'name', $name);
                }
            } else {
                $params['lang'] = $lang;
                $params['name'] = $name;
                $params['typeID'] = $typeID;
                $lastID = $this->PrintShopPageName->create($params);
                if( $lastID > 0 ) {
                    $saved++;
                }
                unset($params);
            }
        }

        if (($updated + $saved + $deleted) > 0) {
            $return['response'] = true;
            $return['saved'] = $saved;
            $return['updated'] = $updated;
            $return['deleted'] = $deleted;
            $customNames = $this->PrintShopPageName->getByType($typeID);

            $return['customNames'] = $this->prepareCustomNames($customNames);
        } else {
            $return['response'] = false;
        }

        return $return;
    }
}
