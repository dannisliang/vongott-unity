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
		
		offset.y += 20;
		
		if ( Button ( "+", new Rect ( 0, offset.y, 24, 16 ) ) ) {
			computer.AddAccount ();

			expandedAccount = computer.validAccounts.Count - 1;
		}
		
		offset.y += 20;

		var acc : Computer.Account = computer.validAccounts [ expandedAccount ];

		acc.username = TextField ( "Username", acc.username );
		acc.password = TextField ( "Password", acc.password );

		offset.y += 20;
		
		LabelField ( "Messages" );
		offset.y += 20;
		acc.messages = TextField ( "", acc.messages, new Rect ( 0, offset.y, width, 100 ) );
		
		offset.y += 100;
		
		LabelField ( "To-do list" );
		offset.y += 20;
		acc.todoList = TextField ( "", acc.todoList, new Rect ( 0, offset.y, width, 100 ) );
		
		offset.y += 120;

		var wallpapers : String [] = [ "wallpaper_debian" ]; 
		var currentWallpaper : int = 0;

		for ( i = 0; i < wallpapers.Length; i++ ) {
			if ( wallpapers[i] == acc.wallpaper ) {
				currentWallpaper = i;
				break;
			}
		}

		acc.wallpaper = wallpapers [ Popup ( "Wallpaper", currentWallpaper, wallpapers ) ];

		offset.y += 20;

		LabelField ( "Events" );
		
		for ( i = 0; i < acc.events.Length; i++ ) {
			acc.events[i] = TextField ( "", acc.events[i] );
		}
		
		offset.y += 20;

		if ( Button ( "+", new Rect ( 0, offset.y, 24, 16 ) ) ) {
			var tmp : List.< String > = new List.< String > ( acc.events );
			
			tmp.Add ( "New Event" );

			acc.events = tmp.ToArray ();
		}
		
		if ( Button ( "-", new Rect ( 30, offset.y, 24, 16 ) ) ) {
			tmp = new List.< String > ( acc.events );
			
			tmp.RemoveAt ( tmp.Count - 1 );

			acc.events = tmp.ToArray ();
		}
		
		offset.y += 20;

		if ( Button ( "Remove account" ) ) {
			computer.RemoveAccount ( expandedAccount );

			expandedAccount = 0;
		}
	}
}
