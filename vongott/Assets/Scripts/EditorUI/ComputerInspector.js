#pragma strict

public class ComputerInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( Computer ); }
	
	private var expandedAccount : int = 0;

	override function Inspector () {
		var computer : Computer = target.GetComponent.< Computer > ();

		computer.domain = TextField ( "Domain", computer.domain );
		
		var accountNames : String[] = new String [ computer.validAccounts.Count ];

		for ( var i : int = 0; i < accountNames.Length; i++ ) {
			accountNames[i] = computer.validAccounts[i].username;
		}

		expandedAccount = Popup ( "Account", expandedAccount, accountNames );

		var acc : Computer.Account = computer.validAccounts [ expandedAccount ];

		acc.username = TextField ( "Username", acc.username );
		acc.password = TextField ( "Password", acc.password );
		acc.messages = TextField ( "Messages", acc.messages );
		acc.todoList = TextField ( "To-do list", acc.todoList );
		acc.openFile = TextField ( "Open file", acc.openFile );
		acc.openFileName = TextField ( "Open file name", acc.openFileName );
		
		var wallpapers : String [] = [ "wallpaper_debian" ]; 
		var currentWallpaper : int = 0;

		for ( i = 0; i < wallpapers.Length; i++ ) {
			if ( wallpapers[i] == acc.wallpaper ) {
				currentWallpaper = i;
				break;
			}
		}

		acc.wallpaper = wallpapers [ Popup ( "Wallpaper", currentWallpaper, wallpapers ) ];

		Offset ( 0, 20 );

		for ( i = 0; i < acc.operations.Count; i++ ) {
			acc.operations[i].title = TextField ( "Title", acc.operations[i].title );
			acc.operations[i].message = TextField ( "Message", acc.operations[i].message );
			acc.operations[i].object = ObjectField ( "Object", acc.operations[i].object, typeof ( GameObject ), OEObjectField.Target.Scene ) as GameObject;
		}
	}
}
