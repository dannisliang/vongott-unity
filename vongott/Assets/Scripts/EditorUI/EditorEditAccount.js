#pragma strict

class EditorEditAccount extends OGPage {
	public static var currentComputer : Computer;
	public static var currentAccount : String = "";
	public static var callback : Function;
	
	override function StartPage () {
		
	}

	function OK () {
		if ( callback != null ) {
			callback ();
			callback = null;
		}
		
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
	}
}