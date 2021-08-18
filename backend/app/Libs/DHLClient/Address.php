<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 15:49
 */

namespace DreamSoft\Libs\DHLClient;


abstract class Address
{
    /**
     * @var string
     */
    private $name;
    /**
     * @var string
     */
    private $street;
    /**
     * @var string
     */
    private $postalCode;
    /**
     * @var string
     */
    private $city;
    /**
     * @var string
     */
    private $houseNumber;
    /**
     * @var string
     */
    private $apartmentNumber;

    public function __construct() {
        // VOID
    }

    /**
     * Clears the Memory
     */
    public function __destruct() {
        unset($this->name);
        unset($this->street);
        unset($this->postalCode);
        unset($this->city);
        unset($this->houseNumber);
        unset($this->apartmentNumber);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getStreet()
    {
        return $this->street;
    }

    /**
     * @param string $street
     */
    public function setStreet($street)
    {
        $this->street = $street;
    }

    /**
     * @return string
     */
    public function getPostalCode()
    {
        return $this->postalCode;
    }

    /**
     * @param string $postalCode
     */
    public function setPostalCode($postalCode)
    {
        $this->postalCode = $postalCode;
    }

    /**
     * @return string
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * @param string $city
     */
    public function setCity($city)
    {
        $this->city = $city;
    }

    /**
     * @return string
     */
    public function getHouseNumber()
    {
        return $this->houseNumber;
    }

    /**
     * @param string $houseNumber
     */
    public function setHouseNumber($houseNumber)
    {
        $this->houseNumber = $houseNumber;
    }

    /**
     * @return string
     */
    public function getApartmentNumber()
    {
        return $this->apartmentNumber;
    }

    /**
     * @param string $apartmentNumber
     */
    public function setApartmentNumber($apartmentNumber)
    {
        $this->apartmentNumber = $apartmentNumber;
    }

}