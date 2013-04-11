////////////////////
// Prerequisites
////////////////////
// Static vars
static var current_page = "";
static var current_page_object = null;
static var instance : GameObject;


////////////////////
// Page actions
////////////////////
// Go to specific page
static function GoToPage ( p : String ) {
	if ( p != "" && p != current_page && p != null ) {
		if ( current_page_object != null ) {
			Destroy ( current_page_object.gameObject );
		}
		
		var page = Instantiate ( Resources.Load ( "Prefabs/UI/" + p ) );
		page.gameObject.transform.parent = instance.transform;
		page.gameObject.transform.localScale = new Vector3 ( 1.0, 1.0, 1.0 );
	
		current_page_object = page;

		GameCore.ToggleControls( p == "HUD" );
	
		Debug.Log ( "PageManager | go to " + p );
	}
}

function Start () {
	instance = this.gameObject;
	
	GoToPage ( "HUD" );
}