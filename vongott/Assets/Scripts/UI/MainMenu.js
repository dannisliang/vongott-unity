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

var pages = Pages();
var buttons = Buttons();
var current_page : GameObject = null;
var tween_duration = 0.5;

private var buttons_active = true;
private var zoomed_in = false;

function ToggleButtons () {
	buttons_active = !buttons_active;
}

private function OuterRimZoom ( direction : boolean ) {
	ToggleButtons();
	
	pages.root.Play ( direction );
	
	for ( var b in buttons.GetAll() ) {
		b.GetComponent(MeshCollider).enabled = !direction;
	}
	
	zoomed_in = direction;
}

function GoToLevel ( sender : GameObject ) {
	if ( buttons_active ) {
		Application.LoadLevel ( sender.name );
	}
}

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

function OnZoomEnd () {
	ToggleButtons ();
	
	if ( !zoomed_in ) {
		current_page.SetActive ( false );
		current_page = null;
	}
}

function Start () {
	pages.load.SetActive (false);
	pages.newGame.SetActive (false);
	pages.options.SetActive (false);
	pages.community.SetActive (false);
	pages.root.duration = tween_duration;
}

function Update () {
	if ( Input.GetKeyDown(KeyCode.Escape) && buttons_active && current_page ) {
		OuterRimZoom ( false );
	}
}