<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-05-2018
 * Time: 11:53
 */

namespace DreamSoft\Models\ProductionPath;

use DreamSoft\Core\Model;

/**
 * Class Skill
 * @package DreamSoft\Models\ProductionPath
 */
class Skill extends Model
{
    /**
     * Skill constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName( 'skills', true );
    }
}