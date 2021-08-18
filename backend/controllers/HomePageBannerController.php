<?php

use DreamSoft\Models\Other\HomePageBanner;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Core\Controller;

class HomePageBannerController extends Controller
{

    /**
     * @var HomePageBanner
     */
    protected $HomePageBanner;
    /**
     * @var UploadFile
     */
    protected $UploadFile;
    /**
     * @var string
     */
    protected $fileFolder;
    /**
     * @var array
     */
    public $useModels = array();

    /**
     * HomePageBannerController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->HomePageBanner = HomePageBanner::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->fileFolder = 'uploadedFiles/';
    }

    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->HomePageBanner->setDomainID($ID);
    }

    /**
     * @return mixed
     */
    public function homePageBanner()
    {
        $paths = $this->HomePageBanner->getBannerPaths();
        return $paths;
    }

    /**
     * @return mixed
     */
    public function homePageBannerPublic()
    {
        $paths = $this->HomePageBanner->getBannerPaths();

        if (!empty($paths)) {
            foreach ($paths as $key => $file) {
                $paths[$key]['url'] = STATIC_URL . $this->fileFolder . companyID . '/' . $file['path'];
            }
        }

        return $paths;
    }

    /**
     * @return array
     */
    public function post_homePageBanner()
    {
        $post = $this->Data->getAllPost();
        $clear = $this->HomePageBanner->clearFiles();

        if ($clear) {

            $savedItems = 0;

            foreach ($post['files'] as $f) {

                if ( array_key_exists('link', $f) && $f['link']) {
                    if ($this->HomePageBanner->setFiles($f['ID'], $f['link'])) {
                        $savedItems++;
                    }
                } else {
                    if ($this->HomePageBanner->setFiles($f['ID'])) {
                        $savedItems++;
                    }
                }
            }

            if( $savedItems > 0 ) {
                return array(
                    'response' => true,
                    'savedItems' => $savedItems
                );
            }
        } else {
            return array('response' => false);
        }
    }

}
