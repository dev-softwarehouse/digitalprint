<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 26-07-2018
 * Time: 17:39
 */

namespace DreamSoft\Tests;

use PHPUnit\Framework\TestCase;
use DreamSoft\Models\Payment\Payment;
use PDO;

class DatabaseTest extends TestCase
{
    /**
     * @var Payment
     */
    private $Payment;

    public function __construct($name = null, array $data = array(), $dataName = '')
    {
        parent::__construct($name, $data, $dataName);
        $this->Payment = Payment::getInstance();

    }

    /**
     *
     */
    public function testPaymentModelHasPdo()
    {

        $pdo = $this->Payment->getDb();
        $className = 'PDO';

        $this->assertInstanceOf(
            $pdo,
            $className
        );
    }
}