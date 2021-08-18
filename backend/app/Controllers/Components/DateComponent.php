<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;
use DreamSoft\Models\RealizationTime\Holiday;

/**
 * Description of DateComponent
 *
 * @author Rafał
 */
class DateComponent extends Component
{

    public $useModels = array();

    /**
     * @var Holiday
     */
    protected $Holiday;

    public function __construct()
    {
        parent::__construct();
        $this->Holiday = Holiday::getInstance();
    }

    /**
     * @param int $year
     * @return array
     */
    public function getEasterDate($year = 2012)
    {
        $a = $year % 19;
        $b = floor($year / 100);
        $c = $year % 100;
        $d = floor($b / 4);
        $e = $b % 4;
        $f = floor(($b + 8) / 25);
        $g = floor(($b - $f + 1) / 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30;
        $i = floor($c / 4);
        $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
        $m = floor(($a + 11 * $h + 22 * $l) / 451);
        $p = ($h + $l - 7 * $m + 114) % 31;
        $day = $p + 1;
        $month = floor(($h + $l - 7 * $m + 114) / 31);

        return array('day' => $day, 'month' => $month);
    }

    /**
     * @param $easterDate
     * @param int $year
     * @return array
     */
    public function getChurchHolidays($easterDate, $year = 2012)
    {
        $holyDays = array();
        $holyDays = $this->addHolyDay($holyDays, '1', '1', 'new_year', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $holyDays = $this->addHolyDay($holyDays, '6', '1', 'epiphany', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $holyDays = $this->addHolyDay($holyDays, $easterDate['day'], $easterDate['month'], 'easter', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $easterMondayDate = $this->addDaysToDate($easterDate['day'], $easterDate['month'], $year, 1);
        $holyDays = $this->addHolyDay($holyDays, $easterMondayDate['day'], $easterMondayDate['month'], 'easter_monday', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $pentecostDate = $this->addDaysToDate($easterDate['day'], $easterDate['month'], $year, 49);
        $holyDays = $this->addHolyDay($holyDays, $pentecostDate['day'], $pentecostDate['month'], 'pentecost', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $corpusChristiDate = $this->addDaysToDate($easterDate['day'], $easterDate['month'], $year, 60);
        $holyDays = $this->addHolyDay($holyDays, $corpusChristiDate['day'], $corpusChristiDate['month'], 'corpus_christi', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $holyDays = $this->addHolyDay($holyDays, '15', '8', 'assumption_of_mother_of_god', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $holyDays = $this->addHolyDay($holyDays, '1', '11', 'all_the_saints', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $holyDays = $this->addHolyDay($holyDays, '25', '12', 'christmas', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        $holyDays = $this->addHolyDay($holyDays, '26', '12', 'saint_stephen', CALENDAR_TYPE_CHURCH_HOLY_DAY);
        return $holyDays;
    }

    /**
     * @param $holyDays
     * @param $day
     * @param $month
     * @param $content
     * @param $type
     * @return array
     */
    private function addHolyDay($holyDays, $day, $month, $content, $type)
    {
        $holyDays[] = array(
            'day' => $day,
            'month' => $month,
            'content' => $content,
            'type' => $type
        );

        return $holyDays;
    }

    /**
     * @param $day
     * @param $month
     * @param $year
     * @param $amount
     * @return array
     */
    private function addDaysToDate($day, $month, $year, $amount)
    {
        $day = date("j", mktime(0, 0, 0, $month, $day + $amount, $year));
        $month = date("n", mktime(0, 0, 0, $month, $day + $amount, $year));
        return compact('day', 'month');
    }

    public function isHoliday($date)
    {
        $holidays = $this->Holiday->getHolidays('nationalholiday');
        foreach ($holidays as $holiday) {
            if ($holiday['active'] == 0) {
                continue;
            }
            if ($holiday['day'] == date('j', strtotime($date)) && $holiday['month'] == date('n', strtotime($date))) {
                return true;
            }
        }

        $nonWorkingDay = array(6, 7);

        if (in_array(date('N', strtotime($date)), $nonWorkingDay)) {
            return true;
        }

        return false;
    }
}
