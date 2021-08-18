<?php

/**
 * Description of DpOrderStatusesController
 *
 * @author Rafał
 */
namespace DreamSoft\Controllers\Orders;

use DreamSoft\Controllers\Components\Standard;
use DreamSoft\Models\Order\OrderStatus;
use DreamSoft\Models\Order\OrderStatusLang;
use DreamSoft\Core\Controller;

class OrderStatusesController extends Controller
{

    /**
     * @var OrderStatus
     */
    protected $OrderStatus;
    /**
     * @var OrderStatusLang
     */
    protected $OrderStatusLang;

    /**
     * @var Standard
     */
    protected $Standard;

    /**
     * @constructor
     * @param array $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->OrderStatus = OrderStatus::getInstance();

        $this->OrderStatusLang = OrderStatusLang::getInstance();
        $this->Standard = Standard::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->OrderStatus->setDomainID($domainID);
    }

    /**
     * @param $active
     * @return array|bool
     */
    public function index( $active = NULL )
    {

        if($active) {
            $active = true;
        } else {
            $active = false;
        }
        $list = $this->OrderStatus->getAll( $active );

        if (empty($list)) {
            $list = array();
        }

        return $list;

    }

    /**
     * @return mixed
     */
    public function post_index()
    {
        $langs = $this->Data->getPost('langs');
        $color = $this->Data->getPost('color');
        if (!is_array($langs)) {
            $langs = json_decode($langs);
        }
        $active = $this->Data->getPost('active');
        if (!empty($langs)) {
            if (!$active) {
                $active = 1;
            }
            $params = array(
                'active' => $active,
                'domainID' => $this->getDomainID(),
                'sort' => $this->OrderStatus->getMaxOrder()+1,
                'color' => $color
            );
            $lastID = $this->OrderStatus->create($params);
            if ($lastID > 0) {
                $statusID = $lastID;
                $savedLangs = 0;
                foreach ($langs as $lang => $names) {
                    foreach ($names as $name) {
                        $savedLangs += intval($this->OrderStatusLang->set($statusID, $lang, $name));
                    }
                }

                $return['savedLangs'] = $savedLangs;
                $item = $this->OrderStatus->getOne($lastID);
                $item['langs'] = $this->parseLang($item['langs']);
                $return['item'] = $item;
                $return['response'] = true;
            }
            if (!$return) {
                $return = $this->sendFailResponse('03');
            }
            return $return;
        } else {
            $return = $this->sendFailResponse('02');
            return $return;
        }
    }

    /**
     * @return mixed
     */
    public function put_index()
    {
        $langs = $this->Data->getPost('langs');
        if (!is_array($langs)) {
            $langs = json_decode($langs);
        }
        $active = $this->Data->getPost('active');
        $ID = $this->Data->getPost('ID');
        $type = $this->Data->getPost('type');
        $color = $this->Data->getPost('color');

        if (!$ID) {
            $return = $this->sendFailResponse('04');
            return $return;
        }

        $res = false;

        $langUpdated = 0;
        if (!empty($langs)) {
            foreach ($langs as $lang => $name) {
                $langUpdated += intval($this->OrderStatusLang->set($ID, $lang, $name));
            }
        }

        if ($active !== NULL) {
            if ($this->OrderStatus->update($ID, 'active', $active)) {
                $res = true;
            }
        }

        if( $type !== NULL ) {
            if ($this->OrderStatus->update($ID, 'type', $type)) {
                $res = true;
            }
        }

        if( $color !== NULL ) {
            if ($this->OrderStatus->update($ID, 'color', $color)) {
                $res = true;
            }
        } else {
            if ($this->OrderStatus->update($ID, 'color', NULL)) {
                $res = true;
            }
        }

        if ($res) {
            $return['langUpdated'] = $langUpdated;
            $return['response'] = true;
            return $return;
        } else {
            $return = $this->sendFailResponse('03');
            return $return;
        }
    }

    /**
     * @param $ID
     * @return mixed
     */
    public function delete_index($ID)
    {
        $data['ID'] = $ID;
        if (intval($ID) > 0) {
            if ($this->OrderStatus->delete('ID', $ID)) {
                $this->OrderStatusLang->delete('statusID', $ID);
                $data['response'] = true;
                return $data;
            } else {
                $data = $this->sendFailResponse('03');
                return $data;
            }

        } else {
            $data = $this->sendFailResponse('04');
            return $data;
        }
    }

    public function patch_sort()
    {
        $post = $this->Data->getAllPost();
        $this->Standard->setModel($this->OrderStatus);
        return $this->Standard->sort($post, $func = 'sort');
    }

    /**
     * @param $langExpression
     * @return array
     */
    private function parseLang($langExpression)
    {
        $exp1 = explode(',', $langExpression);
        $actLangs = array();
        if (empty($exp1)) {
            return array();
        }
        foreach ($exp1 as $e1) {
            $exp2 = explode('::', $e1);
            $actLangs[$exp2[0]] = $exp2[1];
        }
        return $actLangs;
    }

    public function forClient()
    {
        $list = $this->OrderStatus->getAll( 1 );

        if (empty($list)) {
            $list = array();
        }

        return $list;
    }
    
}
