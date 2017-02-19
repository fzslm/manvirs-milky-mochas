var itemDefinitions = [
	{
		"name": "Chair",
		"description": "A simple wooden chair. Patrons can sit on them while they eat and drink.",
		"price": 100,
		"canNPCInteract": true,
		"interaction": function() {
			alert('hi!');
		},
		"state": "vacant",
		"dimensions": [274,340],
		"position": [512,640],
		"image": "assets/chair.png"
	},
	{
		"name": "Table",
		"description": "A simple table. Customers can put their food and drinks on here.",
		"price": 150,
		"canNPCInteract": true,
		"interaction": function() {
			alert('table interacted with');
		},
		"state": "empty",
		"dimensions": [540, 394],
		"position": [760,270],

	}
];

function Item(id) {
	this.name = itemDefinitions[id].name;
	this.description = itemDefinitions[id].description;
	this.price = itemDefinitions[id].price;
	this.maxLevel = itemDefinitions[id].maxLevel;
	this.canNPCInteract = itemDefinitions[id].canNPCInteract;
	this.interaction = itemDefinitions[id].interaction;
	this.state = itemDefinitions[id].state;
	this.dimensions = itemDefinitions[id].dimensions;
	this.position = itemDefinitions[id].position;
	this.level = 1;
	this.image = "assets/set1/chair.png";
	this.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});

	$('.viewContent').append('<div class="item" style="width: '+this.dimensions[0]+'px; height: '+this.dimensions[1]+'px; top: '+this.position[1]+'px; left: '+this.position[0]+'px; position: relative; background: url(\''+this.image+'\')" id="item-'+this.uuid+'"></div>');

}
