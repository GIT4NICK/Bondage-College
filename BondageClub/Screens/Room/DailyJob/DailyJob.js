"use strict";
var DailyJobBackground = "MainHall";
var DailyJobOpponent = null;
var DailyJobPuppyMistress = null;
var DailyJobPuppy1 = null;
var DailyJobPuppy2 = null;
var DailyJobPuppy3 = null;
var DailyJobPuppy4 = null;

function DailyJobPlayerFullRestrain() { CharacterFullRandomRestrain(Player, "ALL") };

// Loads a puppy girl and fully restrain her
function DailyJobPuppyLoad(GirlNum) {
	var C = CharacterLoadNPC("NPC_DailyJob_PuppyGirl" + GirlNum);
	CharacterNaked(C);
	InventoryWear(C, CommonRandomItemFromList("", ["BitchSuit", "BitchSuitExposed", "HempRope", "Chain", "ArmbinderJacket", "StraitLeotard", "LeatherStraitJacket", "SeamlessStraitDress", "SeamlessStraitDressOpen", "BoxTieArmbinder"]), "ItemArms", null, 8);
	InventoryWear(C, CommonRandomItemFromList("", ["Ears1", "Ears2", "PonyEars1", "BunnyEars1", "BunnyEars2", "PuppyEars1", "FoxEars1", "WolfEars1", "WolfEars2", "FoxEars2", "FoxEars3", "PuppyEars2"]), "HairAccessory1", null, 8);
	InventoryWear(C, CommonRandomItemFromList("", ["FoxTailsStrap", "PuppyTailStrap", "RaccoonStrap", "PuppyTailStrap1", "FoxTailStrap1", "FoxTailStrap2", "WolfTailStrap1", "WolfTailStrap2", "WolfTailStrap3"]), "TailStraps", null, 8);
	InventoryWearRandom(C, "ItemMouth", 8);
	InventoryWearRandom(C, "ItemNeck", 8);
	InventoryWear(C, "ChainLeash", "ItemNeckRestraints", null, 8);
	CharacterSetActivePose(C, "Kneel");
	return C;
}

// Loads the daily job room screen
function DailyJobLoad() {
	if (DailyJobOpponent == null) {
		DailyJobOpponent = CharacterLoadNPC("NPC_DailyJob_Opponent");
		DailyJobOpponent.AllowItem = false;
	}
	if (DailyJobPuppyMistress == null) {
		DailyJobPuppyMistress = CharacterLoadNPC("NPC_DailyJob_PuppyMistress");
		DailyJobPuppyMistress.AllowItem = false;
		DailyJobPuppy1 = DailyJobPuppyLoad("1");
		DailyJobPuppy2 = DailyJobPuppyLoad("2");
		DailyJobPuppy3 = DailyJobPuppyLoad("3");
		DailyJobPuppy4 = DailyJobPuppyLoad("4");
	}
}

// Run the daily job room
function DailyJobRun() {
}

// When the user clicks in the daily job room
function DailyJobClick() {
}

// In search mission, we add an extra button
function DailyJobSubSearchRun() {
	if (IntroductionJobCurrent == "SubSearch") {
		DrawButton(1885, 885, 90, 90, "", "White", "Icons/Search.png");
		if (DailyJobSubSearchIsActive() && (IntroductionJobCount > 0) && (IntroductionJobPosition.ClickScreen == CurrentScreen)) DrawEmptyRect(IntroductionJobPosition.ClickX - 100, IntroductionJobPosition.ClickY - 100, 200, 200, "Cyan", 3);
		if (DailyJobSubSearchIsActive() && (IntroductionJobCount <= 0)) DrawImage("Screens/Room/DailyJob/Jewelry.png", 730, 290);
	}
}

// In search mission
function DailyJobSubSearchClick() {
	if (IntroductionJobCurrent == "SubSearch") {
		if (DailyJobSubSearchIsActive() && (MouseX >= IntroductionJobPosition.X - 100) && (MouseX <= IntroductionJobPosition.X + 100) && (MouseY >= IntroductionJobPosition.Y - 100) && (MouseY <= IntroductionJobPosition.Y + 100)) IntroductionJobProgress("SubSearch", CurrentScreen);
		if (DailyJobSubSearchIsActive() && (IntroductionJobCount > 0) && (MouseX <= 1900)) { IntroductionJobPosition.ClickX = MouseX; IntroductionJobPosition.ClickY = MouseY; IntroductionJobPosition.ClickScreen = CurrentScreen; }
		if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 885) && (MouseY <= 975)) IntroductionJobPosition.Active = !IntroductionJobPosition.Active;
	}
}

// Returns TRUE if the job search is active
function DailyJobSubSearchIsActive() {
	return ((IntroductionJobCurrent == "SubSearch") && IntroductionJobPosition.Active);
}

// When the kidnap daily job fight starts
function DailyJobKidnapStart() {
	KidnapStart(DailyJobOpponent, "MainHallDark", 7, "DailyJobKidnapEnd()");
}

// When the kidnap daily job fight ends
function DailyJobKidnapEnd() {
	SkillProgress("Willpower", ((Player.KidnapMaxWillpower - Player.KidnapWillpower) + (DailyJobOpponent.KidnapMaxWillpower - DailyJobOpponent.KidnapWillpower)) * 2);
	DailyJobOpponent.Stage = (KidnapVictory) ? "100" : "200";
	if (KidnapVictory) CharacterRelease(Player);
	else CharacterRelease(DailyJobOpponent);
	if (KidnapVictory) DailyJobOpponent.AllowItem = true;
	CommonSetScreen("Room", "DailyJob");
	CharacterSetCurrent(DailyJobOpponent);
	DailyJobOpponent.CurrentDialog = DialogFind(DailyJobOpponent, (KidnapVictory) ? "KidnapVictory" : "KidnapDefeat");
}

// When the kidnap mission succeed, we go back to the main hall
function DailyJobKidnapSuccess() {
	CommonSetScreen("Room", "MainHall");
	CurrentCharacter = null;
	IntroductionMaid.Stage = "432";
	IntroductionJobCount = 0;
}

// When the kidnap mission fails, we go back to the main hall and allows it to restart later
function DailyJobKidnapFail() {
	CommonSetScreen("Room", "MainHall");
	DailyJobOpponent.Stage = "10";
	CurrentCharacter = null;
	DialogChangeReputation("Dominant", -1);
}

// When the puppy walker job starts
function DailyJobPuppyGameStart() {
	MiniGameStart("PuppyWalker", 0, "DailyJobPuppyGameEnd");
}

// When the puppy walker job ends
function DailyJobPuppyGameEnd() {
}
