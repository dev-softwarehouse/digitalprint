ALTER TABLE `ps_config_attributeLangs` ADD UNIQUE  `attr_lang` (  `attributeID` ,  `lang` );
ALTER TABLE `ps_config_optionLangs` ADD UNIQUE  `option_lang` (  `optionID` ,  `lang` );