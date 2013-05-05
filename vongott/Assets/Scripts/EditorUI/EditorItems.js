#pragma strict

class EditorItems extends OGPage {
	var itemList : Transform;
	var itemSelector : OGPopUp;
	var currentDir : String = "";
	var currentItem : String = "";
	var title : OGLabel;

	function CreateItem ( name : String, x : float, y : float ) {
		var button : GameObject = new GameObject ( name + "_btn" );
		var img : GameObject = new GameObject ( name + "_img" );
		var label : GameObject = new GameObject ( name + "_label" );
		
		var b : OGButton = button.AddComponent ( OGButton );
		var i : OGImage = img.AddComponent ( OGImage );
		var l : OGLabel = label.AddComponent ( OGLabel );
		
		button.transform.parent = itemList;			
		img.transform.parent = itemList;
		label.transform.parent = itemList;
		
		button.transform.localPosition = new Vector3 ( x, y, 0.0 );
		img.transform.localPosition = new Vector3 ( x+10, y+10, 0.0 );
		label.transform.localPosition = new Vector3 ( x, y+80, 0.0 );
		
		button.transform.localScale = new Vector3 ( 100, 100, 0 );
		img.transform.localScale = new Vector3 ( 80, 80, 0 );
		label.transform.localScale = new Vector3 ( 100, 30, 0 );
		
		b.target = this.gameObject;
		b.style = "Button";
		b.message = "SelectItem";
		b.argument = name;
		
		l.style = "bodyCentered"; 
		l.text = name;
		//i.image = ;
			
	}
	
	function SelectItem ( name : String ) {
		title.text = "Select an item ( " + name + " )";
		currentItem = name;
	}
	
	private function ClearList () {
		for ( var i = 0; i < itemList.childCount; i++ ) {
			DestroyImmediate ( itemList.GetChild ( i ).gameObject );
		}
	}
	
	private function PopulateList () {
		ClearList ();
		
		var dir : DirectoryInfo = new DirectoryInfo( "Assets/Resources/Items/" + currentDir );
		var info : FileInfo[] = dir.GetFiles ( "*.prefab" );
		
		var col = 0;
		var row = 0;
		
		for ( var i : FileInfo in info ) {
			CreateItem ( i.Name.Replace ( ".prefab", "" ), col * 110, row * 110 );
		
			if ( col < 3 ) {
				col++;
				
			} else {
				col = 0;
				row++;
			
			}
		}
	}
	
	function OK () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function Add () {
		if ( currentDir != "" && currentItem != "" ) {
			EditorCore.AddItem ( currentDir, currentItem );
			
			OGRoot.GoToPage ( "MenuBase" );
		}
	}
	
	function Start () {
		PopulateList ();
	}
	
	function Update () {
		if ( itemSelector.selectedOption != currentDir && itemSelector.selectedOption != null && itemSelector.selectedOption != "<directory>" ) {
			currentDir = itemSelector.selectedOption;
			
			ClearList ();
			PopulateList();
		}
	}
}