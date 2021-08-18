<?php

namespace DreamSoft\Controllers\Others;

use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Menu\Menu;
use DreamSoft\Models\Menu\SubMenu;
use Exception;

/**
 * Class MenuController
 */
class MenuController extends Controller
{

    public $useModels = array();

    /**
     * @var Menu
     */
    protected $Menu;
    /**
     * @var SubMenu
     */
    protected $SubMenu;
    /**
     * @var Acl
     */
    protected $Acl;

    /**
     * MenuController constructor.
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Acl = new Acl();
        $this->Menu = Menu::getInstance();
        $this->SubMenu = SubMenu::getInstance();
    }

    /**
     * @param null $key
     * @return array
     */
    public function index($key = NULL)
    {

        $user = $this->Auth->getLoggedUser();
        $super =isset($user['super']) && $user['super'] == 1;
        if (strlen($key) > 0) {
            $data = $this->Menu->get('key', $key);
            if ($data['super'] == 1 && !$super) {
                $data = array();
            }
        } else {
            $data = $this->Menu->getAll();
            foreach ($data as $key => $value) {
                if ($value['super'] == 1 && !$super) {
                    unset($data[$key]);
                    continue;
                }

                $subMenus = $this->SubMenu->customGetAll($value['ID']);

                if (!empty($subMenus)) {
                    foreach ($subMenus as $sm) {

                        if ($super == 1 || $this->Acl->checkPerms($sm['controller'], $sm['action'], $sm['package'], $user)) {
                            $data[$key]['subMenus'][] = $sm;
                        }

                    }
                }

            }
        }
        if (empty($data)) {
            $data = array();
        }
        $data = array_values($data);
        return $data;
    }

    /**
     * @return mixed
     * @throws Exception
     */
    public function post_index()
    {
        $key = $this->Data->getPost('key');
        $desc = $this->Data->getPost('desc');
        if ($key) {
            if (!$desc) {
                $desc = NULL;
            }
            $lastID = $this->Menu->customCreate($key, $desc);
            $row = $this->Menu->get('ID', $lastID);
            $return['response'] = true;
            $return['item'] = $row;
            return $return;
        } else {
            $return['response'] = false;
            return $return;
        }
    }

    /**
     * @return array
     */
    public function superAdminAcl()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function superAdminRequestTester()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function superAdminLanguages()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function superAdminModules()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function superAdminHelp()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function superAdminEmails()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function superAdminTemplates()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function shopDomainSettings()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function shopModules()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function shopLanguages()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function shopSpecialUsers()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function shopUserPermissions()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function printShopConfigProducts()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function printShopRealisationTimes()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function printShopConfigAttributes()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function printShopWorkspaces()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function printShopProductionPath()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersProductionPath()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersProductionPanel()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersAcceptFiles()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersOperators()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersOrders()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersProducts()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersStatuses()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersShipment()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersReclamationStatuses()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function ordersCustomProducts()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceRegister()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceUserList()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceOfferList()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceCreateOrder()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceCreateOffer()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceCalculations()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceOrderList()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceDiscounts()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServicePromotions()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceCoupons()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function customerServiceReclamations()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsMails()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsSeo()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsCategories()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsGraphics()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsViewSettings()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsTemplates()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsStaticContents()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsRoutes()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsReclamationFaults()
    {
        return array('response' => true);
    }

    /**
     * @return array
     */
    public function contentsStyleEdit()
    {
        return array('response' => true);
    }

}
