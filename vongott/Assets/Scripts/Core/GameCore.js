static var flag_table = new Hashtable();
static var player_name = "Nameless";
static var interactive_object:GameObject;
static var player_object:GameObject;

static function SetPlayerObject ( obj:GameObject ) {
	player_object = obj;
}

static function GetPlayerObject () {
	return player_object;
}

static function SetInteractiveObject ( obj : GameObject ) {
	interactive_object = obj;
	
	if ( obj ) {
		Debug.Log ( ">>> core: interactive object set to " + obj );
	} else {
		Debug.Log ( ">>> core: interactive object released" );
	}
}

static function GetInteractiveObject () {
	return interactive_object;
}

static function SetFlag ( flag : String ) {
	flag_table[flag] = true;
}

static function GetFlag ( flag : String ) {
	if ( flag_table[flag] ) {
		return true;
	} else {
		return false;
	}
}

static function ToggleControls ( state : boolean ) {
	//player_object.GetComponent(CharacterController).enabled = state;
	Debug.Log ( ">>> core: controls active = " + state );
}

function Start () {
	Debug.Log(">>> core: started");
	
	Instantiate ( Resources.Load ( "Prefabs/UI/ui_root" ) );
}

function Update () {
	
}