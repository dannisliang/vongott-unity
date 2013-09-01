#pragma strict

class EditorFlags extends OGPage {
	private class Flag {
		var instance : GameObject;
		var textField : OGTextField;
		var tickBox : OGTickBox;
		var button : OGButton;
		
		function Update ( index : String ) {
			instance.name = index;
			button.argument = index;
		}
		
		function Flag ( name : String ) {
			// Group
			instance = new GameObject ( "flag_" + name );
						
			// Textfield
			var txtName : GameObject = new GameObject ( "textfield" );
			textField = txtName.AddComponent ( OGTextField );
			
			txtName.transform.parent = instance.transform;
			txtName.transform.localPosition = new Vector3 ( 0, 0, -2 );
			txtName.transform.localScale = new Vector3 ( 360, 20, 1 );
			
			textField.maxLength = 24;
			textField.regex = "^a-zA-Z0-9_";
			textField.text = name;
			
			// Toggle
			var tickToggle : GameObject = new GameObject ( "toggle" );
			tickBox = tickToggle.AddComponent ( OGTickBox );
			
			tickToggle.transform.parent = instance.transform;
			tickToggle.transform.localPosition = new Vector3 ( 380, -1, -2 );
			tickToggle.transform.localScale = new Vector3 ( 20, 20, 1 );
			
			tickBox.label = "bool";
												
			// Delete button
			var btnPick : GameObject = new GameObject ( "btn" );
			button = btnPick.AddComponent ( OGButton );
			
			btnPick.transform.parent = instance.transform;
			btnPick.transform.localPosition = new Vector3 ( 450, 0, -2 );
			btnPick.transform.localScale = new Vector3 ( 20, 20, 1 );
			
			button.message = "DeleteFlag";
			button.argument = "0";
			button.text = "X";
		}
	}
	
	var scrollView : OGScrollView;
	
	@HideInInspector var flags : List.< Flag > = new List.< Flag >();
	@HideInInspector var flagTable : JSONObject;
	@HideInInspector var bottomLine : float = 0;
	
	function NewFlag ( name : String ) {		
		var flag : Flag = new Flag ( name );
	
		flags.Add ( flag );
		flag.instance.transform.parent = scrollView.transform;
		flag.instance.transform.localPosition = new Vector3 ( 0, bottomLine, 0 );
		flag.button.target = this.gameObject;
		
		bottomLine += 30;
		scrollView.scrollLength = bottomLine;
		
		flag.Update ( flags.IndexOf ( flag ).ToString() );
	}
	
	function Clear () {
		for ( var i = 0; i < scrollView.transform.childCount; i++ ) {
			Destroy ( scrollView.transform.GetChild ( i ).gameObject );
		}
		
		flags.Clear ();
		bottomLine = 0;
	}
	
	function DeleteFlag ( index : String ) {
		var flag : Flag = flags [ int.Parse ( index ) ];
		
		Destroy ( flag.instance );
		flags.Remove ( flag );
		
		SaveFlags ();
		
		ReadFlags ();
	}
	
	
	function Cancel () {
		OGRoot.GoToPage ( "MenuBase" );
		
		SaveFlags ();
	}
	
	function SaveFlags () {
		flagTable = new JSONObject ( JSONObject.Type.OBJECT );
		
		for ( var i = 0; i < flags.Count; i++ ) {
			flagTable.AddField ( flags[i].textField.text, false );
		}
		
		Saver.SaveFlags ( flagTable );
	}
	
	function ReadFlags () {
		Clear ();
		
		flagTable = Loader.LoadFlags ();
	
		for ( var i = 0; i < flagTable.list.Count; i++ ) {
			NewFlag ( flagTable.keys[i] as String );
		}
	}
	
	override function StartPage () {
		ReadFlags ();
	}
}