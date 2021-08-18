<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Lang\LangSettingsRoot;
use DreamSoft\Models\Mail\MailContent;
use DreamSoft\Models\Mail\MailTitle;
use DreamSoft\Models\Mail\MailType;
use DreamSoft\Models\Mail\MailTypeLang;
use DreamSoft\Models\Mail\MailVariable;
use DreamSoft\Models\Mail\MailVariableLang;

/**
 * Description of MailController
 *
 * @author Rafał
 * @class MailController
 */
class MailController extends Controller {
    
    public $useModels = array();

    /**
     * @var MailContent
     */
    protected $MailContent;
    /**
     * @var MailTitle
     */
    protected $MailTitle;
    /**
     * @var MailTypeLang
     */
    protected $MailTypeLang;
    /**
     * @var MailType
     */
    protected $MailType;
    /**
     * @var LangSettingsRoot
     */
    protected $LangSettingsRoot;
    /**
     * @var MailVariable
     */
    protected $MailVariable;
    /**
     * @var MailVariableLang
     */
    protected $MailVariableLang;


    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct ($params) {
        
        parent::__construct($params);
        $this->MailContent = MailContent::getInstance();
        $this->MailTitle = MailTitle::getInstance();
        $this->MailType = MailType::getInstance();
        $this->LangSettingsRoot = LangSettingsRoot::getInstance();
        $this->MailTypeLang = MailTypeLang::getInstance();
        $this->MailVariable = MailVariable::getInstance();
        $this->MailVariableLang = MailVariableLang::getInstance();
    }
    
    public function setDomainID($domainID) {
        parent::setDomainID($domainID);
        $this->MailContent->setDomainID($domainID);
        $this->MailTitle->setDomainID($domainID);
    }

    public function types(){
        
        $list = $this->MailType->getAll();
        if( empty($list) ){
            $list = array();
        }
        return $list;
    }
    
    /**
     * @method post_types
     * Dodawanie typów maili wraz z nazwami językowymi
     * 
     * @param {String} $key
     * @param {Array} $names
     * @return {Array}
     */
    public function post_types(){
        $key = $this->Data->getPost('key');
        $names = $this->Data->getPost('names');
        $langListRoot = $this->LangSettingsRoot->getAll();
        $langArr = array();
        foreach($langListRoot as $r){
            $langArr[] = $r['code'];
        }
        $return['response'] = false;
        $addedLangs = 0;
        if( $key ) {
            $lastID = $this->MailType->create(compact('key'));
            if( $lastID > 0 ){
                $return = $this->MailType->get('ID', $lastID);
                if(!$return){
                    $return = $this->sendFailResponse('03');
                    return $return;
                }

                if( !empty($names) ){
                    $return['names'] = array();
                    foreach( $names as $lang => $name ){
                        if( in_array($lang, $langArr) ){
                            $params['mailTypeID'] = $lastID;
                            $params['name'] = $name;
                            $params['lang'] = $lang;
                            $lastTypeLangID = $this->MailTypeLang->create($params);
                            if( $lastTypeLangID > 0 ){
                                $addedLangs++;
                                $return['names'][$lang] = $name;
                            }
                        }
                    }
                }
            }
            
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }
    }
    
    /**
     * @method put_types
     * Edytowanie typów maili wraz z nazwami językowymi
     * 
     * @param {Integer} $ID
     * @param {String} $key
     * @param {Array} $names
     * @return {Array}
     */
    public function put_types() {
        $ID = $this->Data->getPost('ID');
        $key = $this->Data->getPost('key');
        $names = $this->Data->getPost('names');

        $langListRoot = $this->LangSettingsRoot->getAll();
        $langArr = array();
        foreach($langListRoot as $r){
            $langArr[] = $r['code'];
        }
        
        $one = $this->MailType->get('ID', $ID);
        if(!$one){
            return $this->sendFailResponse('06');
        }
        $updateKey = false;
        if( !empty($key) ){
            $updateKey = $this->MailType->update($ID,'key',$key);
        }
        $updatedLangs = 0;
        $addedLangs = 0;
        if( !empty($names) ){
            foreach( $names as $lang => $name ){
                if( in_array($lang, $langArr) ){
                    $typeLangID = $this->MailTypeLang->exist($ID, $lang);
                    if($typeLangID > 0){
                        $ok = $this->MailTypeLang->update($typeLangID, 'name', $name);
                        if($ok){
                            $updatedLangs++;
                        }
                    } else {
                        $lastTypeLangID = $this->MailTypeLang->create(
                            array('mailTypeID' => $ID, 'name' => $name, 'lang' => $lang)
                        );
                        if( $lastTypeLangID > 0 ){
                            $addedLangs++;
                        }
                    }
                }
            }
        }
        
        if( $updateKey || $updatedLangs > 0 ){
            return array('response' => true);
        } else {
            return $this->sendFailResponse('03');
        }
    }
    
    public function delete_types($ID){
        if( intval($ID) > 0 ){
            if( $this->MailType->delete('ID', $ID) ){
                if(!$this->MailTypeLang->delete('mailTypeID', $ID)) {
                    $data = $this->sendFailResponse('09');
                    return $data;
                }
                $data['response'] = true;
            } else {
                return $this->sendFailResponse('05');
            }
        } else {
            return $this->sendFailResponse('05');
        }
        return $data;
    }
    
    /**
     * Pobierz listę treści maili dla danej domeny i typu
     * 
     * @method contents
     * @param {Integer} $mailTypeID
     * @return {Array}
     */
    public function contents( $mailTypeID ) {
        $titles = $this->MailTitle->getByType($mailTypeID);
        $contents = $this->MailContent->getByType($mailTypeID);
        $result = array();
        
        if( $titles && $contents ){
            foreach ($titles as $lang => $value) {
                $result[$lang] = array('title' => $value, 'content' => $contents[$lang]);
            }
        }
        return $result;
    }
    
    /**
     * Dodawanie oraz zmiana treści maila w różnych językach
     * 
     * @method patch_contents
     * @param {Integer} $mailTypeID
     * @param {Array} $contents -> array('en' => array('content' => 'text', 'title' => 'text'))
     * @return {Array}
     */
    public function patch_contents( $mailTypeID ){
        //$content = $this->Data->getPost('content');
        //$title = $this->Data->getPost('title');
        $post = $this->Data->getAllPost('contents');
        
        
        $one = $this->MailType->get('ID', $mailTypeID);
        if( !$one ){
            return $this->sendFailResponse('04');
        }
        
        $data['response'] = false;
        $saved = 0;
        $updated = 0;
        foreach($post as $lang => $row){
            if( $row['content'] && $row['title'] ){
                $title = $row['title'];
                $content = $row['content'];
                $domainID = $this->getDomainID();

                $lastContentID = $this->MailContent->exist( $mailTypeID, $lang );
                if( !$lastContentID){
                    $lastContentID = $this->MailContent->create( compact('lang','domainID','mailTypeID','content') );
                } else {
                    if( $this->MailContent->update($lastContentID, 'content', $content) ){
                        $updated++;
                    }
                }

                $lastTitleID = $this->MailTitle->exist( $mailTypeID, $lang );
                if( !$lastTitleID ){
                    $lastTitleID = $this->MailTitle->create( compact('lang','domainID','mailTypeID','title') );
                } else {
                    if( $this->MailTitle->update($lastTitleID, 'title', $title) ){
                        $updated++;
                    }
                }

                if( $lastContentID > 0 && $lastTitleID > 0 ){
                    $saved++;
                }
            }
            unset($lastTitleID);
            unset($lastContentID);
        }
        
        if( $saved > 0 || $updated > 0 ){
            $data['response'] = true;
            $data['saved'] = $saved;
        }
        return $data;
    }
    
    public function variables( $mailTypeID ){
        
        $list = $this->MailVariable->getList( $mailTypeID );
        
        if( empty($list) ){
            $list = array();
        }
        $listArr = array();
        foreach ($list as $key => $value) {
            $listArr[] = $value['ID'];
        }
        
        $langList = $this->MailVariableLang->customGetByList( $listArr );
        
        if( !empty($langList) ){
            foreach ($list as $key => $value) {
                $list[$key]['langs'] = $langList[ $value['ID'] ];
            }
        }
        
        return $list;
        
    }
    
    public function post_variables( $mailTypeID ){
        
        $return['response'] = false;
        $variable = $this->Data->getPost('variable');
        $langs = $this->Data->getPost('langs');
        if( !is_array($langs) ){
            $langs = json_decode($langs, true);
        }
        if(!$mailTypeID){
            $mailTypeID = $this->Data->getPost('mailTypeID');
        }
        if( $variable && $mailTypeID ) {
            $lastID = $this->MailVariable->create( compact('mailTypeID', 'variable') );
            $langUpdated = 0;
            if( !empty($langs) ){
                foreach ($langs as $lang => $desc) {
                    $langUpdated += intval( $this->MailVariableLang->set($lastID, $lang, $desc) );
                }
            }
            $row = $this->MailVariable->get('ID', $lastID);
            $row['langs'] = $this->MailVariableLang->getByVariable( $lastID );
            $return['response'] = true;
            $return['item'] = $row;
            $return['langUpdated'] = $langUpdated;
            return $return;
        } else {
            return $this->sendFailResponse('01');
        }
        
        return $return;
        
    }
    
    public function put_variables( $mailTypeID ){
        
        $return['response'] = false;
        $ID = $this->Data->getPost('ID');
        $variable = $this->Data->getPost('variable');
        $langs = $this->Data->getPost('langs');
        if( !is_array($langs) ){
            $langs = json_decode($langs, true);
        }
        if( $variable ){
            
            if( $this->MailVariable->update($ID, 'variable', $variable) ) {
                
                $langUpdated = 0;
                if( !empty($langs) ){
                    foreach ($langs as $lang => $desc) {
                        $langUpdated += intval( $this->MailVariableLang->set($ID, $lang, $desc) );
                    }
                }
                
                $return['response'] = true;
                $return['langUpdated'] = $langUpdated;
                
            } else {
            
                return $this->sendFailResponse('10');
                
            }
            
        } else {
            return $this->sendFailResponse('01');
        }
        
        return $return;
    }


    /*
     * Edytuj zmienną
     * @method delete_variables
     * @param {Integer} ID
     * 
     * @return {Array}
     */
    public function put_options( $mailTypeID ){
        
        $post = $this->Data->getAllPost();

        $goodKeys = array( 'variable' );
        
        
        if( isset($post['ID']) && !empty($post['ID']) ){
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }
        
        $res = false;
        foreach( $post as $key => $value) {
            if( in_array($key, $goodKeys) ){
                $res = $this->MailVariable->update($ID, $key, $value);
            }
        }
        
        if( $res ){
            $return['response'] = true;
        } else {
            $return['response'] = false;
        }

        return $return;
        
    }
    
    /*
     * Usuń zmienną
     * @method delete_variables
     * @param {Integer} ID
     * 
     * @return {Array}
     */
    public function delete_variables( $mailTypeID, $ID ) {
        
        $data['response'] = false;
        if( intval($ID) == 0 ){
            return $this->sendFailResponse('04');
        }
        if( $this->MailVariable->delete( 'ID',$ID ) ){
            $this->MailVariableLang->delete( 'variableID', $ID  );
            $data['response'] = true;
        }
        return $data;
    }
    
}
