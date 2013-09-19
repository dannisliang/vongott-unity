#pragma strict

class EditorEditText extends OGPage {
	public static var callback : Function;
	public static var objectName : String;
	
	public var nameLabel : OGLabel;
	public var content : OGTextField;

	override function StartPage () {
		
	}

	function OK () {
		if ( callback != null ) {
			callback ( content.text );
			callback = null;
		}
		
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}
}