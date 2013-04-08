////////////////////
// Prerequisites
////////////////////
// Classes
private class UIPages {
	var hud : HUD;
	var questlog : QuestLog;
}

// Inspector items
var _pages : UIPages;

// Static vars
static var pages : UIPages;
static var current_page = "";
static var instance : GameObject;


////////////////////
// Page actions
////////////////////
// Go to specific page
static function GoToPage ( p : String ) {
	if ( p != "" && p != current_page && p != null ) {
		var page = Instantiate ( Resources.Load ( "Prefabs/UI/" + p ) );
		page.gameObject.transform.parent = instance.transform;
		page.gameObject.transform.localScale = new Vector3 ( 1.0, 1.0, 1.0 );
	}
}

function Start () {
	pages = _pages;
	instance = this.gameObject;
}