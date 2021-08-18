<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShop\PrintShopComplex;
use DreamSoft\Models\PrintShop\PrintShopComplexGroup;
use DreamSoft\Models\PrintShop\PrintShopComplexRelatedFormat;

/**
 * Description of TypesController
 *
 */
class ComplexController extends Controller
{

    public $useModels = array();

    /**
     * @var PrintShopComplex
     */
    protected $PrintShopComplex;
    /**
     * @var PrintShopComplexGroup
     */
    protected $PrintShopComplexGroup;
    /**
     * @var PrintShopComplexRelatedFormat
     */
    protected $PrintShopComplexRelatedFormat;

    /**
     * ComplexController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopComplex = PrintShopComplex::getInstance();
        $this->PrintShopComplexGroup = PrintShopComplexGroup::getInstance();
        $this->PrintShopComplexRelatedFormat = PrintShopComplexRelatedFormat::getInstance();
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $ID
     * @return array|bool
     */
    public function complex($groupID, $typeID, $ID = NULL)
    {

        $this->PrintShopComplex->setTypeID($typeID);

        if (intval($ID) > 0) {
            $data = $this->PrintShopComplex->customGet($ID);
        } else {
            $data = $this->PrintShopComplex->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $ID
     * @return array
     */
    public function complexPublic($groupID, $typeID, $ID = NULL)
    {

        $this->PrintShopComplex->setTypeID($typeID);

        if (intval($ID) > 0) {
            $data = $this->PrintShopComplex->customGet($ID);
        } else {
            $data = $this->PrintShopComplex->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;

    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array|bool
     */
    public function post_complex($groupID, $typeID)
    {

        $baseID = $typeID;

        $typeID = $this->Data->getPost('typeID');
        $complexGroupID = $this->Data->getPost('complexGroupID');

        if ($typeID) {
            $lastID = $this->PrintShopComplex->create(compact('baseID', 'typeID', 'complexGroupID'));
            $return = $this->PrintShopComplex->customGet($lastID);
            if (!$return) {
                $return['response'] = false;
                return $return;
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('01');
            return $return;
        }

    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $ID
     * @return array
     */
    public function delete_complex($groupID, $typeID, $ID)
    {

        $complex = $this->PrintShopComplex->customGet($ID);
        $data['response'] = true;
        if (intval($ID) > 0) {

            if (!$this->PrintShopComplex->delete('ID', $ID)) {
                $data = $this->sendFailResponse('09');
                return $data;
            }

            if ($complex['complexGroupID'] != null) {
                if (!$this->PrintShopComplex->usedGroup($complex['complexGroupID'])) {
                    $this->PrintShopComplexGroup->delete('ID', $complex['complexGroupID']);
                }
            }
            return $data;
        } else {
            $data['response'] = false;
            return $data;
        }
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $complexID
     * @return mixed
     */
    public function post_group($groupID, $typeID, $complexID)
    {
        $name = $this->Data->getPost('name');
        $data['response'] = false;

        $complexGroupID = $this->PrintShopComplexGroup->create(compact('name'));
        if ($complexGroupID) {
            if ($this->PrintShopComplex->update($complexID, 'complexGroupID', $complexGroupID)) {
                $data['response'] = true;
                $data['complexGroupID'] = $complexGroupID;
            }
        }

        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return mixed
     */
    public function put_group($groupID, $typeID)
    {
        $name = $this->Data->getPost('name');
        $ID = $this->Data->getPost('ID');

        $data['response'] = false;
        if ($this->PrintShopComplexGroup->update($ID, 'name', $name)) {
            $data['response'] = true;
        }

        return $data;
    }

    /**
     * @param $groupID
     * @param $params
     * @param $typeID
     * @param $baseFormatID
     * @return array|bool
     */
    public function relatedFormat($groupID, $params, $typeID, $baseFormatID)
    {

        $complexID = $params['complexID'];

        if (intval($baseFormatID) > 0) {
            $data = $this->PrintShopComplexRelatedFormat->getByBaseFormatID($baseFormatID, $complexID);
        } else {
            $data = $this->PrintShopComplexRelatedFormat->getAll();
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $baseFormatID
     * @return array
     */
    public function post_relatedFormat($groupID, $typeID, $baseFormatID)
    {
        $formats = $this->Data->getPost('formats');
        $complexID = $this->Data->getPost('complexID');

        $this->PrintShopComplexRelatedFormat->deleteByComplex($baseFormatID, $complexID);
        foreach ($formats as $format) {
            $format['baseFormatID'] = $baseFormatID;
            $format['complexID'] = $complexID;
            $res = $this->PrintShopComplexRelatedFormat->create($format);
            if (!$res) {
                return $this->sendFailResponse('03');
            }
        }
        $data['response'] = true;
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $baseTypeID
     * @return bool|array
     */
    public function getByBaseID($groupID, $typeID, $baseTypeID)
    {
        $data = $this->PrintShopComplex->getByBaseID($baseTypeID);

        if (empty($data)) {
            return $this->sendFailResponse('06');
        }

        $aggregateBaseTypes = array();
        foreach ($data as $complex) {
            $aggregateBaseTypes[] = $complex['ID'];
        }

        $relatedFormats = $this->PrintShopComplexRelatedFormat->getByList($aggregateBaseTypes);

        foreach ($data as $key => $complex) {
            if (isset($relatedFormats[$complex['ID']])) {
                $data[$key]['relatedFormats'] = $relatedFormats[$complex['ID']];
            } else {
                $data[$key]['relatedFormats'] = array();
            }
        }


        return $data;
    }

}
