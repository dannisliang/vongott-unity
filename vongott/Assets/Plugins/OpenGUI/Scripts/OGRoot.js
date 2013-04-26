#pragma strict

class OGRoot extends MonoBehaviour {
	var _currentPage : OGPage;
	var _allPages : OGPage[];
	
	static var currentPage : OGPage;
	static var allPages : OGPage[];
	
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
	
	function Update () {}
	
	function OnGUI () {

	}
	
	function Start () {
		currentPage = _currentPage;
		allPages = _allPages;
		
		currentPage.gameObject.SetActive ( true );	
	}
}