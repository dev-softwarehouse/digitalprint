
function PanelTool( name, init, update, change, template, index ){
	// panel tool tworzy obiekty panelu glownego, dodaje funkcje

	this.name = name;
	this.index = index;
	this.init = init;
	this.update = update;
	this.change = change;
	this.template = template;
};
