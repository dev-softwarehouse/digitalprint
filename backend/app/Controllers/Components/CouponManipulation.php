<?php
/**
 * Programista Rafał Leśniak - 29.6.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 29-06-2017
 * Time: 14:46
 */

namespace DreamSoft\Controllers\Components;


use DreamSoft\Core\Component;
use DreamSoft\Models\Coupon\Coupon;
use DreamSoft\Models\Coupon\CouponProduct;

/**
 * Class CouponCalculation
 * @package DreamSoft\Controllers\Components
 */
class CouponManipulation extends Component
{
    /**
     * @var Coupon
     */
    protected $Coupon;
    /**
     * @var
     */
    protected $CouponProduct;

    /**
     * CouponCalculation constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->Coupon = Coupon::getInstance();
        $this->CouponProduct = CouponProduct::getInstance();
    }

    /**
     * @param int $stringLength
     * @return string
     */
    public function generateID($stringLength = 8)
    {
        $characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $string = '';
        $max = strlen($characters) - 1;
        for ($i = 0; $i < $stringLength; $i++) {
            $string .= $characters[mt_rand(0, $max)];
        }
        if ($this->checkExist($string)) {
            $string = $this->generateID();
        }
        return strtoupper($string);
    }

    /**
     * @param $ID
     * @return bool
     */
    private function checkExist($ID)
    {
        $coupon = $this->Coupon->get('ID', $ID);
        if ($coupon) {
            return true;
        }

        return false;
    }

    /**
     * @param $post
     * @param $couponID
     * @return array|bool
     */
    public function addOne($post, $couponID)
    {
        $params['expires'] = date('Y-m-d H:i:s', $post['expires']);
        $params['multiUser'] = $post['multiUser'] ? 1 : 0;
        $params['percent'] = $post['percent'] ? 1 : 0;
        $params['ID'] = $couponID;
        $params['value'] = $post['value'];
        $params['created'] = date('Y-m-d H:i:s');

        $this->Coupon->create($params);
        unset($params);

        $newCoupon = $this->Coupon->get('ID', $couponID);

        if ($newCoupon) {

            if (isset($post['products']['groupID'])) {
                $params['couponID'] = $couponID;
                $params['groupID'] = $post['products']['groupID'];
                if ($post['products']['typeID']) {
                    $params['typeID'] = $post['products']['typeID'];
                }
                if ($post['products']['formatID']) {
                    $params['formatID'] = $post['products']['formatID'];
                }
                $lastRelationID = $this->CouponProduct->create($params);
            } else {
                $params['couponID'] = $couponID;
                $lastRelationID = $this->CouponProduct->create($params);
            }

            if ($lastRelationID > 0) {
                $newCoupon['products'][] = $this->CouponProduct->getOne($lastRelationID);
            }

            return $newCoupon;
        }

        return false;
    }

}