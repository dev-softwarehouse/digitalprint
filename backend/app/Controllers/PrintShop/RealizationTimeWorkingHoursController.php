<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 25-09-2018
 * Time: 10:55
 */

namespace DreamSoft\Controllers\PrintShop;


use DreamSoft\Core\Controller;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigRealizationTimeWorkingHour;

class RealizationTimeWorkingHoursController extends Controller
{
    /**
     * @var PrintShopConfigRealizationTimeWorkingHour
     */
    private $PrintShopConfigRealizationTimeWorkingHour;

    /**
     * RealizationTimeWorkingHoursController constructor.
     * @param array $parameters
     */
    public function __construct(array $parameters = array())
    {
        parent::__construct($parameters);
        $this->PrintShopConfigRealizationTimeWorkingHour = PrintShopConfigRealizationTimeWorkingHour::getInstance();
    }

    /**
     * @return array
     */
    public function index()
    {
        $data = $this->PrintShopConfigRealizationTimeWorkingHour->getAll();

        $data = $this->sortData($data);

        $result = array();
        for ($x = 1; $x <= 7; $x++) {
            if (isset($data[$x])) {
                $result[$x] = $data[$x];
            } else {
                $result[$x] = array(
                    'day' => $x,
                    'active' => 0
                );
            }
        }

        return $result;
    }

    /**
     * @param $data
     * @return array
     */
    private function sortData($data)
    {
        $result = array();
        foreach ($data as $day) {
            $result[$day['day']] = $day;
        }

        return $result;
    }

    /**
     * @return array
     */
    public function patch_index()
    {
        $post = $this->Data->getAllPost();

        $updated = 0;
        $saved = 0;
        if ($post) {

            foreach ($post as $day) {

                $existRow = $this->PrintShopConfigRealizationTimeWorkingHour->get('day', $day['day']);

                if ($existRow) {
                    $active = intval($day['active']);
                    $localUpdated = 0;
                    $localUpdated += intval(
                        $this->PrintShopConfigRealizationTimeWorkingHour->update(
                            $existRow['ID'],
                            'startHour',
                            $day['startHour']
                        )
                    );

                    $localUpdated += intval(
                        $this->PrintShopConfigRealizationTimeWorkingHour->update(
                            $existRow['ID'],
                            'endHour',
                            $day['endHour']
                        )
                    );
                    $localUpdated += intval(
                        $this->PrintShopConfigRealizationTimeWorkingHour->update(
                            $existRow['ID'],
                            'active',
                            $active
                        )
                    );
                    if($localUpdated > 0) {
                        $updated++;
                    }

                } else {

                    if( isset($day['startHour']) && isset($day['endHour']) ) {
                        $params = array();
                        $params['day'] = $day['day'];
                        $params['startHour'] = $day['startHour'];
                        $params['endHour'] = $day['endHour'];
                        $params['active'] = $day['active'];

                        $lastID = $this->PrintShopConfigRealizationTimeWorkingHour->create($params);
                        if ($lastID > 0) {
                            $saved++;
                        }
                    }

                }

            }

        } else {
            return $this->sendFailResponse('01');
        }

        if ($saved > 0 || $updated > 0) {
            return array(
                'response' => true,
                'saved' => $saved,
                'updated' => $updated
            );
        }

        return $this->sendFailResponse('03');

    }
}