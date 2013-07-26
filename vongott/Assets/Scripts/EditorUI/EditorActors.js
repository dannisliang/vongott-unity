#pragma strict

class EditorActors extends OGPage {
	var actorList : Transform;
	var actorSelector : OGPopUp;
	var currentDir : String = "";
	var currentActor : String = "";
	var title : OGLabel;
	var actorName : OGLabel;

	var listItemPrefab : EditorListItem;
		
	function SelectItem ( n : String ) {
		actorName.text = n;
		currentActor = n;
	}
	
	private function ClearList () {
		for ( var i = 0; i < actorList.childCount; i++ ) {
			DestroyImmediate ( actorList.GetChild ( i ).gameObject );
		}
	}
	
	private function PopulateList () {
		ClearList ();
		
		var files : Object[] = Resources.LoadAll ( "Actors/" + currentDir, GameObject );
		
		var col = 0;
		var row = 0;
		
		for ( var f : Object in files ) {
			var item : EditorListItem = Instantiate ( listItemPrefab );
			item.transform.parent = actorList;
			item.transform.localScale = Vector3.one;
			item.transform.localPosition = new Vector3 ( col * 116, row * 116, 0 );
		
			item.gameObject.name = (f as GameObject).name;
			item.button.target = this.gameObject;
			item.button.argument = (f as GameObject).name;
		
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
		if ( currentDir != "" && currentActor != "" ) {
			EditorCore.AddActor ( currentDir, currentActor );
			
			OGRoot.GoToPage ( "MenuBase" );
		}
	}
	
	override function StartPage () {
		PopulateList ();
	}
	
	override function UpdatePage () {
		if ( actorSelector.selectedOption != currentDir && actorSelector.selectedOption != null && actorSelector.selectedOption != "<directory>" ) {
			currentDir = actorSelector.selectedOption;
			
			ClearList ();
			PopulateList();
		}
	}
}