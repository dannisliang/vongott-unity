#pragma strict

class LoadingManager extends MonoBehaviour {
	public static var nextScene : String;
	public static var nextSpawnPoint : String;
	
	private var loadingDone : boolean = false;
	
	function Start () {
		DontDestroyOnLoad(this);
		
		if ( String.IsNullOrEmpty(nextScene) ) { return; }
		
		GameCore.nextLevel = nextScene;
		GameCore.nextSpawnPoint = nextSpawnPoint;
		
		yield LoadLevelAsync ();
	}
	
	function LoadLevelAsync () {
		yield WaitForSeconds ( 0.5 );
	
		Application.LoadLevel ( "game" );
	}
}