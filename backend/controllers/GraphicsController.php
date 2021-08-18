<?php

use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Other\ModelIconExtension;

class GraphicsController extends Controller
{

    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var
     */
    protected $filePath;
    /**
     * @var
     */
    protected $modelExtensions;
    /**
     * @var string
     */
    protected $modelIcoPath;
    /**
     * @var string
     */
    protected $logoPath;


    public $useModels = array('ModelIconExtension');

    /**
     * GraphicsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Uploader = Uploader::getInstance();
        $this->logoPath = 'uploadedFiles/' . companyID . '/';
        $this->modelIcoPath = 'uploadedFiles/' . companyID . '/modelsIcons/';
        $this->modelExtensions = ModelIconExtension::getInstance();

    }

    /**
     * @return bool
     */
    public function post_uploadElement()
    {
        $post = $this->Data->getAllPost();

        $logoPath = $this->logoPath . 'logos/' . $post['domainID'] . '/';
        if( !is_dir($logoPath) ) {
            mkdir($logoPath, 0777);
        }
        $res = $this->Uploader->upload($_FILES, 'file', $logoPath, 'logo');
        return $res;
    }

    /**
     * @return array
     */
    public function modelIcon()
    {
        $files = scandir(MAIN_UPLOAD . $this->modelIcoPath);
        $files = array_diff($files, array('..', '.'));
        $files = array_values($files);
        $modelIcoFiles = array();
        foreach ($files as $key => $f) {
            $modelIcoFiles[$key]['name'] = $f;
            $nameParts = explode('.', $f);
            $modelIcoFiles[$key]['ext'] = $nameParts[0];
        }
        return $modelIcoFiles;
    }

    /**
     * @return bool
     */
    public function post_modelIcon()
    {
        $post = $this->Data->getAllPost();
        $ext = $post['ext'];
        $res = $this->Uploader->upload($_FILES, 'file', $this->modelIcoPath, $ext . '.png');
        return $res;
    }

    public function favicon()
    {

    }

    public function post_favicon()
    {

    }

    public function homePageBanner()
    {

    }

    public function post_homePageBanner()
    {
        $post = $this->Data->getAllPost();
    }

}
