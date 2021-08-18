<?php

namespace DreamSoft\Controllers\Components;

use DreamSoft\Core\Component;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xls;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ExportImport extends Component
{
    /**
     * @var Spreadsheet
     */
    private $spreadsheet;
    private $sheetIndex;

    /**
     * Export constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @var
     */
    public $path;

    /**
     * @param string $sheetName
     * @return bool
     */
    public function newSheet($sheetName = 'format')
    {
        $this->spreadsheet = new Spreadsheet();

        $objSheet = $this->spreadsheet->getActiveSheet();
        $objSheet->setTitle($sheetName);
        return true;

    }

    /**
     * @param null $path
     * @return bool
     */
    public function openFile($path = null)
    {
        if ($path == null)
            $src = $this->path;
        else
            $src = $path;
        if (!file_exists($src)) {
            return false;
        }
        $this->spreadsheet = IOFactory::load($src);

        if ($this->sheetIndex !== null)
            $this->spreadsheet->setActiveSheetIndex($this->sheetIndex);
        return true;
    }

    /**
     * @param $cell
     * @param $value
     * @return bool
     */
    public function setCellValue($cell, $value)
    {
        $cell = strtoupper($cell);
        $this->spreadsheet->getActiveSheet()->setCellValue($cell, $value);
        return true;
    }

    /**
     * @return mixed
     */
    public function sheetToArray()
    {
        return $this->spreadsheet->getActiveSheet()->toArray(null, true, true, true);
    }

    public function setFromArray($data)
    {
        $this->spreadsheet->getActiveSheet()->fromArray($data);
    }

    /**
     * @return bool
     */
    public function saveFile()
    {
        $writer=new Xls($this->spreadsheet);
        $writer->save($this->path);
        chmod($this->path, 0777);
        return true;
    }
}
