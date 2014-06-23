#pragma strict

public class ScriptEditor extends OGPage {
	public var fldEditor : OGTextField;
	public var noneSelectedObjects : GameObject [];
	public var noScriptObjects : GameObject [];
	public var editObjects : GameObject [];

	private var target : LuaScriptableObject;

	public function GetObjectId () {
		OEWorkspace.GetInstance().PickObject ( function ( obj : Object ) {
			var so : OFSerializedObject = ( obj as GameObject ).GetComponent.< OFSerializedObject > ();

			if ( so ) {
				var before : String = target.luaString.Substring ( 0, fldEditor.cursorPos );
				var after : String = target.luaString.Substring ( fldEditor.cursorPos );

				target.luaString = before + "'" + so.id + "'" + after;
			}
		}, typeof ( OFSerializedObject ) );
	}

	public function NewScript () {
		var selected : OFSerializedObject = OEWorkspace.GetInstance().GetSelectedObject ();
		
		target = selected.gameObject.AddComponent.< LuaScriptableObject > ();
		selected.SetField ( target );

		target.luaString = "local self\nlocal vg\n\nfunction start ( object, engine )\n   self = object\n   vg = engine\nend\n\nfunction update ( dt )\n\nend";

		StartPage ();
	}

	public function RemoveScript () {
		var selected : OFSerializedObject = OEWorkspace.GetInstance().GetSelectedObject ();

		StartCoroutine ( function () : IEnumerator {
			selected.RemoveField ( "LuaScriptableObject" );

			Destroy ( selected.GetComponent.< LuaScriptableObject > () );
			
			yield WaitForEndOfFrame ();

			StartPage ();
		} () );
	}

	override function UpdatePage () {
		if ( target ) {
			fldEditor.text = fldEditor.text.Replace ( "\"", "'" );

			target.luaString = fldEditor.text;
		}
	}

	override function StartPage () {
		var selected : OFSerializedObject = OEWorkspace.GetInstance().GetSelectedObject ();
		
		if ( selected ) {
			target = selected.GetComponent.< LuaScriptableObject > ();
		}	
	
		for ( var go : GameObject in noneSelectedObjects ) {
			go.SetActive ( selected == null );
		}
		
		for ( go in noScriptObjects ) {
			go.SetActive ( selected != null && target == null );
		}

		for ( go in editObjects ) {
			go.SetActive ( target != null );
		}

		if ( target ) {
			fldEditor.text = target.luaString;
		}
	}

	override function ExitPage () {
	}
}
