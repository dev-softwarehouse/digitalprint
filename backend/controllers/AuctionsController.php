<?php

use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Controllers\Components\ExportImport;
use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Controllers\Components\Mail;
use DreamSoft\Controllers\Components\Price;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Offer\Auction;
use DreamSoft\Models\Offer\AuctionCompany;
use DreamSoft\Models\Offer\AuctionResponse;
use DreamSoft\Models\Offer\AuctionResponseItem;
use DreamSoft\Models\Offer\AuctionFile;
use DreamSoft\Models\Offer\Offer;
use DreamSoft\Models\Offer\OfferItem;
use DreamSoft\Models\Offer\OfferOption;
use DreamSoft\Models\Offer\OfferItemFile;
use DreamSoft\Models\Offer\OfferCompany;
use DreamSoft\Models\User\User;

/**
 * Description of AuctionsController
 * @class AuctionsController
 * @author Rafał
 */
class AuctionsController extends Controller
{

    public $useModels = array();

    /**
     * @var array
     */
    protected $configs;

    /**
     * @var Auction
     */
    private $Auction;

    /**
     * @var AuctionCompany
     */
    protected $AuctionCompany;
    /**
     * @var AuctionResponse
     */
    protected $AuctionResponse;
    /**
     * @var AuctionResponseItem
     */
    protected $AuctionResponseItem;
    /**
     * @var AuctionFile
     */
    protected $AuctionFile;
    /**
     * @var Offer
     */
    protected $Offer;
    /**
     * @var Offer
     */
    protected $OfferRemote;
    /**
     * @var OfferItem
     */
    protected $OfferItem;
    /**
     * @var OfferItemFile
     */
    protected $OfferItemFile;
    /**
     * @var OfferOption
     */
    protected $OfferOption;
    /**
     * @var OfferCompany
     */
    protected $OfferCompany;
    /**
     * @var User
     */
    protected $User;
    /**
     * @var User
     */
    protected $UserRemote;

    /**
     * @var Filter
     */
    protected $Filter;
    /**
     * @var Price
     */
    protected $Price;
    /**
     * @var Mail
     */
    protected $Mail;
    /**
     * @var ExportImport
     */
    protected $Export;

    /**
     * @var string
     */
    protected $folder;
    /**
     * @var Uploader
     */
    protected $Uploader;
    /**
     * @var Acl
     */
    protected $Acl;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->Price = Price::getInstance();

        $this->Auction = Auction::getInstance();
        $this->AuctionCompany = AuctionCompany::getInstance();
        $this->Offer = Offer::getInstance();
        $this->OfferRemote = new Offer();
        $this->OfferItem = OfferItem::getInstance();
        $this->OfferItemFile = OfferItemFile::getInstance();
        $this->OfferOption = OfferOption::getInstance();
        $this->OfferCompany = OfferCompany::getInstance();
        $this->AuctionResponse = AuctionResponse::getInstance();
        $this->AuctionResponseItem = AuctionResponseItem::getInstance();
        $this->AuctionFile = AuctionFile::getInstance();
        $this->User = User::getInstance();
        $this->UserRemote = User::getInstance();
        $this->Filter = Filter::getInstance();

        $this->folder = 'auctions';
        $this->Uploader = Uploader::getInstance();
        $this->Acl = new Acl();
        $this->Mail = Mail::getInstance();
        $this->Export = ExportImport::getInstance();
        $this->setConfigs();
    }

    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->Mail->setDomainID($domainID);
    }

    public function setConfigs()
    {
        $this->configs = array(
            'endDateMax' => array('type' => 'timestamp', 'table' => 'a', 'field' => 'endDate', 'sign' => $this->Filter->signs['gt']),
            'endDateMin' => array('type' => 'timestamp', 'table' => 'a', 'field' => 'endDate', 'sign' => $this->Filter->signs['lt']),
            'inRealization' => array('type' => 'integer', 'table' => 'a', 'field' => 'inRealization', 'sign' => $this->Filter->signs['e']),
            'inOrder' => array('type' => 'integer', 'table' => 'a', 'field' => 'inOrder', 'sign' => $this->Filter->signs['e'], 'default' => 0),
            'companyID' => array('type' => 'integer', 'table' => 'a', 'field' => 'companyID', 'sign' => $this->Filter->signs['e']),
            'ID' => array('type' => 'integer', 'table' => 'a', 'field' => 'ID', 'sign' => $this->Filter->signs['li']),
        );
    }

    public function getConfigs()
    {
        return $this->configs;
    }

    public function index()
    {
        $list = $this->Auction->getAuctions();
        if (empty($list)) {
            $list = array();
        } else {
            $auctionArr = array();
            foreach ($list as $key => $val) {
                $auctionArr[] = $val['ID'];
            }
            $cmpArr = $this->AuctionCompany->getAllForAuction($auctionArr);
            foreach ($list as $key => $val) {
                $list[$key]['companies'] = $cmpArr[$val['ID']];
            }
        }
        return $list;
    }

    /**
     * Zwraca listę przetargów dla posrednika<br>
     *
     * @method getAuctions
     * @return {Array}
     */
    public function getAuctions($params)
    {

        $configs = $this->getConfigs();

        if (isset($params['open']) && $params['open'] == 1 && !isset($params['endDateMax'])) {
            $params['endDateMax'] = time();
        }

        if (isset($params['close']) && $params['close'] == 1 && !isset($params['endDateMin'])) {
            $params['endDateMin'] = time();
        }

        $inOrder = 0;
        if (isset($params['inOrder']) && $params['inOrder'] == 1) {
            $inOrder = 1;
        }

        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->Auction->getAuctionsWithCompanies($filters);

        if (empty($list)) {
            $list = array();
        } else {
            $offers = array();

            $auctionsArr = array();
            foreach ($list as $au) {
                $auctionsArr[] = $au['ID'];
            }
            $auctionFiles = $this->AuctionFile->getByAuctionList($auctionsArr);

            foreach ($list as $key => $val) {
                $notInResult = false;

                $this->OfferRemote->setRemote($val['companyID']);
                $this->OfferItem->setRemote($val['companyID']);
                $this->OfferOption->setRemote($val['companyID']);
                $actOffer = $this->OfferRemote->get('ID', $val['offerID']);

                /**
                 * Filtry do wyszukiwania
                 */
                if (isset($params['agency']) && strlen($params['agency'])) {
                    if (strstr($actOffer['agency'], $params['agency']) === false) {
                        continue;
                    }
                }

                if (isset($params['auctionDescription']) && strlen($params['auctionDescription'])) {
                    if (strstr($val['description'], $params['auctionDescription']) === false) {
                        continue;
                    }
                }

                if (isset($params['offerDescription']) && strlen($params['offerDescription'])) {
                    if (strstr($actOffer['description'], $params['offerDescription']) === false) {
                        continue;
                    }
                }

                if (isset($params['createdFrom']) && strlen($params['createdFrom'])) {
                    if (strtotime($actOffer['created']) <= $params['createdFrom']) {
                        continue;
                    }
                }

                if (isset($params['createdTo']) && strlen($params['createdTo'])) {
                    if (strtotime($actOffer['created']) >= $params['createdTo']) {
                        continue;
                    }
                }

                // Data realizacji
                if (isset($params['realizationDateFrom']) && strlen($params['realizationDateFrom'])) {
                    if (strtotime($actOffer['realizationDate']) <= $params['realizationDateFrom']) {
                        continue;
                    }
                }

                if (isset($params['realizationDateTo']) && strlen($params['realizationDateTo'])) {
                    if (strtotime($actOffer['realizationDate']) >= $params['realizationDateTo']) {
                        continue;
                    }
                }

                $actUser = $this->User->get('ID', $actOffer['uID']);

                if (isset($params['client']) && strlen($params['client'])) {
                    $clientParam = urldecode($params['client']);
                    if (strstr($actUser['user'], $clientParam) === false &&
                        strstr($actUser['name'], $clientParam) === false &&
                        strstr($actUser['lastname'], $clientParam) === false) {
                        continue;
                    }
                }

                if ($actOffer) {
                    $actOffer['user'] = $actUser['user'];
                    $actOffer['userName'] = $actUser['name'];
                    $actOffer['userLastname'] = $actUser['lastname'];

                    $items = current($this->OfferItem->getByOffers(array($actOffer['ID']), $inOrder));
                } else {
                    $items = array();
                }

                $actOffer['poNumber'] = $val['poNumber'];
                $actOffer['auctionFiles'] = $auctionFiles[$val['ID']];

                if (!empty($items)) {

                    $itemsArr = array();
                    foreach ($items as $ikey => $it) {
                        if (intval($actOffer['formatWidth']) > 0) {
                            $items[$ikey]['width'] = $actOffer['formatWidth'];
                        }
                        if (intval($actOffer['formatHeight']) > 0) {
                            $items[$ikey]['height'] = $actOffer['formatHeight'];
                        }

                        $itemsArr[] = $it['ID'];
                    }

                    $itemFiles = $this->OfferItemFile->getFileByList($itemsArr);
                    foreach ($items as $ikey => $it) {
                        $items[$ikey]['files'] = $itemFiles[$it['ID']];
                    }
                    $options = $this->OfferOption->getByItemList($itemsArr);
                    foreach ($items as $k2 => $v2) {
                        $items[$k2]['options'] = $options[$v2['ID']];
                    }
                    if ($inOrder) {
                        $responseItems = $this->AuctionResponseItem->getByListItems($itemsArr, $val['winnerResponseID']);
                    } else {
                        $responseItems = $this->AuctionResponseItem->getByListItems($itemsArr);
                    }

                    $aditionalInfo = array();
                    foreach ($responseItems as $k2 => $v2) {
                        if ($val['winnerResponseID'] == $v2['responseID']) {
                            $aditionalInfo[$v2['itemID']]['inOrder'] = $responseItems[$v2['itemID']]['inOrder'];
                        }

                        $aditionalInfo[$v2['itemID']]['price'] = $this->Price->getPriceToView($responseItems[$v2['itemID']]['price']);
                        $aditionalInfo[$v2['itemID']]['finalPrice'] = $this->Price->getPriceToView($responseItems[$v2['itemID']]['finalPrice']);

                    }

                    /*foreach($items as $itemID => $row){
                        
                    }*/

                    foreach ($items as $iKey => $iVal) {

                        $items[$iKey]['inOrder'] = $aditionalInfo[$iVal['ID']]['inOrder'];
                        $items[$iKey]['price'] = $aditionalInfo[$iVal['ID']]['price'];
                        $items[$iKey]['finalPrice'] = $aditionalInfo[$iVal['ID']]['finalPrice'];

                        if ($inOrder && isset($val['inOrder']) && $val['inOrder'] == 1 && $responseItems[$iVal['ID']]['inOrder'] != 1) {

                            unset($items[$iKey]);

                        }

                    }

                    $actOffer['items'] = $items;
                    $actOffer['endDate'] = $val['endDate'];
                    $actOffer['offerID'] = $actOffer['ID'];
                    $actOffer['ID'] = $val['ID'];
                    $actOffer['auctionDescription'] = $val['description'];
                    $actOffer['inRealization'] = $val['inRealization'];
                    $actOffer['companies'] = explode(';', $val['companies']);
                    $actOffer['winnerResponseID'] = $val['winnerResponseID'];
                    $actOffer['orderDescription'] = $val['orderDescription'];
                    $offers[] = $actOffer;
                } else {
                    $actOffer['items'] = NULL;
                    $actOffer['endDate'] = $val['endDate'];
                    $actOffer['offerID'] = NULL;
                    $actOffer['ID'] = $val['ID'];
                    $actOffer['auctionDescription'] = $val['description'];
                    $actOffer['inRealization'] = $val['inRealization'];
                    $actOffer['companies'] = explode(';', $val['companies']);
                    $actOffer['winnerResponseID'] = $val['winnerResponseID'];
                    $actOffer['orderDescription'] = $val['orderDescription'];
                    $offers[] = $actOffer;
                }
            }
        }
        return $offers;
    }

    public function export($params)
    {
        $list = $this->getAuctions($params);

        $cmpArr = array();
        $offerCompanies = $this->OfferCompany->getAll();
        foreach ($offerCompanies as $oc) {
            $cmpArr[$oc['companyID']] = $oc['name'];
        }


        $dir = 'data/' . companyID . '/tmp/export/';
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        $filename = 'exportAC.xls';
        $this->Export->path = $dir . $filename;
        $sheetName = 'Export ' . date('Y-m-d');

        $this->Export->newSheet($sheetName);

        $header = array('Data stworzenia',
            'Data zamknięcia zapytania',
            'Sugerowany termin realizacji',
            'Drukarnia biorące udział',
            'Agencja',
            'Produkt',
            'Opis zapytania',
            'Klient',
            'Informacje o zapytaniu'
        );

        $alphas = range('A', 'Z');
        foreach ($header as $i => $each) {
            $cell = $alphas[$i] . '1';
            $this->Export->setCellValue($cell, $each);
        }

        $rows = array();
        $i = 1;
        foreach ($list as $l) {
            $i++;
            // Data stworzenia
            $rows[$i][0] = $l['created'];
            // Data zamknięcia zapytania
            $rows[$i][1] = $l['endDate'];
            // Sugerowany termin realizacji
            $rows[$i][2] = $l['realizationDate'];
            // Drukarnia biorące udział
            $cmpStr = '';

            foreach ($l['companies'] as $cmpID) {
                $cmpStr .= $cmpArr[$cmpID] . ',';
            }
            $rows[$i][3] = substr($cmpStr, 0, strlen($cmpStr) - 1);
            // Agencja
            $rows[$i][4] = $l['agency'];
            // Produkt produkt cena ilość
            $itemsArr = array();
            foreach ($l['items'] as $item) {
                $itemsArr[] = $item['productName'] . ' - ' . $this->Price->getPriceToView($item['price']) . ' PLN - ' . $item['volume'];
            }
            $rows[$i][5] = implode('||', $itemsArr);
            // Opis zapytania
            $rows[$i][6] = $l['auctionDescription'];
            // Klient
            $rows[$i][7] = $l['user'] . ' - ' . $l['userName'] . ' ' . $l['userLastname'];
            // auctionDescription
            $rows[$i][8] = $l['auctionDescription'];
        }

        foreach ($rows as $cIndex => $r) {
            foreach ($r as $rIndex => $row) {
                $cell = $alphas[$rIndex] . $cIndex;
                $this->Export->setCellValue($cell, $row);
            }
        }

        $this->Export->saveFile();

        $data = array('response' => true, 'path' => $this->Export->path);

        return $data;

    }


    /**
     * Zwraca listę przetargów,<br>
     * w których może wziąć udział dana drukarnia
     *
     * @method forCompany
     * @return {Array}
     */
    public function forCompany($params)
    {
        $configs = $this->getConfigs();

        if (isset($params['open']) && $params['open'] == 1) {
            $params['endDateMax'] = time();
        }

        if (isset($params['close']) && $params['close'] == 1) {
            $params['endDateMin'] = time();
        }

        // if( isset($params['inOrder']) && $params['inOrder'] == 1 ){
        //     $params['companyID'] = companyID;
        // }

        $inOrder = 0;
        if (isset($params['inOrder']) && $params['inOrder'] == 1) {
            $inOrder = 1;
        }

        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->Auction->getAuctionsForCompany($filters);

        if (empty($list)) {
            $list = array();
        } else {
            $offers = array();

            $auctionsArr = array();
            foreach ($list as $au) {
                $auctionsArr[] = $au['ID'];
            }
            $auctionFiles = $this->AuctionFile->getByAuctionList($auctionsArr);

            foreach ($list as $key => $val) {
                $this->OfferRemote->setRemote($val['companyID']);
                $this->OfferItem->setRemote($val['companyID']);
                $this->OfferItemFile->setRemote($val['companyID']);
                $this->OfferOption->setRemote($val['companyID']);
                $actOffer = $this->OfferRemote->get('ID', $val['offerID']);
                $items = current($this->OfferItem->getByOffers(array($actOffer['ID'])));

                $oneAC = $this->AuctionCompany->get(companyID, $val['ID'], true);

                if (!empty($items)) {
                    $itemsArr = array();
                    foreach ($items as $ikey => $it) {
                        if (intval($actOffer['formatWidth']) > 0) {
                            $items[$ikey]['width'] = $actOffer['formatWidth'];
                        }
                        if (intval($actOffer['formatHeight']) > 0) {
                            $items[$ikey]['height'] = $actOffer['formatHeight'];
                        }

                        $itemsArr[] = $it['ID'];
                    }

                    $itemFiles = $this->OfferItemFile->getFileByList($itemsArr, true);
                    foreach ($items as $ikey => $it) {
                        $items[$ikey]['files'] = $itemFiles[$it['ID']];
                    }

                    $options = $this->OfferOption->getByItemList($itemsArr);
                    foreach ($items as $k2 => $v2) {
                        $items[$k2]['options'] = $options[$v2['ID']];
                    }

                    $responseItems = $this->AuctionResponseItem->getByListItems($itemsArr, $val['winnerResponseID']);

                    $aditionalInfo = array();
                    foreach ($responseItems as $k2 => $v2) {

                        if ($val['winnerResponseID'] == $v2['responseID']) {
                            $aditionalInfo[$v2['itemID']]['inOrder'] = $responseItems[$v2['itemID']]['inOrder'];
                            $aditionalInfo[$v2['itemID']]['price'] = $this->Price->getPriceToView($responseItems[$v2['itemID']]['price']);
                            $aditionalInfo[$v2['itemID']]['finalPrice'] = $this->Price->getPriceToView($responseItems[$v2['itemID']]['finalPrice']);
                        }

                    }

                    foreach ($items as $iKey => $iVal) {

                        $items[$iKey]['inOrder'] = $aditionalInfo[$iVal['ID']]['inOrder'];
                        $items[$iKey]['price'] = $aditionalInfo[$iVal['ID']]['price'];
                        $items[$iKey]['finalPrice'] = $aditionalInfo[$iVal['ID']]['finalPrice'];

                        if (isset($val['inOrder']) && $val['inOrder'] == 1 && $aditionalInfo[$iVal['ID']]['inOrder'] != 1) {

                            unset($items[$iKey]);

                        }

                    }

                    $actOffer['poNumber'] = $val['poNumber'];
                    $actOffer['items'] = $items;
                    $actOffer['endDate'] = $val['endDate'];
                    $actOffer['offerID'] = $actOffer['ID'];
                    $actOffer['ID'] = $val['ID'];
                    $actOffer['orderDescription'] = $val['orderDescription'];
                    $actOffer['auctionFiles'] = $auctionFiles[$val['ID']];

                    if (intval($oneAC['responseID']) > 0) {
                        $actOffer['hasResponse'] = 1;
                    } else {
                        $actOffer['hasResponse'] = 0;
                    }
                    $actOffer['fromCompanyID'] = $val['companyID'];
                    $offers[] = $actOffer;
                }
            }
        }
        $offers = array_values($offers);
        return $offers;
    }


    /**
     * Stwórz przetarg z danej oferty.<br>
     * Po stworzeniu przetargu z oferty, <br>
     * dana oferta dostaje auction na 1.
     *
     * @method post_index
     * @param {String} $endDate koniec oferty
     * @param {String} $description
     * @param {Integer} $offerID
     * @param {Array} $companies lista drukarni
     * @return {Array}
     */
    public function post_index()
    {
        $endDate = date('Y-m-d H:i:s', $this->Data->getPost('endDate'));
        $description = $this->Data->getPost('description');
        $offerID = $this->Data->getPost('offerID');
        $post = $this->Data->getAllPost();
        $companies = $post['companies'];
        $mails = array();

        $data['response'] = false;
        $savedCompanies = 0;
        if ($offerID && $endDate) {
            $companyID = companyID;
            $lastID = $this->Auction->create(compact('companyID', 'endDate', 'offerID', 'description'));
            if ($lastID > 0) {
                $data['item'] = $this->Auction->get('ID', $lastID);

                if (!empty($companies)) {
                    foreach ($companies as $c) {
                        $companyID = $c;
                        $auctionID = $lastID;
                        $lastAC = $this->AuctionCompany->create(compact('companyID', 'auctionID'));
                        if ($lastAC > 0) {

                            // @Mail do wybranych drukarni
                            $UserRemote = User::getInstance();
                            $UserRemote->setRemote($companyID);
                            $supervisors = $UserRemote->getSupervisor();

                            if (!empty($supervisors)) {
                                foreach ($supervisors as $key => $supervisor) {
                                    $mails[] = array('email' => $supervisor['user'], 'name' => $supervisor['name'] . ' ' . $supervisor['lastname']);
                                }
                            }

                            $savedCompanies++;
                        }
                    }
                }
                if ($savedCompanies > 0) {

                    if (!empty($mails)) {
                        $send = $this->Mail->sendMail($mails, NULL, 'newAuctionFromBM');
                    } else {
                        $this->debug($mails);
                    }

                    $data['response'] = true;
                    $this->Offer->update($offerID, 'auction', 1);
                }
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        $data['savedCompanies'] = $savedCompanies;
        return $data;
    }


    /**
     *
     * get  auctionResponses
     * URL auctions/[auctionID]/auctionResponses/[companyID - optional]
     */
    public function response($auctionID, $companyID)
    {
        if (!$companyID) {
            $companyID = companyID;
        }

        $result = array();
        $ac = $this->AuctionCompany->getMulti($companyID, $auctionID);

        if (!empty($ac)) {
            foreach ($ac as $acRow) {

                if (!$acRow['responseID']) {
                    continue;
                }

                $oneResponse = $this->AuctionResponse->get('ID', $acRow['responseID']);
                $res = array();
                $res['realizationDate'] = $oneResponse['realizationDate'];
                $res['description'] = $oneResponse['description'];
                $res['ID'] = $oneResponse['ID'];

                $items = $this->AuctionResponseItem->getByResponse($oneResponse['ID']);

                if (!empty($items)) {

                    foreach ($items as $it) {
                        $res['items'][$it['itemID']] = array(
                            'price' => $this->Price->getPriceToView($it['price'])
                        );
                    }

                } else {
                    $res['items'] = array();
                }

                $result[] = $res;
            }
        }

        return $result;

    }


    /**
     *
     * @param {Integer} $auctionID GET
     * @param {String} $realizationDate POST
     * @param {String} $description POST
     * @param {Integer} $price POST
     * @param {Integer} $companyID POST/GLOBAL
     * @return {Array}
     * @example <br>
     * URL auctions/[auctionID]/auctionResponses
     */
    public function post_response($auctionID)
    {

        $realizationDate = date('Y-m-d', $this->Data->getPost('realizationDate'));

        $description = $this->Data->getPost('description');
        $post = $this->Data->getAllPost();
        $items = $post['items'];
        //$auctionID = $this->Data->getPost('auctionID');
        $companyID = $this->Data->getPost('companyID');
        if (!$companyID) {
            $companyID = companyID;
        }

        $auction = $this->Auction->get('ID', $auctionID);

        $data['response'] = false;

        if (count($items) > 0 && $realizationDate && $auctionID) {

            $lastID = $this->AuctionResponse->create(compact('price', 'realizationDate', 'description'));
            if ($lastID > 0) {

                $acParams['responseID'] = $lastID;
                $acParams['auctionID'] = $auctionID;
                $acParams['companyID'] = $companyID;
                $this->AuctionCompany->create($acParams);
                unset($acParams);

                $data['response'] = true;

                foreach ($items as $itemID => $it) {
                    if (strlen($it['price']) > 0) {
                        $price = $this->Price->getPriceToDb($it['price']);
                    }

                    if (intval($price) > 0) {
                        $params['itemID'] = $itemID;
                        $params['responseID'] = $lastID;
                        $params['price'] = $price;
                        $this->AuctionResponseItem->create($params);
                    }
                    unset($params);
                }

                $data['item'] = $this->AuctionResponse->get('ID', $lastID);
                $itemsDB = $this->AuctionResponseItem->getByResponse($lastID);
                $resItems = array();
                if (!empty($itemsDB)) {
                    foreach ($itemsDB as $value) {
                        $resItems[$value['itemID']] = array('price' => $this->Price->getPriceToView($value['price']));
                    }
                }
                $data['item']['items'] = $resItems;

                $this->UserRemote->setRemote($auction['companyID']);
                $listRecipients = $this->UserRemote->getEmails('@canon.pl');

                $mails = array();
                if (!empty($listRecipients)) {
                    foreach ($listRecipients as $lr) {
                        if (filter_var($lr['user'], FILTER_VALIDATE_EMAIL) !== false) {
                            $mails[] = array('email' => $lr['user'], 'name' => $lr['name'] . ' ' . $lr['lastname']);
                        }
                    }
                }

                if (!empty($mails)) {
                    $this->Mail->setRemote($auction['companyID']);
                    $this->Mail->setDomainID(3);
                    $send = $this->Mail->sendMail($mails, NULL, 'newAuctionResponse');
                } else {
                    $this->debug('Error with emails: ' . PHP_EOL . var_export($mails, true));
                }

            } else {
                $data = $this->sendFailResponse('04');
            }
        } else {
            $data = $this->sendFailResponse('01');
        }

        return $data;
    }

    /**
     *
     * @param {Array} $auctionID
     * @return {Array}
     */
    public function put_response($auctionID)
    {
        $realizationDate = $this->Data->getPost('realizationDate');
        if (strlen($realizationDate) > 0) {
            $realizationDate = date('Y-m-d', $realizationDate);
        }


        $realizationDateFinal = $this->Data->getPost('realizationDateFinal');
        if (strlen($realizationDateFinal) > 0) {
            $realizationDateFinal = date('Y-m-d', $realizationDateFinal);
        }

        $description = $this->Data->getPost('description');
        $post = $this->Data->getAllPost();
        $items = $post['items'];
        $responseID = $this->Data->getPost('ID');

        $data['response'] = false;

        if (count($items) > 0 && ($realizationDate || $realizationDateFinal)) {
            //$ac = $this->AC->get($companyID, $auctionID);
            // sprawdzamy czy już nie ma odpowiedzi od tej drukarni
            // TODO: a jeżęli jest i nie skończył się przetarg to składamy nową ofertę

            $oneResponse = $this->AuctionResponse->get('ID', $responseID);


            if ($oneResponse) {

                $arParams = compact('description');
                if ($realizationDate) {
                    $arParams['realizationDate'] = $realizationDate;
                }

                if ($realizationDateFinal) {
                    $arParams['realizationDateFinal'] = $realizationDateFinal;
                }

                $result = $this->AuctionResponse->updateAll($oneResponse['ID'], $arParams);
                unset($arParams);

                foreach ($items as $itemID => $it) {

                    if (strlen($it['price']) > 0) {
                        $price = $this->Price->getPriceToDb($it['price']);
                    }
                    if (strlen($it['finalPrice']) > 0) {
                        $finalPrice = $this->Price->getPriceToDb($it['finalPrice']);
                    }
                    // sprawdzamy czy jest cena dla Itemu i dodajemy lub aktualizujemy
                    $exist = $this->AuctionResponseItem->exist($oneResponse['ID'], $itemID);
                    if (intval($exist) > 0) {
                        if (intval($price) > 0) {
                            $this->AuctionResponseItem->update($exist, 'price', $price);
                        }
                        if (intval($finalPrice) > 0) {
                            $this->AuctionResponseItem->update($exist, 'finalPrice', $finalPrice);
                        }
                    } else {
                        if (intval($price) > 0) {
                            $params['itemID'] = $itemID;
                            $params['responseID'] = $responseID;
                            $params['price'] = $price;
                            $this->AuctionResponseItem->create($params);
                        }
                        unset($params);
                    }
                }

                if ($result) {
                    $data['item'] = $this->AuctionResponse->get('ID', $responseID);
                    $itemsDB = $this->AuctionResponseItem->getByResponse($responseID);
                    $resItems = array();
                    if (!empty($itemsDB)) {
                        foreach ($itemsDB as $value) {
                            $resItems[$value['itemID']] = array('price' => $this->Price->getPriceToView($value['price']));
                        }
                    }
                    $data['item']['items'] = $resItems;
                }

                $data['response'] = $result;
                return $data;
            }

        }

        return $data;

    }

    /**
     *
     * get  auctionResponses
     * URL auctions/[auctionID]/auctionAllResponses
     */
    public function allresponses($auctionID)
    {


        $result = array();
        $ac = $this->AuctionCompany->getResponsesForAuction($auctionID);
        foreach ($ac as $response) {
            $responseID = $response['responseID'];
            if ($responseID === null) {
                continue;
            }

            $res = $this->AuctionResponse->get('ID', $responseID);
            $res['companyID'] = $response['companyID'];

            $items = $this->AuctionResponseItem->getByResponse($responseID);
            if (!empty($items)) {

                foreach ($items as $p) {
                    $res['items'][$p['itemID']] = array(
                        'price' => $this->Price->getPriceToView($p['price']),
                        'finalPrice' => $this->Price->getPriceToView($p['finalPrice'])
                    );
                }

            } else {
                $res['items'] = array();
            }
            $result[] = $res;

        }
        // if(!$ac || !!$ac['responseID']) {
        //     $result = $this->AR->get('ID', $ac['responseID']);
        // }

        return $result;

    }

    public function post_selectWinner($auctionID)
    {
        $winnerResponseID = $this->Data->getPost('responseID');
        $inRealization = 1;
        $result = $this->Auction->updateAll($auctionID, compact('winnerResponseID', 'inRealization'));

        if ($result) {

            // @Mail do zwycięzcy aukcji
            $companyID = $this->AuctionCompany->getCompany($auctionID, $winnerResponseID);
            $UserRemote = User::getInstance();
            $UserRemote->setRemote($companyID);
            $supervisors = $UserRemote->getSupervisor();

            if (!empty($supervisors)) {
                foreach ($supervisors as $key => $supervisor) {
                    $mails[] = array('email' => $supervisor['user'], 'name' => $supervisor['name'] . ' ' . $supervisor['lastname']);
                }
            }
            //$mails[] = array('email' => $supervisor['user'], 'name' => $supervisor['name'].' '.$supervisor['lastname']);

            if (!empty($mails)) {
                $send = $this->Mail->sendMail($mails, NULL, 'winnerAuction');
            } else {
                $this->debug('Error with emails: ' . PHP_EOL . var_export($mails, true));
            }

        }

        $response['result'] = $result;
        return $response;
    }

    public function responseWinner($auctionID)
    {
        // echo 'responseWInner auctionID: '.$auctionID;
        //$result = array();
        $auction = $this->Auction->getWinner($auctionID);

        if (!empty($auction)) {

            $companyID = $this->AuctionCompany->getCompany($auction['ID'], $auction['winnerResponseID']);
            $companyInfo = $this->OfferCompany->get('companyID', $companyID);

            $res = array();
            $res['realizationDate'] = $auction['resRealizationDate'];
            $res['companyID'] = $companyID;
            $res['companyName'] = $companyInfo['name'];
            $res['realizationDateFinal'] = $auction['resRealizationDateFinal'];
            $res['auctionDescription'] = $auction['description'];
            $res['description'] = $auction['resDescription'];
            $res['ID'] = $auction['responseID'];

            $items = $this->AuctionResponseItem->getByResponse($auction['responseID']);

            if (!empty($items)) {

                foreach ($items as $it) {
                    $res['items'][$it['itemID']] = array(
                        'price' => $this->Price->getPriceToView($it['price']),
                        'finalPrice' => $this->Price->getPriceToView($it['finalPrice'])
                    );
                }

            } else {
                $res['items'] = array();
            }
        }

        return $res;

    }

    // set auction endDate to current
    public function finishAuction($auctionID)
    {
        return put_finishAuction($auctionID);
    }

    public function put_finishAuction($auctionID)
    {
        $currentDate = date('Y-m-d H:i:s');
        $response['response'] = false;
        if ($this->Auction->update($auctionID, 'endDate', $currentDate)) {
            $response['response'] = true;
        }

        return $response;
    }

    public function post_order($auctionID)
    {

        $products = $this->Data->getPost('products');
        if (!is_array($products)) {
            $products = json_decode($products, true);
        }
        $orderDescription = $this->Data->getPost('orderDescription');
        $poNumber = $this->Data->getPost('poNumber');

        $data['response'] = false;
        if (intval($auctionID) > 0) {

            $auction = $this->Auction->get('ID', $auctionID);

            $this->Auction->update($auctionID, 'inOrder', 1);
            if (strlen($poNumber) > 0) {
                $this->Auction->update($auctionID, 'poNumber', $poNumber);
            }
            $this->Auction->update($auctionID, 'orderDescription', $orderDescription);
            $updatedResponseItem = 0;
            if (!empty($products)) {
                foreach ($products as $value) {
                    $actItemID = $this->AuctionResponseItem->exist($auction['winnerResponseID'], $value);
                    $updatedResponseItem += intval($this->AuctionResponseItem->update($actItemID, 'inOrder', 1));
                }
            }
            $data['updatedResponseItem'] = $updatedResponseItem;
            $data['response'] = true;


            // @Mail Nowe zamówienie od BM
            $this->UserRemote->setRemote($auction['companyID']);
            $listRecipients = $this->UserRemote->getEmails('@canon.pl');
            //$listRecipients = $this->User->getEmails('rafal.r.lesniak@gmail.com');

            $mails = array();
            if (!empty($listRecipients)) {
                foreach ($listRecipients as $lr) {
                    if (filter_var($lr['user'], FILTER_VALIDATE_EMAIL) !== false) {
                        $mails[] = array('email' => $lr['user'], 'name' => $lr['name'] . ' ' . $lr['lastname']);
                    }
                }
            }

            if (!empty($mails)) {
                $this->Mail->setRemote($auction['companyID']);
                $this->Mail->setDomainID(3);
                $send = $this->Mail->sendMail($mails, NULL, 'newOrderFromBM');
            } else {
                $this->debug('Error with emails: ' . PHP_EOL . var_export($mails, true));
            }

        } else {
            return $this->sendFailResponse('04');
        }

        return $data;


    }

    public function post_files($auctionID)
    {

        $created = date('Y-m-d');


        $name = $_FILES['auctionFile']['name'];
        //$responseItemID = 1;
        $fileID = $this->AuctionFile->add(compact('created', 'auctionID', 'name'));
        $lastFile = $this->AuctionFile->get('ID', $fileID);

        $destFolder = $this->folder . '/' . $created . '/' . $auctionID . '/';

        /*if( !is_dir($destFolder) ){
            mkdir($destFolder, 755, true);
            chmod($destFolder, 755);
        }*/

        $res = $this->Uploader->upload($_FILES, 'auctionFile', $destFolder, $lastFile['name']);

        return array('response' => $res, 'file' => $lastFile, 'url' => 'auctions/' . $auctionID . '/auctionFiles/getFile/' . $lastFile['ID']);

    }

    public function files($auctionID)
    {

        // pobierz odpowiedni plik
        $list = $this->AuctionFile->getByAuction($auctionID);

        if (empty($list)) {
            $list = array();
        }

        return $list;
    }

    public function getFile($auctionID, $fileID)
    {


        //$folder = 'offer_items';

        $one = $this->AuctionFile->get('ID', $fileID);
        $file = MAIN_UPLOAD . $this->folder . '/' . $one['created'] . '/' . $one['auctionID'] . '/' . $one['name'];

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file);

        $size = filesize($file);

        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mime_type);
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Content-Length: ' . $size);
        readfile($file);

    }

    protected function _delete_file($fileID)
    {

        $result = array();

        $one = $this->AuctionFile->get('ID', $fileID);
        //$folder = 'offer_items';

        if (!$one) {
            $result = $this->sendFailResponse('04');
        }

        $destFoleder = $this->folder . '/' . $one['created'] . '/' . $one['auctionID'] . '/';

        if ($this->Uploader->remove($destFoleder, $one['name'])) {

            if ($this->AuctionFile->delete('ID', $one['ID'])) {

                $result = array('response' => true, 'removed_item' => $one);

            } else {

                $result = $this->sendFailResponse('05');

            }

        } else {

            $result = $this->sendFailResponse('05');

        }

        return $result;

    }

    /**
     * @param $auctionID
     * @param $fileID
     * @return array
     */
    public function delete_files($auctionID, $fileID)
    {
        return $this->_delete_file($fileID);
    }

    /**
     * @return array
     */
    public function isAuctionUser()
    {


        $user = $this->Auth->getLoggedUser();

        return array('response' => $this->Acl->isAuctionUser($user));
    }

}
