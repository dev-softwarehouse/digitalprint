<?php

namespace DreamSoft\Controllers\Components;
/**
 * Description of Mail
 *
 * @author Rafał
 */


use DreamSoft\Libs\Config;
use DreamSoft\Core\Component;
use DreamSoft\Models\Mail\MailContent;
use DreamSoft\Models\Mail\MailTitle;
use DreamSoft\Models\Mail\MailType;
use DreamSoft\Models\Mail\MailVariable;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\Setting\Content;
use Exception;

/**
 * Class Mail
 */
class Mail extends Component
{

    public $useModels = array();

    /**
     * @var Content
     */
    protected $Content;
    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var MailContent
     */
    protected $MailContent;
    /**
     * @var MailTitle
     */
    protected $MailTitle;
    /**
     * @var MailVariable
     */
    protected $MailVariable;
    /**
     * @var MailType
     */
    protected $MailType;

    /**
     * @var Config
     */
    protected $Config;
    /**
     * @var array
     */
    protected $binds;
    /**
     * @var int
     */
    protected $mailDomainID;

    /**
     * @return int
     */
    public function getMailDomainID()
    {
        return $this->mailDomainID;
    }

    /**
     * @param int $mailDomainID
     */
    public function setMailDomainID($mailDomainID)
    {
        $this->mailDomainID = $mailDomainID;
    }

    /**
     * Mail constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Setting = Setting::getInstance();
        $this->Content = Content::getInstance();
        $this->Config = Config::getInstance();
        $this->Setting->setLang(lang);
        $this->Content->setLang(lang);

        $this->MailContent = MailContent::getInstance();
        $this->MailTitle = MailTitle::getInstance();
        $this->MailVariable = MailVariable::getInstance();
        $this->MailType = MailType::getInstance();
    }

    /**
     * @param $companyID
     */
    public function setRemote($companyID)
    {
        $this->Setting->setRemote($companyID);
        $this->Content->setRemote($companyID);

        $this->MailContent->setRemote($companyID);
        $this->MailTitle->setRemote($companyID);
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Setting->setDomainID($domainID);
        $this->Content->setDomainID($domainID);

        $this->MailContent->setDomainID($domainID);
        $this->MailTitle->setDomainID($domainID);

        $this->setMailDomainID($domainID);
    }

    /**
     * @param $userEmail
     * @param $userName
     * @return array|bool
     */
    public function accept($userEmail, $userName)
    {
        $this->Setting->setModule('mail');
        $this->Content->setModule('mail');
        $mailSettings = $this->Setting->getSettingsByModule();
        $mailSettings['fromName'] = $this->Content->getValue('fromName');
        $this->Config->setOptions($mailSettings);
        $title = $this->Content->getValue('acceptTitle');
        $body = $this->Content->getValue('acceptContent');
        $binds = $this->getBinds();
        if (!empty($binds)) {
            foreach ($binds as $b) {
                $body = str_replace($b['search'], $b['value'], $body);
            }
        }
        $send = false;
        try {
            $send = $this->Config->sendMail($title, $body, $userEmail, $userName);
        } catch (Exception $ex) {
            $this->debug($ex->getMessage());
        }
        return $send;
    }

    /**
     * @param $userEmail
     * @param $userName
     * @return array|bool
     */
    public function noAccept($userEmail, $userName)
    {
        $this->Setting->setModule('mail');
        $this->Content->setModule('mail');
        $mailSettings = $this->Setting->getSettingsByModule();
        $mailSettings['fromName'] = $this->Content->getValue('fromName');
        $this->Config->setOptions($mailSettings);
        $title = $this->Content->getValue('noAcceptTitle');
        $body = $this->Content->getValue('noAcceptContent');
        $binds = $this->getBinds();
        if (!empty($binds)) {
            foreach ($binds as $b) {
                $body = str_replace($b['search'], $b['value'], $body);
            }
        }
        $send = false;
        try {
            $send = $this->Config->sendMail($title, $body, $userEmail, $userName);
        } catch (Exception $ex) {
            $this->debug($ex->getMessage());
        }
        return $send;
    }

    /**
     * @param $search
     * @param $value
     */
    public function setBind($search, $value)
    {
        $this->binds[] = compact('search', 'value');
    }

    /**
     * @return mixed
     */
    public function getBinds()
    {
        return $this->binds;
    }

    public function clearBinds()
    {
        $this->binds = null;
    }

    /**
     * @param $userEmail
     * @param $userName
     * @param $type
     * @param bool $lang
     * @return array|bool
     */
    public function sendMail($userEmail, $userName, $type, $lang = false)
    {

        $typeMail = $this->MailType->get('key', $type);
        $send = false;

        if (!$typeMail) {
            return false;
        }
        $this->Setting->setModule('mail');
        $this->Content->setModule('mail');

        $this->Setting->setDomainID($this->getMailDomainID());

        $mailSettings = $this->Setting->getSettingsByModule();

        $mailSettings['fromName'] = $this->Content->getValue('fromName');
        $this->Config->setOptions($mailSettings);

        if( !$lang ) {
            $lang = lang;
        }

        $mailContent = $this->MailContent->getOne($typeMail['ID'], $lang);
        $mailTitle = $this->MailTitle->getOne($typeMail['ID'], $lang);

        if ($mailContent && $mailTitle) {

            $body = $mailContent['content'];
            $title = $mailTitle['title'];

            $binds = $this->getBinds();
            if (!empty($binds)) {
                foreach ($binds as $b) {
                    $body = str_replace('{' . trim($b['search']) . '}', $b['value'], $body);
                    $title = str_replace('{' . trim($b['search']) . '}', $b['value'], $title);
                }
            }

            try {
                $send = $this->Config->sendMail($title, $body, $userEmail, $userName);
                return $send;
            } catch (Exception $ex) {
                $this->debug($ex->getMessage());
                return false;
            }

        } else {
            return false;
        }

    }

}
