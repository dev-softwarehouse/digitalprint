<?php

namespace DreamSoft\Controllers\Traits;
trait ImportLang
{
    public function post_import()
    {
        $path = $this->getUploader()->uploadTemporary('file');
        if ($path) {
            $data = $this->importLang($path);
        } else {
            $data['response'] = false;
        }
        $this->getUploader()->removeTemporary($path);
        return $data;
    }

    private function importLang(string $path)
    {
        $data['response'] = true;

        if (!$this->getExportImport()->openFile($path, 0)) {
            $data['response'] = false;
            return $data;
        }
        $langArray = $this->getExportImport()->sheetToArray();
        $lang = $this->getData()->getPost('lang');
        if (!$lang) {
            $data['response'] = false;
            return $data;
        }
        $createCount = 0;
        $updateCount = 0;
        foreach ($langArray as $langRow) {
            if ($langRow['B']) {
                $one = $this->getLang()->getOne($langRow['A'], $lang);
                if ($one) {
                    if (!$this->getLang()->customUpdate($one['ID'], $langRow['A'], $langRow['B'], $lang)) {
                        $data['response'] = false;
                        return $data;
                    }
                    $createCount++;
                } else {
                    if (!$this->getLang()->customCreate($langRow['A'], $langRow['B'], $lang)) {
                        $data['response'] = false;
                        return $data;
                    }
                    $updateCount++;
                }
            }
        }
        return array_merge($data, compact($createCount, $updateCount));
    }
}
