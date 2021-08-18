<?php
/**
 * Programmer Rafał Leśniak - 15.1.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 15-01-2018
 * Time: 10:25
 */

namespace DreamSoft\Controllers\MetaTags;

use DreamSoft\Core\Controller;
use DreamSoft\Models\MainMetaTag\MainMetaTag;
use DreamSoft\Models\MainMetaTag\MainMetaTagLanguage;

class MainMetaTagsController extends Controller
{
    /**
     * @var MainMetaTag
     */
    private $MainMetaTag;
    /**
     * @var MainMetaTagLanguage
     */
    private $MainMetaTagLanguage;

    /**
     * MainMetaTagsController constructor.
     * @param array $parameters
     */
    public function __construct(array $parameters = array())
    {
        parent::__construct($parameters);
        $this->MainMetaTag = MainMetaTag::getInstance();
        $this->MainMetaTagLanguage = MainMetaTagLanguage::getInstance();
    }

    /**
     * @param $ID
     */
    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->MainMetaTag->setDomainID($ID);
    }

    /**
     * @param $routeID
     * @return array|mixed
     */
    public function index($routeID)
    {
        $mainMetaTag = $this->MainMetaTag->get('routeID', $routeID);
        if( !$mainMetaTag ) {
            return array('response' => false);
        }

        $mainTagLanguages = $this->MainMetaTagLanguage->get('mainMetaTagID', $mainMetaTag['ID'], true);

        if( $mainTagLanguages ) {

            foreach ($mainTagLanguages as $mainTagLanguage) {
                $mainMetaTag['languages'][$mainTagLanguage['lang']] = array(
                    'title' => $mainTagLanguage['title'],
                    'description' => $mainTagLanguage['description'],
                    'keywords' => $mainTagLanguage['keywords']
                );
            }

        }

        $mainMetaTag['response'] = true;

        return $mainMetaTag;
    }

    /**
     * @return array
     */
    public function post_index()
    {
        $post = $this->Data->getAllPost();
        $languages = $post['languages'];

        $savedLanguages = 0;
        $lastID = false;

        if( intval($post['routeID']) > 0 ) {
            $params = array();
            $params['routeID'] = $post['routeID'];
            $params['domainID'] = $this->getDomainID();
            $lastID = $this->MainMetaTag->create($params);

            if( $lastID ) {

                if( $languages ) {
                    foreach ($languages as $lang => $metaTag) {
                        $params = array();
                        $params['mainMetaTagID'] = $lastID;
                        $params['lang'] = $lang;
                        $params['title'] = $metaTag['title'];
                        $params['description'] = $metaTag['description'];
                        $params['keywords'] = $metaTag['keywords'];
                        $lastSavedLanguageID = $this->MainMetaTagLanguage->create($params);
                        if( $lastSavedLanguageID > 0 ) {
                            $savedLanguages++;
                        }
                    }
                }

            }
        }

        if( $lastID ) {
            return array(
                'response' => true,
                'savedLanguages' => $savedLanguages,
                'item' => $this->index($post['routeID'])
            );
        }

        return $this->sendFailResponse('03');
    }

    /**
     * @param $ID
     * @return array
     */
    public function put_index($ID)
    {
        $post = $this->Data->getAllPost();
        $languages = $post['languages'];

        if (!$ID) {
            $ID = $this->Data->getPost('ID');
        }

        if (!$ID) {
            return $this->sendFailResponse('04');
        }

        $savedLanguages = 0;
        $updatedLanguages = 0;

        if($languages) {
            foreach ($languages as $lang => $metaTag) {
                $existID = $this->MainMetaTagLanguage->exist($ID, $lang);
                if( $existID ) {
                    if( intval($this->MainMetaTagLanguage->update($existID, 'title', $metaTag['title'])) > 0 ) {
                        $updatedLanguages++;
                    }
                    if( intval($this->MainMetaTagLanguage->update($existID, 'description', $metaTag['description'])) ) {
                        $updatedLanguages++;
                    }
                    if( intval($this->MainMetaTagLanguage->update($existID, 'keywords', $metaTag['keywords'])) ) {
                        $updatedLanguages++;
                    }
                } else {
                    $params = array();
                    $params['mainMetaTagID'] = $ID;
                    $params['lang'] = $lang;
                    $params['title'] = $metaTag['title'];
                    $params['description'] = $metaTag['description'];
                    $params['keywords'] = $metaTag['keywords'];
                    $lastSavedLanguageID = $this->MainMetaTagLanguage->create($params);
                    if( $lastSavedLanguageID > 0 ) {
                        $savedLanguages++;
                    }
                }
            }
        }

        if( $savedLanguages > 0 || $updatedLanguages > 0 ) {

            $mainTag = $this->MainMetaTag->get('ID', $ID);

            return array(
                'response' => true,
                'savedLanguages' => $savedLanguages,
                'updatedLanguages' => $updatedLanguages,
                'item' => $this->index($mainTag['routeID'])
            );
        }

        return $this->sendFailResponse('03');

    }
}