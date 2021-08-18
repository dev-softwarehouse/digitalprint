<?php

namespace DreamSoft\Models\Setting;

class Content extends Setting
{

    /**
     * Content constructor.
     * @param null $lang
     */
    public function __construct($lang = NULL)
    {
        parent::__construct($lang);
        $this->setTableName('contents', true);
    }

}