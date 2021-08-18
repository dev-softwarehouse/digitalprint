<?php

use DreamSoft\Controllers\Components\DateComponent;
use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Controllers\Components\RouteAssistant;
use DreamSoft\Models\Newsletter\NewsletterRecipient;
use DreamSoft\Controllers\Components\CategoriesAssistant;
use DreamSoft\Models\Lang\LangSetting;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Setting\Content;
use DreamSoft\Libs\JWT;

/**
 * @class SettingsController
 */
class SettingsController extends Controller
{

    public $useModels = array();

    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var Content
     */
    protected $Content;
    /**
     * @var Mail
     */
    protected $Mail;
    /**
     * @var DateComponent
     */
    protected $DateComponent;
    /**
     * @var NewsletterRecipient
     */
    private $NewsletterRecipient;
    /**
     * @var RouteAssistant
     */
    private $RouteAssistant;
    /**
     * @var CategoriesAssistant
     */
    private $CategoriesAssistant;
    /**
     * @var LangSetting
     */
    private $LangSetting;
    /**
     * @var Standard
     */
    private $Standard;
    /**
     * @var array
     */
    private $filterKeys = array();
    private $urlsExistInMap = [];

    /**
     * SettingsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {

        parent::__construct($params);
        $this->Mail = Mail::getInstance();
        $this->DateComponent = DateComponent::getInstance();

        $this->Setting = Setting::getInstance();
        $this->Content = Content::getInstance();

        $this->NewsletterRecipient = NewsletterRecipient::getInstance();
        $this->RouteAssistant = RouteAssistant::getInstance();
        $this->CategoriesAssistant = CategoriesAssistant::getInstance();
        $this->LangSetting = LangSetting::getInstance();
        $this->Standard = Standard::getInstance();

        if (sourceApp === 'client') {
            $this->setFilterKeys(
                array('captchaPrivateKey', 'adminMailRecipients')
            );
        }
    }

    /**
     * @return array
     */
    public function getFilterKeys()
    {
        return $this->filterKeys;
    }

    /**
     * @param array $filterKeys
     */
    public function setFilterKeys($filterKeys)
    {
        $this->filterKeys = $filterKeys;
    }

    /**
     * @param $module
     */
    public function setModule($module)
    {
        $this->Setting->setModule($module);
        $this->Content->setModule($module);
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->Content->setDomainID($domainID);
        $this->Mail->setDomainID($domainID);
        $this->NewsletterRecipient->setDomainID($domainID);
        $this->RouteAssistant->setDomainID($domainID);
        $this->CategoriesAssistant->setDomainID($domainID);
        $this->LangSetting->setDomainID($domainID);
    }

    /**
     * @return array
     */
    public function getUrlsExistInMap()
    {
        return $this->urlsExistInMap;
    }

    /**
     * @param $url
     */
    public function setUrlsExistInMap($url)
    {
        $this->urlsExistInMap[] = $url;
    }

    /**
     * @return array
     */
    public function resetUrlsExistInMap()
    {
        $this->urlsExistInMap = [];
    }

    /**
     * @param null $key
     * @return array
     */
    public function index($key = NULL)
    {

        if (strlen($key) > 0) {
            $data = $this->Setting->getValue($key);
            if (empty($data)) {
                $data = $this->Content->getValue($key);
            }
        } else {
            $filterKeys = $this->getFilterKeys();
            $dataS = $this->Setting->getAllByModule($filterKeys);
            $dataC = $this->Content->getAllByModule();
            if (!empty($dataS) && !empty($dataC)) {
                $data = array_merge((array)$dataS, (array)$dataC);
            } elseif (!empty($dataS)) {
                $data = $dataS;
            } else {
                $data = $dataC;
            }

        }
        if (!$data) {
            return array();
        }

        foreach ($data as $key => $row) {
            if (array_key_exists('value', $row)) {
                $data[$key]['value'] = $this->checkValue($row['value']);
            }
        }

        $data['returnType'] = 'Object';
        return $data;
    }

    private function checkValue($value)
    {
        $exploded = str_split($value);
        $first = current($exploded);
        $last = end($exploded);
        if (is_numeric($first) && is_numeric($last)) {
            return $value . '';
        }
        return $value;
    }

    /**
     * @return array
     */
    public function post_index()
    {
        $key = $this->Data->getPost('key');
        $value = $this->Data->getPost('value');
        $domainID = $this->Data->getPost('domainID');
        if ($domainID == 0) {
            $this->Setting->setDomainID(NULL);
            $this->Content->setDomainID(NULL);
        }

        if ($key && $value) {
            $this->Setting->set($key, $value);
            $return['response'] = true;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @return array
     */
    public function put_index()
    {
        $return['response'] = true;
        return $return;
    }

    /**
     * @return array
     */
    public function patch_index()
    {
        $putArray = $this->Data->getAllPost();

        if (empty($putArray)) {
            $return['response'] = false;
            return $return;
        }
        unset($putArray['id']);

        if (array_key_exists('domainID', $putArray)) {
            if ($putArray['domainID'] == 0) {
                $this->Setting->setDomainID(NULL);
                $this->Content->setDomainID(NULL);
            } else {
                $this->Setting->setDomainID($putArray['domainID']);
                $this->Content->setDomainID($putArray['domainID']);
            }
            unset($putArray['domainID']);
        }

        $this->Setting->setLang(NULL);
        foreach ($putArray as $key => $object) {
            if (strlen($key) > 0 && isset($object['value'])) {
                if (isset($object['value'])) {
                    if (is_bool($object['value'])) {
                        $object['value'] = intval($object['value']);
                    }
                    if ($object['value'] === 'false') {
                        $object['value'] = 0;
                    }
                    if ($object['value'] === 'true') {
                        $object['value'] = 1;
                    }
                    $this->Setting->set($key, $object['value']);
                }
                $this->Setting->setLang(NULL);
            } else {
                $typeData = 'S';
                if (is_array($object)) {
                    if (array_key_exists('_type', $object)) {
                        if ($object['_type'] == 'textarea') {
                            $typeData = 'C';
                        }
                    }
                }
                foreach ($object as $lang => $value) {
                    if (substr($lang, 0, 1) == "_") {
                        continue;
                    }
                    if ($lang == 'value') {
                        if ($typeData == 'C') {
                            $this->Content->setLang(NULL);
                        } else {
                            $this->Setting->setLang(NULL);
                        }
                    } else {
                        if ($typeData == 'C') {
                            $this->Content->setLang($lang);
                        } else {
                            $this->Setting->setLang($lang);
                        }
                    }
                    if (strlen($lang) > 0 && strlen($value) > 0) {
                        if (is_bool($value)) {
                            $value = intval($value);
                        }
                        if ($value === 'false') {
                            $value = 0;
                        }
                        if ($value === 'true') {
                            $value = 1;
                        }
                        if ($typeData == 'C') {
                            $this->Content->set($key, $value);
                        } else {
                            $this->Setting->set($key, $value);
                        }
                    }
                    if ($typeData == 'C') {
                        $this->Content->setLang(NULL);
                    } else {
                        $this->Setting->setLang(NULL);
                    }

                }
            }
        }

        $return['response'] = true;
        return $return;

    }

    /**
     * @param $key
     * @return array
     */
    public function delete_index($key)
    {
        $deleted = 0;
        if (strlen($key) > 0) {
            if ($this->Setting->customDelete($key)) {
                $deleted++;
            }
            if ($this->Content->customDelete($key)) {
                $deleted++;
            }
        } else {
            return $this->sendFailResponse('05');
        }
        if ($deleted > 0) {
            return array('response' => true, 'deleted' => $deleted);
        }
    }

    /**
     * @return mixed
     */
    public function getSkinName()
    {
        $this->Setting->setModule('general');
        $this->Setting->setLang(NULL);

        $skinName = $this->Setting->getValue('skinName');

        if ($skinName) {
            $data['skinName'] = $skinName;
        } else {
            $data['skinName'] = CUSTOM_SKIN;
        }

        $data['response'] = true;

        return $data;
    }

    /**
     * @param $module
     * @return array
     */
    public function getPublicSettings($module)
    {

        $publicSettings = array('forms', 'additionalSettings', 'reclamation', 'general', 'bannerSlider');

        if (!in_array($module, $publicSettings)) {
            return $this->sendFailResponse('12');
        }

        $this->Setting->setModule($module);
        $this->Content->setModule($module);

        return $this->index();
    }

    public function post_sendMessage($key)
    {
        $this->Setting->setModule('forms');
        $this->Setting->setLang(NULL);
        $post = $this->Data->getAllPost();

        $recipients = $this->Setting->getValue($key);

        $this->Setting->setModule('additionalSettings');
        $this->Setting->setLang(NULL);

        $captchaPrivateKey = $this->Setting->getValue('captchaPrivateKey');

        $captchaResponse = $post['captchaResponse'];

        $captchaVerify = $this->Standard->sendCaptchaVerify($captchaPrivateKey, $captchaResponse);

        if (!isset($captchaVerify['success']) || $captchaVerify['success'] === false) {
            return $this->sendFailResponse('19', 'captcha_not_valid');
        }

        $send = false;

        if (!$post['userName'] || !$post['email'] || !$post['content']) {
            return $this->sendFailResponse('01');
        }

        if (!$recipients) {
            $this->sendFailResponse('07', 'invalid_recipients');
        } else {
            $tmpEmails = explode(',', $recipients);
            $mails = NULL;
            foreach ($tmpEmails as $row) {
                $mails[] = array('email' => $row, 'name' => 'Admin');
            }

            $this->Mail->setBind('user_name', $post['userName']);
            $this->Mail->setBind('content', $post['content']);
            $this->Mail->setBind('subject', $post['subject']);
            $this->Mail->setBind('email', $post['email']);

            if (!empty($mails)) {

                foreach ($mails as $mail) {
                    $send = $this->Mail->sendMail($mail['email'], $mail['name'], 'mailContactForm');
                }

            } else {
                return array('response' => false, 'info' => 'mail_not_send');
            }
        }

        if ($send) {
            return array('response' => true, 'info' => 'mail_sent');
        }

        return array('response' => false, 'info' => 'mail_not_send');
    }

    /**
     * @return array
     */
    public function post_newsletter()
    {
        $email = $this->Data->getPost('email');
        $description = 'newsletter z efotogallery';

        $response = false;
        $info = '';
        $sendEmail = false;

        if (companyID == 195) {
            $url = 'https://api.broadmail.de/http/form/OMCINHUifsVyqI5g3NtUB9i94IaViwvJ/subscribe';
            $url .= '?bmRecipientId=' . urlencode(utf8_decode($email));
            $url .= '&opis=' . urlencode(utf8_decode($description));
            $result = @file_get_contents($url);

            if ($result == 'ok') {
                $response = true;
                $info = 'thank_you_for_registering_on_mailing_list';
            } else if ($result == 'duplicate') {
                $info = 'already_on_the_mailing_list';
            } else {
                $info = 'error';
            }

        } else {

            $emailExist = $this->NewsletterRecipient->getByEmail($email);

            if ($emailExist) {
                $info = 'already_on_the_mailing_list';
                $response = false;
                return compact('info', 'response', 'email');
            }

            $result = filter_var($email, FILTER_VALIDATE_EMAIL);

            if ($result) {

                $playLoad = array(
                    'email' => $email
                );
                $token = JWT::encode($playLoad, DEFAULT_SALT);

                $url = $this->RouteAssistant->getStateUrl('confirm-newsletter', lang);

                $url = str_replace(':token', $token, $url);

                $this->Mail->setBind('confirm_url', $url);
                $send = $this->Mail->sendMail($email, '', 'newsletterConfirm', lang);

                $response = true;
                $info = 'check_email_to_confirm_newsletter';
                $sendEmail = $send;
            } else {
                $info = 'error';
            }

        }

        return compact('info', 'response', 'email', 'sendEmail');

    }

    /**
     * @return array
     */
    public function getDateByWorkingDays()
    {
        $this->Setting->setModule('additionalSettings');
        $this->Setting->setLang(NULL);

        $days = $this->Setting->getValue('reclamationDays');

        if (!$days) {
            $days = DEFAULT_RECLAMATION_DAYS;
        }

        $dateIterator = date('Y-m-d H:i:s');

        while ($days > 0) {
            if (!$this->DateComponent->isHoliday($dateIterator)) {
                --$days;
            }
            $dateIterator = date('Y-m-d H:i:s', strtotime($dateIterator . '-1 day'));
        }

        return array('date' => $dateIterator);

    }

    /**
     * @return array
     */
    public function post_confirmNewsletter()
    {
        $token = $this->Data->getPost('token');

        $info = '';
        $errorMessage = '';
        $response = false;

        try {
            $decodedToken = JWT::decode($token, DEFAULT_SALT, array('HS256'));

            if ($decodedToken->email && filter_var($decodedToken->email, FILTER_VALIDATE_EMAIL)) {
                $params['email'] = $decodedToken->email;
                $params['agreement'] = 1;
                $params['domainID'] = $this->NewsletterRecipient->getDomainID();
                $params['created'] = $params['modified'] = date(DATE_FORMAT);
                $result = $this->NewsletterRecipient->create($params);

                if ($result) {
                    $info = 'thank_you_for_registering_on_mailing_list';
                    $response = true;
                } else {
                    $info = 'error';
                }
            }

        } catch (Exception $e) {
            $info = 'error';
            $errorMessage = $e->getMessage();
        }

        return compact('info', 'errorMessage', 'response');
    }

    /**
     * @return array
     */
    public function generateSiteMap()
    {
        $data = $this->CategoriesAssistant->getCategoryByUserDiscount();

        $result = array();

        if ($data) {

            $categoriesBox = array();
            foreach ($data as $key => $row) {
                $categoriesBox[] = $row['ID'];
                unset($data[$key]['langs']);
                $data = $this->CategoriesAssistant->parseLang($data, $key, $row['langs']);
            }

            $result = $this->CategoriesAssistant->setParentItems($data, $result);


            $itemsInRelationBox = $this->CategoriesAssistant->getItemsInRelation($categoriesBox);
            $types = $itemsInRelationBox['types'];
            $groups = $itemsInRelationBox['groups'];
            $itemsInRelation = $itemsInRelationBox['itemsInRelation'];

            $aggregateGroupsForTypes = $this->CategoriesAssistant->getAggregateGroupsForTypes($types);

            $typesForGroup = $this->CategoriesAssistant->getTypesForGroup($groups);

            $typesForGroupWithKey = array();
            if ($typesForGroup) {
                foreach ($typesForGroup as $type) {
                    $typesForGroupWithKey[$type['groupID']][] = $type;
                    if (!in_array($type['groupID'], $aggregateGroupsForTypes)) {
                        $aggregateGroupsForTypes[] = $type['groupID'];
                    }
                }
            }

            $groupsForTypes = $this->CategoriesAssistant->getGroupForTypes($aggregateGroupsForTypes);

            $types = $this->CategoriesAssistant->addSlugToTypes($types, $groupsForTypes);

            if ($typesForGroup) {
                foreach ($typesForGroupWithKey as $groupID => $groupTypes) {
                    foreach ($groupTypes as $keyType => $type) {
                        if ($groupsForTypes[$type['groupID']]) {
                            $typesForGroupWithKey[$groupID][$keyType]['group']['slugs'] = $groupsForTypes[$type['groupID']]['slugs'];
                        }
                    }
                }
            }

            foreach ($groups as $key => $group) {
                $groups[$key]['types'] = $typesForGroupWithKey[$group['ID']];
            }

            $result = $this->CategoriesAssistant->doAggregateGroups($itemsInRelation, $result, $data, $groups);
            $result = $this->CategoriesAssistant->doAggregateTypes($itemsInRelation, $result, $data, $types);
        }

        $langList = $this->LangSetting->getAll();

        $sites = array();

        $routes = $this->RouteAssistant->show(NULL);

        $parentAvailable = ['sitemap', 'cart'];
        $parentWithChildren = ['staticPages', 'authorization'];

        foreach ($routes as $one) {

            if( !array_key_exists('parent', $one['route']) ) {
                continue;
            }

            if( $one['route']['parent'] === 'home' &&
                $one['route']['abstract'] === 0 &&
                in_array($one['route']['state'], $parentAvailable) ) {
                $sites[] = $one['route'];
            } else if( in_array($one['route']['parent'], $parentWithChildren) ) {
                $sites[] = $one['route'];
            }
        }

        $translateSites = array();
        $fileBody = '';
        $activeLanguages = [];

        $this->resetUrlsExistInMap();

        foreach($langList as $lang) {

            if( $lang['active'] == 0 ) {
                continue;
            }

            $activeLanguages[] = $lang['code'];

            foreach ($sites as $site) {
                if(  array_key_exists($lang['code'], $site['langs']) ) {
                    $site['url'] = $this->RouteAssistant->getStateUrl($site['state'], $lang['code']);
                    if( strlen($site['url']) > 0 ) {
                        $fileBody .= $this->printOneUrlElement($site['url']);
                        $translateSites[] = $site;
                    }
                }
            }

            foreach($result as $categoryItem) {

                if( array_key_exists('langs', $categoryItem) ) {
                    $fileBody .= $this->prepareUrlsOfCategory($categoryItem, $activeLanguages);
                }

                if( array_key_exists('groups', $categoryItem) ) {
                    $fileBody .= $this->prepareUrlsOfGroups($categoryItem, $activeLanguages);
                }

                if( array_key_exists('types', $categoryItem) ) {
                    $fileBody .= $this->prepareUrlsOfTypes($categoryItem, $activeLanguages);
                }

                foreach($categoryItem['childs'] as $child) {

                    if( array_key_exists('langs', $child) ) {
                        $fileBody .= $this->prepareUrlsOfCategory($child, $activeLanguages);
                    }

                    if( array_key_exists('groups', $child) ) {
                        $fileBody .= $this->prepareUrlsOfGroups($child, $activeLanguages);
                    }
                    if( array_key_exists('types', $child) ) {
                        $fileBody .= $this->prepareUrlsOfTypes($child, $activeLanguages);
                    }


                }
            }

        }

        $fileContent = '<?xml version="1.0" encoding="UTF-8"?>';
        $fileContent .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $fileContent .= $fileBody;
        $fileContent .= '</urlset>';

        $fileName = 'sitemap.xml';

        $path = STATIC_PATH .'uploadedFiles'.'/'.companyID.'/'.'sitemap/';

        if( !is_dir($path) ) {
            mkdir($path, 0755);
            chmod($path, 0755);
        }

        $bytes = file_put_contents($path . $fileName, $fileContent);

        if( $bytes > 0 ) {
            return array(
                'response' => true,
                'info' => 'sitemap generated'
            );
        }
        return array(
            'response' => false,
            'info' => 'error'
        );
    }

    /**
     * @param $item
     * @param $activeLanguages
     * @return string
     */
    private function prepareUrlsOfGroups($item, $activeLanguages)
    {
        $xmlFragment = '';
        foreach ( $item['groups'] as $group ) {

            foreach ($activeLanguages as $activeLanguage) {
                $groupPreUrl = $this->RouteAssistant->getStateUrl('group', $activeLanguage);

                if( strlen($groupPreUrl) > 0 ) {

                    $newUrl = $groupPreUrl;

                    if( strstr($groupPreUrl, ':categoryurl') && array_key_exists($activeLanguage, $item['langs']) ) {
                        $newUrl = str_replace(':categoryurl', $item['langs'][$activeLanguage]['url'], $groupPreUrl);
                    } else if ( strstr($groupPreUrl, ':categoryurl') && !array_key_exists($activeLanguage, $item['langs'])) {
                        continue 2;
                    }

                    if (strstr($groupPreUrl, ':groupurl') && array_key_exists('slugs', $group)
                        && array_key_exists($activeLanguage, $group['slugs']) ) {
                        $newUrl = str_replace(':groupurl', $group['slugs'][$activeLanguage], $newUrl);
                    } else if ( strstr($groupPreUrl, ':groupurl') && !array_key_exists('slugs', $group) ) {
                        continue 2;
                    }

                    if( strlen($newUrl) > 0 ) {
                        $xmlFragment .= $this->printOneUrlElement($newUrl);
                    }

                }

            }

            if( array_key_exists('types', $group) ) {
                $xmlFragment .= $this->prepareUrlsOfTypes($group, $activeLanguages);
            }

        }

        return $xmlFragment;
    }

    /**
     * @param $item
     * @param $activeLanguages
     * @return string
     */
    private function prepareUrlsOfTypes($item, $activeLanguages)
    {

        $xmlFragment = '';

        foreach( $item['types'] as $type ) {

            foreach ($activeLanguages as $activeLanguage) {
                $calculatePreUrl = $this->RouteAssistant->getStateUrl('calculate', $activeLanguage);

                if( strlen($calculatePreUrl) > 0 ) {
                    $newUrl = $calculatePreUrl;
                    if (strstr($calculatePreUrl, ':categoryurl')) {
                        $newUrl = str_replace(':categoryurl', $item['langs'][$activeLanguage]['url'], $newUrl);
                    }

                    if (strstr($calculatePreUrl, ':groupurl')) {
                        $newUrl = str_replace(':groupurl', $type['group']['slugs'][$activeLanguage], $newUrl);
                    }

                    if (strstr($calculatePreUrl, ':typeurl')) {
                        $newUrl = str_replace(':typeurl', $type['slugs'][$activeLanguage], $newUrl);
                    }

                    if( strlen($newUrl) > 0 ) {
                        $xmlFragment .= $this->printOneUrlElement($newUrl);
                    }

                }

            }
        }

        return $xmlFragment;
    }

    /**
     * @param $item
     * @param $activeLanguages
     * @return string
     */
    private function prepareUrlsOfCategory($item, $activeLanguages)
    {
        $xmlFragment = '';
        foreach ($activeLanguages as $activeLanguage) {
            $categoryPreUrl = $this->RouteAssistant->getStateUrl('category', $activeLanguage);

            if( strlen($categoryPreUrl) > 0 ) {
                if( strstr($categoryPreUrl, ':categoryurl') ) {
                    if( array_key_exists($activeLanguage, $item['langs']) ) {
                        $newUrl = str_replace(':categoryurl', $item['langs'][$activeLanguage]['url'], $categoryPreUrl);
                        $xmlFragment .= $this->printOneUrlElement($newUrl);
                    }
                }
            }

        }

        return $xmlFragment;
    }

    /**
     * @param $url
     * @return string
     */
    private function printOneUrlElement($url)
    {

        if( in_array($url, $this->getUrlsExistInMap()) ) {
            return '';
        }

        $this->setUrlsExistInMap($url);

        return '<url>
                    <loc>' . $url . '</loc>
                </url>';
    }

}