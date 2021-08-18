<?php

namespace DreamSoft\Models\PrintShopProduct;

use DreamSoft\Core\Model;

/**
 * Class PrintShopTypeDescriptionLanguage
 * @package DreamSoft\Models\PrintShopProduct
 */
class PrintShopTypeDescriptionLanguage extends Model
{

    /**
     * PrintShopTypeDescriptionLanguage constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->prefix = 'ps_';
        $this->setTableName('products_descriptionsLangs', true);
    }

    /**
     * @param $descID
     * @param $lang
     * @param null $name
     * @param null $desc
     * @return bool|string
     */
    public function set($descID, $lang, $name = NULL, $desc = NULL)
    {
        $response = false;
        $actID = $this->exist($descID, $lang);

        if (intval($actID) > 0) {
            $updated = 0;
            if ($name) {
                $updated += $this->update($actID, 'name', $name);
            }
            if ($desc) {
                $updated += $this->update($actID, 'description', $desc);
            }
            if ($updated > 0) {
                $response = true;
            }
        } else {
            $params['descID'] = $descID;
            $params['lang'] = $lang;
            $params['name'] = $name;
            $params['description'] = $desc;
            $actID = $this->create($params);
            if (intval($actID) > 0) {
                $response = $actID;
            }
        }

        return $response;
    }

    /**
     * @param $descID
     * @param $lang
     * @return bool
     */
    public function exist($descID, $lang)
    {
        $query = 'SELECT `ID` FROM `' . $this->getTableName() . '` WHERE descID = :descID AND '
            . ' lang = :lang ';

        $binds['descID'] = $descID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }
        return $this->db->getOne();
    }
}
