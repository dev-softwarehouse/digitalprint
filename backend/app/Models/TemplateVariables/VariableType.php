<?php


namespace DreamSoft\Models\TemplateVariables;


use DreamSoft\Core\Model;

class VariableType extends Model
{
    public function __construct($root = false, $companyID = NULL)
    {
        parent::__construct($root, $companyID);
        $this->setTableName('template_variable_type', true);
    }


}
