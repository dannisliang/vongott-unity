#pragma strict

////////////////////
// Prerequisites
////////////////////
// Classes
class Pages extends System.Object {
	var root : TweenTransform = null;
	var load : GameObject = null;
	var newGame : GameObject = null;
	var options : GameObject = null;
	var community : GameObject = null;
}

class Buttons extends System.Object {
	var load : GameObject = null;
	var newGame : GameObject = null;
	var options : GameObject = null;
	var community : GameObject = null;

	function GetAll () {
		return [ this.load, this.newGame, this.options, this.community ];
	}
}

// Public vars
var pages = Pages();
var buttons = Buttons();
var tween_duration = 0.5;
var logo_rotation_speed = 10.0;
var logo : Transform;
var levelManager : LevelManager;

// Private vars
private var current_page : GameObject;
private var buttons_active = true;
private var zoomed_in = false;
private var logo_rotation = 180.0;

////////////////////
// Public functions
////////////////////
// Toggle buttons
function ToggleButtons () {
	buttons_active = !buttons_active;
}

// Go to level
function GoToLevel ( sender : GameObject ) {
	if ( buttons_active ) {
		var level_manager : LevelManager = Instantiate ( levelManager ) as LevelManager;
//		level_manager.GoToLevel ( sender.GetComponent(LevelButton).GetLevel() );
	}
}

// Goto specific page
function GoToPage ( sender : GameObject ) {
	if ( buttons_active ) {
		if ( sender.name == "btn_load" ) {
			current_page = pages.load;
		} else if ( sender.name == "btn_new_game" ) {
			current_page = pages.newGame;
		} else if ( sender.name == "btn_community" ) {
			current_page = pages.community;
		} else if ( sender.name == "btn_options" ) {
			current_page = pages.options;
		}
		
		current_page.SetActive ( true );
		OuterRimZoom ( true );
	}
}

// What happens when zoom is done
function OnZoomEnd () {
	ToggleButtons ();
	
	if ( !zoomed_in ) {
		current_page.SetActive ( false );
		current_page = null;
	}
}

// Init
function Start () {
	pages.load.SetActive (false);
	pages.newGame.SetActive (false);
	pages.options.SetActive (false);
	pages.community.SetActive (false);
	pages.root.duration = tween_duration;
}

// Update
function Update () {
	if ( Input.GetKeyDown(KeyCode.Escape) && buttons_active && current_page ) {
		OuterRimZoom ( false );
	}
	
	// revolve logo
	logo_rotation += logo_rotation_speed * Time.deltaTime;
	logo.localEulerAngles = new Vector3 ( 0.0, logo_rotation, 0.0 );
}


////////////////////
// Private functions
////////////////////
// Outer rim zoom
private function OuterRimZoom ( direction : boolean ) {
	ToggleButtons();
	
	pages.root.Play ( direction );
	
	for ( var b in buttons.GetAll() ) {
		b.GetComponent(MeshCollider).enabled = !direction;
	}
	
	zoomed_in = direction;
}