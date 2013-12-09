#pragma strict

import System.Collections.Generic;

class EditorFlags extends OGPage {
	private class Flag {
		var instance : GameObject;
		var textField : OGTextField;
		var button : OGButton;
		
		function Update ( i : int ) {
			instance.name = i.ToString();
			button.argument = i.ToString();
			instance.transform.localPosition = new Vector3 ( 0, i * 30, 0 );
		}
		
		function Flag ( name : String ) {
			// Group
			instance = new GameObject ( "flag_" + name );
						
			// Textfield
			var txtName : GameObject = new GameObject ( "textfield" );
			textField = txtName.AddComponent ( OGTextField );
			
			txtName.transform.parent = instance.transform;
			txtName.transform.localPosition = new Vector3 ( 0, 0, -2 );
			txtName.transform.localScale = new Vector3 ( 440, 20, 1 );
			
			textField.maxLength = 48;
			textField.regex = "^a-zA-Z0-9_-";
			textField.text = name;
						
			textField.GetDefaultStyles();

			// Delete button
			var btnPick : GameObject = new GameObject ( "btn" );
			button = btnPick.AddComponent ( OGButton );
			
			btnPick.transform.parent = instance.transform;
			btnPick.transform.localPosition = new Vector3 ( 450, 0, -2 );
			btnPick.transform.localScale = new Vector3 ( 20, 20, 1 );
			
			button.message = "DeleteFlag";
			button.argument = "0";
			button.text = "X";

			button.GetDefaultStyles();
		}
	}
	
	var scrollView : OGScrollView;
	var warningMessage : OGLabel;
	
	private var flags : List.< Flag > = new List.< Flag >();
	private var flagTable : JSONObject;
	private var bottomLine : float = 0;
	
	function NewFlag ( name : String ) {		
		if ( FlagExists ( name ) ) { return; }
		
		var flag : Flag = new Flag ( name );
	
		flags.Add ( flag );
		flag.instance.transform.parent = scrollView.transform;
		flag.button.target = this.gameObject;
		
		SortFlags ();
		
		scrollView.position.y = flag.instance.transform.position.y - 255;
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
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	}
	
	function OK () {
		if ( HasDuplicates() ) { return; }
		
		OGRoot.GetInstance().GoToPage ( "MenuBase" );
	
		SaveFlags ();
	}
	
	function FlagExists ( str : String ) : boolean {
		for ( var f : Flag in flags ) {
			if ( f.textField.text == str ) {
				return true;
			}
		}
		
		return false;
	}
	
	function HasDuplicates () : boolean {
		var dic : Dictionary.< String, Flag > = new Dictionary.< String, Flag > ();
		
		for ( var f : Flag in flags ) {
			if ( dic.ContainsKey ( f.textField.text ) ) {
				warningMessage.text = "DUPLICATE FLAG:\n" + f.textField.text;
				return true;
			} else {
				dic.Add ( f.textField.text, f );
			}
		}
		
		return false;
	}
	
	function SortFlags () {
		var dic : Dictionary.< String, Flag > = new Dictionary.< String, Flag > ();
		var arr : Array = new Array ();
		bottomLine = 0;
		
		for ( var f : Flag in flags ) {
			dic.Add ( f.textField.text, f );
			arr.Push ( f.textField.text );
		}
		
		arr.Sort ();
		
		for ( var i = 0; i < arr.length; i++ ) {
			dic[arr[i] as String].Update ( i );
			bottomLine += 30;
		}
		
		OGRoot.GetInstance().SetDirty();	
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
		
		SortFlags ();
	}
	
	override function StartPage () {
		warningMessage.text = "";	
		ReadFlags ();
	}
}
