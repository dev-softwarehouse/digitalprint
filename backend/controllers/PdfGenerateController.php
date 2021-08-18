<?php
/**
 * Description of PdfGenerateController
 * @class PdfGenerateController
 * @author PiotrB
 * @description Klasa generujÄ…ca Pdf'y wyjĹ›ciowe z jsona
 */
/*
 *
 ini_set('max_execution_time', 600);
ini_set('display_errors', 'On');
*/
include_once '../libs/tcpdf/tcpdf.php';

use DreamSoft\Models\PrintShopProduct\PrintShopType;
use DreamSoft\Models\PrintShopProduct\PrintShopGroup;
use DreamSoft\Core\Controller;
use DreamSoft\Models\Domain\DomainRoot;

/**
 * Class PdfGenerateController
 */
class PdfGenerateController extends Controller
{
    /**
     * @var array
     */
    public $useModels = array();

    /**
     * @var
     */
    protected $PrintShopType;
    /**
     * @var
     */
    protected $PSG;
    /**
     * @var mixed
     */
    public $ProjectID;
    /**
     * @var bool|string
     */
    private $ProjectData;
    /**
     * @var mixed
     */
    private $bitmapContent;
    /**
     * @var
     */
    private $currentObject;
    /**
     * @var
     */
    private $fonts;
    /**
     * @var string
     */
    private $orientation;
    /**
     * @var string
     */
    private $unit;
    /**
     * @var array
     */
    private $pageFormat;
    /**
     * @var string
     */
    private $unicode;
    /**
     * @var bool
     */
    private $encoding;
    /**
     * @var bool
     */
    private $diskcache;
    /**
     * @var bool
     */
    private $pdfa;
    /**
     * @var TCPDF
     */
    private $pdf;
    /**
     * @var
     */
    private $configs;
    /**
     * @var string
     */
    private $tmpDir;
    /**
     * @var array
     */
    private $useTmpFileArray;
    /**
     * @var mixed
     */
    private $outputMethod;
    /**
     * @var mixed
     */
    private $isPreview;
    /**
     * @var DomainRoot
     */
    private $DomainRoot;

    /**
     *
     * @constructor
     * @param {Array} $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->DomainRoot = DomainRoot::getInstance();
        $this->ProjectID = filter_input(INPUT_GET, 'projectID');
        if (!$this->ProjectID || $this->ProjectID == "") {
            return;
        }
        $domainRoot = $this->DomainRoot->get('companyID', companyID);
        $this->ProjectData = file_get_contents('https://digitalprint.pro:' . $domainRoot['port'] . '/getProjectTimber?projectID=' . $this->ProjectID);
        $this->bitmapContent = json_decode($this->ProjectData, TRUE);
        $this->PrintShopType = PrintShopType::getInstance();
        $this->PSG = PrintShopGroup::getInstance();
        $this->tmpDir = ini_get('upload_tmp_dir');
        $this->fonts = $this->bitmapContent['fonts'];
        $this->orientation = 'L';
        $this->unit = 'mm';
        $this->pageFormat = array(10, 10000);
        $this->unicode = 'UTF-8';
        $this->encoding = false;
        $this->diskcache = false;
        $this->pdfa = false;
        $this->pdf = new TCPDF($this->orientation, $this->unit, $this->pageFormat, $this->unicode, $this->encoding, $this->diskcache, $this->pdfa);
        $this->pdf->setPrintFooter(false);
        $this->pdf->setPrintHeader(false);
        $this->pdf->SetDisplayMode('fullpage');
        $this->pdf->SetAutoPageBreak(false);
        $this->useTmpFileArray = array();
        $this->outputMethod = filter_input(INPUT_GET, 'out');
        if ($this->outputMethod == '1') {
            ini_set('display_errors', 'Off');
            error_reporting(E_CORE_ERROR);
        }
        $this->isPreview = filter_input(INPUT_GET, 'min');
    }

    /**
     *
     */
    public function __destruct()
    {
        if (!empty($this->useTmpFileArray)) {
            foreach ($this->useTmpFileArray as $u) {
                unlink($u);
            }
        }
    }

    /**
     * @param $a
     * @param $b
     * @return bool
     */
    private function pageSort($a, $b)
    {
        if (intval($a['order']) > intval($b['order'])) {
            return true;
        }
        return false;
    }

    /**
     * @param int $hidden
     */
    public function generatePdf($hidden = 0)
    {
//        return $this->bitmapContent
        $this->setDebugFile('pdfGenerate');
        $data_first = $this->bitmapContent['data'];
        $this->debug('-------------- #1');
        $this->debug($data_first);
        usort($data_first, array($this, 'pageSort'));
        $this->debug('-------------- #2');
        $this->debug($data_first);
        $data = $data_first;
//*******Wyswietlanie wejĹ›ciowego JSON'a w konsoli********// 
        if (isset($_GET['console']) && $_GET['console'] == 1) {
            $this->sendToConsole();
        }
//*************************Iteracja po wszystkich stronach w strukturze*******************//
        foreach ($data as $key => $value) {
            $p = $value['scene'];
            if ($value['vacancy'] == true) {
                if ($this->bitmapContent['width'] / 2 > $this->bitmapContent['height']) {
                    $orientation = 'L';
                } else {
                    $orientation = 'P';
                }
                $this->pdf->addPage($orientation, array($this->bitmapContent['width'] / 2, $this->bitmapContent['height']));
            } else {
                if ($this->bitmapContent['width'] > $this->bitmapContent['height']) {
                    $orientation = 'L';
                } else {
                    $orientation = 'P';
                }
                $this->pdf->addPage($orientation, array($this->bitmapContent['width'], $this->bitmapContent['height']));
            }
            foreach ($p as $keyObj => $obj) {

                $this->currentObject = $obj['object'];
                if ($obj['objectType'] === "proposedImage") {
                    if ($this->isPreview == 1) {
                        $imagePath = $this->currentObject['objectInside']['ProjectImage']['thumbnail'];
                    } else {
                        $imagePath = $this->currentObject['objectInside']['ProjectImage']['imageUrl'];
                    }

                    $cropImage = $this->cropImage($imagePath);
                    $this->addWithRotation($imagePath, $cropImage);

                    if ($this->currentObject['displaySimpleBorder']) {
                        $this->makeBorder();
                    }
                } elseif ($obj['objectType'] === 'proposedText') {
                    if (!isset($this->currentObject['horizontalPadding'])) {

                    } else {
                        $this->addText();
                    }
                } else {
                    $this->addNoProposedObject();
                }
            }
//****************SPADY********************//
            $this->addSlope($p['width'], $p['height']);
//            stop po jednej stronie WARN!!
//break;
        }
//******WyjĹ›cie i zapis/wyĹ›wietlenie wygenerowanego PDF'a**** //
        $this->outputPdf($hidden);
    }

    /**
     * @param $mm
     * @return float
     */
    private function mm_to_pt($mm)
    {
        $pt = $mm * 2.834645669291;
        return $pt;
    }

    /**
     * @param $imagePath
     * @param $blurValue
     * @param $shadowColor
     * @param $thumbW
     * @param $thumbH
     * @return array
     */
    private function makeShadow($imagePath, $blurValue, $shadowColor, $thumbW, $thumbH)
    {
        $im = new Imagick($imagePath);
        $im->thumbnailimage($thumbW * 3, $thumbH * 3);
        $im->setImageFormat("png");
        $black = new Imagick();
        $black->newImage($im->getImageWidth(), $im->getImageHeight(), "black");
        $im->compositeimage($black, Imagick::COMPOSITE_OVER, 0, 0);
        $shadow = $im->clone();
        $shadow->setImageBackgroundColor(new ImagickPixel($shadowColor));
        $shadow->shadowImage(100, $blurValue * 3, 0, 0);
        $shadowPic = array();
        $shadowPic['base'] = $shadow->getimageblob();
        $shadowPic['width'] = $shadow->getimagewidth() / 3;
        $shadowPic['height'] = $shadow->getimageheight() / 3;
        return $shadowPic;
    }

    /**
     * @param $imagePath
     * @param $blurValue
     * @param $shadowColor
     * @param $thumbW
     * @param $thumbH
     * @return array
     */
    private function makeTextShadow($imagePath, $blurValue, $shadowColor, $thumbW, $thumbH)
    {
        $im = new Imagick($imagePath);
        $im->thumbnailImage($thumbW, $thumbH);
        $im->setImageFormat("png");
        $shadow = $im->clone();
        $shadow->setImageBackgroundColor(new ImagickPixel($shadowColor));
        $shadow->shadowImage(100, $blurValue, 0, 0);
//        $shadow->compositeImage($im, Imagick::COMPOSITE_OVER, 0, 0);
        $shadowPic = array();
        $shadowPic['base'] = $shadow->getimageblob();
        $shadowPic['width'] = $shadow->getimagewidth();
        $shadowPic['height'] = $shadow->getimageheight();
        return $shadowPic;
    }

    /**
     *
     */
    private function makeBorder()
    {
        $borderWidth = $this->currentObject['borderWidth'];
        if ($borderWidth > 0) {
            $proposedWidth = $this->currentObject['size']['width'];
            $proposedHeight = $this->currentObject['size']['height'];
            $proposedPositionX = $this->currentObject['pos']['x'] - ($proposedWidth / 2);
            $proposedPositionY = $this->currentObject['pos']['y'] - ($proposedHeight / 2);
            $this->pdf->StartTransform();
            $borderWidth = $this->currentObject['borderWidth'];
            $rotateX = $this->currentObject['pos']['x'];
            $rotateY = $this->currentObject['pos']['y'];
            $rotateAngle = -$this->currentObject['rotation'];
            $borderObjWidth = $proposedWidth - $borderWidth;
            $borderObjHeight = $proposedHeight - $borderWidth;
            $borderObjX = $proposedPositionX + $borderWidth / 2;
            $borderObjY = $proposedPositionY + $borderWidth / 2;
            $borderColor = $this->currentObject['borderColor'];
            $borderColor = str_replace('rgba(', '', $borderColor);
            $borderColor = str_replace(')', '', $borderColor);
            $borderColor = explode(',', $borderColor);
            $red = $borderColor[0];
            $green = $borderColor[1];
            $blue = $borderColor[2];
            $alpha = $borderColor[3];
            $borderStyle = array('width' => $borderWidth, 'color' => array($red, $green, $blue));
            $this->pdf->setAlpha($alpha);
            $this->pdf->SetLineStyle($borderStyle);
            $this->pdf->Rotate($rotateAngle, $rotateX, $rotateY);
            $this->pdf->Rect($borderObjX, $borderObjY, $borderObjWidth, $borderObjHeight, '');
            $this->pdf->StopTransform();
            $this->pdf->setAlpha(1);
            $this->pdf->SetLineStyle(array('width' => 0, 'color' => array(0, 255, 0)));
        }
    }

    /**
     * @param $imagePath
     * @param $cropImage
     */
    private function addWithRotation($imagePath, $cropImage)
    {
        $proposedWidth = $this->currentObject['size']['width'];
        $proposedHeight = $this->currentObject['size']['height'];
        $proposedPositionX = $this->currentObject['pos']['x'] - ($proposedWidth / 2);
        $proposedPositionY = $this->currentObject['pos']['y'] - ($proposedHeight / 2);
        $rotateX = $this->currentObject['pos']['x'];
        $rotateY = $this->currentObject['pos']['y'];
        $rotateAngle = -$this->currentObject['rotation'];
        if ($this->currentObject['dropShadow']) {
            $shadowColor = $this->currentObject['shadowColor'];
            $shadowBlur = $this->currentObject['shadowBlur'];
            $shadowOffsetX = $this->currentObject['shadowOffsetX'];
            $shadowOffsetY = $this->currentObject['shadowOffsetY'];
            $shadowPict = $this->makeShadow($imagePath, $shadowBlur, $shadowColor, $proposedWidth, $proposedHeight);
            $shadowPositionX = $this->currentObject['x'] - ($shadowPict['width'] / 2);
            $shadowPositionY = $this->currentObject['y'] - ($shadowPict['height'] / 2);
            $this->pdf->StartTransform();
            $this->pdf->Rotate($rotateAngle, $rotateX, $rotateY);
            $this->pdf->Image('@' . $shadowPict['base'], $shadowPositionX + $shadowOffsetX, $shadowPositionY + $shadowOffsetY, $shadowPict['width'], $shadowPict['height']);
            $this->pdf->StopTransform();
        }
        $this->pdf->StartTransform();
        $this->pdf->Rotate($rotateAngle, $rotateX, $rotateY);
        $this->pdf->setAlpha(1);
        $this->pdf->Image('@' . $cropImage, $proposedPositionX, $proposedPositionY, $proposedWidth, $proposedHeight);
        $this->pdf->StopTransform();
    }

    /**
     * @param $imagePath
     * @return string
     */
    private function cropImage($imagePath)
    {
        $objectInsideWidth = $this->currentObject['objectInside']['ProjectImage']['width'];
        $objectInsideHeight = $this->currentObject['objectInside']['ProjectImage']['height'];
        $objectInsideTrueWidth = $this->currentObject['objectInside']['ProjectImage']['trueWidth'];
        $objectInsideTrueHeight = $this->currentObject['objectInside']['ProjectImage']['trueHeight'];
        $imageSizeX = $objectInsideWidth * $this->currentObject['objectInside']['scaleX'];
        $imageSizeY = $objectInsideHeight * $this->currentObject['objectInside']['scaleY'];
        $diffScaleY = $imageSizeY / $objectInsideTrueHeight;
        $diffScaleX = $imageSizeX / $objectInsideTrueWidth;

        $objectInsideX = $this->currentObject['objectInside']['x'] / $diffScaleX;
        $objectInsideY = $this->currentObject['objectInside']['y'] / $diffScaleY;
        $originWidth = $this->currentObject['size']['trueWidth'];
        $originHeight = $this->currentObject['size']['trueHeight'];
        $cropWidth = $this->currentObject['size']['width'] / $diffScaleX;
        $cropHeight = $this->currentObject['size']['height'] / $diffScaleY;
        $cropX = ($objectInsideTrueWidth / 2) - $objectInsideX;
        $cropY = ($objectInsideTrueHeight / 2) - $objectInsideY;
        $imagick = new Imagick($imagePath);
        if ($this->isPreview == 1) {
            $imagick->resizeImage($originWidth, $originHeight, Imagick::FILTER_LANCZOS, 1);
        }
        $imagick->cropImage($cropWidth, $cropHeight, $cropX, $cropY);
        $cropImage = $imagick->getImageBlob();
        $image = base64_decode($cropImage);
        $proposedWidth = $this->currentObject['width'];
        $proposedHeight = $this->currentObject['height'];
        $proposedPositionX = $this->currentObject['x'] - ($proposedWidth / 2);
        $proposedPositionY = $this->currentObject['y'] - ($proposedHeight / 2);
        return $cropImage;
    }

    /**
     *
     */
    private function sendToConsole()
    {
        echo '<script>console.log(' . $this->ProjectData . ');</script>';
        echo 'Zobacz do konsoli!';
        die();
    }

    /**
     * @param $pageWidth
     * @param $pageHeight
     */
    private function addSlope($pageWidth, $pageHeight)
    {
        $this->pdf->setAlpha(1);
        $this->pdf->SetLineStyle(array('width' => 0, 'color' => array(0, 0, 0)));

        $print = false;
        $view = true;

        $this->pdf->startLayer('Slope', $print, $view);
        $this->pdf->SetLineStyle(array('width' => 0, 'color' => array(0, 0, 0)));
        $this->pdf->SetDrawColor(0, 0, 0, 100);
        $this->pdf->SetFillColor(0, 0, 0, 100);
        $this->pdf->SetAlpha(0.3);
        /* spad lewy */
        $this->pdf->Rect(0, 0, $this->bitmapContent['formatSlope'], $pageHeight, 'DF');
        /* spad gĂłrny */
        $this->pdf->Rect(0, 0, $pageWidth, $this->bitmapContent['formatSlope'], 'DF');
        /* spad dolny */
        $this->pdf->Rect(0, ($pageHeight - $this->bitmapContent['formatSlope']), $pageWidth, $this->bitmapContent['formatSlope'], 'DF');
        /* spad prawy */
        $this->pdf->Rect(($pageWidth - $this->bitmapContent['formatSlope']), 0, $this->bitmapContent['formatSlope'], $pageHeight, 'DF');
        $this->pdf->endLayer();
    }

    /**
     * @return mixed|null|string|string[]
     */
    private function fontImport()
    {
        $font = TCPDF_FONTS::addTTFfont('libs/tcpdf/fonts/Frijole-Regular.ttf', 'TrueTypeUnicode');
        $this->pdf->SetFont($font, '', 20, '', false);
        $this->pdf->setFontSubsetting(true);
        return $font;
    }

    /**
     *
     */
    private function addText()
    {
        $w = $this->currentObject['size']['width'];
        $h = $this->currentObject['size']['height'];
        $x = $this->currentObject['pos']['x'] - ($w / 2);
        $y = $this->currentObject['pos']['y'] - ($h / 2);
        $pdf2 = new TCPDF();
        $rotateX = $this->currentObject['x'];
        $rotateY = $this->currentObject['y'];
        $angle = -$this->currentObject['rotation'];
        $verticalPadding = $this->currentObject['verticalPadding'];
        $horizontalPadding = $this->currentObject['horizontalPadding'];
        $w_pt = $this->mm_to_pt($w);
        $h_pt = $this->mm_to_pt($h);
        $html = '';
        $wspan = $this->mm_to_pt($w);
        $shadowOffsetX = $this->currentObject['shadowOffsetX'];
        $shadowOffsetY = $this->currentObject['shadowOffsetY'];
        $shadowBlur = $this->currentObject['shadowBlur'];
        $shadowColor = 'rgba(0, 0, 0, 255)';

        $backgroundVisible = $this->currentObject['showBackground'];
        $backgroundColor = $this->currentObject['backgroundColor'];
        $backgroundOpacity = $this->currentObject['backgroundOpacity'];
        $font = '';
        $fontType = '';
        $fontTypeName = '';
        $fontFamily = '';
        $fontType = '';
        if (isset($this->currentObject['content'])) {
            foreach ($this->currentObject['content'] as $objKeyId => $contentLine) {
                $currentLetterLine = '1';
                $lineH = array();
                foreach ($contentLine['letters'] as $letterKey => $l) {
                    $letterSize = $this->mm_to_pt($l['size']);
                    $mmLetterSize = $l['size'];
                    $textLineHeight = $this->mm_to_pt($l['lineHeight']);
                    if (!array_key_exists($currentLetterLine, $lineH) || $lineH[$currentLetterLine] < $l['lineHeight']) {
                        $lineH[$currentLetterLine] = $l['lineHeight'];
                    }
                    if (!($currentLetterLine == $l['line'])) {
                        $html .= '<br />';
                        $currentLetterLine = $l['line'];
                    }
                    $letterColor = $l['color'];
                    $this->pdf->SetFontSize($l['size']);
                    $fontFamily = $l['fontFamily'];
                    $fontType = $l['fontType']['italic'] . '-' . $l['fontType']['regular'];
                    if ($fontType == '0-0') {
                        $fontTypeName = 'Bold';
                    } elseif ($fontType == '1-0') {
                        $fontTypeName = 'Italic';
                    } elseif ($fontType == '0-1') {
                        $fontTypeName = 'Regular';
                    }
                    $html .= '<span style="text-align:center; color:' . $letterColor . '; font-size:' . $letterSize . 'pt; font-family: Open sans">' . $l['text'] . '</span>';
//imagestring(temp, $font, $x, $y, $currentLetterLine, $color)
                }
                $lineHeightSum = '';
                foreach ($lineH as $lh) {
                    $lineHeightSum += $lh;
                }
                $horizontalCenterPadding = ($h - $lineHeightSum - $horizontalPadding) / 2;
            }
        } else {
            $html = '';
            $horizontalCenterPadding = 0;
        }
        /*         * kontener tła dla tekstu* */
        if ($backgroundVisible) {
            $this->pdf->StartTransform();
            $bgColor = $this->hex2rgb($backgroundColor);
            $this->pdf->SetFillColor($bgColor['r'], $bgColor['g'], $bgColor['b']);
            $this->pdf->SetDrawColor($bgColor['r'], $bgColor['g'], $bgColor['b']);
            $this->pdf->setAlpha($backgroundOpacity);
            $this->pdf->Rect($x, $y, $w, $h, 'DF');
            $this->pdf->StopTransform();
        }
        $fontFamily = 'Arial';
//  $font = $this->prepareFontFile($fontFamily, $fontTypeName);
        if (isset($this->currentObject['content'])) {
            /** Przygotowanie strony pdf z tekstem * */
            $pdf2 = new TCPDF($orientation = 'L', $unit = 'mm', $format = array($w, $h), $unicode = true, $encoding = 'UTF-8', $diskcache = false);
            $pdf2->setPrintFooter(false);
            $pdf2->setPrintHeader(false);
            $pdf2->SetDisplayMode('fullpage');
            $pdf2->SetAutoPageBreak(false);
            if ($w > $h) {
                $orientation = 'L';
            } else {
                $orientation = 'P';
            }
//         @TODO do wyłączenia - Defaultowa nazwa fonta            
            $font = "helvetica";
//            disable
            $pdf2->addPage($orientation, $format = array($w, $h));
            $pdf2->SetFont($font, '', 20, '', false);
            $pdf2->setFontSubsetting(true);
            $pdf2->StartTransform();
            $pdf2->Rotate($angle, $rotateX, $rotateY);
            $pdf2->setCellHeightRatio(1.2);
            $pdf2->setCellPaddings($left = $verticalPadding, $top = $horizontalPadding + $horizontalCenterPadding, $right = $verticalPadding, $bottom = $horizontalPadding + $horizontalCenterPadding);
            $pdf2->setCellMargins(0, 0, 0, 0);
            $pdf2->SetFillColor(255, 255, 255);
            $pdf2->writeHTMLCell($w, $h, 0, 0, $html, 0, 0, true, true, 'C', true);
            $pdf2->StopTransform();
            /* Dodawanie cienia tekstu do strony */
            $this->pdf->StartTransform();
            $textPdfPage = tempnam($this->tmpDir, 'generator_TextPDF');
            array_push($this->useTmpFileArray, $textPdfPage);
            $pdf2->Output($textPdfPage, 'F');
            $textImage = $this->textToImage($textPdfPage);
            $shadowBlur = 5;
            $textShadow = $this->makeTextShadow($textImage, $shadowBlur, $shadowColor, $w, $h);
            $this->pdf->Rotate($angle, $rotateX, $rotateY);
            if ($this->currentObject['dropShadow']) {
                $this->pdf->Image('@' . $textShadow['base'], $x - 2 * $shadowBlur, $y - $shadowBlur, $w + 2 * $shadowBlur, $h + 2 * $shadowBlur);
            }
            $this->pdf->StopTransform();
// Koniec tworzenia cienia dla tekstu //
            /*             * Dodawanie tekstu do strony* */
            $this->pdf->StartTransform();
            $this->pdf->SetFont($font, '', 20, '', false);
            $this->pdf->setFontSubsetting(true);
            $this->pdf->Rotate($angle, $rotateX, $rotateY);
            $this->pdf->setCellHeightRatio(1.2);
            $this->pdf->setCellPaddings($left = $verticalPadding, $top = $horizontalPadding + $horizontalCenterPadding, $right = $verticalPadding, $bottom = $horizontalPadding + $horizontalCenterPadding);
            $this->pdf->setCellMargins(0, 0, 0, 0);
            $this->pdf->writeHTMLCell($w, $h, $x, $y, $html, 0, 0, false, true, 'C', true);
            $this->pdf->StopTransform();
        }
    }

    /**
     *
     */
    private function addNoProposedObject()
    {
        if ($this->isPreview == 1) {
            $file = $this->currentObject['ProjectImage']['minUrl'];
        } else {
            $file = $this->currentObject['ProjectImage']['imageUrl'];
        }
        $w = $this->currentObject['width'] * $this->currentObject['scaleX'];
        $h = $this->currentObject['height'] * $this->currentObject['scaleY'];
        $x = $this->currentObject['x'] - ($w / 2);
        $y = $this->currentObject['y'] - ($h / 2);
        if (isset($_GET['debug'])) {
            var_dump('order: ' . $this->currentObject['order']);
            var_dump('id: ' . $this->currentObject['_id']);
            var_dump('width: ' . $w);
            var_dump('height: ' . $h);
            var_dump('x' . $x);
            var_dump('y' . $y);
        }
//****************Dodawanie z uwzglÄ™dnieniem rotacji dla elementĂłw bez pozycji propoowanej*******************//            
        $rotateX = $this->currentObject['x'];
        $rotateY = $this->currentObject['y'];
        $rotateAngle = -$this->currentObject['rotation'];
        $this->pdf->StartTransform();
        $this->pdf->Rotate($rotateAngle, $rotateX, $rotateY);
        $this->pdf->Image($file, $x, $y, $w, $h);
        $this->pdf->StopTransform();
    }

    /**
     * @param $hidden
     */
    private function outputPdf($hidden)
    {
        if (!is_dir(MAIN_UPLOAD . companyID . '/' . 'editorPDF')) {
            mkdir(MAIN_UPLOAD . companyID . '/' . 'editorPDF', 0777);
        }
        $outputPdfPath = MAIN_UPLOAD . companyID . '/' . 'editorPDF/' . date('Y-m-d');
        $outputPdfDestination = $outputPdfPath . '/' . $this->ProjectID . '.pdf';

        if (!is_dir($outputPdfPath)) {
            mkdir($outputPdfPath, 0777);
        }
        if ($this->outputMethod && $this->outputMethod == '1') {
            $om = 'I';
        } else {
            $om = 'F';
        }
        $this->pdf->Output($outputPdfDestination, $om); // atrybut 'I' - wyswietlanie w przeglÄ…darce, 'F' - zapis do pliku(potrzebuje peĹ‚nej Ĺ›cieĹĽki z prawem zapisu 777)
        if ($hidden == 0) {
            echo json_encode(array('url' => 'http://static.digitalprint.pro/' . companyID . '/editorPDF/' . date('Y-m-d') . '/' . $this->ProjectID . '.pdf'));
        }
    }

    /**
     *
     */
    private function execScriptTimeStart()
    {
        if (isset($_GET['execTime'])) {
            $rustart = getrusage();
        }
    }

    /**
     * @return string
     */
    private function execScriptTimeEnd()
    {
        if (isset($_GET['execTime'])) {
            function rutime($ru, $rus, $index)
            {
                return ($ru["ru_$index.tv_sec"] * 1000 + intval($ru["ru_$index.tv_usec"] / 1000)) - ($rus["ru_$index.tv_sec"] * 1000 + intval($rus["ru_$index.tv_usec"] / 1000));
            }

            $ru = getrusage();
            $scriptTime = rutime($ru, $rustart, "utime") / 1000;
            $timeInfo = "Ten proces trwaĹ‚: " . $scriptTime . " s";
            return $timeInfo;
        }
    }

    /**
     * @param $pdfPage
     * @return bool|string
     */
    private function textToImage($pdfPage)
    {
        $outputName = tempnam($this->tmpDir, 'generator_OutputImage');
        array_push($this->useTmpFileArray, $outputName);
        $pdf = new imagick();
        $pdf->readimage($pdfPage);
        $w = $pdf->getimagewidth();
        $h = $pdf->getimageheight();
        $bg = new Imagick();
        $bg->newimage($w, $h, 'none');
        $bg->compositeimage($pdf, imagick::COMPOSITE_OVER, 0, 0);
        $bg->paintTransparentImage($bg->getImagePixelColor(5, 5), 0, 1);
        $bg->setImageFormat('png');
        $bg->writeImage($outputName);
//$bg->writeImage('/home/www/vprojekttest4/data/108/kurwaaa.png');
        return $outputName;
    }

    /**
     * @param $hex
     * @return array
     */
    private function hex2rgb($hex)
    {
        $checkHex = substr($hex, 0, 1);
        if ($checkHex[0] == '#') {
            $hex = str_replace("#", "", $hex);
            if (strlen($hex) == 3) {
                $r = hexdec(substr($hex, 0, 1) . substr($hex, 0, 1));
                $g = hexdec(substr($hex, 1, 1) . substr($hex, 1, 1));
                $b = hexdec(substr($hex, 2, 1) . substr($hex, 2, 1));
            } else {
                $r = hexdec(substr($hex, 0, 2));
                $g = hexdec(substr($hex, 2, 2));
                $b = hexdec(substr($hex, 4, 2));
            }
            $rgb = array('r' => $r, 'g' => $g, 'b' => $b);
            return $rgb;
        } else {
            $rgba = $this->string2rgba($hex);
            return $rgba;
        }
    }

    /**
     * @param $color
     * @return array
     */
    private function string2rgba($color)
    {
        $color = str_replace('rgba(', '', $color);
        $color = str_replace(')', '', $color);
        $color = explode(',', $color);
        $red = $color[0];
        $green = $color[1];
        $blue = $color[2];
        $alpha = $color[3];
        $rgba = array('r' => $red, 'g' => $green, 'b' => $blue, 'a' => $alpha);
        return $rgba;
    }

    /**
     * @param $fontname
     * @param $fonttype
     * @return mixed|null|string|string[]
     */
    private function prepareFontFile($fontname, $fonttype)
    {
        $fontInfo = array();
        foreach ($this->fonts as $f) {
            if ($f['name'] == $fontname) {
                $fontInfo = $f;
                break;
            } else {
                continue;
            }
        }
        foreach ($fontInfo['FontTypes'] as $ft) {
            if ($ft['name'] == $fonttype) {
                $fonturl['url'] = $ft['url'];
                $fonturl['name'] = $ft['name'];
            }
        }
        $fontFile = tempnam($this->tmpDir, $fontInfo['name'] . '_');
        chmod($fontFile, 0777);
        copy($fonturl['url'], $fontFile);
        array_push($this->useTmpFileArray, $fontFile);
        $font = TCPDF_FONTS::addTTFfont($fontFile, 'TrueTypeUnicode');
        $this->pdf->SetFont($font, '', 20, '', false);
        $this->pdf->setFontSubsetting(true);
        return $font;
    }

    /**
     * @param $projectPdf
     * @return array
     */
    public function jpgPreview($projectPdf)
    {
        $outputPdfPath = MAIN_UPLOAD . companyID . '/' . 'editorPDF/' . date('Y-m-d');
        $outputPdfDest = $outputPdfPath . '/' . $this->ProjectID . '.pdf';
        if (file_exists($outputPdfDest)) {
            $res = $this->generateJpgPreview();
        } else {
            $this->generatePdf(1);
            $res = $this->generateJpgPreview();
        }
        return $res;
    }

    /**
     * @param $allProjects
     */
    public function jpgAllPreview($allProjects)
    {
    }

    /**
     * @return array
     */
    private function generateJpgPreview()
    {
        $outputPdfPath = MAIN_UPLOAD . companyID . '/' . 'editorPDF/' . date('Y-m-d');
        $outputPdfDestination = $outputPdfPath . '/' . $this->ProjectID . '.pdf';
        $jpgPreviewPath = MAIN_UPLOAD . companyID . '/' . 'editorPDF/' . date('Y-m-d') . '/preview';
        $jpgPreviewDestination = $jpgPreviewPath . '/' . $this->ProjectID . '/';
        $baseStaticUrl = STATIC_URL . companyID . '/editorPDF/' . date('Y-m-d') . '/preview/' . $this->ProjectID . '/';
        if (!is_dir($jpgPreviewPath)) {
            mkdir($jpgPreviewPath, 0777);
        }
        if (!is_dir($jpgPreviewDestination)) {
            mkdir($jpgPreviewDestination, 0777);
        }
        $pdfText = file_get_contents($outputPdfDestination);
        $num = preg_match_all("/\/Page\W/", $pdfText, $dummy);
        $imagesList = array();
        for ($i = 0; $i < $num; $i++) {
            $imagick = new Imagick();
            $imagick->readImage($outputPdfDestination . '[' . $i . ']');
            $imagick->setImageFormat('jpg');
            try {
                $imagick->writeImage($jpgPreviewDestination . $i . '.jpg');
            } catch (ImagickException $e) {
                $this->debug($e->getMessage());
            }
            $imagick->clear();
            $imagick->destroy();
            $imagesList[] = $baseStaticUrl . $i . '.jpg';
        }
        return $imagesList;
    }
}