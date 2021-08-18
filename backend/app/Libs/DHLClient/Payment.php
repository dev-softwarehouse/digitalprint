<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 17:00
 */

namespace DreamSoft\Libs\DHLClient;


use stdClass;

class Payment
{
    /**
     * @var string
     */
    private $paymentMethod;
    /**
     * @var string
     */
    private $payerType;
    /**
     * @var string
     */
    private $accountNumber;
    /**
     * @var string
     */
    private $costsCenter;

    const rootName = 'payment';

    /**
     * @return string
     */
    public function getPaymentMethod()
    {
        return $this->paymentMethod;
    }

    /**
     * @param string $paymentMethod
     */
    public function setPaymentMethod($paymentMethod)
    {
        $this->paymentMethod = $paymentMethod;
    }

    /**
     * @return string
     */
    public function getPayerType()
    {
        return $this->payerType;
    }

    /**
     * @param string $payerType
     */
    public function setPayerType($payerType)
    {
        $this->payerType = $payerType;
    }

    /**
     * @return string
     */
    public function getAccountNumber()
    {
        return $this->accountNumber;
    }

    /**
     * @param string $accountNumber
     */
    public function setAccountNumber($accountNumber)
    {
        $this->accountNumber = $accountNumber;
    }

    /**
     * @return string
     */
    public function getCostsCenter()
    {
        return $this->costsCenter;
    }

    /**
     * @param string $costsCenter
     */
    public function setCostsCenter($costsCenter)
    {
        $this->costsCenter = $costsCenter;
    }

    public function getStructure()
    {
        $payment = new stdClass();
        $payment->paymentMethod = $this->getPaymentMethod();
        $payment->payerType = $this->getPayerType();
        $payment->accountNumber = $this->getAccountNumber();
        $payment->costsCenter = $this->getCostsCenter();

        return $payment;
    }


}