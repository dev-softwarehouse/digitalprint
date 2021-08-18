<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 17:29
 */

namespace DreamSoft\Libs\DHLClient;


use stdClass;

class Service
{
    private $product;
    private $collectOnDelivery;
    private $collectOnDeliveryValue;
    private $collectOnDeliveryForm;
    const rootName = 'service';

    public function __construct()
    {

    }

    /**
     * @return mixed
     */
    public function getProduct()
    {
        return $this->product;
    }

    /**
     * @param mixed $product
     */
    public function setProduct($product)
    {
        $this->product = $product;
    }

    /**
     * @return mixed
     */
    public function getCollectOnDelivery()
    {
        return $this->collectOnDelivery;
    }

    /**
     * @param mixed $collectOnDelivery
     */
    public function setCollectOnDelivery($collectOnDelivery)
    {
        $this->collectOnDelivery = $collectOnDelivery;
    }

    /**
     * @return mixed
     */
    public function getCollectOnDeliveryValue()
    {
        return $this->collectOnDeliveryValue;
    }

    /**
     * @param mixed $collectOnDeliveryValue
     */
    public function setCollectOnDeliveryValue($collectOnDeliveryValue)
    {
        $this->collectOnDeliveryValue = $collectOnDeliveryValue;
    }

    /**
     * @return mixed
     */
    public function getCollectOnDeliveryForm()
    {
        return $this->collectOnDeliveryForm;
    }

    /**
     * @param mixed $collectOnDeliveryForm
     */
    public function setCollectOnDeliveryForm($collectOnDeliveryForm)
    {
        $this->collectOnDeliveryForm = $collectOnDeliveryForm;
    }

    /**
     * @return object
     */
    public function getStructure()
    {
        $serviceDefinition = new stdClass();
        $serviceDefinition->product = $this->getProduct();
        $serviceDefinition->collectOnDelivery = $this->getCollectOnDelivery();
        $serviceDefinition->collectOnDeliveryValue = $this->getCollectOnDeliveryValue();
        $serviceDefinition->collectOnDeliveryForm = $this->getCollectOnDeliveryForm();

        return $serviceDefinition;
    }
}