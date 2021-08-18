<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 24-09-2018
 * Time: 12:41
 */

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;

class CalculateAdapter extends Component
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param $pages
     * @param $oneSide
     * @param $doublePage
     * @return int
     */
    public function getAmountPages($pages, $oneSide, $doublePage)
    {

        if ($oneSide && $pages > 2) {
            $pages *= 2;
        }

        if ($doublePage) {
            $pages /= 2;
        }

        if ($pages % 2) {
            $pages++;
        }

        return $pages;
    }

    /**
     * @param $workspaceWidth
     * @param $workspaceHeight
     * @param $formatWidth
     * @param $formatHeight
     * @return float|int
     */
    public function getAreaPerSheetForStandard($workspaceWidth, $workspaceHeight, $formatWidth, $formatHeight)
    {
        $horizontalWidth = floor($workspaceWidth / $formatWidth);
        $horizontalHeight = floor($workspaceHeight / $formatHeight);

        $horizontal = $horizontalWidth * $horizontalHeight;

        $verticalWidth = floor($workspaceWidth / $formatHeight);
        $verticalHeight = floor($workspaceHeight / $formatWidth);

        $vertical = $verticalWidth * $verticalHeight;

        return ($horizontal > $vertical) ? $horizontal : $vertical;
    }

    /**
     * @param $area
     * @param $workspaceWidth
     * @param $formatWidth
     * @param $formatHeight
     * @return float|int
     */
    public function getUsedHeight($area, $workspaceWidth, $formatWidth, $formatHeight)
    {
        $horizontalWidth = floor($workspaceWidth / $formatWidth);
        $verticalWidth = floor($workspaceWidth / $formatHeight);

        if ($horizontalWidth > $verticalWidth
            || ($horizontalWidth == $verticalWidth && $formatWidth > $formatHeight)
        ) {
            $rowHeight = $formatHeight;
            $perRow = $horizontalWidth;

        } else {
            $rowHeight = $formatWidth;
            $perRow = $verticalWidth;
        }

        return $area / $perRow * $rowHeight;
    }

    /**
     * @param $pages
     * @param $volume
     * @return float|int
     */
    public function getAreaForRolled($pages, $volume)
    {
        return $pages / 2 * $volume;
    }

    /**
     * @param $usedHeight
     * @param $workspaceHeight
     * @return float
     */
    public function getSheetsForRolled($usedHeight, $workspaceHeight)
    {
        return ceil($usedHeight / $workspaceHeight);
    }

    /**
     * @param $pages
     * @param $perSheet
     * @param $volume
     * @return float|int
     */
    public function getSheetsForStandard($pages, $perSheet, $volume)
    {
        return ($pages / ($perSheet * 2)) * $volume;
    }

    /**
     * @param $pages
     * @param $perSheet
     * @param $volume
     * @return float|int
     */
    public function getSheetsForStandardPrintRotated($pages, $perSheet, $volume)
    {
        $area = $pages / 2;
        $sheets = $area / $perSheet;
        $sheets *= $volume;

        return $sheets;
    }

    /**
     * @param $volume
     * @param $increase
     * @param $rows
     * @return float
     */
    public function addSetIncreaseToVolume($volume, $increase, $rows)
    {
        if ($increase != false) {
            $volume += ceil(intval($increase) / $rows);
            return $volume;
        }

        return $volume;
    }

    /**
     * @param $volume
     * @param $increase
     * @return float
     */
    public function addSetIncreaseToVolumeTotal($volume, $increase)
    {
        if ($increase != false) {
            $volume += ceil(intval($increase));
            return $volume;
        }

        return $volume;
    }

    /**
     * @param $formatWidth
     * @param $formatHeight
     * @return float|int
     */
    public function calculateSize($formatWidth, $formatHeight)
    {
        return ($formatWidth / 1000) * ($formatHeight / 1000);
    }

    /**
     * @param $formatWidth
     * @param $formatHeight
     * @param $slope
     * @return float|int
     */
    public function calculateSizeNet($formatWidth, $formatHeight, $slope)
    {
        return (($formatWidth - intval($slope * 2)) / 1000) * (($formatHeight - intval($slope * 2)) / 1000);
    }

    /**
     * @param $size
     * @param $maxRollLength
     * @param $formatWidth
     * @param $rollSlipIncrease
     * @return float|int
     */
    public function calculateSizeForRollPrint($size, $maxRollLength, $formatWidth, $rollSlipIncrease)
    {
        $length = $this->getLengthForRoll($size, $formatWidth);

        $numberOfRolls = $this->getNumberOfRolls($length, $maxRollLength);

        if ($rollSlipIncrease != false) {
            $increase = ($formatWidth / 10) * ($rollSlipIncrease * $numberOfRolls);
            $size += $increase / 10000;

        }

        return $size;
    }

    /**
     * @param $length
     * @param $maxRollLength
     * @return float
     */
    public function getNumberOfRolls($length, $maxRollLength)
    {
        return ceil($length / $maxRollLength);
    }

    /**
     * @param $size
     * @param $formatWidth
     * @return float|int
     */
    public function getLengthForRoll($size, $formatWidth)
    {
        return ($size * 10000) / ($formatWidth / 10);
    }

    /**
     * @param $formatWidth
     * @param $formatHeight
     * @param $workspaceWidth
     * @param $volume
     * @return float|int
     */
    public function getLengthForTotalArea($formatWidth, $formatHeight, $workspaceWidth, $volume)
    {
        $horizontalWidth = floor($workspaceWidth / $formatWidth);

        $verticalWidth = floor($workspaceWidth / $formatHeight);

        if ($horizontalWidth > $verticalWidth) {
            $length = $formatHeight * ceil($volume / $horizontalWidth);
        } else {
            $length = $formatWidth * ceil($volume / $verticalWidth);
        }

        return $length;
    }

    /**
     * @param $length
     * @param $workspace
     * @return mixed
     */
    public function addPaperHeightForTotalArea($length, $workspace)
    {
        if ($workspace['paperHeight']) {
            $length += $workspace['paperHeight'] - $workspace['height'];
            return $length;
        }
        return $length;
    }

    /**
     * @param $length
     * @param $maxRollLength
     * @return float
     */
    public function getNumberOfRollsForTotalArea($length, $maxRollLength)
    {
        return ceil($length / 10 / $maxRollLength);
    }

    /**
     * @param $length
     * @param $rollSlipIncrease
     * @param $numberOfRolls
     * @return float|int
     */
    public function addRollSlipIncrease($length, $rollSlipIncrease, $numberOfRolls)
    {
        if ($rollSlipIncrease != false) {
            $increase = $rollSlipIncrease * $numberOfRolls;
            $length += $increase * 10;
            return $length;
        }

        return $length;
    }

    /**
     * @param $length
     * @param $workspace
     * @return float|int
     */
    public function calculateTotalArea($length, $workspace)
    {
        return ($length / 1000) * ($workspace['paperWidth'] / 1000);
    }

    /**
     * @param $basicUnitOfSheets
     * @param $noRoundSheets
     * @return float
     */
    public function getFullProjectSheets($basicUnitOfSheets, $noRoundSheets)
    {

        return ceil(
            (floor($noRoundSheets) * $basicUnitOfSheets) / floor($noRoundSheets)
        );
    }

    /**
     * @param $noRoundSheets
     * @return float
     */
    public function getModuloFromNoRoundSheets($noRoundSheets)
    {
        return fmod($noRoundSheets, floor($noRoundSheets));
    }

    /**
     * @param $noRoundSheets
     * @return float|int
     */
    public function getNoRoundProjectSheet($noRoundSheets)
    {
        $noRoundedProjectSheets = 0;
        if ($noRoundSheets > 0.5) {
            $noRoundedProjectSheets = 1;
        } else if ($noRoundSheets > 0.25) {
            $noRoundedProjectSheets = 0.5;
        } else if ($noRoundSheets <= 0.25) {
            $noRoundedProjectSheets = 0.25;
        }

        return $noRoundedProjectSheets;
    }

    /**
     * @param $modulo
     * @param $noRoundSheets
     * @return float|int
     */
    public function getNoRoundProjectSheetWithModulo($modulo, $noRoundSheets)
    {
        $noRoundedProjectSheets = 0;
        if ($modulo == 0) {
            $noRoundedProjectSheets = floor($noRoundSheets);
        } else if ($modulo > 0.25) {
            $noRoundedProjectSheets = floor($noRoundSheets) + 0.5;
        } else if ($modulo <= 0.25) {
            $noRoundedProjectSheets = floor($noRoundSheets) + 0.25;
        }

        return $noRoundedProjectSheets;
    }

    /**
     * @param $projectSheets
     * @param $noRoundSheets
     * @return float|int|null
     */
    public function getInfoForPartProjectSheetsAmount($projectSheets, $noRoundSheets)
    {
        $partProjectSheetsAmount = null;

        if ($noRoundSheets > 0) {

            if ($noRoundSheets > 1) {

                $partProjectSheetsAmount = floor($noRoundSheets);

            } else {

                $partProjectSheetsAmount = floor($projectSheets);

            }

        } else {
            $partProjectSheetsAmount = $projectSheets;
        }

        return $partProjectSheetsAmount;

    }

    /**
     * @param $noRoundSheets
     * @param $sheets
     * @return float|int|null
     */
    public function getInfoForPartProjectSheets($noRoundSheets, $sheets)
    {
        $partProjectSheets = null;
        if ($noRoundSheets > 0) {
            $basicUnitOfSheets = $sheets / $noRoundSheets;
            if ($noRoundSheets > 1) {
                $modulo = $this->getModuloFromNoRoundSheets(
                    $noRoundSheets
                );
                $partProjectSheets = ceil(($modulo * $basicUnitOfSheets));
            } else {
                $partProjectSheets = 0;
            }
        }

        return $partProjectSheets;

    }

    /**
     * @param $noRoundSheets
     * @param $sheets
     * @param $projectSheets
     * @return float|null
     */
    public function getInfoForFullProjectSheets($noRoundSheets, $sheets, $projectSheets)
    {
        $fullProjectSheets = null;
        if ($noRoundSheets > 0) {

            $basicUnitOfSheets = $sheets / $noRoundSheets;
            if ($noRoundSheets > 1) {
                $fullProjectSheets = $this->getFullProjectSheets(
                    $basicUnitOfSheets,
                    $noRoundSheets
                );
            } else {
                $fullProjectSheets = $sheets;
            }

        } else {
            $basicUnitOfSheets = $sheets / $projectSheets;
            $fullProjectSheets = ceil((floor($projectSheets) *
                    $basicUnitOfSheets) / floor($projectSheets));
        }

        return $fullProjectSheets;
    }

    /**
     * @param $noRoundSheets
     * @param $projectSheets
     * @return float|int|null
     */
    public function getInfoNoRoundedProjectSheets($noRoundSheets, $projectSheets)
    {
        $noRoundedProjectSheets = null;
        if ($noRoundSheets > 0) {
            if ($noRoundSheets > 1) {
                $modulo = $this->getModuloFromNoRoundSheets(
                    $noRoundSheets
                );

                $noRoundedProjectSheets = $this->getNoRoundProjectSheetWithModulo(
                    $modulo,
                    $noRoundSheets
                );
            } else {
                $noRoundedProjectSheets = $this->getNoRoundProjectSheet(
                    $noRoundSheets
                );
            }
        } else {
            $noRoundedProjectSheets = $projectSheets;
        }

        return $noRoundedProjectSheets;
    }

    /**
     * @param $noRoundSheets
     * @return float|null
     */
    public function getInfoForValueOfPartInProjectSheets($noRoundSheets)
    {
        $valueOfPartInProjectSheets = null;
        if ($noRoundSheets > 0) {

            if ($noRoundSheets > 1) {
                $modulo = $this->getModuloFromNoRoundSheets(
                    $noRoundSheets
                );

                $valueOfPartInProjectSheets = $modulo;
            }
        }

        return $valueOfPartInProjectSheets;

    }

    /**
     * @param $formatID
     * @param $printTypeID
     * @param $workspaceID
     * @param $printTypeWorkspaces
     * @return null|array
     */
    public function getPrintTypeWorkspaceSettings($formatID, $printTypeID, $workspaceID, $printTypeWorkspaces)
    {
        $printTypeWorkspace = NULL;
        if( $printTypeWorkspaces &&
            array_key_exists($formatID, $printTypeWorkspaces) &&
            array_key_exists($printTypeID, $printTypeWorkspaces[$formatID]) &&
            array_key_exists($workspaceID, $printTypeWorkspaces[$formatID][$printTypeID]) &&
            $printTypeWorkspaces[$formatID][$printTypeID][$workspaceID] ) {
            $printTypeWorkspace = $printTypeWorkspaces[$formatID][$printTypeID][$workspaceID];
        }
        if( !$printTypeWorkspace ) {
            return NULL;
        }
        return array(
            'usePerSheet' => $printTypeWorkspace['usePerSheet'],
            'operationDuplication' => $printTypeWorkspace['operationDuplication']
        );
    }

    /**
     * @param $workspace
     * @param $option
     * @return int|null
     */
    public function getRepeatedOperationsNumber($workspace, $option)
    {
        $repeatedOperationsNumber = NULL;
        if( intval($option['repeatedOperation']) === 1 &&
            $workspace['printTypeWorkspaceSettings']['operationDuplication'] > 0 ) {
            $repeatedOperationsNumber = intval($workspace['printTypeWorkspaceSettings']['operationDuplication']);
        }
        return $repeatedOperationsNumber;
    }

    /**
     * @param $value
     * @param $volume
     * @return float|int
     */
    public function multiplicationByVolume($value, $volume = NULL)
    {
        if( !$volume ) {
            return $value;
        }
        return $value * $volume;
    }
}