#pragma strict

class EditorPrefabs extends OGPage {
	var prefabList : Transform;
	var prefabSelector : OGPopUp;
	var currentDir : String;
	var listItemPrefab : EditorListItem;
	var itemName : OGLabel;
	var selectedItem : GameObject;
	
	private function ClearList () {
		for ( var i = 0; i < prefabList.childCount; i++ ) {
			Destroy ( prefabList.GetChild ( i ) );
		}
	}
	
	private function PopulateList () {
		var files : Object[] = Resources.LoadAll ( "Prefabs/" + currentDir, GameObject );
		
		var col : float = 0;
		var row : float = 0;
		
		for ( var f : GameObject in files ) {
			var item : EditorListItem = Instantiate ( listItemPrefab );
			item.transform.parent = prefabList;
			item.transform.localScale = Vector3.one;
			item.transform.localPosition = new Vector3 ( col * 110, row * 110, 0 );
		
			item.gameObject.name = f.name;
			item.label.text = "";
			item.button.target = this.gameObject;
			item.button.argument = f.name;
		
			if ( col < 3 ) {
				col++;
			} else {
				col = 0;
				row++;
			}
		}
	}
	
	function SelectItem ( n : String ) {
		itemName.text = n;
		selectedItem = Resources.Load ( "Prefabs/" + currentDir + "/" + n );
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
		EditorCore.SpawnObject ( selectedItem );
		OGRoot.GoToPage ( "MenuBase" );
	}
}