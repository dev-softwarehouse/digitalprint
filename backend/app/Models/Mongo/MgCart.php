<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 16.01.19
 * Time: 11:44
 */

namespace DreamSoft\Models\Mongo;

use DreamSoft\Core\MongoModel;
use Exception;
use MongoCollection;

/**
 * Class MgCart
 * @package DreamSoft\Models\Mongo
 */
class MgCart extends MongoModel {

    /**
     * @var MongoCollection
     */
    private $collection;

    /**
     * MgCart constructor.
     */
    public function __construct() {
        parent::__construct();
        try {
            $this->collection = $this->db->selectCollection('Cart');
        } catch (Exception $e) {
            $this->debug('Collection Cart problem!', $e->getMessage());
        }

    }

    /**
     * @return MongoCollection
     */
    public function getAdapter()
    {
        return $this->collection;
    }

}