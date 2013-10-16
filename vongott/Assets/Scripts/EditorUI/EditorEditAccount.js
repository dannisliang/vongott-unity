#pragma strict

class EditorEditAccount extends OGPage {
	public static var currentComputer : Computer;
	public static var currentAccount : Computer.Account;
	public static var callback : Function;
	
	public var username : OGTextField;
	public var password : OGTextField;
	public var wallpaper : OGImage;
	public var wallpaperSelect : OGPopUp;
	public var messages : OGTextField;
	public var todoList : OGTextField;
	public var openFile : OGTextField;
	public var openFileName : OGTextField;
	
	override function StartPage () {		
		wallpaper.image = Resources.Load ( "Textures/UI/Wallpapers/" + currentAccount.wallpaper ) as Texture2D;
		
		var wallpapers : Object[] = Resources.LoadAll ( "Textures/UI/Wallpapers" );
		wallpaperSelect.options = new String[wallpapers.Length];
		
		for ( var i = 0; i < wallpapers.Length; i++ ) {
			wallpaperSelect.options[i] = ( wallpapers[i] as Texture2D ).name;
		}
		
		if ( currentAccount.wallpaper != "" ) {
			wallpaperSelect.selectedOption = currentAccount.wallpaper;
		}
		
		username.text = currentAccount.username;
		password.text = currentAccount.password;
		messages.text = currentAccount.messages;
		todoList.text = currentAccount.todoList;
		openFile.text = currentAccount.openFile;
		openFileName.text = currentAccount.openFileName;		
	}
	
	public function UpdateWallpaper ( n : String ) {
		wallpaper.image = Resources.Load ( "Textures/UI/Wallpapers/" + n ) as Texture2D;
	}
	
	function OK () {
		currentAccount.username = username.text;
		currentAccount.password = password.text;
		currentAccount.wallpaper = wallpaperSelect.selectedOption;
		currentAccount.messages = messages.text;
		currentAccount.todoList = todoList.text;
		currentAccount.openFile = openFile.text;
		currentAccount.openFileName = openFileName.text;
		
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