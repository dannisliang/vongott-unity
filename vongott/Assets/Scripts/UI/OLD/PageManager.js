#pragma strict

////////////////////
// Prerequisites
////////////////////
// Enums
enum Page {
	Empty,
	MainMenu,
	HUD,
	Inventory,
	QuestLog
}

// Public vars
var firstPage = Page.MainMenu;

// Static vars
static var current_page : Page;
static var current_page_object : GameObject = null;
static var instance : GameObject;


////////////////////
// Page actions
////////////////////
// Go to specific page
static function GoToPage ( p : Page ) {
	if ( p != current_page ) {
		if ( current_page_object != null ) {
			Destroy ( current_page_object );
		}
		
		var page : GameObject = Instantiate ( Resources.Load ( "Prefabs/UI/" + p.ToString() ) ) as GameObject;
		page.transform.parent = instance.transform;
		page.transform.localScale = new Vector3 ( 1.0, 1.0, 1.0 );
		page.transform.localPosition = Vector3.zero;
	
		current_page = p;
		current_page_object = page;
	
		// check if main menu
		if ( p == Page.MainMenu ) {
			instance.transform.parent.GetComponent(Camera).orthographic = false;
			page.transform.localPosition = new Vector3 ( 0.0, 0.0, 500.0 );
		} else {
			instance.transform.parent.GetComponent(Camera).orthographic = true;
		}
	
		GameCore.Print ( "PageManager | go to " + p.ToString() );
	}
}

function Start () {
	instance = this.gameObject;
	
	GoToPage ( firstPage );
}