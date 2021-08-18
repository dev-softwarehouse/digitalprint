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
 * Class MgSession
 * @package DreamSoft\Models\Mongo
 */
class MgSession extends MongoModel {

    /**
     * @var MongoCollection
     */
    private $collection;

    /**
     * MgSession constructor.
     */
    public function __construct() {
        parent::__construct();
        try {
            $this->collection = $this->db->selectCollection('Session');
        } catch (Exception $e) {
            $this->debug('Collection Session problem!', $e->getMessage());
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