#pragma strict

class EditorInspectorComputer extends MonoBehaviour {
	public var nameField : OGTextField;
	public var addButton : OGButton;
	public var accountContainer : Transform;	
		
	private var currentComputer : Computer;
	
	
	//////////////////////
	// List
	//////////////////////
	private function AddListObject ( n : String ) : GameObject {
		var obj : GameObject = new GameObject ( "Account" );
		var lblObj : GameObject = new GameObject ( "Username" );
		var btnObj : GameObject = new GameObject ( "Edit" );
		var dlObj : GameObject = new GameObject ( "Delete" );
		
		var lbl : OGLabel = lblObj.AddComponent ( OGLabel );
		var btn : OGButton = btnObj.AddComponent ( OGButton );
		var dl : OGButton = dlObj.AddComponent ( OGButton );
		
		obj.transform.parent = accountContainer;
		
		lblObj.transform.parent = obj.transform;
		lblObj.transform.localScale = new Vector3 ( 110, 20, 1 );
		lblObj.transform.localPosition = Vector3.zero;
		lblObj.transform.localEulerAngles = Vector3.zero;
		
		btnObj.transform.parent = obj.transform;
		btnObj.transform.localScale = new Vector3 ( 70, 20, 1 );
		btnObj.transform.localPosition = new Vector3 ( 190, 0, 0 );
		btnObj.transform.localEulerAngles = Vector3.zero;
		
		dlObj.transform.parent = obj.transform;
		dlObj.transform.localScale = new Vector3 ( 20, 20, 1 );
		dlObj.transform.localPosition = new Vector3 ( 270, 0, 0 );
		dlObj.transform.localEulerAngles = Vector3.zero;
		
		lbl.text = n;
		lbl.GetDefaultStyles();

		dl.text = "X";
		dl.target = this.gameObject;
		dl.message = "DeleteAccount";
		dl.argument = n;
		dl.GetDefaultStyles();

		btn.text = "Edit";
		btn.target = this.gameObject;
		btn.message = "EditAccount";
		btn.argument = n;
		btn.GetDefaultStyles();

		return obj;
	}
	
	private function ClearList () {
		for ( var i = 0; i < accountContainer.childCount; i++ ) {
			DestroyImmediate ( accountContainer.GetChild ( i ).gameObject );
		}
	}
	
	private function Reorganize () {
		ClearList ();
		
		var bottomLine : float = 0;
		
		for ( var acc : Computer.Account in currentComputer.validAccounts ) {
			var obj : GameObject = AddListObject ( acc.username );
			
			obj.transform.localPosition = new Vector3 ( 0, bottomLine, 0 );
			
			bottomLine += 40;
		}
		
		addButton.transform.localPosition = new Vector3 ( 0, accountContainer.localPosition.y + bottomLine, 0 );
	}
	
	
	//////////////////////
	// Update
	//////////////////////
	public function UpdateObject () {
		currentComputer.domain = nameField.text;
		
		Reorganize ();
	}
	
	public function AddAccount () {
		currentComputer.AddAccount ();
		
		Reorganize ();
	}
	
	public function DeleteAccount ( name : String ) {
		currentComputer.RemoveAccount ( name );
		
		Reorganize ();
	}
	
	public function EditAccount ( name : String ) {
		EditorEditAccount.currentComputer = currentComputer;
		EditorEditAccount.currentAccount = currentComputer.GetAccountFromString ( name );
		EditorEditAccount.callback = UpdateObject;
		
		OGRoot.GetInstance().GoToPage ( "EditAccount" );
	}
	
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {
		currentComputer = obj.GetComponent( Computer );
	
		nameField.text = currentComputer.domain;
		
		Reorganize ();
	}
}
