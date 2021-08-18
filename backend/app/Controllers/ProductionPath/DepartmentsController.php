<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 10-07-2018
 * Time: 12:00
 */

namespace DreamSoft\Controllers\ProductionPath;

use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Models\ProductionPath\Department;

class DepartmentsController extends Controller
{
    /**
     * @var Standard
     */
    private $Standard;
    /**
     * @var Department
     */
    private $Department;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->Department = Department::getInstance();
        $this->Standard = Standard::getInstance();

    }

    /**
     * @return array|bool
     */
    public function departments()
    {
        $departments = $this->Department->getAll();

        if (!$departments) {
            return array();
        }

        $departments = $this->Standard->sortData($departments, 'sort');

        return $departments;
    }

    public function post_departments()
    {
        $name = $this->Data->getPost('name');
        $color = $this->Data->getPost('color');

        $data['response'] = true;

        if ($name) {

            $sort = $this->Department->getMaxSort();

            if (!$sort) {
                $sort = 1;
            } else {
                $sort++;
            }

            $created = date(DATE_FORMAT);

            $lastID = $this->Department->create(compact('name', 'sort', 'created', 'color'));
            if ($lastID > 0) {
                $one = $this->Department->get('ID', $lastID);
                $data['item'] = $one;
            }
        } else {
            return $this->sendFailResponse('02');
        }
        return $data;
    }

    /**
     * @return array
     */
    public function put_departments()
    {
        $ID = $this->Data->getPost('ID');
        if (!$ID) {
            return $this->sendFailResponse('06');
        }

        $data['response'] = false;

        $name = $this->Data->getPost('name');
        $color = $this->Data->getPost('color');
        $saved = 0;
        if ($name) {
            $saved += intval($this->Department->update($ID, 'name', $name));
            $saved += intval($this->Department->update($ID, 'color', $color));
            if ($saved > 0) {
                $data['item'] = $this->Department->get('ID', $ID);
                $data['response'] = true;
            }
        } else {
            $data = $this->sendFailResponse('02');
        }
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_departments($ID)
    {
        if ($ID) {
            if ($this->Department->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            }
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return array
     */
    public function patch_sort()
    {
        $post = $this->Data->getAllPost();
        if ($this->Department->sort($post)) {
            return array('response' => true);
        } else {
            return $this->sendFailResponse('03');
        }
    }
}