#pragma strict

public class SerializeLuaScriptableObject extends OFPlugin {
	override function get types () : System.Type[] {
		return [ typeof ( LuaScriptableObject ) ];
	}
	
	override function Serialize ( component : Component ) : JSONObject {
		var output : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
		var input : LuaScriptableObject = component as LuaScriptableObject;

		output.AddField ( "luaString", input.luaString.Replace ( "\n", "@" ).Replace ( "\"", "'" ) );

		return output;
	}
	
	override function Deserialize ( input : JSONObject, component : Component ) {
		var output : LuaScriptableObject = component as LuaScriptableObject;
		
		output.luaString = input.GetField ( "luaString" ).str.Replace ( "@", "\n" );
	}
}
