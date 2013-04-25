#pragma strict

class OGPageManager {
	static var allPages : List.< KeyValuePair.<String, OGPage> > = new List.< KeyValuePair.<String, OGPage> >();
	static var currentPage : OGPage;
	
	static function Add ( page : OGPage, key : String ) {
		allPages.Add ( new KeyValuePair.<String, OGPage> ( key, page ) );
	}
	
	static function GoToPage ( key : String ) {
		OGCore.ClearWidgets ();
		
		currentPage = null;
		
		for ( var kvp : KeyValuePair.<String, OGPage> in allPages ) {
			if ( kvp.Key == key ) {
				currentPage = kvp.Value;
				continue;
			}
		}
		
		if ( currentPage == null ) {
			Debug.LogError ( "OGPageManager | invalid page" );
		}
		
		currentPage.Init ();
	}
	
	static function Update () {
		if ( currentPage ) {
			currentPage.Update ();
		}
	}
}