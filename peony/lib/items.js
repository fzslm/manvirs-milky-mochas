var itemDefinitions = [
	{
		"name": "Cash Register",
		"description": "How are customers going to pay if you don't have one of these?",
		"price": 0,
		"canNPCInteract": false,
		"state": "default",
		"dimensions": [282,271],
		"position": [240,430],
		"image": "assets/cashregister.png",
		"shouldDraw": true,
		"canMove": false
	},
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
		"image": "assets/chair.png",
		"shouldDraw": true,
		"canMove": true
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
		"position": [760,610],
		"image": "assets/table.png",
		"shouldDraw": true,
		"canMove": true
	},
	{
		"name": "Plant Pot",
		"description": "A plant pot. A pot containing a plant. Plant pot pot plant. Pot pot plant plant.",
		"price": 50,
		"canNPCInteract": false,
		"state": "default",
		"dimensions": [130, 240],
		"position": [760,710],
		"image": "assets/plant-pot.png",
		"shouldDraw": true,
		"canMove": true

	},
	{
		"name": "Kettle",
		"description": "A water pot. A pot containing hot water. Kettle kettle, kettle kettle.",
		"price": 50,
		"canNPCInteract": false,
		"state": "default",
		"dimensions": [1000, 1000],
		"position": [100,100],
		"image": "assets/kettle.png",
		"shouldDraw": true,
		"canMove": true
	},
	{
			"name": "Callie",
			"description": "She is grace, she is beauty.",
			"price": 100000,
			"canNPCInteract": false,
			"state": "default",
			"dimensions": [1000, 1000],
			"position": [100, 100],
			"image": "assets/callie.jpg",
			"shouldDraw": true,
			"canMove": true
	}
];

var decorationDefinitions = [
	{
		"name": "Decrepit",
		"description": "It looks like this place has been unused for years...",
		"price": 0,
		"internalName": "shop0"
	},
	{
		"name": "Classic",
		"description": "A simple, clean backdrop.",
		"price": 750,
		"internalName": "shop1"
	},
	{
		"name": "Prison",
		"description": "Imprisoning your customers - is there a better way to keep your customers loyal?",
		"price": 1500,
		"internalName": "shop2"
	},
	{
		"name": "Modern",
		"description": "Who said the future had to be a dystopia?",
		"price": 1500,
		"internalName": "shop3"
	}
];

function Item(id) {
	this.name = itemDefinitions[id].name;
	this.description = itemDefinitions[id].description;
	this.price = itemDefinitions[id].price;
	this.maxLevel = itemDefinitions[id].maxLevel;
	this.canNPCInteract = itemDefinitions[id].canNPCInteract;
	this.state = itemDefinitions[id].state;
	this.image = itemDefinitions[id].image;
	this.dimensions = itemDefinitions[id].dimensions;
	this.position = itemDefinitions[id].position;
	this.shouldDraw = itemDefinitions[id].shouldDraw;
	this.canMove = itemDefinitions[id].canMove;
	this.id = id;
	this.flipped = 0;
	this.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});

	this.destroy = function(){_f.game.destroyItem(this.uuid);};
	this.sell = function(){_f.game.sellItem(this.uuid);};
	this.interaction = itemDefinitions[id].interaction;
	this.flip = function(){_f.game.flipItem(this.uuid);};


	if(this.shouldDraw){
		$('.viewContent').append('<div class="item" style="width: '+this.dimensions[0]+'px; height: '+this.dimensions[1]+'px; top: '+this.position[1]+'px; left: '+this.position[0]+'px; position: absolute; background: url(\''+this.image+'\')" id="item-'+this.uuid+'"></div>');
	}

}
