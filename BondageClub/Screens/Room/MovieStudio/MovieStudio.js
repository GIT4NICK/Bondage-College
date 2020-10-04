"use strict";
var MovieStudioBackground = "MovieStudio";
var MovieStudioDirectory = null;
var MovieStudioCurrentMovie = "";
var MovieStudioCurrentScene = "";
var MovieStudioCurrentRole = "";
var MovieStudioActor1 = null;
var MovieStudioActor2 = null;
var MovieStudioTimer = null;
var MovieStudioMeter = 0;
var MovieStudioDecay = 0;
var MovieStudioActivity = [];

/**
 * The player can play in a movie if she doesn't have any locked restraints
 * @returns {void} - TRUE if the player can play in a movie
 */
function MovieStudioCanPlayInMovie() { return !InventoryCharacterHasLockedRestraint(Player) }

/**
 * When the player fails the movie, we jump back to the director
 * @param {number} Factor - The number to add or substract from the meter
 * @returns {void} - Nothing
 */
function MovieStudioFail() {
	MovieStudioMeter = -100;
	MovieStudioCurrentMovie = "";
	MovieStudioBackground = "MovieStudio";
	CharacterRelease(Player);
	CharacterSetActivePose(Player, null, true);
	MovieStudioDirectory.CurrentDialog = DialogFind(MovieStudioDirectory, "FailIntro" + Math.floor(Math.random() * 4).toString());
	MovieStudioDirectory.Stage = "Fail";
	CharacterSetCurrent(MovieStudioDirectory);
}

/**
 * Change the movie quality meter value, the director stops everything if the meter drops to -100
 * @param {number} Factor - The number to add or substract from the meter
 * @returns {void} - Nothing
 */
function MovieStudioChangeMeter(Factor) {
	MovieStudioMeter = MovieStudioMeter + Factor;
	if (MovieStudioMeter > 100) MovieStudioMeter = 100;
	if (MovieStudioMeter <= -100) MovieStudioFail();
}

/**
 * Process the movie meter decay over time, 
 * @returns {void} - Nothing
 */
function MovieStudioProcessDecay() {
	if (MovieStudioDecay < CurrentTime) {
		let Decay = Math.ceil((CurrentTime - MovieStudioDecay) / 3000);
		MovieStudioDecay = CurrentTime + 3000;
		MovieStudioChangeMeter(Decay * -1);
	}
	if (CurrentTime >= MovieStudioTimer) {
		if (MovieStudioMeter < 0) return MovieStudioFail();
		if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "1")) {
			MovieStudioProgress(MovieStudioCurrentMovie, "2", "");
			MovieStudioActor1 = null;
			MovieStudioActor1 = CharacterLoadNPC("NPC_MovieStudio_Interview_Maid");
			MovieStudioActor1.CurrentDialog = TextGet("MaidIntro" + (InventoryIsWorn(Player, "X-Cross", "ItemDevices") ? "Cross" : "NoCross") + Math.floor(Math.random() * 2).toString());
			MovieStudioActor1.Stage = "0";
			CharacterSetCurrent(MovieStudioActor1);
			return;
		}
		if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "2")) {
			MovieStudioProgress(MovieStudioCurrentMovie, "3", "");
			MovieStudioActor2 = null;
			MovieStudioActor2 = CharacterLoadNPC("NPC_MovieStudio_Interview_Mistress");
			MovieStudioActor2.CurrentDialog = TextGet("MistressIntro" + Math.floor(Math.random() * 4).toString());
			MovieStudioActor2.Stage = "0";
			MovieStudioActor1.Stage = "300";
			CharacterSetCurrent(MovieStudioActor2);
			return;
		}
	}
}

/**
 * Loads the Movie Studio introduction room screen
 * @returns {void} - Nothing
 */
function MovieStudioLoad() {
	if (MovieStudioDirectory == null) {		
		MovieStudioDirectory = CharacterLoadNPC("NPC_MovieStudio_Director");
		InventoryWear(MovieStudioDirectory, "Beret1", "Hat");
		InventoryWear(MovieStudioDirectory, "SunGlasses1", "Glasses");
		InventoryWear(MovieStudioDirectory, "AdmiralTop", "Cloth");
		InventoryWear(MovieStudioDirectory, "AdmiralSkirt", "ClothLower");
		MovieStudioDirectory.AllowItem = false;
	}
}

/**
 * Runs and draws the Movie Studio screen
 * @returns {void} - Nothing
 */
function MovieStudioRun() {
	
	// If there's no movie going on, the player can chat with the director.
	if (MovieStudioCurrentMovie == "") {
		DrawCharacter(Player, 500, 0, 1);
		DrawCharacter(MovieStudioDirectory, 1000, 0, 1);
		if (Player.CanWalk()) DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png", TextGet("Leave"));
		DrawButton(1885, 145, 90, 90, "", "White", "Icons/Character.png", TextGet("Profile"));
		return;
	}
	
	// In the interview first & second scene, the player can check a drawer and a X Cross
	if ((MovieStudioCurrentMovie == "Interview") && ((MovieStudioCurrentScene == "1") || (MovieStudioCurrentScene == "2"))) {
		DrawCharacter(MovieStudioActor1, 250, 0, 1);
		if (InventoryIsWorn(Player, "X-Cross", "ItemDevices")) {
			DrawCharacter(Player, 1250, 0, 1);
		} else {			
			DrawCharacter(Player, 750, 0, 1);
			DrawCharacter(MovieStudioActor2, 1250, 0, 1);
		}
	}

	// In the interview third scene, all three characters are available
	if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "3")) {
		DrawCharacter(MovieStudioActor1, 250, 0, 1);
		DrawCharacter(Player, 750, 0, 1);
		DrawCharacter(MovieStudioActor2, 1250, 0, 1);
	}
	
	// If there's a movie, we draw the progress meter on the right and the wait button
	if (MovieStudioCurrentMovie != "") {
		MovieStudioProcessDecay();
		DrawRect(1873, 198, 54, 604, "White");
		DrawRect(1875, 200, 50, 300, "Green");
		DrawRect(1875, 500, 50, 300, "Red");
		DrawRect(1875, 499 + MovieStudioMeter * -3, 50, 3, "White");
		DrawButton(1855, 25, 90, 90, "", "White", "Icons/Wait.png", TextGet("Wait"));
		DrawText(TextGet("Scene" + MovieStudioCurrentScene.toString()), 1900, 900, "White", "Black");
		DrawText(TimermsToTime(MovieStudioTimer - CurrentTime), 1900, 960, "White", "Black");
	}

}

/**
 * Handles clicks in the Movie Studio screen
 * @returns {void} - Nothing
 */
function MovieStudioClick() {
	if ((MovieStudioCurrentMovie == "") && MouseIn(500, 0, 500, 1000)) CharacterSetCurrent(Player);
	if ((MovieStudioCurrentMovie == "") && MouseIn(1000, 0, 500, 1000)) CharacterSetCurrent(MovieStudioDirectory);
	if ((MovieStudioCurrentMovie == "") && MouseIn(1885, 25, 90, 90) && Player.CanWalk()) CommonSetScreen("Room", "MainHall");
	if ((MovieStudioCurrentMovie == "") && MouseIn(1885, 145, 90, 90)) InformationSheetLoadCharacter(Player);
	if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "1") && MouseIn(250, 0, 500, 1000) && !InventoryIsWorn(Player, "X-Cross", "ItemDevices")) CharacterSetCurrent(MovieStudioActor1);
	if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "1") && MouseIn(1250, 0, 500, 1000)) CharacterSetCurrent(MovieStudioActor2);
	if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "2") && MouseIn(250, 0, 500, 1000)) CharacterSetCurrent(MovieStudioActor1);
	if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "2") && InventoryIsWorn(Player, "DusterGag", "ItemMouth") && MouseIn(1250, 0, 500, 1000)) CharacterSetCurrent(MovieStudioActor2);
	if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "3") && MouseIn(250, 0, 500, 1000)) CharacterSetCurrent(MovieStudioActor1);
	if ((MovieStudioCurrentMovie == "Interview") && (MovieStudioCurrentScene == "3") && MouseIn(1250, 0, 500, 1000)) CharacterSetCurrent(MovieStudioActor2);
	if ((MovieStudioCurrentMovie != "") && MouseIn(1855, 25, 90, 90)) { MovieStudioChangeMeter(-20); MovieStudioTimer = MovieStudioTimer - 60000; }
}

/**
 * When the player needs to change clothes for a role in the movie
 * @param {string} Cloth - The clothes to wear
 * @returns {void} - Nothing
 */
function MovieStudioChange(Cloth) {
	if (Cloth == "Journalist") {
		CharacterNaked(Player);
		InventoryWear(Player, "TeacherOutfit1", "Cloth", "Default");
		InventoryWear(Player, "Glasses1", "Glasses", "#333333");
		InventoryWear(Player, "Socks5", "Socks", "#444458");
		InventoryWear(Player, "Shoes2", "Shoes", "#111111");
		InventoryRemove(Player, "ItemHead");
		InventoryRemove(Player, "ItemArms");
		InventoryRemove(Player, "ItemHands");
		InventoryRemove(Player, "ItemLegs");
		InventoryRemove(Player, "ItemFeet");
		InventoryRemove(Player, "ItemBoots");
	}
}

/**
 * When the movie scene progresses, we assign the new values
 * @param {string} Movie - The movie type
 * @param {string} Scene - The scene in the movie
 * @param {string} Role - Optional - The role the player is taking
 * @returns {void} - Nothing
 */
function MovieStudioProgress(Movie, Scene, Role) {
	MovieStudioTimer = CurrentTime + 600000;
	MovieStudioMeter = 0;
	MovieStudioDecay = CurrentTime + 5000;
	MovieStudioActivity = [];
	MovieStudioCurrentMovie = Movie;
	MovieStudioCurrentScene = Scene;
	if (Role != "") MovieStudioCurrentRole = Role;
	if ((Movie == "Interview") && (Scene == "1")) {
		MovieStudioBackground = CommonRandomItemFromList("", ["BDSMRoomRed", "BDSMRoomBlue", "BDSMRoomPurple"]);
		MovieStudioActor1 = CharacterLoadNPC("NPC_MovieStudio_Interview_Drawer");
		MovieStudioActor1.FixedImage = "Screens/Room/MovieStudio/Drawer.png";
		MovieStudioActor1.Stage = "0";
		MovieStudioActor2 = CharacterLoadNPC("NPC_MovieStudio_Interview_XCross");
		MovieStudioActor2.FixedImage = "Screens/Room/MovieStudio/XCross.png";
		MovieStudioActor2.Stage = "0";
	}
	if (CurrentCharacter != null) DialogLeave();
}

/**
 * When an activity is done
 * @param {string} Activity - The activity name
 * @returns {void} - Nothing
 */
function MovieStudioDoActivity(Activity) {

	// Each activity takes 30 seconds, we check the number of times it was done and if it was done on the last time
	MovieStudioTimer = MovieStudioTimer - 30000;
	let Count = 0;
	let LastCount = false;
	for (let A = 0; A < MovieStudioActivity.length; A++) {
		if (MovieStudioActivity[A] == Activity) Count++;
		LastCount = (MovieStudioActivity[A] == Activity);
	}

	// It raises the meter the first time and second time as long as it's not a direct repeat.  Over 3 times it decreases the meter.
	if (Count == 0) MovieStudioChangeMeter(20);
	if ((Count == 1) && !LastCount) MovieStudioChangeMeter(10);
	if (Count <= 1) CharacterSetFacialExpression(Player, "Blush", "Low", 5);
	if (Count >= 3) MovieStudioChangeMeter(-10);
	if (Count >= 4) CurrentCharacter.CurrentDialog = TextGet("OtherActivity" + Math.floor(Math.random() * 4).toString());
	MovieStudioActivity.push(Activity);

	// Some activities will dress/restrain the player or another actor
	if (Activity == "DressCatsuit") { CharacterNaked(Player); InventoryWear(Player, "Catsuit", "Suit", "#202020"); InventoryWear(Player, "Catsuit", "SuitLower", "#202020"); InventoryWear(Player, "Glasses1", "Glasses", "#333333"); }
	if (Activity == "DressLingerie") { CharacterNaked(Player); InventoryWear(Player, "CorsetBikini1", "Bra", "#202020"); InventoryWear(Player, "Stockings1", "Socks"); InventoryWear(Player, "Glasses1", "Glasses", "#333333"); }
	if (Activity == "DressNaked") { CharacterNaked(Player); InventoryWear(Player, "Glasses1", "Glasses", "#333333"); }
	if (Activity == "InterviewWearCorset") InventoryWear(Player, "LatexCorset1", "Bra");
	if (Activity == "InterviewWearBoots") InventoryWear(Player, "BalletHeels", "ItemBoots");
	if (Activity == "InterviewWearCuffs") { InventoryWear(Player, "LeatherCuffs", "ItemArms"); InventoryWear(Player, "LeatherLegCuffs", "ItemLegs"); InventoryWear(Player, "LeatherAnkleCuffs", "ItemFeet"); }
	if (Activity == "InterviewWearCollar") InventoryWear(Player, "BordelleCollar", "ItemNeck");
	if (Activity == "InterviewCrossRestrain") { InventoryWear(Player, "X-Cross", "ItemDevices"); MovieStudioActor2.FixedImage = "Screens/Room/MovieStudio/Empty.png"; }
	if (Activity == "InterviewRestrainMaid") { 
		InventoryWear(Player, "LeatherCuffs", "ItemArms"); 
		InventoryWear(Player, "LeatherLegCuffs", "ItemLegs");
		InventoryWear(Player, "DusterGag", "ItemMouth");
		InventoryRemove(Player, "ItemFeet");
		InventoryRemove(Player, "ItemDevices");
		var Cuffs = InventoryGet(Player, "ItemArms");
		Cuffs.Property = {};
		Cuffs.Property.Type = "Wrist";
		Cuffs.Property.SetPose = ["BackBoxTie"];
		Cuffs.Property.Effect = ["Block", "Prone", "Lock"];
		CharacterRefresh(Player);
		MovieStudioActor2.FixedImage = "Screens/Room/MovieStudio/XCross.png";
		MovieStudioActor2.Stage = "20";
	}
	if (Activity == "InterviewDustOutfit") { InventoryWear(MovieStudioActor1, "MaidOutfit2", "Cloth"); InventoryRemove(MovieStudioActor1, "Bra"); }
	if (Activity == "InterviewMaidStrip") { CharacterNaked(MovieStudioActor1); InventoryWear(MovieStudioActor1, "MaidHairband1", "Hat"); }
	if (Activity == "InterviewRestrainForOral") { 
		InventoryWear(Player, "LeatherCuffs", "ItemArms"); 
		InventoryWear(Player, "LeatherLegCuffs", "ItemLegs");
		InventoryWear(Player, "LeatherAnkleCuffs", "ItemFeet");
		InventoryRemove(Player, "ItemDevices");
		var Cuffs = InventoryGet(Player, "ItemArms");
		Cuffs.Property = {};
		Cuffs.Property.Type = "Wrist";
		Cuffs.Property.SetPose = ["BackBoxTie"];
		Cuffs.Property.Effect = ["Block", "Prone", "Lock"];
		CharacterSetActivePose(Player, "Kneel", true);
		MovieStudioActor2.FixedImage = "Screens/Room/MovieStudio/XCross.png";
	}
	if (Activity == "InterviewMaidCuffPlayer") {
		InventoryWear(Player, "LeatherCuffs", "ItemArms"); 
		InventoryWear(Player, "LeatherLegCuffs", "ItemLegs");
		InventoryWear(Player, "LeatherAnkleCuffs", "ItemFeet");
		InventoryRemove(Player, "ItemDevices");
		var Cuffs = InventoryGet(Player, "ItemArms");
		Cuffs.Property = {};
		Cuffs.Property.Type = "Wrist";
		Cuffs.Property.SetPose = ["BackBoxTie"];
		Cuffs.Property.Effect = ["Block", "Prone", "Lock"];
		CharacterRefresh(Player);
	}
	if (Activity == "InterviewMaidTighten") {
		var Cuffs = InventoryGet(Player, "ItemArms");
		Cuffs.Property.Type = "Elbow";
		Cuffs.Property.SetPose = ["BackElbowTouch"];
		CharacterRefresh(Player);
	}
	if ((Activity == "InterviewMaidOral1") || (Activity == "InterviewMaidOral2") || (Activity == "InterviewMaidOral3") || (Activity == "InterviewMaidOral4") || (Activity == "InterviewMaidOral5")) {
		CharacterSetFacialExpression(MovieStudioActor1, "Blush", "Medium", 10);
		CharacterSetFacialExpression(MovieStudioActor1, "Eyes", "Horny", 10);
		CharacterSetFacialExpression(MovieStudioActor1, "Eyes2", "Horny", 10);
	}
	if (Activity == "InterviewMaidKneel") {
		CharacterSetActivePose(MovieStudioActor1, "Kneel", true);
		CharacterSetFacialExpression(MovieStudioActor1, "Blush", "Low", 10);
		CharacterSetFacialExpression(MovieStudioActor1, "Eyes", "Closed", 5);
		CharacterSetFacialExpression(MovieStudioActor1, "Eyes2", "Closed", 5);
	}
	if (Activity == "InterviewMaidDusterGag") InventoryWear(MovieStudioActor1, "DusterGag", "ItemMouth");
	if (Activity == "InterviewMaidCuffs") {
		InventoryWear(MovieStudioActor1, "LeatherCuffs", "ItemArms");
		InventoryWear(MovieStudioActor1, "LeatherLegCuffs", "ItemLegs");
		InventoryWear(MovieStudioActor1, "LeatherAnkleCuffs", "ItemFeet");
		var Cuffs = InventoryGet(MovieStudioActor1, "ItemArms");
		Cuffs.Property = {};
		Cuffs.Property.Type = "Wrist";
		Cuffs.Property.SetPose = ["BackBoxTie"];
		Cuffs.Property.Effect = ["Block", "Prone", "Lock"];
		CharacterRefresh(MovieStudioActor1);
	}
	if (Activity == "InterviewMaidBreast") { InventoryWear(MovieStudioActor1, "MaidOutfit2", "Cloth"); InventoryRemove(MovieStudioActor1, "Bra"); }
	if (Activity == "InterviewMaidCross") {
		CharacterSetActivePose(MovieStudioActor1, null, true);
		CharacterSetFacialExpression(MovieStudioActor1, "Blush", "Low", 10);
		InventoryRemove(MovieStudioActor1, "ItemArms");
		InventoryWear(MovieStudioActor1, "LeatherCuffs", "ItemArms");
		InventoryWear(MovieStudioActor1, "X-Cross", "ItemDevices");
		MovieStudioActor2.FixedImage = "Screens/Room/MovieStudio/Empty.png";
	}

	// Check for decay
	MovieStudioProcessDecay();

}

/**
 * Tests if an activity can be done
 * @param {string} Activity - The activity to test
 * @returns {boolean} - Returns TRUE if the activity can be done
 */
function MovieStudioCanDoActivity(Activity) {
	if (Activity == "InterviewOpenFirstDrawer") return (InventoryGet(Player, "Cloth") != null);
	if (Activity == "InterviewOpenSecondDrawer") return (InventoryGet(Player, "Cloth") == null);
	if (Activity == "InterviewWearCorset") return !InventoryIsWorn(Player, "LatexCorset1", "Bra");
	if (Activity == "InterviewWearBoots") return !InventoryIsWorn(Player, "BalletHeels", "ItemBoots");
	if (Activity == "InterviewWearCuffs") return (InventoryGet(Player, "ItemArms") == null);
	if (Activity == "InterviewWearCollar") return (InventoryGet(Player, "ItemNeck") == null);
	if (Activity == "InterviewCrossRestrain") return InventoryIsWorn(Player, "LeatherCuffs", "ItemArms");
	if (Activity == "InterviewMaidCuffPlayer") return !InventoryIsWorn(Player, "LeatherCuffs", "ItemArms");
	if (Activity == "InterviewMaidDusterGag") return !InventoryIsWorn(MovieStudioActor1, "DusterGag", "ItemMouth");
	if (Activity == "InterviewMaidCuffs") return !InventoryIsWorn(MovieStudioActor1, "LeatherCuffs", "ItemArms");
	if (Activity == "InterviewMaidBreast") return InventoryIsWorn(MovieStudioActor1, "MaidOutfit1", "Cloth");
}