<?php

/**
 * Description of MainContentsController
 * @class MainContenetsController
 * @author Rafał
 */

use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Content\MainContent;
use DreamSoft\Models\Content\MainContentLang;
use DreamSoft\Models\Route\RouteContent;

class MainContentsController extends Controller
{

    public $useModels = array();

    /**
     * @var MainContent
     */
    protected $MainContent;
    /**
     * @var MainContentLang
     */
    protected $MainContentLang;
    /**
     * @var RouteContent
     */
    protected $RouteContent;

    /**
     * @var Standard
     */
    protected $Standard;

    /**
     * MainContentsController constructor.
     * @param array $parameters
     */
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        $this->MainContent = MainContent::getInstance();
        $this->MainContentLang = MainContentLang::getInstance();
        $this->RouteContent = RouteContent::getInstance();
        $this->Standard = Standard::getInstance();
    }

    /**
     * @param $routeID
     * @param null $ID
     * @return array
     */
    public function index($routeID, $ID = NULL)
    {

        if ($ID) {
            $data = $this->MainContent->get('ID', $ID);
        } else {
            $data = $this->MainContent->getAll($routeID);

            foreach ($data as $key => $value) {
                $langRes = array();
                $langs = $value['langs'];
                if (strlen($langs) > 0) {
                    $exp = explode("||", $langs);
                    if (!empty($exp)) {
                        foreach ($exp as $ln) {
                            $expLn = explode('::', $ln);
                            $langRes[$expLn[0]] = array('title' => $expLn[1], 'content' => $expLn[2]);
                        }
                    }
                }
                $data[$key]['langs'] = $langRes;
                unset($langRes);
            }
        }

        if (empty($data)) {
            return array();
        }
        return $data;
    }

    /**
     * @param $routeID
     * @return array
     */
    public function post_index($routeID)
    {

        $langs = $this->Data->getPost('langs');
        $data['response'] = false;
        if (!empty($langs) && $routeID) {
            if (!is_array($langs)) {
                $langs = json_decode($langs, true);
            }
            $order = $this->MainContent->getLastOrder($routeID);

            $mainContentID = $this->MainContent->create(compact('order'));
            $savedLangs = 0;

            if ($mainContentID > 0) {
                $contentID = $mainContentID;
                $this->RouteContent->create(compact('contentID', 'routeID'));
            }

            if (!empty($langs) && $mainContentID > 0) {
                foreach ($langs as $lang => $value) {
                    $savedLangs += intval($this->MainContentLang->set($mainContentID, $lang, $value['title'], $value['content']));
                }
            }
            $data['savedLangs'] = $savedLangs;
            if ($mainContentID > 0) {
                $data['response'] = true;
            } else {
                return $this->sendFailResponse('03');
            }

        } else {
            return $this->sendFailResponse('02');
        }
        return $data;
    }

    /**
     * @param null $routeID
     * @return array
     */
    public function patch_index($routeID = NULL)
    {

        $action = $this->Data->getPost('action');

        $data['response'] = false;

        switch ($action) {
            case "edit":
                $langs = $this->Data->getPost('langs');
                $ID = $this->Data->getPost('ID');
                if (!is_array($langs)) {
                    $langs = json_decode($langs, true);
                }

                if ($ID && !empty($langs)) {
                    $langUpdated = 0;
                    foreach ($langs as $lang => $value) {
                        $langUpdated += intval($this->MainContentLang->set($ID, $lang, $value['title'], $value['content']));
                    }
                    if ($langUpdated > 0) {
                        $data['response'] = true;
                        $data['langUpdated'] = $langUpdated;
                    }
                } else {
                    $data = $this->sendFailResponse('02');
                }
                break;
            case "addToRoutes":

                $routes = $this->Data->getPost('routes');
                $ID = $this->Data->getPost('ID');
                if (!is_array($routes)) {
                    $routes = json_decode($routes, true);
                }

                if (empty($routes)) {
                    return $this->sendFailResponse('01');
                }
                $contentID = $ID;
                $savedRelations = 0;
                foreach ($routes as $r) {
                    $routeID = $r;
                    $existID = $this->RouteContent->exist($contentID, $routeID);
                    if (!$existID) {
                        $savedRelations += intval($this->RouteContent->create(compact('contentID', 'routeID')));
                    }
                }
                $data['response'] = false;
                if ($savedRelations > 0) {
                    $data['savedRelations'] = $savedRelations;
                    $data['response'] = true;
                }

                break;

        }

        return $data;
    }

    /**
     * @param $routeID
     * @return mixed
     */
    public function patch_sort($routeID)
    {
        $post = $this->Data->getAllPost();
        if (!is_array($post)) {
            $post = json_decode($post, true);
        }
        $this->Standard->setModel($this->MainContent);
        return $this->Standard->sort($post, $func = 'sort');
    }

    /**
     * @param $routeID
     * @param $ID
     * @return array
     */
    public function delete_index($routeID, $ID)
    {

        if (!$ID) {
            return $this->sendFailResponse('04');
        }

        $data['response'] = false;
        if ($this->MainContent->delete('ID', $ID)) {
            $this->RouteContent->delete('contentID', $ID);
            $this->MainContentLang->delete('mainContentID', $ID);

            $data['response'] = true;
        } else {
            return $this->sendFailResponse('05');
        }

        return $data;

    }

}
