<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Upload\UploadFile;
use DreamSoft\Models\Behaviours\UrlMaker;
use DreamSoft\Controllers\Components\Uploader;

class TextAngularUploadController extends Controller
{

    public $useModels = array();

    protected $Uploader;
    protected $fileFolder;
    protected $UploadFile;

    /**
     * @var
     */
    private $UrlMaker;


    public function __construct($params)
    {
        parent::__construct($params);
        $this->Uploader = Uploader::getInstance();
        $this->UploadFile = UploadFile::getInstance();
        $this->fileFolder = 'uploadedFiles/' . companyID . '/productIcons';
        $this->UrlMaker = new UrlMaker();
    }

    /**
     * @return mixed
     * @throws ImagickException
     */
    public function post_textAngularIcons()
    {

        $filename = $_FILES['file']['name'];
        $filename = $this->UrlMaker->permalink($filename);
        $destFolder = $this->fileFolder . '/' . date('Y-m-d') . '/';
        $destFilePath = MAIN_UPLOAD . $destFolder;

        if (is_file($destFilePath . $filename)) {
            $nameParts = explode('.', $filename);
            for ($i = 1; ; $i++) {
                $newFileName = $nameParts[0] . '_' . $i . '.' . $nameParts[1];
                if (!is_file($destFilePath . $newFileName)) {
                    $filename = $newFileName;
                    break;
                }
            }
        }

        $res = $this->Uploader->upload($_FILES, 'file', $destFolder, $filename);
        $imagick = new Imagick($destFilePath . $filename);
        $w = $imagick->getimagewidth();
        $h = $imagick->getimageheight();

        if ($w > 1000) {
            $resizeVar = 1000 / $w;
            $newH = ($h * $resizeVar);
            $thumb = $imagick->thumbnailimage(1000, $newH);
        }
        $imagick->writeimage($destFilePath . $filename);
        $response['path'] = $destFolder . $filename;

        return $response;
    }
}
