#pragma strict

class EditorBrowser extends OGPage {
	var fileList : Transform;
	var dirSelector : OGPopUp;
	var currentDir : String;
	var addButton : OGButton;
	var title : OGLabel;
	
	static var rootFolder : String;
	static var mode : String = "Add";
	static var folders : String[];
	static var argument : String;
	
	@HideInInspector var currentFile : String;
	
	private function ClearList () {
		for ( var i = 0; i < fileList.childCount; i++ ) {
			Destroy ( fileList.GetChild ( i ).gameObject );
		}
	}
	
	private function PopulateList () {
		var files : Object[] = Resources.LoadAll ( rootFolder + "/" + currentDir, GameObject );
		
		var i : int = 0;
		
		for ( var f : GameObject in files ) {
			var obj : GameObject = new GameObject ( f.name );
			var btn = obj.AddComponent ( OGButton );
		
			btn.text = f.name;
			btn.target = this.gameObject;
			btn.message = "SelectFile";
			btn.argument = f.name;
			
			obj.transform.parent = fileList;
			obj.transform.localScale = new Vector3 ( 468, 30, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 32, -2 );
			
			i++;
		}
	}
	
	function SelectFile ( n : String ) {
		currentFile = n;
		
		EditorCore.PreviewObject ( rootFolder + "/" + currentDir + "/" + currentFile );
	}
		
	override function StartPage () {
		addButton.text = mode;
		title.text = mode + " " + rootFolder.ToLower();
		dirSelector.options = folders;
	}
	
	override function UpdatePage () {
		if ( dirSelector.selectedOption != currentDir && dirSelector.selectedOption != null ) {
			currentDir = dirSelector.selectedOption;
			
			ClearList ();
			PopulateList();
		}
	}
	
	function OK () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function Add () {
		EditorCore.ClearPreview ();
		
		if ( mode == "Add" ) {
			EditorCore.AddObject ( rootFolder, currentDir, currentFile );
		
		} else if ( mode == "Equip" ) {
			EditorCore.EquipItem ( currentDir, currentFile, int.Parse(argument) );
			EditorCore.ReselectObject();
			
		}
		
		OGRoot.GoToPage ( "MenuBase" );
	}
}