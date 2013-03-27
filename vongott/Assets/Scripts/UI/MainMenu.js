var base : TweenTransform;

var current_page = "root";
var tween_duration = 2;

private var buttons_active = true;

function ToggleButtons () {
	buttons_active = !buttons_active;
	
	for ( var c in base.gameObject.GetComponentsInChildren(MeshCollider) ) {
		c.enabled = buttons_active;
	}
}

private function OuterRimZoom ( direction : boolean ) {
	ToggleButtons();
	
	base.Play ( direction );
}

private function GoBack () {
	if ( current_page != "root" ) {
		OuterRimZoom ( false );
	}
}

function GoToLoad () {
	if ( buttons_active ) {
		OuterRimZoom ( true );
		current_page = "load";
	}
}

function Start () {

}

function Update () {
	if ( Input.GetKeyDown(KeyCode.Escape) && buttons_active ) {
		GoBack();
	}
}