#pragma strict

class EditorPickFlag extends OGPage {
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
			instance = new GameObject ( "flag" );
						
			// Textfield
			var txtName : GameObject = new GameObject ( "textfield" );
			textField = txtName.AddComponent ( OGTextField );
			
			txtName.transform.parent = instance.transform;
			txtName.transform.localPosition = new Vector3 ( 0, 0, -2 );
			txtName.transform.localScale = new Vector3 ( 240, 20, 1 );
			
			textField.maxLength = 24;
			textField.restrictASCII = true;
			textField.text = name;
			textField.style = "textfield";
			
			// Toggle
			var tickToggle : GameObject = new GameObject ( "toggle" );
			tickBox = tickToggle.AddComponent ( OGTickBox );
			
			tickToggle.transform.parent = instance.transform;
			tickToggle.transform.localPosition = new Vector3 ( 250, 0, -2 );
			tickToggle.transform.localScale = new Vector3 ( 20, 20, 1 );
			
			tickBox.style = "toggle";
			
			// Pick button
			var btnPick : GameObject = new GameObject ( "btn" );
			button = btnPick.AddComponent ( OGButton );
			
			btnPick.transform.parent = instance.transform;
			btnPick.transform.localPosition = new Vector3 ( 280, 0, -2 );
			btnPick.transform.localScale = new Vector3 ( 80, 20, 1 );
			
			button.message = "Pick";
			button.argument = "0";
			button.style = "button";
			button.text = "Pick";
		}
	}
	
	var scrollView : OGScrollView;
	
	static var target : OGButton;
	static var sender : String = "";
	
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
	
	function Pick ( index : String ) {
		var flag : Flag = flags [ int.Parse ( index ) ];
		
		if ( target != null && sender != "" ) {
			target.text = flag.textField.text + " | " + flag.tickBox.isChecked.ToString();
			OGRoot.GoToPage ( sender );
		}
		
		SaveFlags ();
	}
	
	
	function Cancel () {
		if ( sender != "" ) {
			target.text = "(none)";
			OGRoot.GoToPage ( sender );
		}
	}
	
	function SaveFlags () {
		flagTable = new JSONObject ( JSONObject.Type.OBJECT );
		
		for ( var i = 0; i < flags.Count; i++ ) {
			flagTable.AddField ( flags[i].textField.text, flags[i].tickBox.isChecked );
		}
		
		Saver.SaveFlags ( flagTable );
	}
	
	function ReadFlags () {
		Clear ();
		
		flagTable = Loader.LoadFlags ();
	
		for ( var i = 0; i < flagTable.list.Count; i++ ) {
			NewFlag ( flagTable.keys[i] );
		}
	}
	
	override function StartPage () {
		ReadFlags ();
	}
}