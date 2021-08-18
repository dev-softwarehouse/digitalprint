<?php

namespace DreamSoft\Controllers\Components;
/**
 * Programista Rafał Leśniak - 17.7.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 17-07-2017
 * Time: 13:25
 */
use DreamSoft\Core\Component;
use DreamSoft\Models\Order\DpInvoice;
use DreamSoft\Models\Setting\Setting;

class InvoiceComponent extends Component {

    /**
     * @var DpInvoice
     */
    protected $DpInvoice;
    /**
     * @var Setting
     */
    protected $Setting;

    public $useModels = array();


    public function __construct (  ) {
        parent::__construct();
        $this->Setting = Setting::getInstance();
        $this->DpInvoice = DpInvoice::getInstance();
        $this->Setting->setModule('invoice');
    }

    public function setDomainID( $domainID )
    {
        $this->Setting->setDomainID($domainID);
    }

    public function changeInvoiceToVat( $orderID )
    {
        $exist = $this->DpInvoice->getOne($orderID, VAT_INVOICE_TYPE);

        if( $exist ) {
            return false;
        }

        $proformaInvoice = $this->DpInvoice->getOne($orderID, PROFORMA_INVOICE_TYPE);

        $typeNumeration = $this->Setting->getValue('numerationInvoices');
        $invoiceParams = array();
        $month = NULL;
        if( $typeNumeration == 1 ) {
            $month = date('m');
        }
        $year = date('Y');
        $maxInvoiceID = $this->DpInvoice->getMaxID( $year, $month, VAT_INVOICE_TYPE );

        if( !$maxInvoiceID ) {
            $maxInvoiceID = 1;
        } else {
            $maxInvoiceID = $maxInvoiceID+1;
        }

        $invoiceParams['invoiceID'] = $maxInvoiceID;
        $invoiceParams['type'] = VAT_INVOICE_TYPE;
        $invoiceParams['documentDate'] = date('Y-m-d');
        $invoiceParams['orderID'] = $proformaInvoice['orderID'];
        $invoiceParams['addressID'] = $proformaInvoice['addressID'];
        $invoiceParams['sellDate'] = $proformaInvoice['sellDate'];
        return $this->DpInvoice->create($invoiceParams);
    }

    /**
     * @param $invoice
     * @return array|bool|mixed
     */
    public function prepareInvoiceNumber($invoice)
    {
        $this->Setting->setLang(NULL);
        $this->Setting->setModule('invoice');
        $numerationInvoices = $this->Setting->getValue('numerationInvoices');
        if ($numerationInvoices == 1) {
            $mask = DEFAULT_INVOICE_MASK_MONTHLY;
        } else {
            $mask = DEFAULT_INVOICE_MASK_ANNUALY;
        }

        if ($invoice['type'] == 1) {
            $mask = $this->Setting->getValue('proformaInvoiceMask');
        } else {
            $mask = $this->Setting->getValue('invoiceMask');
        }

        $number = $mask;
        preg_match_all('/{[a-z]+}/', $mask, $matches);
        foreach ($matches[0] as $match) {
            if ($match === '{nr}') {
                $number = str_replace($match, $invoice['invoiceID'], $number);
            } else if ($match === '{m}') {
                $month = date('m', strtotime($invoice['documentDate']));
                $number = str_replace($match, $month, $number);
            } else if ($match === '{r}') {
                $year = date('Y', strtotime($invoice['documentDate']));
                $number = str_replace($match, $year, $number);
            }
        }

        return $number;
    }

}