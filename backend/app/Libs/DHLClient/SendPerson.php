<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 15:53
 */

namespace DreamSoft\Libs\DHLClient;


abstract class SendPerson extends Address
{
    /**
     * @var string
     */
    private $contactPhone;
    /**
     * @var string
     */
    private $contactPerson;
    /**
     * @var string
     */
    private $contactEmail;

    public function __construct() {
        // VOID
    }

    /**
     * Clears the Memory
     */
    public function __destruct() {
        unset($this->contactPhone);
    }

    /**
     * @return string
     */
    public function getContactPhone()
    {
        return $this->contactPhone;
    }

    /**
     * @param string $contactPhone
     */
    public function setContactPhone($contactPhone)
    {
        $this->contactPhone = $contactPhone;
    }

    /**
     * @return string
     */
    public function getContactPerson()
    {
        return $this->contactPerson;
    }

    /**
     * @param string $contactPerson
     */
    public function setContactPerson($contactPerson)
    {
        $this->contactPerson = $contactPerson;
    }

    /**
     * @return string
     */
    public function getContactEmail()
    {
        return $this->contactEmail;
    }

    /**
     * @param string $contactEmail
     */
    public function setContactEmail($contactEmail)
    {
        $this->contactEmail = $contactEmail;
    }


}