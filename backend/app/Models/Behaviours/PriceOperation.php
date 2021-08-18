<?php
/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 12-09-2018
 * Time: 14:13
 */

namespace DreamSoft\Models\Behaviours;

use DreamSoft\Libs\Debugger;

/**
 * Class PriceOperation
 * @package DreamSoft\Models\Behaviours
 */
class PriceOperation extends Debugger
{
    /**
     * PriceOperation constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param $firstPrice
     * @param $nextPrice
     * @param $amount
     * @return float|int
     */
    public function countValue($firstPrice, $nextPrice, $amount)
    {
        $amountDiff = $nextPrice['amount'] - $firstPrice['amount'];

        $firstPercentOfPrice = 1 - ($amount - $firstPrice['amount']) / $amountDiff;
        $secondPercentOfPrice = 1 - ($nextPrice['amount'] - $amount) / $amountDiff;

        if (array_key_exists('value', $firstPrice)) {
            $out = $firstPrice['value'] * $firstPercentOfPrice + $nextPrice['value'] * $secondPercentOfPrice;
        } else {
            if (array_key_exists('value', $nextPrice)) {
                $out = $nextPrice['value'];
            } else {
                $out = 0;
            }
        }

        if ($out > 0) {
            return $out;
        }
        return 0;
    }

    /**
     * @param $firstExpense
     * @param $nextExpense
     * @param $amount
     * @return float|int|mixed
     */
    public function countExpenseValue($firstExpense, $nextExpense, $amount)
    {
        $amountDiff = $nextExpense['amount'] - $firstExpense['amount'];

        $firstPercentOfExpense = 1 - ($amount - $firstExpense['amount']) / $amountDiff;
        $secondPercentOfExpense = 1 - ($nextExpense['amount'] - $amount) / $amountDiff;

        if (array_key_exists('expense', $firstExpense)) {
            $out = $firstExpense['expense'] * $firstPercentOfExpense + $nextExpense['expense'] * $secondPercentOfExpense;
        } else {
            if (array_key_exists('expense', $nextExpense)) {
                $out = $nextExpense['expense'];
            } else {
                $out = 0;
            }
        }

        if ($out > 0) {
            return $out;
        }
        return 0;
    }

    /**
     * @param $firstPrice
     * @param $nextPrice
     * @param $amount
     * @return float|int
     */
    public function countPaperValue($firstPrice, $nextPrice, $amount)
    {
        $amountDiff = $nextPrice['amount'] - $firstPrice['amount'];

        $firstPercentOfPrice = 1 - ($amount - $firstPrice['amount']) / $amountDiff;
        $secondPercentOfPrice = 1 - ($nextPrice['amount'] - $amount) / $amountDiff;

        $out = $firstPrice['price'] * $firstPercentOfPrice + $nextPrice['price'] * $secondPercentOfPrice;

        if ($out > 0) {
            return $out;
        }
        return 0;
    }

    /**
     * @param $firstExpense
     * @param $nextExpense
     * @param $amount
     * @return float|int
     */
    public function countPaperExpenseValue($firstExpense, $nextExpense, $amount)
    {
        $amountDiff = $nextExpense['amount'] - $firstExpense['amount'];

        $firstPercentOfExpense = 1 - ($amount - $firstExpense['amount']) / $amountDiff;
        $secondPercentOfExpense = 1 - ($nextExpense['amount'] - $amount) / $amountDiff;

        $out = $firstExpense['expense'] * $firstPercentOfExpense + $nextExpense['expense'] * $secondPercentOfExpense;

        if ($out > 0) {
            return $out;
        }
        return 0;
    }
}