#pragma strict

class EditorPrefabs extends OGPage {
	var prefabList : Transform;
	var prefabSelector : OGPopUp;
	var currentDir : String;
	
	@HideInInspector var currentPrefab : String;
	
	private function ClearList () {
		for ( var i = 0; i < prefabList.childCount; i++ ) {
			Destroy ( prefabList.GetChild ( i ) );
		}
	}
	
	private function PopulateList () {
		var files : Object[] = Resources.LoadAll ( "Prefabs/" + currentDir, GameObject );
		
		var i : int = 0;
		
		for ( var f : GameObject in files ) {
			var obj : GameObject = new GameObject ( f.name );
			var btn = obj.AddComponent ( OGButton );
		
			btn.text = f.name;
			btn.target = this.gameObject;
			btn.message = "SelectPrefab";
			btn.argument = f.name;
			
			obj.transform.parent = prefabList;
			obj.transform.localScale = new Vector3 ( 468, 30, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 32, -2 );
			
			i++;
		}
	}
	
	function SelectPrefab ( n : String ) {
		currentPrefab = n;
		
		EditorCore.PreviewObject ( "Prefabs/" + currentDir + "/" + currentPrefab );
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
		EditorCore.ClearPreview ();
		EditorCore.AddPrefab ( currentDir, currentPrefab );
		OGRoot.GoToPage ( "MenuBase" );
	}
}