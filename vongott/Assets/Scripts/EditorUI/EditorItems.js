#pragma strict

class EditorItems extends OGPage {
	var itemList : Transform;
	var itemSelector : OGPopUp;
	var currentDir : String = "";
	
	var listItemPrefab : EditorListItem;
	
	var currentItem : String = "";
	var title : OGLabel;
	
	static var equipping : int = 99;
	
	function SelectItem ( n : String ) {
		currentItem = n;
	}
	
	private function ClearList () {
		for ( var i = 0; i < itemList.childCount; i++ ) {
			DestroyImmediate ( itemList.GetChild ( i ).gameObject );
		}
	}
	
	private function PopulateList () {
		ClearList ();
		
		var files : Object[] = Resources.LoadAll ( "Items/" + currentDir, GameObject );
		
		var i : int = 0;
		
		for ( var f : GameObject in files ) {
			var obj : GameObject = new GameObject ( f.name );
			var btn = obj.AddComponent ( OGButton );
		
			btn.text = f.name;
			btn.target = this.gameObject;
			btn.message = "SelectFile";
			btn.argument = f.name;
			
			obj.transform.parent = itemList;
			obj.transform.localScale = new Vector3 ( 468, 30, 1 );
			obj.transform.localPosition = new Vector3 ( 0, i * 32, -2 );
			
			i++;
		}
	}
	
	function OK () {
		OGRoot.GoToPage ( "MenuBase" );
		
		if ( equipping != 99 ) {
			EditorCore.ReselectObject();
			equipping = 99;
		}
	}
	
	function Add () {
		if ( currentDir != "" && currentItem != "" ) {
			if ( equipping != 99 ) {
				EditorCore.EquipItem ( currentDir, currentItem, equipping );
				OGRoot.GoToPage ( "MenuBase" );
				EditorCore.ReselectObject();
			} else {
				EditorCore.AddItem ( currentDir, currentItem );		
				OGRoot.GoToPage ( "MenuBase" );
			}
		}
	}
	
	override function StartPage () {
		PopulateList ();
	}
	
	override function UpdatePage () {
		if ( itemSelector.selectedOption != currentDir && itemSelector.selectedOption != null && itemSelector.selectedOption != "<directory>" ) {
			currentDir = itemSelector.selectedOption;
			
			ClearList ();
			PopulateList();
		}
	}
}