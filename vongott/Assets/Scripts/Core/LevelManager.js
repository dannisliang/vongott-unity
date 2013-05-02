#pragma strict

////////////////////
// Prerequisites
////////////////////
// Public vars
/*var player : GameObject;

// Private vars
private var current_level : Level;
private var current_level_object : GameObject = null;


////////////////////
// Public functions
////////////////////
// Go to level
public function GoToLevel ( l : Level ) {
	PageManager.GoToPage ( Page.HUD );
	
	if ( current_level_object != null ) {
		Destroy ( current_level_object );
	}
	
	var level : GameObject = Instantiate ( l.gameObject ) as GameObject;
	level.transform.parent = this.gameObject.transform;
	level.transform.localScale = new Vector3 ( 1.0, 1.0, 1.0 );
	level.transform.localPosition = Vector3.zero;

	player.transform.localPosition = level.GetComponent(Level).GetSpawnPoint().localPosition;

	GameCore.SetPlayerObject ( player );

	current_level = l;
	current_level_object = level;

	GameCore.Print ( "LevelManager | go to " + l.ToString() );
}
*/