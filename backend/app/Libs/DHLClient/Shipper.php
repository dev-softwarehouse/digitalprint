<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 15:46
 */

namespace DreamSoft\Libs\DHLClient;


use stdClass;

class Shipper extends SendPerson
{
    const rootName = 'shipper';

    public function getStructure()
    {
        $shipper = new stdClass();
        $shipper->name = $this->getName();
        $shipper->postalCode = $this->getPostalCode();
        $shipper->city = $this->getCity();
        $shipper->street = $this->getStreet();
        $shipper->houseNumber = $this->getHouseNumber();
        $shipper->apartmentNumber = $this->getApartmentNumber();
        $shipper->contactPerson = $this->getContactPerson();
        $shipper->contactPhone = $this->getContactPhone();
        $shipper->contactEmail = $this->getContactEmail();

        return $shipper;
    }

}