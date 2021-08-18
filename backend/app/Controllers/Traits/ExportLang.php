<?php

namespace DreamSoft\Controllers\Traits;
trait ExportLang
{
    public function post_export()
    {
        $lang = $this->getData()->getPost('lang');
        if (!$lang) {
            return array('response' => false);
        }
        $translations = $this->getLang()->exportAll($lang);
        if ($this->getData()->getPost('companyContext')) {
            $translationDP = $this->getLangRoot()->exportAll($lang);
            $nonTranslated[] = [];
            foreach ($translationDP as $dp) {
                if (sizeof(array_filter($translations, function ($item) use ($dp) {
                        return $item[0] == $dp[0];
                    })) == 0) {
                    $dp[] = 'default';
                    $nonTranslated[] = $dp;
                }
            }
            $translations = array_merge($translations, $nonTranslated);
        }
        $dir = companyID . '/download/';
        if (!is_dir(STATIC_PATH . $dir)) {
            mkdir(STATIC_PATH . $dir, 0777, true);
        }
        $path1 = $dir . 'lang_' . $lang . '_' . date('Y-m-d_G-i') . '.xls';
        $this->getExportImport()->newSheet('Translations');
        $this->getExportImport()->setFromArray($translations);
        $this->getExportImport()->path = STATIC_PATH . $path1;
        $this->getExportImport()->saveFile();
        return array('response' => true, 'url' => STATIC_URL . $path1);
    }
}
