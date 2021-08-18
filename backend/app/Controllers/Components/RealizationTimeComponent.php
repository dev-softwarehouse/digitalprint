<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Models\PrintShopConfig\PrintShopConfigRealizationTimeWorkingHour;
use DreamSoft\Core\Component;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\RealizationTime\Holiday;

/**
 * Class RealizationTimeComponent
 */
class RealizationTimeComponent extends Component
{
    /**
     * @var PrintShopConfigRealizationTimeWorkingHour
     */
    private $PrintShopConfigRealizationTimeWorkingHour;

    public $useModels = array();

    /**
     * @var Setting
     */
    protected $Setting;
    /**
     * @var Holiday
     */
    protected $Holiday;
    /**
     * @var DateComponent
     */
    protected $DateComponent;


    public function __construct()
    {
        parent::__construct();
        $this->DateComponent = DateComponent::getInstance();
        $this->Setting = Setting::getInstance();
        $this->Holiday = Holiday::getInstance();
        $this->Setting->setModule('printshop');
        $this->PrintShopConfigRealizationTimeWorkingHour = PrintShopConfigRealizationTimeWorkingHour::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        $this->Setting->setDomainID($domainID);
    }

    /**
     * @return array|bool|int
     */
    public function getFirstHour()
    {
        if ($var = $this->Setting->getValue('firstHour')) {
            return $var;
        }
        return 8;

    }

    /**
     * @return array|bool
     */
    public function getWorkingSaturday()
    {
        return $this->Setting->getValue('workingSaturday');

    }

    /**
     * @return array|bool
     */
    public function getWorkingSunday()
    {
        return $this->Setting->getValue('workingSunday');
    }

    /**
     * @param $days
     * @return false|string
     */
    public function calcRealizationDate($days)
    {
        $currentHour = date("G");

        $currentWeekDay = date('N');

        $workingHours = $this->PrintShopConfigRealizationTimeWorkingHour->getAll();
        $workingHours = $this->sortWorkingHours($workingHours);
        $workingHours = $this->fillIfEmpty($workingHours);

        if( $workingHours[$currentWeekDay] && $currentHour > $workingHours[$currentWeekDay]['endHour'] ) {
            $days++;
        }

        $nationalHolidays = $this->Holiday->getHolidays('nationalholiday');

        $churchHolidays = $this->DateComponent->getChurchHolidays($this->DateComponent->getEasterDate(date('Y')), date('Y'));

        $allHolidays = array_merge($nationalHolidays, $churchHolidays);

        $holidays = array();
        foreach ($allHolidays as $each) {
            $holidays[$each['month']][$each['day']] = true;
        }

        $days = $this->checkFreeDays($days, $holidays, $workingHours);

        $timestamp = strtotime(date("Y-m-d") . ' + ' . $days . 'days');
        $realizationDate = date("Y-m-d", $timestamp);

        return $realizationDate;
    }

    /**
     * @param $workingHours
     * @return array
     */
    private function sortWorkingHours($workingHours)
    {
        $result = array();
        foreach ($workingHours as $day) {
            $result[$day['day']] = $day;
        }

        return $result;
    }

    /**
     * @param $workingHours
     * @return mixed
     */
    private function fillIfEmpty($workingHours)
    {
        for ($x = 1; $x <= 7; $x++) {
            if (!isset($workingHours[$x])) {
                $workingHours[$x] = array(
                    'day' => $x,
                    'active' => 0
                );
            }
        }

        return $workingHours;
    }

    /**
     * @param $days
     * @param $holidays
     * @param $workingHours
     * @return mixed
     */
    private function checkFreeDays($days, $holidays, $workingHours)
    {
        for ($i = 0; $i <= $days; $i++) {
            $timestamp = strtotime(date("Y-m-d") . ' + ' . $i . 'days');

            $month = date("n", $timestamp);
            $day = date("j", $timestamp);
            $hour = date("G");
            $weekDay = date("N", $timestamp);

            if( !$workingHours[$weekDay]  ) {
                $days++;
            } else if ( !$workingHours[$weekDay]['active'] ) {
                $days++;
            } else if( $hour >= $workingHours[$weekDay]['endHour'] && $this->checkIsToday($timestamp) ) {
                $days++;
            } else {
                if (isset($holidays[$month][$day])) {
                    $days++;
                }
            }

        }

        return $days;
    }

    /**
     * @param $futureDate
     * @return bool
     */
    private function checkIsToday($futureDate)
    {
        $current = strtotime(date("Y-m-d"));
        $dateDiff = $futureDate - $current;
        $difference = floor($dateDiff/(60*60*24));

        if( $difference==0 )
        {
            return true;
        }

        return false;
    }
}
