#pragma strict

class EditorCharacters extends OGPage {
	var characterList : Transform;
	var characterSelector : OGPopUp;
	var currentDir : String;
/*
	private class ListItem {
		var img : GameObject;
		var label : GameObject;
		
		function ListItem ( name : String, x : float, y : float ) {
			img = new GameObject ( name + "_img" );
			label = new GameObject ( name + "_label" );
			
			var i : OGImage = img.AddComponent ( OGImage );
			var l : OGLabel = img.AddComponent ( OGLabel );
						
			img.transform.parent = characterList;
			label.transform.parent = characterList;
			
			img.transform.localPosition = new Vector3 ( x, y, 0.0 );
			label.transform.localPosition = new Vector3 ( x, y, 0.0 );
			
			l.text = name;
			//i.image = ;
			
		}
	}	*/
	
	private function ClearList () {
		for ( var i = 0; i < characterList.childCount; i++ ) {
			Destroy ( characterList.GetChild ( i ) );
		}
	}
	
	private function PopulateList () {
		var dir : DirectoryInfo = new DirectoryInfo( "Assets/Resources/Characters/" + currentDir );
		var info : FileInfo[] = dir.GetFiles ( "*.prefab" );
		
		for ( var i : FileInfo in info ) {
			Debug.Log ( i.Name );
		}
	}
	
	function Update () {
		if ( characterSelector.selectedOption != currentDir && characterSelector.selectedOption != null && characterSelector.selectedOption != "<directory>" ) {
			currentDir = characterSelector.selectedOption;
			
			ClearList ();
			PopulateList();
		}
	}
	
	function OK () {
		OGRoot.GoToPage ( "MenuBase" );
	}
	
	function Add () {
		OGRoot.GoToPage ( "MenuBase" );
	}
}