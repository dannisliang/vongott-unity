#pragma strict

@script ExecuteInEditMode

class OGRoot extends MonoBehaviour {
	var _currentPage : OGPage;
	var _allPages : OGPage[];
	var _allStyles : GUIStyle[];
			
	static var currentPage : OGPage;
	static var allPages : OGPage[];
	static var allStyles : GUIStyle[];
	static var mouseOver : boolean = false;
	
	static function GoToPage ( name : String ) {
		currentPage.gameObject.SetActive ( false );
		currentPage = null;
		
		for ( var p : OGPage in allPages ) {
			if ( p.pageName == name ) {
				currentPage = p;
				p.gameObject.SetActive ( true );
				p.Start ();
				return;
			}
		}
		
		if ( currentPage == null ) {
			Debug.LogError ( "OGRoot | invalid page: " + name );
		}
	}
	
	function Update () {
		if ( currentPage ) {
			var anyRects : int = 0;
			
			for ( var w : OGWidget in currentPage.transform.GetComponentsInChildren ( OGWidget ) ) {
				if ( w.guiRect.Contains ( Input.mousePosition ) ) {
					anyRects++;
				}
			}
		
			mouseOver = anyRects > 0;
		}
		
		allStyles = _allStyles;
	}
	
	function OnGUI () {

	}
	
	function Start () {		
		currentPage = _currentPage;
		allPages = _allPages;
		allStyles = _allStyles;
		
		currentPage.gameObject.SetActive ( true );	
	}
}