<?php

use DreamSoft\Models\Editor\Font;
use DreamSoft\Models\Editor\FontType;
use DreamSoft\Core\Controller;

/**
 * Obsługuje fonty
 *
 * @class FontsController
 * @extends Controller
 */
class FontsController extends Controller
{

    public $useModels = array();

    protected $Font;
    protected $FontType;
    private $destination = 'fonts';
    public $domain = 'https://dev2.digitalprint.pro';

    /**
     * @constructor
     * @param {Array} $params
     */
    public function __construct($params)
    {
        parent::__construct($params);
        $this->Font = Font::getInstance();
        $this->FontType = FontType::getInstance();
    }

    /**
     * @param null $ID
     * @return array
     */
    public function fonts($ID = NULL)
    {
        if (intval($ID) > 0) {
            $data = $this->Font->getOne($ID);
        } else {
            $res = $this->Font->getAll();
            if ($res) {
                $result = array();
                foreach ($res as $row) {
                    if (!isset($result[$row['name']])) {
                        $result[$row['name']] = array();
                    }
                    $url = $this->domain . '/' . $this->destination . '/' . $row['fontID'] . '/' . $row['name'] . '-' . ucfirst($row['type']) . '.ttf';
                    $result[$row['name']][ucfirst($row['type'])] = $url;
                }
                $data = $result;
            }
        }

        if (empty($data)) {
            $data = array();
        }
        return $data;
    }

    public function post_fonts()
    {
        $post = filter_input(INPUT_POST, 'font');
        $fonts = json_decode($post, true);
        if (empty($fonts)) {
            return array('response' => false, 'info' => 'Pusty post');
        }
        foreach ($fonts as $name => $types) {
            $name = str_replace(" ", "-", $name);
            $name = preg_replace("/[^a-zA-Z0-9-]+/", "", $name);
            $fontID = $this->Font->existFont('name', $name);
            if (!$fontID) {
                $fontID = $this->Font->create(compact('name'));
            }
            foreach ($this->Font->types as $t) {
                if (isset($types[$t]) && strlen($types[$t]) > 0) {
                    $type = $t;
                    $typeID = $this->FontType->existType($fontID, $type);
                    if (!$typeID) {
                        $this->FontType->create(compact('fontID', 'type'));
                    }
                    $data = $types[$t];
                    list($fileType, $data) = explode(';', $data);
                    list(, $data) = explode(',', $data);
                    $data = base64_decode($data);
                    $dir = BASE_DIR . $this->destination . '/' . $fontID . '/';
                    if (!is_dir($dir)) {
                        mkdir($dir, 0777, true);
                    }
                    file_put_contents($dir . $name . '-' . ucfirst($type) . '.ttf', $data);
                }
                unset($typeID);
                unset($type);
                unset($dir);
            }
            unset($fontID);
        }
        return array('response' => 'true');
    }

    public function delete_fonts($name)
    {

        $fontID = existFont('name', $name);
        $data['return'] = false;
        if ($fontID) {
            $types = $this->FontType->getTypesByFontID($fontID);
            $dir = BASE_DIR . $this->destination . '/' . $fontID . '/';
            foreach ($types as $t) {
                unlink($dir . $name . '-' . ucfirst($t['type']) . '.ttf');
            }
            $removeTypes = $this->FontType->delete('fontID', $fontID);
            $data['removeTypes'] = $removeTypes;
            $removeFont = $this->Font->delete('ID', $fontID);
            $data['removeFonts'] = $removeTypes;
            if ($removeTypes && $removeFont) {
                $data['return'] = true;
            }
        }
        return $data;

    }

    public function patch_checkFont()
    {
        $name = $this->Data->getPost('name');
        $fontID = existFont('name', $name);
        if ($fontID) {
            $data['response'] = true;
            $data['info'] = 'exist';
        } else {
            $data['response'] = false;
            $data['info'] = 'not exist';
        }

        return $data;
    }
}