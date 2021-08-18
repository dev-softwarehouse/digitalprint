<?php

use DreamSoft\Controllers\Components\Acl;
use DreamSoft\Controllers\Components\Filter;
use DreamSoft\Models\Offer\Auction;
use DreamSoft\Models\Offer\AuctionFile;
use DreamSoft\Models\Offer\AuctionResponseItem;
use DreamSoft\Models\Offer\Offer;
use DreamSoft\Models\Offer\OfferCompany;
use DreamSoft\Models\Offer\OfferItem;
use DreamSoft\Models\Offer\OfferItemFile;
use DreamSoft\Models\Offer\OfferOption;
use DreamSoft\Models\User\User;
use DreamSoft\Controllers\Components\Uploader;
use DreamSoft\Core\Controller;
use DreamSoft\Controllers\Components\Mail;

/**
 * Class OffersController
 */
class OffersController extends Controller
{

    public $useModels = array();

    protected $configs;

    // modele
    protected $Offer;
    protected $OfferItem;
    protected $OfferItemFile;
    protected $OfferOption;
    protected $OfferCompany;
    protected $Auction;
    /**
     * @var AuctionFile
     */
    protected $AuctionFile;
    protected $ARI;
    protected $User;
    protected $Filter;
    protected $Price;
    protected $Uploader;
    protected $Mail;
    /**
     * @var Acl
     */
    protected $Acl;


    public function __construct($params)
    {
        parent::__construct($params);
        $this->Offer = Offer::getInstance();
        $this->OfferItem = OfferItem::getInstance();
        $this->OfferItemFile = OfferItemFile::getInstance();
        $this->OfferOption = OfferOption::getInstance();
        $this->OfferCompany = OfferCompany::getInstance();
        $this->Auction = Auction::getInstance();
        $this->AuctionFile = AuctionFile::getInstance();
        $this->ARI = AuctionResponseItem::getInstance();
        $this->User = User::getInstance();

        $this->Filter = Filter::getInstance();
        $this->Uploader = Uploader::getInstance();
        $this->Acl = Acl::getInstance();
        $this->Mail = Mail::getInstance();
        $this->setConfigs();
    }

    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->User->setDomainID($domainID);
        $this->Mail->setDomainID($domainID);
    }

    public function setConfigs()
    {
        $this->configs = array(
            'finished' => array('type' => 'string', 'table' => 'dp_offers', 'field' => 'finished', 'sign' => $this->Filter->signs['e'], 'default' => 1),
            'auction' => array('type' => 'string', 'table' => 'dp_offers', 'field' => 'auction', 'sign' => $this->Filter->signs['e']),
            'uID' => array('type' => 'string', 'table' => 'dp_offers', 'field' => 'uID', 'sign' => $this->Filter->signs['e']),
        );
    }

    public function getConfigs()
    {
        return $this->configs;
    }

    public function offers($params)
    {

        $limit = 30;
        if (isset($params['limit'])) {
            $limit = $params['limit'];
        }
        $offset = 0;
        if (isset($params['offset'])) {
            $offset = $params['offset'];
        }

        $user = $this->Auth->getLoggedUser();

        // tylko swoje wysłane ofery:
        if (!$this->Acl->isAuctionUser($user) && isset($user['ID'])) {
            $params['uID'] = $user['ID'];
        }
        $sortBy[0] = '-created';
        if (isset($params['sort'])) {
            $sortBy = explode('|', $params['sort']);
        }

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $list = $this->Offer->getList($filters, $offset, $limit, $sortBy);

        if (empty($list)) {
            $list = array();
        } else {
            $offerArr = array();
            foreach ($list as $key => $val) {
                $offerArr[] = $val['ID'];
            }
            $auctions = $this->Auction->getAuctionForOffer($offerArr);

            $items = $this->OfferItem->getByOffers($offerArr);
            $offerItems = array();
            $companiesArr = array();
            /// nie ma tu ani śladu komentarza :()
            foreach ($list as $key => $val) {
                foreach ($items[$val['ID']] as $key2 => $val2) {
                    $offerItems[] = $val2['ID'];
                }
            }


            $offerOptions = $this->OfferOption->getByItemList($offerItems);
            $offerItemFiles = $this->OfferItemFile->getFileByList($offerItems);

            $auctionsArr = array();
            foreach ($auctions as $au) {
                $auctionsArr[] = $au['ID'];
            }

            $auctionFiles = $this->AuctionFile->getByAuctionList($auctionsArr);

            if (!isset($params['inOrder'])) {
                $params['inOrder'] = 0;
            }


            if (!empty($items)) {
                foreach ($items as $key => $val) {
                    foreach ($items[$key] as $k2 => $v2) {
                        $items[$key][$k2]['options'] = $offerOptions[$v2['ID']];
                        $items[$key][$k2]['files'] = $offerItemFiles[$v2['ID']];
                    }
                }

                foreach ($list as $key => $val) {

                    $responseItems = $this->ARI->getByResponse($auctions[$val['ID']]['winnerResponseID']);

                    if (!empty($responseItems)) {
                        $responseItemsArr = array();
                        foreach ($responseItems as $keyRi => $ri) {
                            $responseItemsArr[$ri['itemID']] = $ri['inOrder'];
                        }
                        foreach ($items[$val['ID']] as $keyOi => $oi) {
                            if ($params['inOrder'] == 1 && !$responseItemsArr[$oi['ID']]) {
                                unset($items[$val['ID']][$keyOi]);
                            } elseif ($params['inOrder'] == 0 && $responseItemsArr[$oi['ID']]) {
                                unset($items[$val['ID']][$keyOi]);
                            }
                        }
                    }

                    if ($params['inOrder'] == 1 && !$auctions[$val['ID']]) {
                        unset($list[$key]);
                        continue;
                    }
                    if ($params['inOrder'] == 1 && !$auctions[$val['ID']]['inOrder']) {
                        unset($list[$key]);
                        continue;
                    }


                    if ($params['inOrder'] == 0 && $auctions[$val['ID']]['inOrder']) {
                        unset($list[$key]);
                        continue;
                    }

                    foreach ($items[$val['ID']] as $k2 => $v2) {

                        if (intval($val['formatWidth']) > 0) {
                            $items[$key][$k2]['width'] = $val['formatWidth'];
                        }
                        if (intval($val['formatHeight']) > 0) {
                            $items[$key][$k2]['height'] = $val['formatHeight'];
                        }

                    }

                    sort($items[$val['ID']]);
                    $list[$key]['items'] = $items[$val['ID']];
                    $list[$key]['auctionInfo'] = NULL;

                    if ($val['auction'] == 1 && !empty($auctions[$val['ID']])) {
                        $auctions[$val['ID']]['companies'] = explode(';', $auctions[$val['ID']]['companies']);
                        $companiesArr = array_unique(array_merge($companiesArr, $auctions[$val['ID']]['companies']));
                        $list[$key]['auctionInfo'] = $auctions[$val['ID']];
                    }

                    if ($params['inOrder'] == 1 && $list[$key]['auctionInfo'] == NULL) {
                        unset($list[$key]);
                        continue;
                    }

                    $list[$key]['auctionFiles'] = $auctionFiles[$auctions[$val['ID']]['ID']];
                }

                $companies = $this->OfferCompany->getByCompanies($companiesArr);

                foreach ($list as $key => $val) {
                    if ($val['auction'] == 1 && !empty($companies)) {
                        $list[$key]['auctionInfo']['companies'] = $companies;
                    }
                }

            }

        }
        $list = array_values($list);
        return $list;
    }

    public function count($params = NULL)
    {

        $configs = $this->getConfigs();

        $filters = $this->Filter->prepare($configs, $params);

        $count = $this->Offer->count($filters);
        return array('count' => $count);
    }

    public function getCurrent()
    {

        $user = $this->Auth->getLoggedUser();

        $actOffer = $this->Offer->getFinished(0, $user['ID']);
        if (!$actOffer) {
            return array();
        }
        $items = current($this->OfferItem->getByOffers(array($actOffer['ID'])));
        if (!empty($items)) {
            $itemsArr = array();
            foreach ($items as $key => $it) {
                if (intval($actOffer['formatWidth']) > 0) {
                    $items[$key]['width'] = $actOffer['formatWidth'];
                }
                if (intval($actOffer['formatHeight']) > 0) {
                    $items[$key]['height'] = $actOffer['formatHeight'];
                }

                $itemsArr[] = $it['ID'];
            }
            $options = $this->OfferOption->getByItemList($itemsArr);
            foreach ($items as $key => $val) {
                $items[$key]['options'] = $options[$val['ID']];
            }
            $actOffer['items'] = $items;
        }
        return $actOffer;
    }

    public function post_offers()
    {
        $realizationDate = $this->Data->getPost('realizationDate');
        $description = $this->Data->getPost('description');
        $uID = '';

        $data['response'] = false;

        if ($realizationDate) {
            $created = date('Y-m-d H:i:s');
            $user = $this->Auth->getLoggedUser();
            $uID = $user['ID'];


            $lastID = $this->Offer->create(compact('realizationDate', 'description', 'created', 'uID'));
            if ($lastID > 0) {
                $data['response'] = true;

                $data['item'] = $this->Offer->get('ID', $lastID);
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        return $data;
    }


    public function put_offers()
    {

        $post = $this->Data->getAllPost();

        if ($post['finished']) {
            // updatuje created jak zostanie założone zapytanie ofertowe
            $post['created'] = date('Y-m-d H:i:s');
        }

        $user = $this->Auth->getLoggedUser();

        if (isset($post['uID']) && $this->Acl->isAuctionUser($user)) {

            $post['supervisor'] = 1;
            //$userFromPost = $this->User->get();


        } else {
            $post['uID'] = $user['ID'];
            /*if($user){
                
            }*/
        }


        $goodKeys = array('created', 'realizationDate', 'finished', 'description', 'agency', 'uID', 'supervisor');

        if (isset($post['ID']) && !empty($post['ID'])) {
            $ID = $post['ID'];
            unset($post['ID']);
        } else {
            $return['response'] = false;
            return $return;
        }

        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }
            if ($key == 'realizationDate') {
                $value = date('Y-m-d H:i:s', $value);
            }
            $return['response'] = $this->Offer->update($ID, $key, $value);
        }
        $one = $this->Offer->get('ID', $ID);

        if ($one && $one['sendMail'] == 0) {

            // Tu wysłać maila

            $listRecipients = $this->User->getEmails('@canon.pl');
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
                $send = $this->Mail->sendMail($mails, NULL, 'newOfferBM');
                if ($send) {
                    $this->Offer->update($one['ID'], 'sendMail', 1);
                }
            } else {
                $this->debug('Problem with mails: ' . var_export($mails, true));
            }

        }

        if ($one && $one['created'] == NULL) {
            $this->Offer->update($one['ID'], 'created', date('Y-m-d H:i:s'));
        }
        return $return;

    }

    /**
     * Dodaj item do ofery
     *
     * @method post_items
     *
     * @param {Integer} $groupID POST
     * @param {Integer} $typeID POST
     * @param {Integer} $formatID POST
     * @param {Integer} $pages POST
     * @param {Integer} $volume POST
     * @param {Integer} $formatWidth POST
     * @param {Integer} $formatHeight POST
     * @param {Array} $options POST
     * @return
     * @example
     * URL offerItems POST
     */
    public function post_items()
    {

        $groupID = $this->Data->getPost('groupID');
        $typeID = $this->Data->getPost('typeID');
        $formatID = $this->Data->getPost('formatID');
        $pages = $this->Data->getPost('pages');
        $volume = $this->Data->getPost('volume');
        $formatWidth = $this->Data->getPost('formatWidth');
        $formatHeight = $this->Data->getPost('formatHeight');
        $description = $this->Data->getPost('description');
        $signature = $this->Data->getPost('signature');
        $name = $this->Data->getPost('name');
        $singleDelivery = $this->Data->getPost('singleDelivery');
        $multiDelivery = $this->Data->getPost('multiDelivery');
        $post = $this->Data->getAllPost();
        $options = $post['options'];

        $data['response'] = false;
        $savedOptions = 0;

        $user = $this->Auth->getLoggedUser();

        // jest już offerta
        $actOffer = $this->Offer->getFinished(0, $user['ID']);
        if (!$actOffer) {
            $uID = $user['ID'];
            $created = date('Y-m-d H:i:s');
            $lastOfferID = $this->Offer->create(compact('uID', 'created'));
            $actOffer = $this->Offer->get('ID', $lastOfferID);
        }

        if ($actOffer['ID'] && $groupID && $typeID && $formatID && $volume && !empty($options)) {
            $offerID = $actOffer['ID'];

            $lastID = $this->OfferItem->create(compact('name', 'offerID', 'groupID', 'typeID', 'formatID', 'pages', 'volume', 'formatWidth', 'formatHeight', 'description', 'signature', 'singleDelivery', 'multiDelivery'));

            if ($lastID > 0) {

                $data['offer'] = $actOffer;
                $data['item'] = $this->OfferItem->getOneOfferItem($lastID);

                //$optionsArr = array();
                if (is_array($options)) {
                    foreach ($options as $o) {
                        $attrID = $o['attrID'];
                        $optID = $o['optID'];
                        $attrPages = $o['attrPages'];
                        $offerItemID = $lastID;
                        $lastOptionID = $this->OfferOption->create(compact('attrID', 'optID', 'attrPages', 'offerItemID'));
                        if ($lastOptionID > 0) {
                            //$optionsArr[] = $lastOptionID;
                            $savedOptions++;
                        }
                    }
                }
                if ($savedOptions > 0 && $lastID > 0) {
                    $data['response'] = true;
                    $data['item']['options'] = current($this->OfferOption->getByItemList(array($lastID)));
                }
            } else {
                // nie udało się dodać itema
                $data['error'] = 'Cannot add item';
            }
        } else {
            $data = $this->sendFailResponse('01');
        }
        $data['savedOptions'] = $savedOptions;
        return $data;
    }

    public function delete_items($ID)
    {
        $data['ID'] = $ID;
        $data['response'] = false;
        $removedFiles = 0;
        if (intval($ID) > 0) {
            if ($this->OfferItem->delete('ID', $ID)) {
                $this->OfferOption->delete('offerItemID', $ID);
                $list = $this->OfferItemFile->getByItem($ID);
                if (!empty($list)) {
                    foreach ($list as $file) {
                        $resultOfRemove = $this->_delete_file($file['ID']);

                        if (isset($resultOfRemove) && $resultOfRemove['response'] === true) {
                            if ($this->OfferItemFile->delete('ID', $file['ID'])) {
                                $removedFiles++;
                            }
                        }
                    }
                }
                $data['response'] = true;
                $data['removedFiles'] = $removedFiles;
            }
            return $data;
        } else {
            header("HTTP/1.0 403 Forbidden");
            return $data;
        }
    }

    /**
     * Pobierz drukarnie dla operatora(Canon)
     * @method companies
     * @return {Array}
     * @example
     * URL /offerCompanies
     *
     */
    public function companies()
    {
        $list = $this->OfferCompany->getAll();
        if (empty($list)) {
            $list = array();
        }
        return $list;
    }

    public function post_files($offerItemID)
    {

        $created = date('Y-m-d');
        $folder = 'offer_items';

        $name = $_FILES['itemFile']['name'];

        $fileID = $this->OfferItemFile->add(compact('created', 'offerItemID', 'name'));
        $lastFile = $this->OfferItemFile->get('ID', $fileID);

        $destFolder = $folder . '/' . $created . '/' . $offerItemID . '/';

        $res = $this->Uploader->upload($_FILES, 'itemFile', $destFolder, $lastFile['name']);

        return array('response' => $res, 'file' => $lastFile, 'url' => 'offerItems/getFile/' . $lastFile['ID']);

    }

    /**
     * @param $offerItemID
     * @return array
     */
    public function files($offerItemID)
    {
        $list = $this->OfferItemFile->getByItem($offerItemID);

        if (empty($list)) {
            $list = array();
        }

        return $list;
    }

    /**
     * @param $fileID
     * @param array $params
     */
    public function getFile($fileID, $params = array())
    {

        if (isset($params['fromCompanyID'])) {
            $fromCompanyID = $params['fromCompanyID'];
        } else {
            $fromCompanyID = companyID;
        }

        $folder = 'offer_items';

        $this->OfferItemFile->setRemote($fromCompanyID);
        $one = $this->OfferItemFile->get('ID', $fileID);

        $file = MAIN_UPLOAD . $folder . '/' . $one['created'] . '/' . $one['offerItemID'] . '/' . $one['name'];

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

        $one = $this->OfferItemFile->get('ID', $fileID);
        $folder = 'offer_items';

        if (!$one) {
            $result = $this->sendFailResponse('04');
        }

        $destFoleder = $folder . '/' . $one['created'] . '/' . $one['offerItemID'] . '/';


        if ($this->Uploader->remove($destFoleder, $one['name'])) {

            if ($this->OfferItemFile->delete('ID', $one['ID'])) {

                $result = array('response' => true, 'removed_item' => $one);

            } else {

                $result = $this->sendFailResponse('05');

            }

        } else {

            $result = $this->sendFailResponse('05');

        }

    }


    /**
     * @param $fileID
     */
    public function delete_files($fileID)
    {

        return $this->_delete_file($fileID);

    }

    public function put_files($fileID)
    {

        $file = $this->OfferItemFile->get('ID', $fileID);

        if (!$file) {
            return $this->sendFailResponse('06');
        }

        $post = $this->Data->getAllPost();
        $goodKeys = array('visible');
        foreach ($post as $key => $value) {
            if (!in_array($key, $goodKeys)) {
                continue;
            }
            $this->OfferItemFile->update($fileID, $key, $value);
        }
        $return['response'] = true;
        return $return;

    }

    public function userCanAddFile()
    {
        return array('response' => true);
    }
}
