#pragma strict

class LoadingManager extends MonoBehaviour {
	public static var nextScene : String;
	public static var nextSpawnPoint : String;
	
	private var loadingDone : boolean = false;
	
	public var loadingString : OGLabel;
	
	function Start () {
		DontDestroyOnLoad(this);
		
		if ( String.IsNullOrEmpty(nextScene) ) { return; }
		
		GameCore.nextLevel = nextScene;
		GameCore.nextSpawnPoint = nextSpawnPoint;
		
		yield LoadLevelAsync ();
	}
	
	function LoadLevelAsync () {
		yield WaitForSeconds ( 0.5 );
	
		var async : AsyncOperation = Application.LoadLevelAsync ( "game" );
		
		while ( !async.isDone ) {
			var p : float = async.progress * 100.0;		
			var pRounded : int = Mathf.RoundToInt ( p );
			var perc : String = pRounded.ToString();
			
			loadingString.text = perc + "%";
			
			yield;
		}
	}
}