#pragma strict

class EditorEditText extends OGPage {
	public static var callback : Function;
	public static var objectName : String = "";
	public static var objectContent : String = "";
	
	public var nameLabel : OGLabel;
	public var content : OGTextField;

	override function StartPage () {
		content.text = objectContent;
	}

	function OK () {
		if ( callback != null ) {
			callback ( content.text );
			callback = null;
			content.text = "";
			objectContent = "";
		}
		
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}
}