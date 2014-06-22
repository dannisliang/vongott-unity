#pragma strict

public class ScriptEditor extends OGPage {
	public var fldEditor : OGTextField;
	public var noneSelectedObjects : GameObject [];
	public var noScriptObjects : GameObject [];
	public var editObjects : GameObject [];

	private var target : LuaScriptableObject;

	public function NewScript () {
		var selected : OFSerializedObject = OEWorkspace.GetInstance().GetSelectedObject ();
		
		target = selected.gameObject.AddComponent.< LuaScriptableObject > ();
		selected.SetField ( target );

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

	public function SaveScript ( str : String ) {
		target.luaString = str;
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
			go.SetActive ( target == null );
		}

		for ( go in editObjects ) {
			go.SetActive ( target != null );
		}

		if ( target ) {
			fldEditor.text = target.luaString;
		}
	}

	override function ExitPage () {
		fldEditor.text = "";
	}
}
