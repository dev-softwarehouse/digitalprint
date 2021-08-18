<?php

namespace DreamSoft\Controllers\Components;
/**
 * Description of Uploader
 *
 * @author Rafał
 */
use DreamSoft\Core\Component;
use Exception;
use Imagick;
use ImagickException;

class Uploader extends Component
{

    public function __construct()
    {
        parent::__construct();
    }

    /**
     *
     *
     * @param {String} $_file
     * @param {String} $fileName
     * @param {String} $destFolder
     * @param {String} $newName
     * @return boolean
     */
    public function upload($_file, $fileName, $destFolder, $newName)
    {

        if (!isset($_file[$fileName]) || !is_uploaded_file($_file[$fileName]['tmp_name'])) {
            return false;
        }
        $dir = MAIN_UPLOAD . $destFolder;

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
            chmod($dir, 0755);
        }

        $file = $dir . $newName;

        if (move_uploaded_file($_file[$fileName]['tmp_name'], $file)) {
            chmod($file, 0777);
            return true;
        }
        return false;

    }

    /**
     * @param $destinationFolder
     * @param $name
     * @return bool
     */
    public function remove($destinationFolder, $name)
    {
        $file = MAIN_UPLOAD . $destinationFolder . $name;

        if (!is_file($file)) {
            return true;
        }

        if (unlink($file)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param $_file
     * @param $fileName
     * @param $destinationFolder
     * @param $newName
     * @return bool
     */
    public function uploadToCompany($_file, $fileName, $destinationFolder, $newName)
    {

        if (!isset($_file[$fileName]) || !is_uploaded_file($_file[$fileName]['tmp_name'])) {
            return false;
        }

        $dir = MAIN_UPLOAD . companyID . '/' . $destinationFolder;
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
            chmod($dir, 0755);
        }

        $file = $dir . $newName;

        try {

            if (move_uploaded_file($_file[$fileName]['tmp_name'], $file)) {
                chmod($file, 0755);
                return true;
            }
        } catch (Exception $e) {
            $this->debug($e->getMessage());
            return true;
        }

        return false;
    }

    public function uploadTemporary($postFileName, $fileName=null)
    {
        $postFile = $_FILES[$postFileName];
        if(!$fileName){
            $fileName=$postFile['name'];
        }
        ini_set('max_execution_time', 720);
        $dir = STATIC_PATH . companyID . '/tmp/';// TODO STATIC_PATH should be moved to another
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        $path = $dir . $fileName;

        if (move_uploaded_file($postFile['tmp_name'], $path)) {
            return $path;
        } else {
            return false;
        }
    }

    public function removeTemporary($filePath)
    {
        if (unlink($filePath)) {
            return true;
        } else {
            return false;
        }
    }


    public function removeFromCompany($destFolder, $name)
    {

        $file = MAIN_UPLOAD . companyID . '/' . $destFolder . $name;
        $minFile = MAIN_UPLOAD . companyID . '/' . $destFolder . THUMB_IMAGE_PREFIX . $name;

        if (!is_file($file)) {
            return true;
        }

        if (unlink($file)) {
            unlink($minFile);
            unlink(MAIN_UPLOAD . companyID . '/' . $destFolder);
            return true;
        } else {
            return false;
        }

    }

    /**
     * @param $imagePath
     * @param $width
     * @param $height
     * @param $cropZoom
     * @return Imagick
     * @throws ImagickException
     */
    function resizeImage($imagePath, $width, $height, $cropZoom)
    {
        $explodedString = explode('.', $imagePath);
        $ext = end($explodedString);

        if( $ext == 'pdf' ) {
            $imagick = new Imagick();
            $imagick->setResolution(100, 100);
            $imagick->readImage(realpath($imagePath));
            $imagick->setIteratorIndex(0);
            $imagick->setImageFormat('jpg');
            $imagick->setImageAlphaChannel(imagick::ALPHACHANNEL_FLATTEN);
            $imagick->setImageCompressionQuality(90);
        } else {
            $imagick = new \Imagick(realpath($imagePath));
        }

        $imageProps = $imagick->getImageGeometry();
        if ($imageProps['width'] > $width || $imageProps['height'] > $height) {
            $imagick->resizeImage($width, $height, imagick::FILTER_LANCZOS, 0.9, true);
        }

        $cropWidth = $imagick->getImageWidth();
        $cropHeight = $imagick->getImageHeight();

        if ($cropZoom) {
            $newWidth = $cropWidth / 2;
            $newHeight = $cropHeight / 2;

            $imagick->cropimage(
                $newWidth,
                $newHeight,
                ($cropWidth - $newWidth) / 2,
                ($cropHeight - $newHeight) / 2
            );

            $imagick->scaleimage(
                $imagick->getImageWidth() * 4,
                $imagick->getImageHeight() * 4
            );
        }

        return $imagick;
    }

}
