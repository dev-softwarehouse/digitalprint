<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 13:44
 */

namespace DreamSoft\Controllers\ProductionPath;

use DreamSoft\Controllers\Components\Calculation;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\QueryFilter;
use DreamSoft\Models\ProductionPath\Operator;
use DreamSoft\Models\ProductionPath\OperatorSkill;
use DreamSoft\Models\ProductionPath\OngoingLog;
use DreamSoft\Models\PrintShopUser\UserAttribute;
use DreamSoft\Models\ProductionPath\Ongoing;
use DreamSoft\Models\Order\DpProduct;
use DreamSoft\Models\User\User;
use Exception;
use DreamSoft\Models\User\UserGroup;
use DreamSoft\Models\User\UserRole;

/**
 * Class OperatorsController
 * @package DreamSoft\Controllers\ProductionPath
 */
class OperatorsController extends Controller
{
    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var Operator
     */
    private $Operator;
    /**
     * @var OperatorSkill
     */
    private $OperatorSkill;
    /**
     * @var User
     */
    private $User;
    /**
     * @var UserGroup
     */
    private $UserGroup;
    /**
     * @var OngoingLog
     */
    private $OngoingLog;
    /**
     * @var UserAttribute
     */
    private $UserAttribute;
    /**
     * @var Ongoing
     */
    private $Ongoing;
    /**
     * @var UserRole
     */
    private $UserRole;
    /**
     * @var DpProduct
     */
    private $DpProduct;
    /**
     * @var Calculation
     */
    private $Calculation;


    /**
     * @var
     */
    private $logConfigs;
    /**
     * @var QueryFilter
     */
    private $Filter;

    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Filter = new QueryFilter();
        $this->Operator = Operator::getInstance();
        $this->OperatorSkill = OperatorSkill::getInstance();
        $this->User = User::getInstance();
        $this->UserGroup = UserGroup::getInstance();
        $this->OngoingLog = OngoingLog::getInstance();
        $this->UserAttribute = UserAttribute::getInstance();
        $this->Ongoing = Ongoing::getInstance();
        $this->UserRole = UserRole::getInstance();
        $this->DpProduct = DpProduct::getInstance();
        $this->Calculation = Calculation::getInstance();
        $this->setLogConfigs();

    }

    /**
     *
     */
    public function setLogConfigs()
    {
        $this->logConfigs = array(
            'dateFrom' => array('type' => 'timestamp', 'table' => 'ongoingLogs', 'field' => 'date', 'sign' => $this->Filter->signs['gt']),
            'dateTo' => array('type' => 'timestamp', 'table' => 'ongoingLogs', 'field' => 'date', 'sign' => $this->Filter->signs['lt']),
            'operatorID' => array('type' => 'string', 'table' => 'ongoings', 'field' => 'operatorID', 'sign' => $this->Filter->signs['e']),
        );
    }

    /**
     * @return mixed
     */
    public function getLogConfigs()
    {
        return $this->logConfigs;
    }


    /**
     * @param null $ID
     * @return array|bool|mixed
     */
    public function operators($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->Operator->get('ID', $ID);
        } else {
            $data = $this->Operator->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }


    /**
     * @return bool|mixed
     * @throws \Exception
     */
    public function post_operators()
    {
        $userID = $uID = $this->Data->getPost('uID');
        $name = $this->Data->getPost('name');
        $user = $this->User->exist('ID', $userID);
        $createUser = $this->Data->getPost('createUser');
        $login = $this->Data->getPost('login');
        $firstname = $this->Data->getPost('firstname');
        $lastname = $this->Data->getPost('lastname');
        $password = $this->Data->getPost('pass');
        $password_confirm = $this->Data->getPost('pass_confirm');

        $return['response'] = false;
        if ($createUser && $login) {
            $group = 0;
            if (!$password) {
                $password = null;
            } elseif ($password !== $password_confirm) {
                $return['info'] = 'Hasła się nie zgadzają';
                return $return;
            }
            $userID = $uID = $this->User->customCreate($login, $password, $firstname, $lastname, $group);
            if ($userID) {
                $lastID = $this->Operator->create(compact('name', 'uID'));
                if ($lastID) {
                    $roleID = OPERATOR_ROLE_NUMBER;
                    $this->UserRole->create( compact('roleID', 'userID') );
                    $return = $this->Operator->get('ID', $lastID);
                }
            } else {
                $return['info'] = 'Nie udało się utworzyć użytkownika';
            }

        } else {
            if ($userID && !empty($user)) {

                try {
                    $lastID = $this->Operator->create(compact('name', 'uID'));
                    $return = $this->Operator->get('ID', $lastID);
                    if ($lastID > 0) {
                        $selected = $this->UserRole->getSelectedRoles($userID);
                        if (!in_array(OPERATOR_ROLE_NUMBER, $selected)) {
                            $roleID = OPERATOR_ROLE_NUMBER;
                            $this->UserRole->create( compact('userID', 'roleID') );
                        }
                        $this->User->update($userID, 'special', 1);
                    }
                } catch (Exception $e) {
                    $return['response'] = false;
                    $return['info'] = 'Istnieje taki operator';
                    $return['error'] = $e->getMessage();
                }

            } else {
                $return['response'] = false;
                $return['info'] = 'Brak uID lub brak użytkownika';
            }
        }
        return $return;
    }


    /**
     * @return mixed
     */
    public function put_operators()
    {
        $ID = $this->Data->getPost('ID');
        $name = $this->Data->getPost('name');

        $user = $this->Data->getPost('user');
        $firstname = $this->Data->getPost('firstname');
        $lastname = $this->Data->getPost('lastname');
        $password = $this->Data->getPost('pass');
        $password_confirm = $this->Data->getPost('pass_confirm');

        $return['response'] = false;

        if ($ID === null) {
            return $return;
        }

        $operator = $this->Operator->get('ID', $ID);
        if (!$operator) {
            $return['response'] = false;
            return $return;
        }
        if ($name) {
            $this->Operator->update($ID, 'name', $name);
        }

        $uID = $operator['uID'];
        if ($user) {
            $this->User->update($uID, 'user', $user);
        }
        if ($firstname) {
            $this->User->update($uID, 'name', $firstname);
        }
        if ($lastname) {
            $this->User->update($uID, 'lastname', $lastname);
        }
        if ($password !== null) {
            if ($password === $password_confirm) {
                $this->User->editPassword($uID, $password);
            } else {
                $return['info'] = 'Hasła się nie zgadzają';
                return $return;
            }
        }

        $return['response'] = true;
        return $return;
    }


    /**
     * @param $ID
     * @return mixed
     * @throws \Exception
     */
    public function delete_operators($ID)
    {
        if ($ID) {
            $operator = $this->Operator->get('ID', $ID);

            if ($this->UserGroup->deleteByUser($operator['uID']) && $this->Operator->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            }
        } else {
            $data['response'] = false;
            return $data;
        }
    }


    /**
     * @param $operatorID
     * @return mixed
     */
    public function patch_operatorSkills($operatorID)
    {
        $post = $this->Data->getAllPost();

        $removedRelations = $this->OperatorSkill->delete('operatorID', $operatorID);
        $data['response'] = false;
        $data['exist'] = array();
        $data['created'] = array();
        if (!empty($post)) {
            foreach ($post as $skillID) {
                $ID = $this->OperatorSkill->exist($operatorID, $skillID);
                $data['exist'][] = array('ID' => $ID, 'skillID' => $skillID, 'operatorID' => $operatorID);
                if (!$ID) {
                    $params['operatorID'] = $operatorID;
                    $params['skillID'] = $skillID;
                    if ($this->OperatorSkill->create($params) > 0) {
                        $data['created'][] = $params;
                        $data['response'] = true;
                    }

                }
            }
        } else {
            $data['info'] = 'Usunięto powiązania';
            $data['response'] = $removedRelations;
        }

        return $data;
    }

    /**
     * @param $operatorID
     * @return array
     */
    public function operatorSkills($operatorID)
    {
        $res = $this->OperatorSkill->getByOperatorID($operatorID);
        if (empty($res)) {
            return array();
        }
        $data = array();
        foreach ($res as $key => $value) {
            $data[] = $value['skillID'];
        }

        return $data;
    }


    /**
     * @param $operatorID
     * @param null $params
     * @return array|bool
     */
    public function operatorLogs($operatorID, $params = NULL)
    {
        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $sortBy[0] = '-date';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $configs = $this->getLogConfigs();
        $params['operatorID'] = $operatorID;


        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->Ongoing->getList($filters, $offset, $limit, $sortBy);

        if (empty($list)) {
            $list = array();
        } else {

            $newList = array();

            $allOngoings = array();
            $aggregateCalculations = array();
            foreach ($list as $key => $val) {
                $allOngoings[] = $val['ID'];
                $aggregateCalculations[] = $val['calcID'];

            }
            $ongoingLogs = $this->OngoingLog->getLogsByOngoings($allOngoings, $operatorID);

            $calculatedProducts = $this->Calculation->getCalcProductSeparated($aggregateCalculations);

            foreach ($list as $key => $item) {

                $calculatedProductSorted = array();
                foreach ($calculatedProducts[$item['calcID']] as $calculatedProduct) {
                    $calculatedProductSorted[$calculatedProduct['ID']] = $calculatedProduct;
                }

                $list[$key]['calcProduct'] = NULL;
                if( $calculatedProductSorted[$item['calcProductID']] ) {
                    $list[$key]['calcProduct'] = $calculatedProductSorted[$item['calcProductID']];
                }
            }

            sort($list);
        }
        return $list;
    }

    /**
     * @param $operatorID
     * @param null $params
     * @return array
     */
    public function count($operatorID, $params = NULL)
    {

        $configs = $this->getLogConfigs();
        $params['operatorID'] = $operatorID;

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->Ongoing->simpleCount($filters);
        return array('count' => $count);
    }
}