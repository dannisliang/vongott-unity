#pragma strict

class EditorBrowser extends OGPage {
	var fileList : Transform;
	var dirSelector : OGPopUp;
	var currentDir : String;
	var addButton : OGButton;
	var title : OGLabel;
	
	static var rootFolder : String;
	static var mode : String = "Add";
	static var argument : String;
	
	@HideInInspector var currentFile : String;
	@HideInInspector var folders : String[];
	
	private function ClearList () {
		for ( var i = 0; i < fileList.childCount; i++ ) {
			Destroy ( fileList.GetChild ( i ).gameObject );
		}
	}
	
	function DeselectAll () {
		for ( var i = 0; i < fileList.transform.childCount; i++ ) {
			var btn : OGButton = fileList.transform.GetChild ( i ).gameObject.GetComponent ( OGButton );
			btn.style = "listitem";		
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
			btn.style = "listitem";
			
			obj.transform.parent = fileList;
			obj.transform.localScale = new Vector3 ( 468, 30, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 32, -2 );
			
			i++;
		}
	}
	
	function SelectFile ( btn : OGButton ) {
		DeselectAll ();
		
		currentFile = btn.text;
		btn.style = "listitemselected";
		
		EditorCore.PreviewObject ( rootFolder + "/" + currentDir + "/" + currentFile );
	}
	
	function SetFolders () {
		folders = null;
		
		if ( rootFolder == "Prefabs" ) {
			folders = new String[2];
			folders[0] = "Levels/AwesomeIsland";
			folders[1] = "Interior/Furniture";
		
		} else if ( rootFolder == "Items" ) {
			folders = new String[3];
			folders[0] = "Equipment";
			folders[1] = "Consumables";
			folders[2] = "Upgrades";
		
		} else if ( rootFolder == "Actors" ) {
			folders = new String[3];
			folders[0] = "NPC";
			folders[1] = "Player";
			folders[2] = "Animals";
		
		}
	
		dirSelector.options = folders;
	
	}
		
	override function StartPage () {
		ClearList ();
		addButton.text = mode;
		title.text = mode + " " + rootFolder.ToLower();
		SetFolders ();
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