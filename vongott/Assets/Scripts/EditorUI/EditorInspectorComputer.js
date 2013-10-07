#pragma strict

class EditorInspectorComputer extends MonoBehaviour {
	public var nameField : OGTextField;
	public var addButton : OGButton;
		
	private var currentComputer : Computer;
	
	
	//////////////////////
	// Update
	//////////////////////
	public function UpdateObject () {
		
	}
	
	public function EditAccount ( name : String ) {
		
		
		OGRoot.GoToPage ( "EditAccount" );
	}
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {
		currentComputer = obj.GetComponent( Computer );
	
		
	}
}