<?php


namespace DreamSoft\Models\TemplateVariables;


use DreamSoft\Core\Model;

class TemplateVariables extends Model
{
    public function __construct($root = false, $companyID = NULL)
    {
        parent::__construct($root, $companyID);
        $this->setTableName('template_variables', true);
    }

    public function getKind($range, $id)
    {
        $query = 'select * from dp_template_variables where ';
        if ($range == 'type') {
            $query .= 'typeID=' . $id . ' and  isnull(groupID) and isnull(categoryID)';
        } else if ($range == 'category') {
            $query .= 'categoryID=' . $id . ' and  isnull(groupID) and isnull(typeID)';
        } else if ($range == 'group') {
            $query .= 'groupID=' . $id . ' and  isnull(categoryID) and isnull(typeID)';
        }
        if (!$this->db->exec($query)) {
            return false;
        }
        return $this->db->getAll();
    }

    public function getGlobal()
    {
        $query = 'select * from dp_template_variables 
                    where isnull(groupID) and isnull(categoryID) and isnull(typeID)';
        $this->db->exec($query);
        return $this->db->getAll();
    }

    public function getConfiguredVariables($templateName){
        $query = 'select * from dp_template_variables tv
        join dp_template_variable_type t on t.ID=tv.templateVariableTypeID
        where t.templateName=:templateName';
        $this->db->exec($query, [':templateName'=>$templateName]);
        $templateVariables = $this->db->getAll();
        $variables=array_map( function($var){
            return ['name'=>$var['name'], 'value'=>$var['value'], 'categoryID'=>$var['categoryID'], 'groupID'=>$var['groupID'], 'typeID'=>$var['typeID']];
        },$templateVariables);
        return [['name'=>"{$templateName}TemplateVariables", 'value'=>$variables]];
    }

    public function getVariables($groupID, $typeID, $categoryID, $templateName)
    {
        $query = 'select * from dp_template_variables tv
        join dp_template_variable_type t on t.ID=tv.templateVariableTypeID
        where t.templateName=:templateName';
        $this->db->exec($query, [':templateName'=>$templateName]);
        $templateVariables = $this->db->getAll();

        $classified=array_filter($templateVariables,function($var) use($typeID, $groupID, $categoryID){
            $match=false;
            if ($typeID) {
                $match = $match || $var['typeID'] == $typeID;
            }
            if ($groupID) {
                $match = $match || $var['groupID'] == $groupID;
            }
            if ($categoryID) {
                $match = $match || $var['categoryID'] == $categoryID;
            }
            return $match;
        });
        $defaults=array_values(array_filter($templateVariables,function($var) use($typeID, $groupID, $categoryID, $classified){
            return !$var['typeID'] && !$var['groupID'] && !$var['categoryID'];
        }));
        $variables=array_map(function($var) use($classified,$typeID, $groupID, $categoryID){
            $classifiedTypes=array_values(array_filter($classified, function($var2) use($var,$typeID, $groupID, $categoryID){
                return $var2['name']==$var['name'];
            }));
            foreach($classifiedTypes as $classifiedType){
                if(!$classifiedType['groupID'] && !$classifiedType['categoryID']){
                    return $classifiedType;
                }else if(!$classifiedType['groupID']){
                    return $classifiedType;
                }else{
                    return $classifiedType;
                }
            }
            return $var;
        },$defaults);
        $variables=array_map( function($var){
            return ['name'=>$var['name'], 'value'=>$var['value']];
        },$variables);
        return $variables;
    }
}
