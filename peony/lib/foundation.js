var gameSave = {};
// the user's game save is loaded here. global scope is used so that all functions can access it.

var _f = {
	music: {
		currentlyPlayingBGM: false,
		changeBGM: function(bgm) {
			if(!bgm) {
				console.log('Stopping BGM');
				_f.music.currentlyPlayingBGM.stop();
				_f.music.currentlyPlayingBGM = false;
			} else {
				console.log('Changing BGM track to assets/bgm/'+bgm+'.ogg');
				try{
					_f.music.currentlyPlayingBGM.stop();
				} catch(err) {
					// we use a try block because the statement above will fail if no music is playing.
					// this is because currentlyPlayingBGM is set to /false/ if nothing is playing.
					// therefore, there isn't a stop method to access.
					//
					// using a try/catch block ignores this failure and continues.
				}
				_f.music.currentlyPlayingBGM = new Howl({src: 'assets/bgm/'+bgm+'.ogg', loop: true});
				_f.music.currentlyPlayingBGM.play();
			}
		},

		playSFX: function(sfx, callback) {
			console.log('Playing SFX at assets/sfx/'+sfx+'.ogg');
			new Howl({src: 'assets/sfx/'+sfx+'.ogg', onend: function(){
				try{
					callback();
				} catch(e) {
					/* we use a try block here because the callback might not exist.
					using a try block ensures execution completes successfully even
					if the callback function is not passed. */
				}
			}}).play();
		}
	},

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
				"money": 1,
				"level": 1,
				"shop": [],
				"shopWidth": 2560,
				"unlockedItems": [true, false, false, false],
				"unlockedDecorations": [false, false, false, false],
				"purchasedDecorations": [true, false, false, false],
				"currentDecoration": "shop0",
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
				_f.music.playSFX('modal');
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
				$('*').off(); /* disables all key + click bindings from previous view */
				$('.content').html(fs.readFileSync('peony/views/'+view+'.html', 'utf-8'));
				$('.content').fadeIn();
			});
		}

	},

	game: {
		npcSpeech: function(npc,message, callback){
			// shows an NPC speaking certain message(s)
			messages = ["Welcome to MANVIR'S MILKY MOCHAS, "+gameSave.playerName+"! To continue, click the speech bubble.", "I'm <em>so</em> glad to have you on board. I've run this coffee shop for 15 years now, but I'm getting far too tired now. I've got OTHER projects to devote my time and energy to - after all, I'm <strong>MANVIR</strong>!", "<em>clears throat</em> Oh, excuse me! I don't know what became of me there. Let's take a quick look at your new coffee shop, shall we?", "Oh, I forgot to mention. The repo men came the other day and they took all of the furniture. They even took the carpet. That means <em>you'll</em> have to do all the work.", "Now, one small technicality. While I'd love for you to be able to use the prestigious MANVIR'S MILKY MOCHAS name for your shop, it turns out that for... tax evasion purposes, you'll need to pick a different name.", "<strong>"+gameSave.shopName+"</strong>? Hmm... it's no <strong>MANVIR'S MILKY MOCHAS</strong>, but I guess we've got no other options. We'll use it.", "Before you can start up your coffee shop, you need to get a cash register! Don't worry, I'll pay for this. Let's go through how to add an item.", "First, click the [+] button in the bottom-left.", "Nice work, "+gameSave.playerName+". You pressed a button. Now you just need to click the <em>Cash Register</em> and choose <em>Confirm Purchase</em>.", "There's your cash register. Now you can start stealing the money of unsuspecting coffee aficionados everywhere.", "<strong>WHAT?</strong> I <strong>specifically</strong> said NO customers today! Oh, I'm angry. And you wouldn't like me when I'm angry.","<em>sighs</em> Well, I suppose I will have to teach you how to make coffee!", "You'll know you have a customer when you see that little dollar sign in the bottom-right corner. Tap it to ask the customer what they want!", "He-he-he!", "Yeah, these guys are <small>really</small> particular about their coffee. It drives me insane. There's this one guy who always asks for tons of milk. Says it adds extra lactose or something like that...", "Anyway, never mind about that. Hope you remembered what that guy just ordered, because I'm not reminding you. Let's make some coffee!", "<em>slurp</em>", "This coffee is amazing! It's exactly what I wanted!", "...Wow! I wasn't expecting it to be this good!", "Oh my god! It's perfect!", "Yeah! This is real coffee!", "Wow! This is incredible!", "...Mmm! This is good!", "This is nice! I'd certainly drink this again!", "Mmm! This is some damn fine coffee!", "I'm impressed, $PLAYERNAME! This tastes great!", "Nice work! This is a great coffee!", "...Ehh... I suppose it's alright. I've certainly had better.", "... It could be worse, but it could definitely be better...", "Coffee's coffee, but I don't know about this one...", "It has potential, but I think something's missing...", "...I guess it's drinkable. The question is - do I <em>really</em> want to drink it?", "... $PLAYERNAME, I know you're new and all that, but come on now. This is awful.", "Did you even add the coffee beans, $PLAYERNAME? Because I can barely taste them.", "What's in this? It's just that I don't think I like it very much.", "... Ugh! This is really bad.", "... I'm not paying for this. I genuinely think I'm going to throw up everywhere.", "Are you trying to kill me or something? This is some of the worst coffee I've ever had in my life. In fact, no, I think it <em>is</em> the worst.", "I don't feel well. Is there a hospital near here? It's just that I think I have food poisoning now, $PLAYERNAME. And if it turns out I do, I'm suing you.", "Well, there goes the prestige of what was once <strong>MANVIR'S MILKY MOCHAS</strong>. Don't expect me to be back here again.", "Can I ask a quick question? How exactly did you screw up this bad?", "The money you make from a coffee depends on how well you made it. If you made it bad enough, you might not make any money at all. So don't screw it up!", "The amount of money you have shows up in the top-right corner of your screen. And -- wait. You only have $MONEY? I guess I could help you out... if you do me a favour.", "Recently I've been running into some issues with the law. They seem to think they can make <strong>MANVIR</strong> pay his bills and his loans!", "So the bank men came out the other day and they took all of my furniture. Like I said, they even took the carpet! And needless to say, I'm less than pleased.", "I've got a great plan to show them who's boss, but it requires me to leave this branch behind. Would you be willing to take ownership of this place?", "Oh wait, you haven't got a choice. Congratulations - this place is yours! Now, here's $1000 to start you off. Spend it wisely, 'cause I won't be helping you out again!", "Right, before I let you go off on your own, there's one last thing I want you to do. Let's change the decorations.", "Changing the decorations will change the floor and the wall! So you can make my, erm, I mean <em>your</em> coffee shop look exactly how you want.", "After I'm done teaching you, you'll even be able to add furniture like tables and chairs. Doing so will make your coffee shop more popular, and might encourage more people to come. Wouldn't that be nice!", "Right - let's change the decorations. Press the [+] button, but this time go to the tab with the paintbrush. Then, choose a decoration!", "There you go. You've changed the decoration of my store now! Which means -- you're done! You're ready to start running $SHOPNAME!", "I'll pop back in from time to time to see how you're doing, of course. But yeah, we're done with this tutorial now! Click the speech bubble to save, and start the <em>real</em> Manvir's Milky Mochas. The game has only just begun!"];

			_f.game.npcSpeechCallback = callback;

			if(typeof(npc) == "object") {
				$('.npcLayer').html('<div style="background-image: url(\'assets/npc/head'+npc[0]+'.png\')" class="npcHead"></div><div style="background-image: url(\'assets/npc/body'+npc[1]+'.png\')" class="npcBody"></div><div style="background-image: url(\'assets/npc/legs'+npc[2]+'.png\')" class="npcLegs"></div><div style="background-image: url(\'assets/npc/boots'+npc[3]+'.png\')" class="npcBoots"></div>');
			} else {
				// load NPC image from string
				$('.npcLayer').html('<div style="background-image: url(assets/'+npc+'.png);" class="npcImage"></div>');
			}

			$('.npcLayer').append('<div onclick="_f.game.npcSpeechAdvance();" class="npcSpeech"></div>');

			if(typeof(message) == "string") {
				// the message is a single string
				$('.npcSpeech').append('<div style="display: none;" id="npcSpeechItem0" class="npcSpeechItem">'+message+'</div>');
			} else {
				if(typeof(message[0]) == "string") {
					// the message format is an array of strings.
					message.forEach(function(res, i){
						$('.npcSpeech').append('<div style="display: none;" id="npcSpeechItem'+i+'" class="npcSpeechItem">'+res+'</div>');
					});
				} else {
					// the message format is an array of ints referring to items in messages array.
					message.forEach(function(res, i){
						$('.npcSpeech').append('<div style="display: none;" id="npcSpeechItem'+i+'" class="npcSpeechItem">'+messages[res]+'</div>');
					});
				}
			}



			$('.item').hide();
			$('#npcSpeechItem0').show();

			$('.npcImage').hide(); $('.npcSpeech').hide();
			$('.npcLayer').show();
			$('.npcImage').effect('slide', {direction: 'right', duration: 150, mode: 'show'});
			$('.npcSpeech').effect('slide', {direction: 'left', duration: 150, mode: 'show'});

		},

		currentNPCArray: [],

		npcSpeechAdvance: function() {
			// advance the speech bubble or dismiss it, based on the amount of messages left

			_f.music.playSFX('click');

			if($('.npcSpeechItem').length === 0) {
				// there's nothing to do, as no NPC speech items are on screen.
				return false;
			} else if($('.npcSpeechItem').length === 1) {
				// dismiss the NPC speech box
				$('.npcLayer').effect('slide', {direction: 'down', duration: 350, mode: 'hide'}, _f.game.npcSpeechCallback);
				$('.item').show();
			} else {
				// advance to the next quote
				$('#'+$('.npcSpeechItem')[0].id).remove(); /* removes the first available speech item */
				$('#'+$('.npcSpeechItem')[0].id).show(); /* shows the next available speech item */
			}


		},

		npcSpeechCallback: function() {},

		judgeCoffee: function(desiredBeans, desiredSize, desiredMilk, desiredExtras) {
			// a score is assigned to the user when they make a coffee, as a percentage between 0 - 100.
			// five minigames - each minigame has 20% weight.
			// each percentage causes a different reaction and payment:
			// 0 - 20%: AWFUL. no payment
			// 20% - 40%: BAD, $2.00 paid
			// 40% - 60%: AVERAGE: $3.50 paid
			// 60% - 80%: GOOD, $7.00 paid
			// 80% - 100%: AMAZING, $14.00 paid
			var score = 0;

			///// BEANS
			// did the player pick the right beans? +20 to score if they did, +0 if they didn't.
			if(minigameScores.beans == desiredBeans) score+=20;

			///// GRINDING
			// how well were the beans ground?
			// first, get the grinding score as a number between 0 or 1 (0 if ground as bad as possible, 1 if ground perfectly)
			var grindingScore = Math.abs(Math.abs((minigameScores.grind/50)-1)-1);
			// this formula first divides the player's score by 50 (a perfect score).
			// this causes the score to be in the range 0 - 2, where 0 is not at all ground and 2 is too finely ground, and 1 is perfect
			// it then takes away 1 and finds the absolute value. this makes 1 ground as badly as possible (in either direction), and 0 perfect.
			// we want the numbers to be the other way around, so we take away 1 and take the absolute value again. we now have the desired format.
			// now add 20 * grindingScore to the total
			score+=20*grindingScore;

			///// SIZE
			// did the player pick the right size cup? +20 to score if they did, +0 if they didn't.
			if(minigameScores.size == desiredSize) score+=20;

			///// MILK
			// was the right amount of milk added?
			// first, work out the difference between what the customer ordered and what the player made.
			var difference = Math.abs(minigameScores.milk - desiredMilk);
			// now divide that by 100, take away one and get the absolute value.
			difference = Math.abs((difference / 100)-1);
			// difference will equal 1 if the exact right amount of milk was added, 0 if it was completely wrong
			// multiply 20 * difference and add that to the score.
			score+=20*difference;

			///// FLAVOURING/EXTRAS
			// how correct were the user's choices?
			// 3 points awarded for each correct choice, +2 bonus if they got all of them right.
			// then add that score to the total
			var extrasScore = 0;
			desiredExtras.forEach(function(res, i){
				if(res == minigameScores.flavouring[i]) {
					extrasScore+=3;
				}
			});
			if(extrasScore==18) {
				extrasScore=20; // award +2 bonus if they got all of them right (3 * 6 = 18, so this triggers on 18pts)
			}
			score+=extrasScore;

			return score;
		},

		npcSpeechFromScore: function(score, npc, callback){
			/* uses a coffee judging score to put an appropriate message on screen, and add the right amount of money. */
			// 0 - 20%: AWFUL. no payment
			// 20% - 40%: BAD, $2.00 paid
			// 40% - 60%: AVERAGE: $3.50 paid
			// 60% - 80%: GOOD, $7.00 paid
			// 80% - 100%: AMAZING, $14.00 paid

			var messageIndex = false;
			var changeMoneyBy = false;
			switch(true){
				case (score < 20):
					messageIndex = _f.misc.randomIntFromInterval(36, 40);
					changeMoneyBy = 0;
					break;
				case (score < 40):
					messageIndex = _f.misc.randomIntFromInterval(32, 36);
					changeMoneyBy = 2.00;
					break;
				case (score < 60):
					messageIndex = _f.misc.randomIntFromInterval(27, 31);
					changeMoneyBy = 3.50;
					break;
				case (score < 80):
					messageIndex = _f.misc.randomIntFromInterval(22, 26);
					changeMoneyBy = 7.00;
					break;
				case (score < 100):
					messageIndex = _f.misc.randomIntFromInterval(17, 21);
					changeMoneyBy = 14.00;
					break;
			}

			_f.game.npcSpeech(npc, [messageIndex], function(){
				if(changeMoneyBy !== 0) {
					_f.game.changeMoney(changeMoneyBy);
				}
					try{
						callback();
					} catch(e) {

					}
			});
		},

		updateName: function(name) {
			// sets the user's name
			gameSave.playerName = name;
			_f.system.save();
		},

		toggleTray: function(callback) {
			_f.music.playSFX('zip');
			if($('.tray').attr('closed') == "true") {
				// tray is closed, open it
				_f.game.refreshItemStore();
				_f.game.refreshDecorationStore();
				$('.tray').attr('closed', 'false');
				$('#trayButton').css('background', "url('assets/common/back.png')");
				$('.trayContainer').show();
				$('.tray').effect('slide', {direction: 'down', duration: 350, mode: 'show'}, callback);
			} else {
				// tray is open, close it
				$('.tray').attr('closed', 'true');
				$('#trayButton').css('background', "url('assets/common/addItem.png')");
				$('.tray').effect('slide', {direction: 'down', duration: 350, mode: 'hide'}, function(){
				$('.trayContainer').hide();
				try{
					callback();
				} catch(err) {
					/* there might not always be a callback! we use a try block so that the tray still deploys even if there is no callback. */
				}
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

		purchaseItem: function(id, calledFromTutorial) {
			$('.buyButton').remove();
			if(!calledFromTutorial) _f.game.toggleTray();
			gameSave.shop.push(new Item(id));
			_f.game.changeMoney(-itemDefinitions[id].price);
			_f.system.save();
		},

		destroyItem: function(uuid){
			_f.music.playSFX('poof');
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
			_f.music.playSFX('money-change');
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
			_f.music.playSFX('flip');
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
			_f.music.playSFX('move-init');
			$(document).on('mousemove', function(event){

				if(sizeOf('peony/assets/'+gameSave.currentDecoration+'/p1.png').width < event.pageX+$('.content').scrollLeft() && (sizeOf('peony/assets/'+gameSave.currentDecoration+'/p3.png').width+gameSave.shopWidth) > event.pageX+$('.content').scrollLeft()) {

					$('#item-'+uuid).css('left', event.pageX+$('.content').scrollLeft()-($('#item-'+uuid).width()/2)+'px');

				}

			});

			$('#item-'+uuid).click(function(event){
				$(document).off('mousemove');
				_f.music.playSFX('move-done');
				var itemReference = _f.game.getItemFromUUID(uuid);
				itemReference.position[0] = $('#item-'+uuid).position().left;
				_f.system.save();
			});
		},

		updateMoneyHud: function() {
			$('.moneyText').text('$'+gameSave.money.toFixed(2));
		},

		refreshDecorationStore: function() {
			var listHtml = "";
			var onclick = "";
			decorationDefinitions.forEach(function(res, i){

				if(gameSave.purchasedDecorations[i]){
					/* the user already owns this decoration, just apply it if they click it */
					onclick = "_f.game.applyDecoration("+i+")";
				} else {
					/* the user doesn't own this decoration yet, buy it if they click */
					onclick = "_f.game.confirmDecorationBuy("+i+")";
				}

				if(gameSave.unlockedDecorations[i]){
					listHtml = listHtml + '<li onclick="'+onclick+'" id="item'+i+'" class="itemElement"><div class="itemImage" style="background: url(\''+res.preview+'\')"></div><div class="itemDetails"><span class="itemName">'+res.name+'</span><span class="itemDescription">'+res.description+' <span style="color: grey; padding-left: 2px;font-size: 32px">($'+res.price+')</span></span></div></li>';
				}

			});
			$('#trayView-decorate').html('<ul class="decorationsList">'+listHtml+'</ul>');
		},

		confirmDecorationBuy: function(id) {
			$('.buyButton').remove();
			$('li#item'+id).append('<div onclick="_f.game.purchaseDecoration('+id+')" class="buyButton">Confirm Purchase</div>');
		},

		purchaseDecoration: function(id, callback) {
			$('.buyButton').remove();
			gameSave.purchasedDecorations[id] = true;
			_f.game.changeMoney(-decorationDefinitions[id].price);
			_f.system.save();
			_f.game.applyDecoration(id);
			_f.game.refreshDecorationStore();
			if(gameSave.tutorialComplete) {
				_f.game.toggleTray();
			} else {
				tutorialEnding();
			}
		},

		applyDecoration: function(id) {
			gameSave.currentDecoration = "shop"+id;
			_f.game.refreshDecoration();
		},

		refreshDecoration: function(){
			$('.viewContent').css('background-image', 'url("assets/'+gameSave.currentDecoration+'/p2.png")');

			var widthPre = sizeOf('peony/assets/'+gameSave.currentDecoration+'/p1.png').width;
			$('.shop-pre').css('min-width', widthPre).css('max-width', widthPre).css('background-image', 'url("assets/'+gameSave.currentDecoration+'/p1.png")');

			var widthPost = sizeOf('peony/assets/'+gameSave.currentDecoration+'/p3.png').width;
			$('.shop-post').css('min-width', widthPost).css('max-width', widthPost).css('background-image', 'url("assets/'+gameSave.currentDecoration+'/p3.png")');

			$('.viewContent').css('min-width', gameSave.shopWidth+widthPost+widthPre+'px');
			$('.viewContent').css('max-width', gameSave.shopWidth+widthPost+widthPre+'px');
			$('.viewContent').css('background-position-x', widthPre+'px');
		},

		returnRandomNPCArray: function(){
			return [_f.misc.randomIntFromInterval(1,3),_f.misc.randomIntFromInterval(1,3),_f.misc.randomIntFromInterval(1,3),_f.misc.randomIntFromInterval(1,3)];
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
		},

		randomIntFromInterval: function(min, max) {
			// returns a random integer between min and max
    		return Math.floor(Math.random()*(max-min+1)+min);
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
