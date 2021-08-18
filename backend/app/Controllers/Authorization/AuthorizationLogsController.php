<?php
/**
 * Programmer Rafał Leśniak - 29.1.2018
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 29-01-2018
 * Time: 11:53
 */

namespace DreamSoft\Controllers\Authorization;

use DreamSoft\Core\Controller;
use DreamSoft\Models\Authorization\AuthorizationLog;
use DreamSoft\Controllers\Components\QueryFilter;
use DreamSoft\Models\User\User;

class AuthorizationLogsController extends Controller
{
    /**
     * @var QueryFilter
     */
    protected $QueryFilter;
    /**
     * @var AuthorizationLog
     */
    protected $AuthorizationLog;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var array
     */
    private $configs;

    public $useModels = array();

    public function __construct($params)
    {
        parent::__construct($params);
        $this->User = User::getInstance();
        $this->AuthorizationLog = AuthorizationLog::getInstance();
        $this->QueryFilter = new QueryFilter();
        $this->setConfigs();
    }

    public function setConfigs()
    {
        $this->configs = array(
            'ID' => array('type' => 'string', 'table' => 'authorizationLogs', 'alias' => true, 'field' => 'ID', 'sign' => $this->QueryFilter->signs['li']),
            'dateFrom' => array('type' => 'timestamp', 'table' => 'authorizationLogs', 'alias' => true, 'field' => 'created', 'sign' => $this->QueryFilter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'authorizationLogs', 'field' => 'created', 'alias' => true, 'sign' => $this->QueryFilter->signs['lt']),
            'userID' => array('type' => 'string', 'table' => 'authorizationLogs', 'alias' => true, 'field' => 'userID', 'sign' => $this->QueryFilter->signs['li']),
        );
    }

    /**
     * @return array
     */
    public function getConfigs()
    {
        return $this->configs;
    }

    /**
     * @param $params
     * @return array
     */
    public function index($params)
    {
        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-ID';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);
        $list = $this->AuthorizationLog->getList($filters, $offset, $limit, $sortBy);

        if( !$list ) {
            return array();
        }

        $aggregateUsers = array();
        foreach ($list as $row) {
            $aggregateUsers[] = $row['userID'];
        }

        $users = $this->User->getByList($aggregateUsers);

        foreach ($list as $key => $row) {
            if( isset($users[$row['userID']]) ) {
                $list[$key]['user'] = $users[$row['userID']];
            }
        }

        return $list;
    }

    /**
     * @param null $params
     * @return array
     */
    public function count($params = NULL)
    {

        $configs = $this->getConfigs();

        $filters = $this->QueryFilter->prepare($configs, $params);
        $count = $this->AuthorizationLog->count($filters);
        return array('count' => $count);
    }

    /**
     * @param $userID
     * @return array
     */
    public function delete_deleteByUser($userID)
    {
        $deleted = $this->AuthorizationLog->delete('userID', $userID);
        return array('response' => $deleted);
    }
}