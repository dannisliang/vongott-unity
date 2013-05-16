#pragma strict

class EditorPrefabs extends OGPage {
	var prefabList : Transform;
	var prefabSelector : OGPopUp;
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
						
			img.transform.parent = prefabList;
			label.transform.parent = prefabList;
			
			img.transform.localPosition = new Vector3 ( x, y, 0.0 );
			label.transform.localPosition = new Vector3 ( x, y, 0.0 );
			
			l.text = name;
			//i.image = ;
			
		}
	}	*/
	
	private function ClearList () {
		for ( var i = 0; i < prefabList.childCount; i++ ) {
			Destroy ( prefabList.GetChild ( i ) );
		}
	}
	
	private function PopulateList () {
		var files : Object[] = Resources.LoadAll ( "Prefabs/" + currentDir, GameObject );
		
		for ( var f : GameObject in files ) {
			Debug.Log ( f.name );
		}
	}
	
	override function UpdatePage () {
		if ( prefabSelector.selectedOption != currentDir && prefabSelector.selectedOption != null && prefabSelector.selectedOption != "<directory>" ) {
			currentDir = prefabSelector.selectedOption;
			
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