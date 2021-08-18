<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 29.01.19
 * Time: 07:46
 */

namespace DreamSoft\Controllers\Calculate;

use DreamSoft\Controllers\Components\Price;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Delivery\DeliveryName;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigAttribute;
use DreamSoft\Models\PrintShopConfig\PrintShopConfigOption;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeLanguage;
use DreamSoft\Models\Behaviours\ProductManipulation;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeTax;
use DreamSoft\Models\Tax\Tax;
use DreamSoft\Models\Setting\Setting;
use DreamSoft\Models\PrintShop\PrintShopComplex;
use DreamSoft\Controllers\Components\FormatAssistant;
use DreamSoft\Controllers\Components\OptionAssistant;
use DreamSoft\Models\PrintShopProduct\PrintShopPage;
use DreamSoft\Controllers\Components\DescriptionAssistant;
use DreamSoft\Controllers\Components\DeliveryAssistant;
use DreamSoft\Libs\TwigExtensions\TranslateExtension;
use DreamSoft\Controllers\Components\CalculateAssistant;
use DreamSoft\Models\PrintShop\PrintShopRealizationTimeLanguage;
use DreamSoft\Models\PrintShopProduct\PrintShopFormat;
use DreamSoft\Models\PrintShopProduct\PrintShopFormatName;
use DreamSoft\Models\Content\StaticContent;
use DreamSoft\Models\Content\StaticContentLang;
use DreamSoft\Models\PrintShopProduct\PrintShopTypeDescription;
use DreamSoft\Models\PrintShopProduct\PrintShopOption;
use DreamSoft\Models\Template\TemplateSetting;
use Spipu\Html2Pdf\Exception\Html2PdfException;
use Spipu\Html2Pdf\Html2Pdf;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use Twig\Loader\FilesystemLoader;
use Twig\Environment as Twig_Environment;

/**
 * Class CalculateController
 * @package DreamSoft\Controllers\Calculate
 */
class CalculateController extends Controller
{
    public $useModels = array();
    /**
     * @var PrintShopGroup
     */
    private $PrintShopGroup;
    /**
     * @var PrintShopType
     */
    private $PrintShopType;
    /**
     * @var PrintShopTypeLanguage
     */
    private $PrintShopTypeLanguage;
    /**
     * @var ProductManipulation
     */
    private $ProductManipulation;
    /**
     * @var PrintShopTypeTax
     */
    private $PrintShopTypeTax;
    /**
     * @var Tax
     */
    private $Tax;
    /**
     * @var Setting
     */
    private $Setting;
    /**
     * @var PrintShopComplex
     */
    private $PrintShopComplex;
    /**
     * @var FormatAssistant
     */
    private $FormatAssistant;
    /**
     * @var PrintShopPage
     */
    private $PrintShopPage;
    /**
     * @var OptionAssistant
     */
    private $OptionAssistant;
    /**
     * @var DescriptionAssistant
     */
    private $DescriptionAssistant;
    /**
     * @var DeliveryAssistant
     */
    private $DeliveryAssistant;
    /**
     * @var TemplateSetting
     */
    private $TemplateSetting;
    /**
     * @var CalculateAssistant
     */
    private $CalculateAssistant;
    /**
     * @var DeliveryName
     */
    private $DeliveryName;
    /**
     * @var Price
     */
    private $Price;
    /**
     * @var PrintShopConfigAttribute
     */
    private $PrintShopConfigAttribute;
    /**
     * @var PrintShopConfigOption
     */
    private $PrintShopConfigOption;
    /**
     * @var PrintShopRealizationTimeLanguage
     */
    private $PrintShopRealizationTimeLanguage;
    /**
     * @var PrintShopFormat
     */
    private $PrintShopFormat;
    /**
     * @var PrintShopFormatName
     */
    private $PrintShopFormatName;
    /**
     * @var StaticContent
     */
    private $StaticContent;
    /**
     * @var StaticContentLang
     */
    private $StaticContentLang;
    /**
     * @var PrintShopTypeDescription
     */
    private $PrintShopTypeDescription;
    /**
     * @var PrintShopOption
     */
    private $PrintShopOption;

    /**
     * CalculateController constructor.
     * @param $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->PrintShopGroup = PrintShopGroup::getInstance();
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PrintShopTypeLanguage = PrintShopTypeLanguage::getInstance();
        $this->ProductManipulation = ProductManipulation::getInstance();
        $this->PrintShopTypeTax = PrintShopTypeTax::getInstance();
        $this->Tax = Tax::getInstance();
        $this->Setting = Setting::getInstance();
        $this->PrintShopComplex = PrintShopComplex::getInstance();
        $this->FormatAssistant = FormatAssistant::getInstance();
        $this->PrintShopPage = PrintShopPage::getInstance();
        $this->OptionAssistant = OptionAssistant::getInstance();
        $this->DescriptionAssistant = DescriptionAssistant::getInstance();
        $this->DeliveryAssistant = DeliveryAssistant::getInstance();
        $this->TemplateSetting = TemplateSetting::getInstance();
        $this->CalculateAssistant = CalculateAssistant::getInstance();
        $this->DeliveryName = DeliveryName::getInstance();
        $this->Price = Price::getInstance();
        $this->PrintShopConfigAttribute = PrintShopConfigAttribute::getInstance();
        $this->PrintShopConfigOption = PrintShopConfigOption::getInstance();
        $this->PrintShopRealizationTimeLanguage = PrintShopRealizationTimeLanguage::getInstance();
        $this->PrintShopFormat = PrintShopFormat::getInstance();
        $this->PrintShopFormatName = PrintShopFormatName::getInstance();
        $this->StaticContent = StaticContent::getInstance();
        $this->StaticContentLang = StaticContentLang::getInstance();
        $this->PrintShopTypeDescription = PrintShopTypeDescription::getInstance();
        $this->PrintShopOption = PrintShopOption::getInstance();
    }

    /**
     * @param $domainID
     */
    public function setDomainID($domainID)
    {
        parent::setDomainID($domainID);
        $this->OptionAssistant->setDomainID($domainID);
        $this->TemplateSetting->setDomainID($domainID);
        $this->CalculateAssistant->setDomainID($domainID);
        $this->Setting->setDomainID($domainID);
        $this->StaticContent->setDomainID($domainID);
        $this->PrintShopTypeTax->setDomainID($domainID);
        $this->ProductManipulation->setDomainID($domainID);
    }

    /**
     * @param $typeID
     * @return array
     */
    public function index($typeID)
    {
        $typeEntity = $this->PrintShopType->get('ID', $typeID);
        $group = $this->PrintShopGroup->customGet($typeEntity['groupID']);

        $type = $this->prepareType($typeEntity);

        $taxes = $this->getTaxesForProduct($group['ID'], $type['ID']);

        $typeDescriptions = $this->getTypeDescriptions($group['ID'], $type['ID']);

        if ($type['complex']) {
            $complex = $this->getComplex($type['ID']);
        } else {
            $type['typeID'] = $type['ID'];
            $complex[0] = array(
                'ID' => $type['ID'],
                'name' => $type['name'],
                'products' => array($type)
            );
        }

        $formats = array();
        $pages = array();
        $selectOptions = array();
        if ($complex) {
            foreach ($complex as $row) {
                if ($row['products']) {
                    foreach ($row['products'] as $product) {
                        $formats[$product['typeID']] = $this->getFormats($product['groupID'], $product['typeID'], $type['ID']);
                        $pages[$product['typeID']] = $this->getPages($product['groupID'], $product['typeID']);
                        $selectOptions[$product['typeID']] = $this->getSelectOptions($product['typeID']);
                    }
                }
            }
        } else {
            $formats[$type['ID']] = $this->getFormats($group['ID'], $type['ID'], 0);
            $pages[$type['ID']] = $this->getPages($group['ID'], $type['ID']);
            $selectOptions[$type['ID']] = $this->getSelectOptions($type['ID']);
        }

        $params = array();
        $currency = DEFAULT_CURRENCY;
        $deliveries = $this->DeliveryAssistant->getDeliveries($params, $currency);

        return compact(
            'group',
            'type',
            'taxes',
            'complex',
            'formats',
            'pages',
            'selectOptions',
            'typeDescriptions',
            'deliveries'
        );

    }

    /**
     * @param $typeEntity
     * @return array|mixed
     */
    private function prepareType($typeEntity)
    {
        if (!$typeEntity) {
            return $this->sendFailResponse('06');
        }

        $ID = $typeEntity['ID'];

        $this->PrintShopType->setGroupID($typeEntity['groupID']);
        $data = $this->PrintShopType->get('ID', $ID);
        $languages = $this->PrintShopTypeLanguage->get('typeID', $ID, true);

        $category = $this->ProductManipulation->selectCategory($typeEntity['groupID'], $ID);
        $group = $this->PrintShopGroup->customGet($typeEntity['groupID']);

        if (!$data) {
            return $this->sendFailResponse('06');
        } else {
            if (!empty($languages)) {

                foreach ($languages as $key => $value) {

                    $data['names'][$value['lang']] = $value['name'];
                    $data['icons'][$value['lang']] = $value['icon'];
                    $data['slugs'][$value['lang']] = $value['slug'];
                }
            }
            $data['category'] = $category;
            $data['group']['slugs'] = $group['slugs'];
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    private function getTaxesForProduct($groupID, $typeID)
    {
        if (!$typeID) {
            return array();
        }

        $selected = $this->PrintShopTypeTax->getByType($typeID);


        if (empty($selected) && $groupID) {
            $selected = $this->PrintShopTypeTax->getByGroup($groupID);
        }

        $data = array();
        if( $selected ) {
            foreach ($selected as $key => $taxID) {
                $one = $this->Tax->customGet($taxID, 1);
                if ($this->Setting->getValue('defaultTax') == $taxID) {
                    $one['default'] = 1;
                }
                $data[] = $one;
            }
        }


        return $data;
    }

    /**
     * @param $typeID
     * @return array|bool
     */
    private function getComplex($typeID)
    {
        $this->PrintShopComplex->setTypeID($typeID);

        $data = $this->PrintShopComplex->getAll();

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @param $complexID
     * @return array|mixed
     */
    private function getFormats($groupID, $typeID, $complexID)
    {
        try {
            $data = $this->FormatAssistant->formats($groupID, $typeID, $complexID, NULL, 1);
        } catch (\Exception $exception) {
            $this->debug($exception->getMessage());
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    private function getPages($groupID, $typeID)
    {
        $this->PrintShopPage->setGroupID($groupID);
        $this->PrintShopPage->setTypeID($typeID);

        $data = $this->PrintShopPage->getAll();

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $typeID
     * @return array
     */
    private function getSelectOptions($typeID)
    {
        $data = $this->OptionAssistant->getSelectOptions($typeID);

        if (!$data) {
            $data = array();
        }
        return $data;
    }

    /**
     * @param $groupID
     * @param $typeID
     * @return array
     */
    private function getTypeDescriptions($groupID, $typeID)
    {
        $data = $this->DescriptionAssistant->getTypeDescriptions($groupID, $typeID);

        if (!$data) {
            $data = array();
        }
        return $data;
    }

    private function printOfferData($params)
    {
        $params['limitedVolumes'] = 1;

        $data = $this->CalculateAssistant->prepareRealizationTimes($params);

        $deliveriesAggregate = array();
        $sumDeliveryPrice = 0;
        $sumDeliveryPriceGross = 0;
        foreach ($params['productAddresses'] as $productAddress) {
            $deliveriesAggregate[] = $productAddress['deliveryID'];
            $sumDeliveryPrice += floatval(str_replace(',', '.', $productAddress['price']));
            $sumDeliveryPriceGross += floatval(str_replace(',', '.', $productAddress['priceGross']));
        }

        $selectedDeliveries = array();
        $dNames = $this->DeliveryName->getNames($deliveriesAggregate);
        foreach ($deliveriesAggregate as $ID) {
            $selectedDeliveries[] = $dNames[$ID];
        }
        $data['selectedDeliveries'] = $selectedDeliveries;

        $data['sumDeliveryPrice'] = $this->Price->getPriceToView($sumDeliveryPrice);
        $data['sumDeliveryPriceGross'] = $this->Price->getPriceToView($sumDeliveryPrice);

        $price = $priceGross = 0;
        foreach ($data['volumes'] as $key => $volume) {
            if ($volume['calculation']['volume'] == $params['activeVolume']) {
                $price = floatval(str_replace(',', '.', $volume['calculation']['price']));
                $priceGross = floatval(str_replace(',', '.', $volume['calculation']['priceBrutto']));
            }
            $unitPrice = floatval(str_replace(',', '.', $volume['calculation']['price'])) / $volume['calculation']['volume'];
            $unitPriceGross = floatval(str_replace(',', '.', $volume['calculation']['priceBrutto'])) / $volume['calculation']['volume'];
            $data['volumes'][$key]['calculation']['unitPrice'] = $this->Price->getPriceToView($unitPrice * 100);
            $data['volumes'][$key]['calculation']['unitPriceGross'] = $this->Price->getPriceToView($unitPriceGross * 100);
        }

        $data['totalPrice'] = $this->Price->getPriceToView(($price + $sumDeliveryPrice) * 100);
        $data['totalPriceGross'] = $this->Price->getPriceToView(($priceGross + $sumDeliveryPriceGross) * 100);
        $data['activeVolume'] = $params['activeVolume'];
        $data['amount'] = $params['amount'];

        $types = $this->PrintShopType->customGetByList(array($params['typeID']));
        $data['type'] = current($types);

        $aggregateAttributes = array();
        $aggregateOptions = array();
        $aggregateTypes = array();
        foreach ($params['products'] as $product) {
            $aggregateTypes[] = $product['typeID'];
            foreach ($product['options'] as $row) {
                $aggregateAttributes[] = $row['attrID'];
                $aggregateOptions[] = $row['optID'];
            }
        }

        $attributes = $this->prepareAttributeNames($aggregateAttributes);
        $options = $this->prepareOptionNames($aggregateOptions);

        $productOptions = $this->PrintShopOption->getSelectedOptionSorted($params['typeID'], $aggregateOptions);

        if($productOptions) {
            foreach ($productOptions as $productOptionKey => $productOption) {
                $options[$productOptionKey]['invisible'] = $productOption['invisible'];
            }
        }

        $typeLanguages = $this->prepareTypeLanguages($aggregateTypes);

        foreach ($params['products'] as $productKey => $product) {
            foreach ($product['options'] as $optionKey => $row) {
                if( array_key_exists($row['attrID'], $attributes) ) {
                    $params['products'][$productKey]['options'][$optionKey]['attribute'] = $attributes[$row['attrID']];
                }
                if( array_key_exists($row['optID'], $options) ) {
                    $params['products'][$productKey]['options'][$optionKey]['option'] = $options[$row['optID']];
                }
            }
        }

        $selectedRealisationTime = array();
        foreach ($data['realisationTimes'] as $realisationTime) {
            if( $realisationTime['ID'] == $params['realizationTimeID'] ) {
                $selectedRealisationTime = $realisationTime;
                break;
            }
        }

        $data['realisationTimeDate'] = $selectedRealisationTime['date'];

        foreach( $selectedRealisationTime['volumes'] as $volume ) {
            if( $volume['volume'] == $params['activeVolume'] && $volume['date'] ) {
                $data['realisationTimeDate'] = $volume['date'];
            }
        }

        $types = $this->PrintShopType->getByList($aggregateTypes);

        foreach ($params['products'] as $productKey => $product) {
            $params['products'][$productKey]['format'] = $this->PrintShopFormat->customGet($product['formatID']);

            $customNames = $this->PrintShopFormatName->getByType($product['typeID']);

            if( array_key_exists($product['typeID'], $typeLanguages) ) {
                $params['products'][$productKey]['typeLanguage'] = $typeLanguages[$product['typeID']];
            } else {
                $params['products'][$productKey]['typeLanguage'] = array();
            }

            if( array_key_exists($product['typeID'], $types) ) {
                $params['products'][$productKey]['type'] = $types[$product['typeID']];
            } else {
                $params['products'][$productKey]['type'] = array();
            }

            if( $customNames ) {

                $sortedCustomNames = array();
                foreach ($customNames as $row) {
                    $sortedCustomNames[$row['lang']] = $row['name'];
                }

                $params['products'][$productKey]['format']['customNames'] = $sortedCustomNames;
            }
        }

        $data['products'] = $params['products'];

        $data['staticText'] = $this->prepareStaticText('static.print_offer');

        $imagesFromGallery = $this->prepareImagesFromGallery($params['typeID']);
        if( $imagesFromGallery && is_array($imagesFromGallery) ) {
            $data['imageFromGallery'] = current($imagesFromGallery);
        } else {
            $data['imageFromGallery'] = array();
        }

        return $data;
    }

    /**
     * @param $data
     * @return string
     * @throws LoaderError
     * @throws RuntimeError
     * @throws SyntaxError
     */
    private function printOfferHTML($data)
    {
        $loader = new FilesystemLoader(STATIC_PATH . 'templates');

        $twig = new Twig_Environment($loader, array(
            'auto_reload' => true
        ));
        $twig->addExtension(new TranslateExtension());

        $templateID = 119;
        $templateName = 'print-offer';

        $templateSetting = $this->TemplateSetting->getOne($templateID, 1);

        $templatePath = 'default/' . $templateID . '/' . $templateName . '.html';

        if ($templateSetting && $templateSetting['source'] == 1) {
            $templatePath = companyID . '/' . $templateID . '/' . $templateName . '.html';
        } elseif ($templateSetting && $templateSetting['source'] == 2) {
            $templatePath = companyID . '/' . $templateID . '/' . $this->getDomainID() . '/' . $templateName . '.html';
        }

        $template = $twig->load($templatePath);

        $logoFile = MAIN_UPLOAD . 'uploadedFiles' . '/' . companyID . '/' . 'logos' . '/' . $this->getDomainID() . '/logo';

        $content = $template->render(
            array(
                'logoPath' => $logoFile,
                'offerDate' => date(DATE_FORMAT),
                'print_offer_text' => 'test',
                'lang' => lang,
                'selectedDeliveries' => $data['selectedDeliveries'],
                'currency' => $data['currency'],
                'totalPrice' => $data['totalPrice'],
                'totalPriceGross' => $data['totalPriceGross'],
                'activeVolume' => $data['activeVolume'],
                'volumes' => $data['volumes'],
                'type' => $data['type'],
                'complexProducts' => $data['products'],
                'amount' => $data['amount'],
                'realisationTimeDate' => $data['realisationTimeDate'],
                'tax' => $data['tax'],
                'staticText' => $data['staticText'],
                'imageFromGallery' => $data['imageFromGallery']
            )
        );

        return $content;
    }

    /**
     * @param $params
     * @return array
     * @throws LoaderError
     * @throws RuntimeError
     * @throws SyntaxError
     */
    private function generate($params)
    {
        try {

            $html2pdf = new Html2Pdf('P', 'A4', 'pl', true, 'UTF-8');
            $html2pdf->setTestTdInOnePage(false);
            $html2pdf->addFont('freesans', 'regular', BASE_DIR.'libs/tcpdf/fonts/freesans.php');
            $html2pdf->setDefaultFont('freesans');

            $printOfferData = $this->printOfferData($params);

            $content = '';
            $content .= $this->printOfferHTML($printOfferData);

            $html2pdf->writeHTML($content);

            $outputFolder = date('Y-m-d');

            if (!is_dir(MAIN_UPLOAD . 'tmp/' . $outputFolder)) {
                mkdir(MAIN_UPLOAD . 'tmp/' . $outputFolder, 0777);
            }
            $path = MAIN_UPLOAD . 'tmp/' . $outputFolder . '/print_offer.pdf';

            $html2pdf->Output($path, 'F');
            $link = STATIC_URL . 'tmp/' . $outputFolder . '/print_offer.pdf';
            $res = array();
            $res['path'] = $path;
            $res['invoiceData'] = $printOfferData;
            $res['link'] = $link;
            $res['success'] = true;
        } catch (Html2PdfException $e) {
            return array(
                'info' => $e->getMessage(),
                'error' => true,
                'response' => false
            );
        }
        return $res;
    }

    public function patch_printOffer()
    {
        $post = $this->Data->getAllPost();
        $generated = $this->generate($post);
        if ($generated['success'] == true) {
            return $generated;
        }

        return $this->sendFailResponse('13');
    }

    /**
     * @param $aggregateAttributes
     * @return array|bool|mixed
     */
    private function prepareAttributeNames($aggregateAttributes)
    {
        $attributes = $this->PrintShopConfigAttribute->customGetByList($aggregateAttributes);

        if( !$attributes ) {
            return array();
        }

        return $attributes;
    }

    /**
     * @param $aggregateOptions
     * @return array
     */
    private function prepareOptionNames($aggregateOptions)
    {
        $options = $this->PrintShopConfigOption->customGetByList($aggregateOptions);

        if( !$options ) {
            return array();
        }

        return $options;
    }

    /**
     * @param $aggregateTypes
     * @return array
     */
    private function prepareTypeLanguages($aggregateTypes)
    {
        $languages = $this->PrintShopTypeLanguage->getByList($aggregateTypes);

        if( !$languages || !is_array($languages) ) {
            return array();
        }

        $result = array();

        foreach ($languages as $language) {
            $result[$language['typeID']][$language['lang']] = $language['name'];
        }

        return $result;
    }

    /**
     * @param $key
     * @return mixed
     */
    private function prepareStaticText($key)
    {
        $printOfferContent = $this->StaticContent->get('key', $key);
        $languages = $this->StaticContentLang->get('staticContentID', $printOfferContent['ID'], true);

        if( $languages ) {
            foreach ($languages as $language) {
                $printOfferContent['content'][$language['lang']] = $language['content'];
            }
        }

        return $printOfferContent;
    }

    private function prepareImagesFromGallery($typeID, $descType = 5)
    {
        $data = $this->PrintShopTypeDescription->customGetAll($typeID);
        if( !$data ) {
            return array();
        }
        $firstGalleryDescription = array();
        foreach ($data as $description) {
            if( $description['descType'] == $descType ) {
                $firstGalleryDescription = $description;
                break;
            }
        }

        $fileFolder =  UPLOADED_FILES_DIR . '/';
        $thumbFolder = UPLOADED_FILES_DIR . '/' . companyID . '/thumbs/';

        $files = array();

        if(array_key_exists('descID', $firstGalleryDescription)) {
            $files = $this->PrintShopTypeDescription->getFilesByList(array($firstGalleryDescription['descID']));
        }

        if (!empty($files)) {
            foreach ($files as $descID => $fls) {
                foreach ($fls as $kf => $f) {
                    $files[$descID][$kf]['path'] = MAIN_UPLOAD . $fileFolder . companyID . '/' . $f['path'];
                    $files[$descID][$kf]['pathThumb'] = MAIN_UPLOAD . $thumbFolder . $f['path'];
                }
            }
        }

        return current($files);

    }

}