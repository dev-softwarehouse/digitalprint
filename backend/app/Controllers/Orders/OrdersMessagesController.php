<?php
/**
 * Programmer Rafał Leśniak - 25.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-09-2017
 * Time: 16:03
 */

namespace DreamSoft\Controllers\Orders;

use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Core\Controller;
use DreamSoft\Models\User\User;
use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Models\Order\OrderMessage;
use DreamSoft\Models\Order\DpOrder;
use DreamSoft\Models\User\UserOption;

class OrdersMessagesController extends Controller
{
    /**
     * @var OrderMessage
     */
    protected $OrderMessage;
    /**
     * @var DpOrder
     */
    protected $DpOrder;
    /**
     * @var User
     */
    protected $User;

    public $useModels = array();
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

    /**
     * ReclamationsController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->OrderMessage = OrderMessage::getInstance();
        $this->DpOrder = DpOrder::getInstance();
        $this->User = User::getInstance();
        $this->Acl = new Acl();
        $this->Mail = Mail::getInstance();
        $this->UserOption = UserOption::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Mail->setDomainID($domainID);
    }

    /**
     * @param $orderID
     * @return array|mixed
     */
    public function index($orderID)
    {

        $loggedUser = $this->Auth->getLoggedUser();

        if( !$this->canReadWriteOrderMessages() && !$loggedUser['super'] ) {
            return $this->sendFailResponse('12');
        }

        $this->OrderMessage->setRead($orderID, 0);

        $list = $this->OrderMessage->get('orderID', $orderID, true);

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

    public function post_index()
    {

    }

    public function put_index()
    {

    }

    /**
     * @param $orderID
     * @return array
     */
    public function myZone( $orderID )
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $order = $this->DpOrder->get('ID', $orderID);

        if( $loggedUser['ID'] != $order['userID'] && $loggedUser['super'] != 1
            && !$this->canReadWriteOrderMessages() ) {
            return $this->sendFailResponse('12');
        }

        $this->OrderMessage->setRead($orderID, 1);

        $list = $this->OrderMessage->get('orderID', $orderID, true);

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
     * @param $orderID
     * @return array
     */
    public function count($orderID)
    {
        $loggedUser = $this->Auth->getLoggedUser();

        $order = $this->DpOrder->get('ID', $orderID);

        if( $loggedUser['ID'] != $order['userID'] && $loggedUser['super'] != 1
            && !$this->Acl->canReadWriteOrderMessages($loggedUser) ) {
            return $this->sendFailResponse('12');
        }

        $count = $this->OrderMessage->countUnread($orderID, 0);

        return array('count' => $count);

    }

    /**
     * @return array
     */
    public function canReadWriteOrderMessages()
    {
        $user = $this->Auth->getLoggedUser();
        return array('response' => $this->Acl->canReadWriteOrderMessages($user));
    }

    /**
     * @return array
     */
    public function countAll()
    {
        $count = $this->OrderMessage->countAllUnread(0);
        return array('response' => true, 'count' => $count);
    }

    /**
     * @return array
     */
    public function post_sendEmail()
    {
        $content = $this->Data->getPost('content');
        $orderID = $this->Data->getPost('orderID');
        $orderMessageID = $this->Data->getPost('orderMessageID');

        $order = $this->DpOrder->get('ID', $orderID);

        if( !$order ) {
            return $this->sendFailResponse('06');
        }

        $user = $this->User->get('ID', $order['userID']);

        if(!$user) {
            return $this->sendFailResponse('06');
        }

        $orderMessage = $this->OrderMessage->get('ID', $orderMessageID);

        if($orderMessage['mailSent']) {
            return $this->sendFailResponse('13', 'mail_already_sent');
        }

        $userOption = $this->UserOption->get('uID', $user['ID']);

        $lang = lang;
        if( $userOption && $userOption['lang'] ) {
            $lang = $userOption['lang'];
        }

        $this->Mail->setBind('message', $content);
        $this->Mail->setBind('firstName', $user['name']);
        $this->Mail->setBind('order_id', $orderID);
        $sent = $this->Mail->sendMail($user['user'], $user['name'], 'newMessageAboutOrder', $lang);

        if( $sent ) {
            $this->OrderMessage->update($orderMessageID, 'mailSent', 1);
            return array('response' => true);
        }

        return $this->sendFailResponse('13');
    }
}