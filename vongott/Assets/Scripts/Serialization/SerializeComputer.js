#pragma strict

public class SerializeComputer extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( Computer ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var input : Computer = component as Computer;
	
		output.AddField ( "domain", input.domain );

		var accounts : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

		for ( var acc : Computer.Account in input.validAccounts ) {
			var account : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

			account.AddField ( "username", acc.username );
			account.AddField ( "password", acc.password );
			account.AddField ( "messages", acc.messages );
			account.AddField ( "todoList", acc.todoList );
			account.AddField ( "wallpaper", acc.wallpaper );

			var events : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );

			for ( var ev : String in acc.events ) {
				events.Add ( ev );
			}

			account.AddField ( "events", events );

			accounts.Add ( account );
		}

		output.AddField ( "validAccounts", accounts );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var computer : Computer = component as Computer;
	
		computer.domain = input.GetField ( "domain" ).str;

		for ( var acc : JSONObject in input.GetField ( "validAccounts" ).list ) {
			var account : Computer.Account = computer.AddAccount ();

			account.username = acc.GetField ( "username" ).str;
			account.password = acc.GetField ( "password" ).str;
			account.messages = acc.GetField ( "messages" ).str;
			account.todoList = acc.GetField ( "todoList" ).str;
			account.wallpaper = acc.GetField ( "wallpaper" ).str;

			var events : List.< String > = new List.< String > ();

			for ( var ev : JSONObject in acc.GetField ( "events" ).list ) {
				events.Add ( ev.str );
			}

			account.events = events.ToArray ();
		}
	}
}
