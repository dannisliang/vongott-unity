#pragma strict

class LoadingManager extends MonoBehaviour {
	public static var nextScene : String;
	public static var nextSpawnPoint : String;
		
	function Start () {
		if ( String.IsNullOrEmpty(nextScene) ) { return; }
		
		GameCore.nextLevel = nextScene;
		GameCore.nextSpawnPoint = nextSpawnPoint;
		
		Application.LoadLevel ( "game" );
	}
}
