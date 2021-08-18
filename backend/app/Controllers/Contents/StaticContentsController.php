<?php
/**
 * Programista Rafał Leśniak - 19.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 19-06-2017
 * Time: 11:32
 */

namespace DreamSoft\Controllers\Contents;


use DreamSoft\Models\Content\StaticContent;
use DreamSoft\Models\Content\StaticContentLang;
use DreamSoft\Core\Controller;

class StaticContentsController extends Controller
{
    /**
     * @var $StaticContent StaticContent
     */
    protected $StaticContent;
    /**
     * @var $StaticContentLang StaticContentLang
     */
    protected $StaticContentLang;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->StaticContent = StaticContent::getInstance();
        $this->StaticContentLang = StaticContentLang::getInstance();
    }

    public function setDomainID($domainID)
    {
        $this->StaticContent->setDomainID($domainID);
        parent::setDomainID($domainID);
    }

    /**
     * @return array
     */
    public function index()
    {

        $data = $this->StaticContent->getAll();

        if (!$data) {
            return array();
        }

        foreach ($data as $key => $row) {
            if ($row['domainID'] > 0) {
                $data[$key]['forDomain'] = 1;
            } else {
                $data[$key]['forDomain'] = 0;
            }
        }

        return $data;
    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $post = $this->Data->getAllPost();
        $data['response'] = false;

        if (empty($post['contents'])) {
            return $this->sendFailResponse('01');
        }

        if (!empty($post) && isset($post['key'])) {

            $keyExist = $this->StaticContent->get('key', $post['key']);

            if ($keyExist) {
                return $this->sendFailResponse('08');
            }

            $params['key'] = $post['key'];
            if (intval($post['forDomain']) == 1) {
                $params['domainID'] = $this->getDomainID();
            }
            $lastContentID = $this->StaticContent->create($params);

            $langSaved = array();
            if (!empty($post['contents'])) {
                foreach ($post['contents'] as $lang => $content) {
                    unset($params);
                    $params['lang'] = $lang;
                    $params['content'] = $content;
                    $params['staticContentID'] = $lastContentID;
                    $langSaved[] = $lastLangID = $this->StaticContentLang->create($params);
                }
            }

            if ($lastContentID > 0) {
                $data['response'] = true;
                $data['langSaved'] = $langSaved;
                $one = $this->StaticContent->getOne($lastContentID);
                $one['forDomain'] = 0;
                if ($one['domainID'] > 0) {
                    $one['forDomain'] = 1;
                }
                $data['one'] = $one;
            }

        } else {
            return $this->sendFailResponse('01');
        }

        return $data;
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $post = $this->Data->getAllPost();
        $data['response'] = false;

        $staticContent = false;

        $updated = 0;
        if (!empty($post) && isset($post['key'])) {
            $staticContent = $this->StaticContent->get('ID', $post['ID']);

            $updated += intval($this->StaticContent->update($staticContent['ID'], 'key', $post['key']));
            if (isset($post['forDomain'])) {
                $forDomain = intval($post['forDomain']) > 0 ? 1 : 0;
                if ($forDomain == 1) {
                    $updated += intval($this->StaticContent->update($staticContent['ID'], 'domainID', $this->getDomainID()));
                } else {
                    $updated += intval($this->StaticContent->update($staticContent['ID'], 'domainID', NULL));
                }
            }
            if (isset($post['active'])) {
                $active = intval($post['active']) > 0 ? 1 : 0;
                $updated += intval($this->StaticContent->update($staticContent['ID'], 'active', $active));
            }
        }

        $data['updatedField'] = $updated;

        $params = array();
        $updatedLangs = $deleted = $added = 0;
        if (!empty($post['contents']) && $staticContent) {
            foreach ($post['contents'] as $lang => $content) {
                $existID = $this->StaticContentLang->exist($staticContent['ID'], $lang);
                if ($existID) {
                    if (strlen($content) > 0) {
                        $updatedLangs += intval($this->StaticContentLang->update($existID, 'content', $content));
                    } else {
                        $deleted += intval($this->StaticContentLang->delete('ID', $existID));
                    }
                } else {
                    unset($params);
                    $params['lang'] = $lang;
                    $params['content'] = $content;
                    $params['staticContentID'] = $staticContent['ID'];
                    $lastID = $this->StaticContentLang->create($params);
                    if ($lastID > 0) {
                        $added++;
                    }
                }
            }
        }

        $allActions = $updated + $updatedLangs + $deleted + $added;

        if ($allActions > 0) {
            $data['response'] = true;
            $data['updated'] = $updated;
            $data['updatedLangs'] = $updatedLangs;
            $data['deleted'] = $deleted;
            $data['added'] = $added;
            $one = $this->StaticContent->getOne($staticContent['ID']);
            $one['forDomain'] = 0;
            if ($one['domainID'] > 0) {
                $one['forDomain'] = 1;
            }
            $data['one'] = $one;
            return $data;
        }

        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        $data['response'] = false;
        if ($ID) {
            if ($this->StaticContent->delete('ID', $ID)) {
                if ($this->StaticContentLang->delete('staticContentID', $ID)) {
                    $data['response'] = true;
                }
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
     * @param $key
     * @return array
     */
    public function getContent($key)
    {

        $data = $this->StaticContent->getByKey($key);

        if ($data['domainID'] != $this->getDomainID() && $data['domainID'] != NULL) {
            return array('return' => false);
        }

        if (!$data) {
            return array('return' => false);
        }

        return $data;
    }

}