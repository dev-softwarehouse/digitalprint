<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Editor\AdminProjectObject;

/**
 * Description of uploadController
 *
 * @author Rafał
 */
class UploadController extends Controller {
    
    public $useModels = array( 'AdminProjectObject' => array('package' => 'Editor'),);
    public $domain = 'http://dev2.digitalprint.pro/';
    
    protected $AdminProjectObject;
    private $destination = 'uploads';
    private $destThemes = 'themes';

    public function __construct ($params) {
        parent::__construct($params);
        $this->AdminProjectObject = AdminProjectObject::getInstance();
    }
    
    public function post_upload(){
        $projectID = filter_input(INPUT_POST, 'projectID');
        $objectID = filter_input(INPUT_POST, 'objectID');
        $imageMin = filter_input(INPUT_POST, 'image_min');
        $companyID = filter_input(INPUT_POST, 'companyID');
        
        if(isset($_FILES) && $projectID && $objectID) {
            if(!isset($_FILES['userFile']) || !is_uploaded_file($_FILES['userFile']['tmp_name']))
            {
                return array('response' => false, 'info' => 'Brak user file. Chuju!' );
            }

            $ImageName = $this->AdminProjectObject->permalink($_FILES['userFile']['name']);
            $dir = BASE_DIR.$this->destination.'/'.$companyID.'/'.$projectID.'/'.$objectID.'/';
            if( !is_dir($dir) ){
                mkdir($dir,0755,true);
                chmod($dir,0755);
            }
            $file = $dir.$ImageName;
            if(move_uploaded_file($_FILES['userFile']['tmp_name'], $file)){
                $url = str_replace(BASE_DIR, $this->domain, $file);
                $base64img = explode(',',$imageMin);
                $data = base64_decode($base64img[1]);
                $minFile = $dir.'min-'.$ImageName;
                file_put_contents($minFile, $data);
                $minUrl = str_replace(BASE_DIR, $this->domain, $minFile);
                
                return array('url' => $url, 'minUrl' => $minUrl,'response' => true);
            } else {
                return array('response' => false, 'info' => 'Nie zapisał się KURWA plik!!!! ');
            }
            
        } else {
            return array('response' => false, 'info' => 'Nie ma wszystkich parametów. JA PIERDOLE!');
        }
        /*$base64img = str_replace('data:image/jpeg;base64,', '', $base64img);
        explode(',',$base64img);
        $data = base64_decode($base64img);
        $file = UPLOAD_DIR . uniqid() . '.jpg';
        file_put_contents($file, $data);*/
    }
    
    public function post_theme() {
        
        $themeID = filter_input(INPUT_POST, 'themeID');
        $imageMin = filter_input(INPUT_POST, 'image_min');
        $name = filter_input(INPUT_POST, 'name');
        
        $dir = BASE_DIR.$this->destThemes.'/'.$themeID.'/';
        
        if( strlen($name) > 0 && strlen($imageMin) > 0 ){
            $ImageName = $this->AdminProjectObject->permalink($name).'.jpg';
            $base64img = explode(',',$imageMin);
            $data = base64_decode($base64img[1]);
            $file = $dir.$ImageName;
            if( !is_dir($dir) ){
                mkdir($dir, 0777);
                chmod($dir, 0777);
            }
            if( file_put_contents($file, $data)){
                $response = true;
            } else {
                return array('response' => false, 'info' => 'GENERATED. Nie zapisał się KURWA plik!!!! ');
            }
            $url = str_replace(BASE_DIR, $this->domain, $file);
            return array('url' => $url,'response' => $response);
        } else {
            return array('response' => false, 'info' => 'GENERATED. Nie zapisał się KURWA plik!!!! ');
        }
    }
    
    public function upload($objectID){
        return $this->AdminProjectObject->getBase64($objectID);
    }
    
    public function compress($objectID){
        $base = $this->AdminProjectObject->getBase64($objectID);
        return gzcompress($base, 9);
    }
    
    public function url($objectID){
        return $this->AdminProjectObject->getUrl($objectID);
    }

    public function fotobox($params = NULL)
    {
        if (!empty($params)) {
            $data['get'] = 'Wysłano get';
        } else {
            $data['get'] = 'Nie wysłano get';
        }

        if (!empty($_POST)) {
            $data['post'] = 'Wysłano post';
        } else {
            $data['post'] = 'Nie wysłano post';
        }

        return $data;
    }
    
}
