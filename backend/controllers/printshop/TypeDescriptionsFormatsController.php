<?php

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescription;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescriptionFormat;

class TypeDescriptionsFormatsController extends Controller
{

    /**
     * @var PrintShopTypeDescription
     */
    protected $PrintShopTypeDescription;
    /**
     * @var PrintShopTypeDescriptionFormat
     */
    protected $PrintShopTypeDescriptionFormat;

    public $useModels = array();

    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopTypeDescription = PrintShopTypeDescription::getInstance();
        $this->PrintShopTypeDescriptionFormat = PrintShopTypeDescriptionFormat::getInstance();
    }

    public function typeDescriptionsFormats($params)
    {
        $descID = $params['dID'];

        return $this->PrintShopTypeDescriptionFormat->getForDesc($descID);

    }

    public function post_typeDescriptionsFormats()
    {

        $post = $this->Data->getAllPost();
        $descID = $post['descID'];
        $this->PrintShopTypeDescriptionFormat->clearRecords($descID);

        $response = false;

        foreach ($post['formats'] as $f) {
            if ($f['selected'] == 1) {
                $response = $this->PrintShopTypeDescriptionFormat->setFormat($descID, $f['ID']);
            }
        }

        if( !$response ) {
            return $this->sendFailResponse('03');
        }

        return $response;

    }

}