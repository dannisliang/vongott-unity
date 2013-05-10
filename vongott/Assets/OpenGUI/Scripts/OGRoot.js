#pragma strict

@script ExecuteInEditMode

class OGRoot extends MonoBehaviour {
	var _currentPage : OGPage;
	var _allStyles : GUIStyle[];
			
	static var currentPage : OGPage;
	static var allStyles : GUIStyle[];
	static var mouseOver : boolean = false;
	static var thisTransform : Transform;
	
	static function GoToPage ( name : String ) {				
		if ( currentPage ) {
			if ( name == currentPage.pageName ) {
				return;
			}
			
			currentPage.gameObject.SetActive ( false );
			currentPage = null;
		}
		
		if ( name == "" ) { return; }
								
		for ( var i = 0; i < thisTransform.GetChildCount(); i++ ) {
			if ( thisTransform.GetChild( i ).GetComponent ( OGPage ) ) {
				var p = thisTransform.GetChild( i ).GetComponent ( OGPage );

				if ( p.pageName == name ) {
					currentPage = p;
					p.gameObject.SetActive ( true );
					p.StartPage ();
					return;
				}
			}
		}
		
		if ( currentPage == null ) {
			Debug.LogError ( "OGRoot | invalid page: " + name );
		}
	}
	
	function Update () {
		if ( currentPage ) {
			var anyRects : int = 0;
			
			for ( var i = 0; i < currentPage.transform.GetChildCount(); i++ ) {
				if ( currentPage.transform.GetChild ( i ).GetComponent( OGWidget ) ) {
					if ( currentPage.transform.GetChild ( i ).GetComponent( OGWidget ).guiRect.Contains ( Input.mousePosition ) ) {
						anyRects++;
					}
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
		thisTransform = this.transform;
		
		if ( currentPage ) {
			currentPage.gameObject.SetActive ( true );
			currentPage.StartPage ();
		}
	}
}