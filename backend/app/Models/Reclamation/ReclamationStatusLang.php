<?php
/**
 * Programmer Rafał Leśniak - 7.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 07-09-2017
 * Time: 16:28
 */

namespace DreamSoft\Models\Reclamation;

use DreamSoft\Core\Model;

/**
 * Class ReclamationStatusLang
 * @package DreamSoft\Models\Reclamation
 */
class ReclamationStatusLang extends Model
{
    /**
     * ReclamationStatusLang constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setTableName('reclamationStatusLangs', true);
    }

    /**
     * @param $statusID
     * @param $lang
     * @param $name
     * @return bool
     */
    public function set($statusID, $lang, $name)
    {
        $response = false;
        $updated = 0;
        $actID = $this->exist($statusID, $lang);

        if (intval($actID) > 0) {
            if ($this->update($actID, 'name', $name)) {
                $updated++;
            }

            if ($updated == 1) {
                $response = true;
            }
        } else {
            $params['name'] = $name;
            $params['lang'] = $lang;
            $params['statusID'] = $statusID;

            $actID = $this->create($params);
            if (intval($actID) > 0) {
                $response = true;
            }
        }
        return $response;
    }

    /**
     * @param $statusID
     * @param $lang
     * @return bool
     */
    public function getName($statusID, $lang)
    {
        $query = 'SELECT `name` FROM `' . $this->getTableName() . '` 
        WHERE `statusID` = :statusID AND `lang` = :lang ';

        $binds['statusID'] = $statusID;
        $binds['lang'] = $lang;

        if (!$this->db->exec($query, $binds)) {
            return false;
        }

        return $this->db->getOne();
    }
}