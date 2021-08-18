<?php
/**
 * Programista Rafał Leśniak - 21.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 21-07-2017
 * Time: 16:51
 */

namespace DreamSoft\Libs\DHLClient;


use stdClass;

class Piece
{
    /**
     * @var string
     */
    private $type;
    /**
     * @var int
     */
    private $width;
    /**
     * @var int
     */
    private $height;
    /**
     * @var int
     */
    private $length;
    /**
     * @var int
     */
    private $weight;
    /**
     * @var int
     */
    private $quantity;
    /**
     * @var int
     */
    private $nonStandard;
    /**
     * @var int
     */
    private $euroReturn;
    /**
     * @var int
     */
    private $blpPieceId;

    const rootName = 'item';

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @return int
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @param int $width
     */
    public function setWidth($width)
    {
        $this->width = $width;
    }

    /**
     * @return int
     */
    public function getHeight()
    {
        return $this->height;
    }

    /**
     * @param int $height
     */
    public function setHeight($height)
    {
        $this->height = $height;
    }

    /**
     * @return int
     */
    public function getLength()
    {
        return $this->length;
    }

    /**
     * @param int $length
     */
    public function setLength($length)
    {
        $this->length = $length;
    }

    /**
     * @return int
     */
    public function getWeight()
    {
        return $this->weight;
    }

    /**
     * @param int $weight
     */
    public function setWeight($weight)
    {
        $this->weight = $weight;
    }

    /**
     * @return int
     */
    public function getQuantity()
    {
        return $this->quantity;
    }

    /**
     * @param int $quantity
     */
    public function setQuantity($quantity)
    {
        $this->quantity = $quantity;
    }

    /**
     * @return int
     */
    public function getNonStandard()
    {
        return $this->nonStandard;
    }

    /**
     * @param int $nonStandard
     */
    public function setNonStandard($nonStandard)
    {
        $this->nonStandard = $nonStandard;
    }

    /**
     * @return int
     */
    public function getEuroReturn()
    {
        return $this->euroReturn;
    }

    /**
     * @param int $euroReturn
     */
    public function setEuroReturn($euroReturn)
    {
        $this->euroReturn = $euroReturn;
    }

    /**
     * @return int
     */
    public function getBlpPieceId()
    {
        return $this->blpPieceId;
    }

    /**
     * @param int $blpPieceId
     */
    public function setBlpPieceId($blpPieceId)
    {
        $this->blpPieceId = $blpPieceId;
    }

    public function getStructure()
    {
        $piece = new stdClass();
        $piece->type = $this->getType();
        $piece->width = $this->getWidth();
        $piece->height = $this->getHeight();
        $piece->length = $this->getLength();
        $piece->weight = $this->getWeight();
        $piece->quantity = $this->getQuantity();
        $piece->nonStandard = $this->getNonStandard();
        $piece->euroReturn = $this->getEuroReturn();
        $piece->blpPieceId = $this->getBlpPieceId();

        return $piece;
    }
}