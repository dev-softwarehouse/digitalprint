<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 07-06-2018
 * Time: 14:54
 */

namespace DreamSoft\Controllers\ProductionPath;

use DreamSoft\Core\Controller;
use DreamSoft\Models\ProductionPath\Process;
use DreamSoft\Controllers\Components\Standard;

class ProcessesController extends Controller
{
    /**
     * @var Process
     */
    private $Process;
    /**
     * @var Standard
     */
    private $Standard;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->Process = Process::getInstance();
        $this->Standard = Standard::getInstance();
    }

    /**
     * @return array
     */
    public function index()
    {
        $data = $this->Process->getAll();

        if( !$data ) {
            return array();
        }

        return $data;
    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $name = $this->Data->getPost('name');
        $return['response'] = false;

        if ($name) {
            $order = $this->Process->getMaxOrder();
            if (!$order) {
                $order = 0;
            }
            $lastID = $this->Process->create(compact('name', 'description', 'order'));
            if ($lastID) {
                $return = $this->Process->get('ID', $lastID);
                $return['response'] = true;
            } else {
                return $this->sendFailResponse('03');
            }
        } else {
            $return['response'] = false;
        }
        return $return;
    }

    /**
     * @param null $ID
     * @return array
     */
    public function put_index($ID = NULL)
    {
        $goodFields = array('name');
        $post = $this->Data->getAllPost();
        $data['response'] = false;
        if (isset($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        }

        $count = count($goodFields);
        if (!empty($post)) {
            $saved = 0;
            foreach ($post as $key => $value) {
                if (in_array($key, $goodFields)) {
                    $saved += intval($this->Process->update($ID, $key, $value));
                }
            }

            if ($saved == $count) {
                $data['response'] = true;
                $data['info'] = 'Zapisano: ' . $count . ' pól.';
            } else {
                $data['info'] = 'Brak zapisanych pól';
            }
        } else {
            $data['info'] = 'Pusty POST';
        }
        return $data;
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        if ($ID) {
            if ($this->Process->delete('ID', $ID)) {
                $data['response'] = true;
                return $data;
            }
        } else {
            $data['info'] = 'Brak ID';
            $data['httpCode'] = 400;
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @return mixed
     */
    public function patch_sort()
    {
        $post = $this->Data->getAllPost();
        $this->Standard->setModel($this->Process);
        return $this->Standard->sort($post, $func = 'sort');
    }

}