static var interactive_object:GameObject;
static var flag_array = new Hashtable();
static var player_name = "Nameless";

function SetInteractiveObject ( obj:GameObject ) {
	interactive_object = obj;
	if ( obj ) {
		Debug.Log ( ">>> core: interactive object set to " + interactive_object );
	} else {
		Debug.Log ( ">>> core: interactive object released" );
	}
};

function SetFlag ( flag : String ) {
	flag_array[flag] = true;
}

function GetFlag ( flag : String ) {
	return flag_array[flag];
}

function Interact () {
	if ( interactive_object ) {
		interactive_object.GetComponent(InteractiveObject).Interact();
		interactive_object = null;
	}
}

function Start () {
	Debug.Log(">>> core: started");
}

function Update () {
	if ( Input.GetKeyDown(KeyCode.F) ) {
		Interact();	
	}
}