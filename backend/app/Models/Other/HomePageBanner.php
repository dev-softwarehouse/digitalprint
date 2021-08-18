<?php

namespace DreamSoft\Models\Other;

use DreamSoft\Core\Model;

class HomePageBanner extends Model
{
    /**
     * @var string
     */
    protected $fileTable;
    private $domainID;

    /**
     * HomePageBanner constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('homepageBanner', true);
        $this->fileTable = 'uploadedFiles';
    }

    /**
     * @return mixed
     */
    public function getDomainID()
    {
        return $this->domainID;
    }

    /**
     * @param mixed $domainID
     */
    public function setDomainID($domainID)
    {
        $this->domainID = $domainID;
    }

    /**
     * @return mixed
     */
    public function getBannerPaths()
    {
        $query = 'SELECT * FROM `' . $this->getTableName() . '` AS tn 
        LEFT JOIN `' . $this->fileTable . '` AS uf ON tn.`fileID` = uf.`ID` 
        ORDER BY tn.ID DESC ';

        $this->db->exec($query);

        return $this->db->getAll();
    }

    /**
     * @return bool
     */
    public function clearFiles()
    {
        $query = 'DELETE FROM `' . $this->getTableName() . '`';

        if (!$this->db->exec($query)) {
            return false;
        }
        return true;
    }

    /**
     * @param $fileID
     * @param string $link
     * @return bool
     */
    public function setFiles($fileID, $link = '#')
    {

        $query = 'INSERT INTO `' . $this->getTableName() . '` (`fileID`, `domainID`, `link`) VALUES ( :fileID, :domainID, :link )';

        $binds['fileID'] = $fileID;
        $binds['link'] = $link;
        $binds['domainID'] = $this->getDomainID();

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->lastInsertID();
    }
}