<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 22.01.19
 * Time: 09:45
 */

namespace DreamSoft\Models\Order;


use DreamSoft\Core\Model;
use DreamSoft\Models\Behaviours\QueryFilter;


class DpOrder extends Model
{
    protected $userTable;
    protected $sellerTable;
    protected $invoices;
    protected $orderStatuses;

    /**
     * @var QueryFilter
     */
    protected $QueryFilter;

    /**
     * DpOrder constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->QueryFilter = QueryFilter::getInstance();
        $this->setTableName('orders', true);
        $this->userTable = 'users';
        $this->sellerTable = 'users';
        $this->invoices = $this->prefix . 'invoices';
        $this->orderStatuses = $this->prefix . 'orderStatuses';
    }

    /**
     * @param null $filters
     * @param int $offset
     * @param int $limit
     * @param array $orderBy
     * @param string $logicalOperator
     * @return array|bool
     */
    public function getList($filters = NULL, $offset = 0, $limit = 30, $orderBy = array(), $logicalOperator = 'AND')
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, '
            . 'user.`user`as userMail, user.`name` as userName, user.`lastname` as userLastname, user.`companyName` as userCompanyName, '
            . ' address.telephone as userTelephone, user.onetime as oneTimeUser, '
            . 'seller.`user`as sellerMail, seller.`name` as sellerName, seller.`lastname` as sellerLastname, invoice.invoiceID, MAX(invoice.type) as invoiceType, 
            paymentReminds.remindDate1, paymentReminds.remindDate2, paymentReminds.remindDate3, 
            fileReminders.remindDate1 as fileRemindDate1, fileReminders.remindDate2 as fileRemindDate2, fileReminders.remindDate3 as fileRemindDate3, 
            customProducts.ID as customProductID '
            . ' FROM `' . $this->getTableName() . '` ';
        $query .= ' LEFT JOIN `' . $this->userTable . '` as user ON user.ID =  `' . $this->getTableName() . '`.`userID` ';
        $query .= ' LEFT JOIN `' . $this->userTable . '` as seller ON seller.ID =  `' . $this->getTableName() . '`.`sellerID` ';
        $query .= ' LEFT JOIN `' . $this->invoices . '` as invoice ON invoice.orderID =  `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `' . $this->orderStatuses . '` as orderStatuses ON orderStatuses.ID = `' . $this->getTableName() . '`.`status` ';
        $query .= ' LEFT JOIN `dp_invoices` as invoices ON invoices.orderID = `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `address_users` as defaultAddress ON defaultAddress.userID = user.ID AND defaultAddress.type = 1 AND defaultAddress.default = 1 ';
        $query .= ' LEFT JOIN `address_users` as defaultInvoiceAddress ON defaultInvoiceAddress.userID = user.ID AND defaultInvoiceAddress.type = 2 AND defaultInvoiceAddress.default = 1 ';
        $query .= ' LEFT JOIN `address` as address ON address.ID = defaultAddress.addressID ';
        $query .= ' LEFT JOIN `address` as invoiceAddress ON invoiceAddress.ID = defaultInvoiceAddress.addressID ';
        $query .= ' LEFT JOIN `dp_paymentReminder` as paymentReminds ON paymentReminds.orderID = `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `dp_fileReminders` as fileReminders ON fileReminders.orderID = `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `dp_customProducts` as customProducts ON customProducts.orderID = `' . $this->getTableName() . '`.`ID` ';

        $prepare = $this->QueryFilter->prepare($filters, $logicalOperator);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        $query .= ' GROUP BY `' . $this->getTableName() . '`.ID ASC ';
        if (empty($orderBy)) {
            $query .= ' ORDER BY `' . $this->getTableName() . '`.`modified` DESC ';
        } else {

            $orderQuery = ' ORDER BY ';
            foreach ($orderBy as $ord) {
                if (strstr($ord, '.')) {
                    $exp = explode('.', $ord);
                    if (strlen($exp[0]) > 0) {
                        $sortTable = '`' . $exp[0] . '`.';
                    } else {
                        $sortTable = '';
                    }
                    $ord = $exp[1];
                } else {
                    $sortTable = '`' . $this->getTableName() . '`.';
                }
                if (substr($ord, 0, 1) == '-') {
                    $direct = 'DESC';
                    $ord = substr($ord, 1);
                } else {
                    $direct = 'ASC';
                }
                $orderQuery .= ' ' . $sortTable . '`' . $ord . '` ' . $direct . ',';
            }
            $query .= substr($orderQuery, 0, -1);
        }

        $query .= ' LIMIT ' . intval($offset) . ',' . intval($limit) . ' ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    public function count($filters = NULL)
    {
        $query = 'SELECT COUNT(DISTINCT `' . $this->getTableName() . '`.`ID`) as count '
            . ' FROM `' . $this->getTableName() . '` ';
        $query .= ' LEFT JOIN `' . $this->userTable . '` as user ON user.ID =  `' . $this->getTableName() . '`.`userID` ';
        $query .= ' LEFT JOIN `' . $this->userTable . '` as seller ON seller.ID =  `' . $this->getTableName() . '`.`sellerID` ';
        $query .= ' LEFT JOIN `' . $this->invoices . '` as invoice ON invoice.orderID =  `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `' . $this->orderStatuses . '` as orderStatuses ON orderStatuses.ID = `' . $this->getTableName() . '`.`status` ';
        $query .= ' LEFT JOIN `dp_invoices` as invoices ON invoices.orderID = `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `address_users` as defaultAddress ON defaultAddress.userID = user.ID AND defaultAddress.type = 1 AND defaultAddress.default = 1 ';
        $query .= ' LEFT JOIN `address_users` as defaultInvoiceAddress ON defaultInvoiceAddress.userID = user.ID AND defaultInvoiceAddress.type = 2 AND defaultInvoiceAddress.default = 1 ';
        $query .= ' LEFT JOIN `address` as address ON address.ID = defaultAddress.addressID ';
        $query .= ' LEFT JOIN `address` as invoiceAddress ON invoiceAddress.ID = defaultInvoiceAddress.addressID ';
        $query .= ' LEFT JOIN `dp_paymentReminder` as paymentReminds ON paymentReminds.orderID = `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `dp_fileReminders` as fileReminders ON fileReminders.orderID = `' . $this->getTableName() . '`.`ID` ';
        $query .= ' LEFT JOIN `dp_customProducts` as customProducts ON customProducts.orderID = `' . $this->getTableName() . '`.`ID` ';

        $prepare = $this->QueryFilter->prepare($filters);

        $where = $prepare['where'];
        $binds = $prepare['binds'];

        if (!empty($where)) {
            $query .= ' WHERE ' . substr($where, 4);
        }

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();

    }

    /**
     * @param $sellerID
     * @param int $ready
     * @param string $typeEntity
     * @return array|bool
     */
    public function getAllForSeller($sellerID, $ready = 1, $typeEntity = 'order')
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '`
 			WHERE `ready` = :ready AND `sellerID` = :sellerID AND `production` = 0 ';

        $binds = array();
        $binds[':ready'] = $ready;
        $binds[':sellerID'] = $sellerID;

        if($typeEntity === 'order') {
            $binds['isOrder'] = 1;
            $binds['isOffer'] = 0;
        } else if ($typeEntity === 'offer') {
            $binds['isOrder'] = 0;
            $binds['isOffer'] = 1;
        }

        if( $typeEntity !== NULL ) {
            $query .= ' AND `isOrder` = :isOrder AND `isOffer` = :isOffer ';
        }

        $query .= ' ORDER BY `created` DESC ';

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getAll();
    }

    public function getOne($orderID)
    {

        $query = 'SELECT `' . $this->getTableName() . '`.*, '
            . 'user.`login` as userMail, user.`name` as userName, user.`lastname` as userLastname, user.`companyName` as userCompanyName, '
            . 'seller.`user`as sellerMail, seller.`name` as sellerName, seller.`lastname` as sellerLastname'
            . ' FROM `' . $this->getTableName() . '` ';
        $query .= ' LEFT JOIN `' . $this->userTable . '` as user ON user.ID =  `' . $this->getTableName() . '`.`userID` ';
        $query .= ' LEFT JOIN `' . $this->userTable . '` as seller ON seller.ID =  `' . $this->getTableName() . '`.`sellerID` ';
        $query .= ' WHERE `' . $this->getTableName() . '`.ID = :orderID ';

        $binds['orderID'] = $orderID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();

    }

    /**
     * @param $userID
     * @return bool
     */
    public function getLastUserOrder($userID)
    {
        $query = 'SELECT * 
                FROM  `' . $this->getTableName() . '` 
                WHERE  `userID` = :userID
                ORDER BY  `created` DESC 
                LIMIT 1';

        $binds['userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getRow();
    }

    /**
     * @param $userID
     * @return array|bool
     */
    public function getNotPaidCalculations($userID)
    {
        $query = 'SELECT products.calcID 
		    FROM `' . $this->getTableName() . '` orders 
		    LEFT JOIN `dp_products` products ON products.orderID = orders.ID
    		WHERE orders.`userID` = :userID AND orders.paid = 0 
    		AND orders.`isOrder` = 1 AND orders.production = 1 ORDER BY products.`created` DESC';

        $binds['userID'] = $userID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if( !$res ) {
            return array();
        }

        $result = array();
        foreach ( $res as $row ) {
            if( !in_array($row['calcID'], $result) && intval($row['calcID']) > 0 ) {
                $result[] = $row['calcID'];
            }
        }

        return $result;
    }

    /**
     * @param $orderID
     * @return array|bool
     */
    public function getOrderCalculations($orderID)
    {
        $query = 'SELECT products.calcID 
		    FROM `' . $this->getTableName() . '` orders 
		    LEFT JOIN `dp_products` products ON products.orderID = orders.ID
    		WHERE orders.`ID` = :orderID AND orders.`isOrder` = 1  ORDER BY products.`created` DESC';

        $binds['orderID'] = $orderID;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        $res = $this->db->getAll();

        if( !$res ) {
            return array();
        }

        $result = array();
        foreach ( $res as $row ) {
            if( !in_array($row['calcID'], $result) && intval($row['calcID']) > 0 ) {
                $result[] = $row['calcID'];
            }
        }

        return $result;
    }
}