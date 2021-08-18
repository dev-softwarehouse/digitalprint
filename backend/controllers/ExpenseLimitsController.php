<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\Expense\ExpenseLimit;

/**
 * Description of ExpenseLimitsController
 *
 * @author Rafał
 */
class ExpenseLimitsController extends Controller
{

    public $useModels = array();

    protected $ExpenseLimit;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->ExpenseLimit = ExpenseLimit::getInstance();
    }

    public function patch_index()
    {
        $type = $this->Data->getPost('type');
        if ($type == 'group') {

            // @TODO EXIST I SET

        } elseif ($type == 'user') {

            // @TODO EXIST I SET

        } else {
            $this->sendFailResponse('07', 'NIe wybrano typu: group|user');
        }
    }

}
