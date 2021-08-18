<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 16:31
 */

namespace DreamSoft\Libs\DHLClient;


class Receiver extends SendPerson
{
    /**
     * @var string
     */
    private $country;

    const rootName = 'receiver';

    /**
     * @return string
     */
    public function getCountry()
    {
        return $this->country;
    }

    /**
     * @param string $country
     */
    public function setCountry($country)
    {
        $this->country = $country;
    }

    public function getStructure()
    {
        $receiver = array();
        $receiver['country'] = $this->getCountry();
        $receiver['name'] = $this->getName();
        $receiver['postalCode'] = $this->getPostalCode();
        $receiver['city'] = $this->getCity();
        $receiver['street'] = $this->getStreet();
        $receiver['houseNumber'] = $this->getHouseNumber();
        $receiver['apartmentNumber'] = $this->getApartmentNumber();
        $receiver['contactPerson'] = $this->getContactPerson();
        $receiver['contactPhone'] = $this->getContactPhone();
        $receiver['contactEmail'] = $this->getContactEmail();

        return $receiver;
    }


}