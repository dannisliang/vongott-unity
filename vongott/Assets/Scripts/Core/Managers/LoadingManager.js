#pragma strict

class LoadingManager extends MonoBehaviour {
	public static var nextScene : String;
	
	function Start () {
		if ( String.IsNullOrEmpty(nextScene) ) { return; }
		
		GameCore.nextLevel = nextScene;
		
		StartCoroutine ( LoadLevelAsync () );
	}
	
	function LoadLevelAsync () {
		yield WaitForSeconds ( 0.5 );
	
		yield Application.LoadLevelAsync ( "game" );
	}
}