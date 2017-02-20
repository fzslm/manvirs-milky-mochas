var gameSave = {};
// the user's game save is loaded here. global scope is used so that all functions can access it.

var _f = {
	system: {

		loadSave: function() {
			console.log('Loading game...');
			gameSave = jsonfile.readFileSync('peony/save.json');
		},

		newSave: function() {
			console.log('Creating new save...');
			gameSave = {
				"playerName": "",
				"shopName": "",
				"started": false,
				"tutorialComplete": false,
				"money": 1000,
				"level": 1,
				"shop": [],
				"shopWidth": 2560,
				"unlockedItems": [true, false, false, false],
				"lastPlayed": Date.now()
			};
			jsonfile.writeFileSync('peony/save.json', gameSave);
		},

		save: function() {
			console.log('Saving game...');
			jsonfile.writeFileSync('peony/save.json', gameSave);
		},

		start: function(){
			_f.window.scaleUx(); // scale the UI to fit the screen
			// let's draw a loading wheel on the screen first!
			$('.content').append('<div class="game-loading"><i class="fa fa-cog fa-spin"></i> Loading</div>');
			// check for user's save game
			fs.exists('peony/save.json', function(res){
				if(!res){
					// game never played before, create new save game
					_f.system.newSave();
				} else {
					// load old save game
					_f.system.loadSave();
				}
			});
			// show title screen
			_f.views.loadView('titlescreen');

			return true;
		},

		loadError: function(errorNumber){
			// an unrecoverable error occurred during startup...
			console.log('An unrecoverable error occurred during startup. ('+errorNumber+')');
			_f.ui.modal.push('An error occurred', 'A critical error occurred while trying to start the game. Please contact the developer. ('+errorNumber+')', [
				{
					"name": "Quit",
					"action": "win.close();"
				}
			]);
		}
	},

	ui: {
		modal: {
			push: function(title, contents, actions) {
				$('.vignette').fadeIn();

				$('.modalContainer').show();

				actionsHtml = "";
				actions.forEach(function(res){
					actionEscaped = res.action.replace(/\"/g,'&quot;');
					actionsHtml = actionsHtml + '<li class="modal-action" onclick="'+actionEscaped+'">'+res.name+'</li>';
				});

				$('.modalContainer').prepend('<div class="modal" style="display: none"><div class="modal-title">'+title+'</div><div class="modal-contents">'+contents+'</div><ul class="modal-actions">'+actionsHtml+'</ul></div>');

				$('.modal').effect('slide', {direction: 'down', duration: 350, mode: 'show'});
			},

			dismiss: function(callback){
				$('.vignette').fadeOut();
				$('.modal').effect('slide', {direction: 'down', duration: 350, mode: 'hide'}, function(){
					$('.modal').remove();
					$('.modalContainer').hide();
				});
				if(callback) callback();
			}
		}
	},

	views: {

		loadView: function(view, data) {
			// loads a HTML file into the content div.
			$('.content').fadeOut(function(){
				$('.content').html(fs.readFileSync('peony/views/'+view+'.html', 'utf-8'));
				$('.content').fadeIn();
			});
		}

	},

	game: {
		npcSpeech: function(npc,message, callback){
			// shows an NPC speaking certain message(s)
			messages = ["Welcome to MANVIR'S MILKY MOCHAS! To continue, click the speech bubble.", "I'm so glad to have you on board. I've run this coffee shop for 15 years now, but I'm getting far too tired now. I've got OTHER projects to devote my time and energy to - after all, I'm <strong>MANVIR</strong>!", "<em>clears throat</em> Oh, excuse me! I don't know what became of me there. Let's take a quick look at your new coffee shop, shall we?", "Oh, I forgot to mention. The repo men came the other day and they took all of the furniture. They even took the carpet. That means <em>you'll</em> have to do all the work.", "Now, one small technicality. While I'd love for you to be able to use the prestigious MANVIR'S MILKY MOCHAS name for your shop, it turns out that for... tax evasion purposes, you'll need to pick a different name.", "{{SHOPNAME}}? Hmm... it's no <strong>MANVIR'S MILKY MOCHAS</strong>, but I guess we've got no other options. We'll use it.", "Before you can start up your coffee shop, you need to get a cash register! Don't worry, I'll pay for this. Let's go through how to add an item.", "First, click the [+] button in the bottom-left.", "Nice work, {{PLAYERNAME}}! Now you just need to click the <em>Cash Register</em and choose <em>Purchase Item</em>."];

			_f.game.npcSpeechCallback = callback;

			$('.npcLayer').html('<div class="npcImage"></div><div onclick="_f.game.npcSpeechAdvance();" class="npcSpeech"></div>');

			message.forEach(function(res, i){
				$('.npcSpeech').append('<div style="display: none;" id="npcSpeechItem'+i+'" class="npcSpeechItem">'+messages[res]+'</div>');
			});

			$('#npcSpeechItem0').show();

			$('.npcImage').hide(); $('.npcSpeech').hide();
			$('.npcLayer').show();
			$('.npcImage').effect('slide', {direction: 'right', duration: 150, mode: 'show'});
			$('.npcSpeech').effect('slide', {direction: 'left', duration: 150, mode: 'show'});

		},

		npcSpeechAdvance: function() {
			// advance the speech bubble or dismiss it, based on the amount of messages left

			if($('.npcSpeechItem').length === 0) {
				console.log('nothing to dismiss!');
				return false;
			} else if($('.npcSpeechItem').length === 1) {
				console.log('dismiss');
				$('.npcLayer').effect('slide', {direction: 'down', duration: 350, mode: 'hide'}, _f.game.npcSpeechCallback);
			} else {
				console.log('advance');
				$('#'+$('.npcSpeechItem')[0].id).remove(); /* removes the first available speech item */
				$('#'+$('.npcSpeechItem')[0].id).show(); /* shows the next available speech item */
			}


		},

		npcSpeechCallback: function() {},

		updateName: function(name) {
			// sets the user's name
			gameSave.playerName = name;
			_f.system.save();
		},

		toggleTray: function() {
			if($('.tray').attr('closed') == "true") {
				// tray is closed, open it
				_f.game.refreshItemStore();
				$('.tray').attr('closed', 'false');
				$('#trayButton').css('background', "url('assets/common/back.png')");
				$('.trayContainer').show();
				$('.tray').effect('slide', {direction: 'down', duration: 350, mode: 'show'});
			} else {
				// tray is open, close it
				$('.tray').attr('closed', 'true');
				$('#trayButton').css('background', "url('assets/common/addItem.png')");
				$('.tray').effect('slide', {direction: 'down', duration: 350, mode: 'hide'}, function(){
					$('.trayContainer').hide();
				});
			}
		},

		refreshItemStore: function() {
			var listHtml = "";
			itemDefinitions.forEach(function(res, i){
				if(gameSave.unlockedItems[i]){
					listHtml = listHtml + '<li onclick="_f.game.confirmBuy('+i+')" id="item'+i+'" class="itemElement"><div class="itemImage" style="background: url(\''+res.image+'\')"></div><div class="itemDetails"><span class="itemName">'+res.name+'</span><span class="itemDescription">'+res.description+' <span style="color: grey; padding-left: 2px;font-size: 32px">($'+res.price+')</span></span></div></li>';
				}

			});
			$('#trayView-items').html('<ul class="itemsList">'+listHtml+'</ul>');
		},

		confirmBuy: function(id) {
			$('.buyButton').remove();
			$('li#item'+id).append('<div onclick="_f.game.purchaseItem('+id+')" class="buyButton">Confirm Purchase</div>');
		},

		purchaseItem: function(id) {
			$('.buyButton').remove();
			_f.game.toggleTray();
			gameSave.shop.push(new Item(id));
			_f.game.changeMoney(-itemDefinitions[id].price);
			_f.system.save();
		},

		destroyItem: function(uuid){
			$('#item-'+uuid).remove();
			var newShopArray = [];
			gameSave.shop.forEach(function(res){
				if(res.uuid != uuid) {
					newShopArray.push(res);
				}
			});
			gameSave.shop = newShopArray;
			_f.system.save();
		},

		sellItem: function(uuid) {
			var itemReference = _f.game.getItemFromUUID(uuid);
			console.log(itemReference);
			_f.game.changeMoney((itemReference.price / 4 ) * 3);
			_f.game.destroyItem(uuid);
		},

		changeMoney: function(amount) {
			console.log('changing by '+amount);
			gameSave.money = gameSave.money + amount;
			_f.game.updateMoneyHud();
			_f.system.save();
		},

		getItemFromUUID: function(uuid) {
			var returnValue = false;
			gameSave.shop.forEach(function(res){
				if(res.uuid == uuid) {
					returnValue = res;
				}
			});
			return returnValue;
		},

		flipItem: function(uuid){
			var itemReference = _f.game.getItemFromUUID(uuid);
			if(itemReference.flipped === 0) {
				itemReference.flipped = 1;
				$('#item-'+uuid).css('transform', 'scaleX(-1)');
			} else {
				itemReference.flipped = 0;
				$('#item-'+uuid).css('transform', 'scaleX(1)');
			}
			_f.system.save();
		},

		moveItem: function(uuid){
			$(document).on('mousemove', function(event){

				if(sizeOf('peony/assets/shop1/p1.png').width < event.pageX+$('.content').scrollLeft() && (sizeOf('peony/assets/shop1/p3.png').width+gameSave.shopWidth) > event.pageX+$('.content').scrollLeft()) {

					$('#item-'+uuid).css('left', event.pageX+$('.content').scrollLeft()-($('#item-'+uuid).width()/2)+'px');

				}

			});

			$('#item-'+uuid).click(function(event){
				$(document).off('mousemove');

				var itemReference = _f.game.getItemFromUUID(uuid);
				itemReference.position[0] = $('#item-'+uuid).position().left;
				_f.system.save();
			});
		},

		updateMoneyHud: function() {
			$('.moneyText').text('$'+gameSave.money.toFixed(2));
		}
	},

	misc: {
		clock: function() {
			/* returns the present time. */
			var date = new Date();
			var h = date.getHours();
			var m = date.getMinutes();
			var s = date.getSeconds();
			var ms = date.getMilliseconds();
			if(h < 10) {h = "0" + h;}
			if(m < 10) {m = "0" + m;}
			if(s < 10) {s = "0" + s;}
			if(ms < 10) {ms = "00" + ms;} else if(ms < 100) {ms = "0" + ms;}
			return h+":"+m+":"+s + "." +ms;
		}
	},

	window: {
		close: function() {
			gui.App.quit();
		},

		minimise: function() {
			win.minimize();
		},

		fullScreen: function() {
			win.toggleFullscreen();
		},

		scaleUx: function() {
			var zoomPercent = 100;
			if(win.width/1920 < win.height/1080) {
				zoomPercent = (win.width / 1920) * 100;
			} else {
				zoomPercent = (win.height / 1080) * 100;
			}
			win.zoomLevel = Math.log(zoomPercent / 100) / Math.log(1.2);
		}
	},

};

// LISTENERS //
win.on('resize', function(){
	_f.window.scaleUx();
});

$(document).ready(function(){
	if(!_f.system.start()){
		alert('Failed to start.');
	}
});
