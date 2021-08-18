<?php


use Phinx\Migration\AbstractMigration;

class TemplateVariables extends AbstractMigration
{

    public function up()
    {
        $this->query('
alter table dp_templates add column useVariables int not null default 0;
create table dp_template_variable_type
(
    ID       int auto_increment primary key,
    name     varchar(100)  not null,
    `values` varchar(1000) null comment \'values separated by | or null for any\',
    templateName             varchar(100) null ,
    domainID int           not null references dp_domains (ID),
    unique key(name,templateName)
);

create table dp_template_variables
(
    ID                     int auto_increment primary key,
    templateVariableTypeID int           not null references dp_template_variable_type (ID),
    `value`                varchar(1000) not null,
    categoryID             int           null references dp_categories (ID) on delete set null,
    groupID                int           null references ps_products_groups (ID) on delete set null,
    typeID                 int           null references ps_products_types (ID) on delete set null,
    unique key(templateVariableTypeID,categoryID,groupID,typeID)
);');
    }

    public function down()
    {
        $this->query('
            alter table dp_templates drop column useVariables;
            drop table if exists dp_template_variables;
            drop table if exists dp_template_variable_type;');
    }
}
