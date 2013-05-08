#pragma strict

@script ExecuteInEditMode

class OGRoot extends MonoBehaviour {
	var _currentPage : OGPage;
	var _allStyles : GUIStyle[];
			
	static var currentPage : OGPage;
	static var allStyles : GUIStyle[];
	static var mouseOver : boolean = false;
	static var thisTransform : Transform;
	
	@HideInInspector static var allPages : List.< OGPage > = new List.< OGPage >();
	
	static function GoToPage ( name : String ) {
		if ( name == currentPage.pageName ) {
			return;
		}
		
		currentPage.gameObject.SetActive ( false );
		currentPage = null;
		
		for ( var p : OGPage in allPages ) {
			if ( p.pageName == name ) {
				currentPage = p;
				p.gameObject.SetActive ( true );
				p.StartPage ();
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
			
			currentPage.UpdatePage ();
		}
		
		allStyles = _allStyles;
	}
	
	function OnGUI () {

	}
	
	function Start () {		
		currentPage = _currentPage;
		allStyles = _allStyles;
		
		for ( var i = 0; i < this.transform.childCount; i++ ) {
			if ( this.transform.GetChild ( i ).GetComponent ( OGPage ) ) {
				allPages.Add ( this.transform.GetChild ( i ).GetComponent ( OGPage ) );
			}
		}
		
		currentPage.gameObject.SetActive ( true );
		currentPage.StartPage ();
	}
}