#pragma strict

class EditorActors extends OGPage {
	var actorList : Transform;
	var actorSelector : OGPopUp;
	var currentDir : String = "";
	var currentActor : String = "";
	var title : OGLabel;

	function CreateItem ( name : String, x : float, y : float ) {
		var button : GameObject = new GameObject ( name + "_btn" );
		var img : GameObject = new GameObject ( name + "_img" );
		var label : GameObject = new GameObject ( name + "_label" );
		
		var b : OGButton = button.AddComponent ( OGButton );
		var i : OGImage = img.AddComponent ( OGImage );
		var l : OGLabel = label.AddComponent ( OGLabel );
		
		button.transform.parent = actorList;			
		img.transform.parent = actorList;
		label.transform.parent = actorList;
		
		button.transform.localPosition = new Vector3 ( x, y, 0.0 );
		img.transform.localPosition = new Vector3 ( x+10, y+10, 0.0 );
		label.transform.localPosition = new Vector3 ( x, y+80, 0.0 );
		
		button.transform.localScale = new Vector3 ( 100, 100, 0 );
		img.transform.localScale = new Vector3 ( 80, 80, 0 );
		label.transform.localScale = new Vector3 ( 100, 30, 0 );
		
		b.target = this.gameObject;
		b.message = "SelectActor";
		b.argument = name;
		
		l.text = name;
			
	}
	
	function SelectActor ( name : String ) {
		title.text = "Select an actor ( " + name + " )";
		currentActor = name;
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
		
		for ( var f : GameObject in files ) {
			CreateItem ( f.name, col * 110, row * 110 );
		
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