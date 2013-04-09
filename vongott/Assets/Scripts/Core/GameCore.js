////////////////////
// Prerequiites
////////////////////
// Static vars
static var player_name = "Nameless";
static var interactive_object:GameObject;
static var player_object:GameObject;


////////////////////
// Player
////////////////////
static function SetPlayerObject ( obj:GameObject ) {
	player_object = obj;
}

static function GetPlayerObject () {
	return player_object;
}


////////////////////
// Interactions
////////////////////
static function SetInteractiveObject ( obj : GameObject ) {
	interactive_object = obj;
	
	if ( obj ) {
		Debug.Log ( "... GameCore | interactive object set to: " + obj );
	} else {
		Debug.Log ( "... GameCore | interactive object released" );
	}
}

static function GetInteractiveObject () {
	return interactive_object;
}


////////////////////
// Controls
////////////////////
static function ToggleControls ( state : boolean ) {
	//player_object.GetComponent(CharacterController).enabled = state;
	Debug.Log ( "... GameCore | controls active = " + state );
}


////////////////////
// Init
////////////////////
static function Start () {	
	// quests
	QuestManager.Init();
	
	// ui root
	Instantiate ( Resources.Load ( "Prefabs/UI/Root" ) );
	
	// inventory
	InventoryManager.Init();
	
	Debug.Log("... GameCore | started");
}


////////////////////
// Update
////////////////////
static function Update () {

}