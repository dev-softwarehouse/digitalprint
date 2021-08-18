<?php
/**
 * Programmer Rafał Leśniak - 11.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 11-09-2017
 * Time: 14:48
 */

namespace DreamSoft\Controllers\Reclamations;

use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Reclamation\Reclamation;
use DreamSoft\Models\Reclamation\ReclamationMessage;
use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Models\User\User;
use DreamSoft\Models\User\UserOption;

/**
 * Class ReclamationMessagesController
 * @package DreamSoft\Controllers\Reclamations
 */
class ReclamationsMessagesController extends Controller
{
    /**
     * @var ReclamationMessage
     */
    protected $ReclamationMessage;
    /**
     * @var Reclamation
     */
    protected $Reclamation;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var Acl
     */
    protected $Acl;
    /**
     * @var Mail
     */
    protected $Mail;
    /**
     * @var UserOption
     */
    protected $UserOption;

    public $useModels = array();

    /**
     * ReclamationsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->ReclamationMessage = ReclamationMessage::getInstance();
        $this->Reclamation = Reclamation::getInstance();
        $this->User = User::getInstance();
        $this->UserOption = UserOption::getInstance();
        $this->Acl = new Acl();
        $this->Mail = Mail::getInstance();
    }

    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->Mail->setDomainID($ID);
    }

    public function index($reclamationID)
    {

    }

    public function post_index()
    {

    }

    public function put_index()
    {

    }

    /**
     * @param $reclamationID
     * @return array
     */
    public function myZone( $reclamationID )
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $reclamation = $this->Reclamation->get('ID', $reclamationID);

        if( $loggedUser['ID'] != $reclamation['userID'] && $loggedUser['super'] != 1
            && !$this->canReadWriteMessages() ) {
            return $this->sendFailResponse('12');
        }

        if( $loggedUser['ID'] == $reclamation['userID'] ) {
            $this->ReclamationMessage->setRead($reclamationID, 1);
        } else {
            $this->ReclamationMessage->setRead($reclamationID, 0);
        }

        $list = $this->ReclamationMessage->get('reclamationID', $reclamationID, true);

        if( !$list ) {
            return array();
        }

        $aggregateUsers = array();
        foreach ($list as $row) {
            if($row['senderID']) {
                $aggregateUsers[] = $row['senderID'];
            }
        }

        $aggregateUsers = array_unique($aggregateUsers);

        $users = $this->User->getByList($aggregateUsers);

        foreach ($list as $key => $row) {
            if( $users[$row['senderID']] ) {
                $list[$key]['user'] = array(
                    'name' => $users[$row['senderID']]['name'],
                    'lastname' => $users[$row['senderID']]['lastname']
                );
            }
        }

        return $list;
    }

    /**
     * @param $reclamationID
     * @return array
     */
    public function count($reclamationID)
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $reclamation = $this->Reclamation->get('ID', $reclamationID);

        if( $loggedUser['ID'] != $reclamation['userID'] && $loggedUser['super'] != 1
            && !$this->Acl->canReadWriteMessages($loggedUser) ) {
            return $this->sendFailResponse('12');
        }

        if( $loggedUser['ID'] == $reclamation['userID'] ) {
            $count = $this->ReclamationMessage->countUnread($reclamationID, 0);
        } else {
            $count = $this->ReclamationMessage->setRead($reclamationID, 1);
        }

        return array('count' => $count);

    }

    /**
     * @return array
     */
    public function canReadWriteMessages()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canReadWriteMessages($user));
    }

    /**
     * @return array
     */
    public function countAll()
    {
        $count = $this->ReclamationMessage->countAllUnread(0);
        return array('response' => true, 'count' => $count);
    }

    /**
     * @return array
     */
    public function post_sendEmail()
    {
        $content = $this->Data->getPost('content');
        $reclamationID = $this->Data->getPost('reclamationID');
        $reclamationMessageID = $this->Data->getPost('orderMessageID');

        $reclamation = $this->Reclamation->get('ID', $reclamationID);

        if( !$reclamation ) {
            return $this->sendFailResponse('06');
        }

        $user = $this->User->get('ID', $reclamation['userID']);

        if(!$user) {
            return $this->sendFailResponse('06');
        }

        $reclamationMessage = $this->ReclamationMessage->get('ID', $reclamationMessageID);

        if($reclamationMessage['mailSent']) {
            return $this->sendFailResponse('13', 'mail_already_sent');
        }

        $userOption = $this->UserOption->get('uID', $user['ID']);

        $lang = lang;
        if( $userOption && $userOption['lang'] ) {
            $lang = $userOption['lang'];
        }

        $this->Mail->setBind('firstName', $user['name']);
        $this->Mail->setBind('reclamation_id', $reclamationID);
        $this->Mail->setBind('order_id', $reclamation['orderID']);
        $this->Mail->setBind('content', $content);
        $sent = $this->Mail->sendMail($user['user'], $user['name'], 'newMessageAboutReclamation', $lang);

        if( $sent ) {
            $this->ReclamationMessage->update($reclamationMessageID, 'mailSent', 1);
            return array('response' => true);
        }

        return $this->sendFailResponse('13');
    }
}