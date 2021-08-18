<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 15-10-2018
 * Time: 18:03
 */

namespace DreamSoft\Controllers\PrintShop;

use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopProduct\PrintShopPrintTypeWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintTypeWorkspace;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigPrintType;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigWorkspace;

class PrintShopPrintTypeWorkspacesController extends Controller
{
    /**
     * @var PrintShopPrintTypeWorkspace
     */
    private $PrintShopPrintTypeWorkspace;
    /**
     * @var PrintShopConfigPrintTypeWorkspace
     */
    private $PrintShopConfigPrintTypeWorkspace;
    /**
     * @var PrintShopConfigPrintType
     */
    private $PrintShopConfigPrintType;
    /**
     * @var PrintShopConfigWorkspace
     */
    private $PrintShopConfigWorkspace;

    /**
     * PrintShopPrintTypeWorkspacesController constructor.
     * @param array $parameters
     */
    public function __construct(array $parameters = array())
    {
        parent::__construct($parameters);
        $this->PrintShopPrintTypeWorkspace = PrintShopPrintTypeWorkspace::getInstance();
        $this->PrintShopConfigPrintTypeWorkspace = PrintShopConfigPrintTypeWorkspace::getInstance();
        $this->PrintShopConfigPrintType = PrintShopConfigPrintType::getInstance();
        $this->PrintShopConfigWorkspace = PrintShopConfigWorkspace::getInstance();
    }

    /**
     * @param $printTypeID
     * @param $params
     * @return array|bool
     */
    public function index($printTypeID, $params)
    {
        $formatID = $params['formatID'];

        $printType = $this->PrintShopConfigPrintType->get('ID', $printTypeID);

        if( $printType['workspaceID'] ) {
            $oneWorkspace = $this->PrintShopConfigWorkspace->get('ID', $printType['workspaceID']);
            $oneWorkspace['workspaceID'] = $oneWorkspace['ID'];
            $data[] = $oneWorkspace;
        } else {
            $data = $this->PrintShopConfigPrintTypeWorkspace->getByPrintTypeID($printTypeID);
        }

        if( !$data ) {
            return array();
        }

        $printTypeWorkspaces = $this->PrintShopPrintTypeWorkspace->getByParams($printTypeID, $formatID);

        foreach($data as $key => $row) {
            if( $printTypeWorkspaces[$row['workspaceID']] ) {
                $data[$key]['usePerSheet'] = $printTypeWorkspaces[$row['workspaceID']]['usePerSheet'];
                $data[$key]['operationDuplication'] = $printTypeWorkspaces[$row['workspaceID']]['operationDuplication'];
            }
        }

        return $data;
    }
}