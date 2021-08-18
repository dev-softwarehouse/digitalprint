<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 14:21
 */

namespace DreamSoft\Controllers\ProductionPath;

use DreamSoft\Core\Controller;
use DreamSoft\Models\ProductionPath\Skill;
use DreamSoft\Models\ProductionPath\SkillDevice;


/**
 * Class SkillsController
 * @package DreamSoft\Controllers\ProductionPath
 */
class SkillsController extends Controller
{

    /**
     * @var Skill
     */
    protected $Skill;
    /**
     * @var SkillDevice
     */
    protected $SkillDevice;


    /**
     * SkillsController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Skill = Skill::getInstance();
        $this->SkillDevice = SkillDevice::getInstance();
    }


    /**
     * @param null $ID
     * @return array
     */
    public function skills($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->Skill->get('ID', $ID);
        } else {
            $data = $this->Skill->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @return mixed
     */
    public function post_skills()
    {
        $name = $this->Data->getPost('name');
        if ($name) {
            $params['name'] = $name;
            $lastID = $this->Skill->create($params);
            $return = $this->Skill->get('ID', $lastID);
            if (!$return) {
                $return['response'] = false;
            }
        } else {
            $return['response'] = false;
        }
        return $return;
    }


    /**
     * @return mixed
     */
    public function put_skills()
    {
        $ID = $this->Data->getPost('ID');
        if (!$ID) {
            $data['info'] = 'Nie ma ID';
            $data['response'] = false;
            return $data;
        }
        $name = $this->Data->getPost('name');
        if ($name) {
            $this->Skill->update($ID, 'name', $name);
            $data['response'] = true;
        } else {
            $data = $this->sendFailResponse('02');
        }
        return $data;
    }


    /**
     * @param $ID
     * @return array
     */
    public function delete_skills($ID)
    {
        $data = array();

        if ($ID) {
            if ($this->Skill->delete('ID', $ID)) {
                $this->SkillDevice->delete('skillID', $ID);
                $data['response'] = true;
                return $data;
            }
        } else {
            $data['response'] = false;
        }

        return $data;
    }


    /**
     * @param $skillID
     * @return mixed
     */
    public function patch_skillDevices($skillID)
    {
        $post = $this->Data->getAllPost();

        $removedRelations = $this->SkillDevice->delete('skillID', $skillID);
        $data['response'] = false;

        if (!empty($post)) {
            foreach ($post as $deviceID) {
                $ID = $this->SkillDevice->exist($skillID, $deviceID);
                if (!$ID) {
                    $params['skillID'] = $skillID;
                    $params['deviceID'] = $deviceID;
                    if ($this->SkillDevice->create($params) > 0) {
                        $data['response'] = true;
                    }

                }
            }
        } else {
            $data['info'] = 'relations_removed';
            $data['response'] = $removedRelations;
        }

        return $data;
    }

    /**
     * @param $skillID
     * @return array
     */
    public function skillDevices($skillID)
    {
        $res = $this->SkillDevice->getBySkillID($skillID);
        if (empty($res)) {
            return array();
        }
        $data = array();
        foreach ($res as $key => $value) {
            $data[] = $value['deviceID'];
        }

        return $data;
    }
}