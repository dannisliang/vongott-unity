#pragma strict

public class ScriptEditor extends OGPage {
	public var btnRemoveScript : OGButton;
	public var btnNewScript : OGButton;
	public var fldEditor : OGTextField;
	public var lblNoneSelected : OGLabel;

	private var target : LuaScriptableObject;

	public function NewScript () {
		var selected : OFSerializedObject = OEWorkspace.GetInstance().GetSelectedObject ();
		
		target = selected.gameObject.AddComponent.< LuaScriptableObject > ();
	}

	public function RemoveScript () {
		var selected : OFSerializedObject = OEWorkspace.GetInstance().GetSelectedObject ();

		Destroy ( selected.GetComponent.< LuaScriptableObject > () );
	}

	override function StartPage () {
		var selected : OFSerializedObject = OEWorkspace.GetInstance().GetSelectedObject ();
		
		if ( selected ) {
			target = selected.GetComponent.< LuaScriptableObject > ();
		}	
		
		fldEditor.gameObject.SetActive ( selected != null && target == null );
		btnRemoveScript.gameObject.SetActive ( selected != null && target == null );
		btnNewScript.gameObject.SetActive ( selected != null && target != null );
			
		lblNoneSelected.gameObject.SetActive ( selected == null );
	}

	override function UpdatePage () {

	}
}
