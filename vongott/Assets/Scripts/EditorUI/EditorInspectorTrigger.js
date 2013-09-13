#pragma strict

class EditorInspectorTrigger extends MonoBehaviour {
	var fireOnce : OGTickBox;
	var endQuest : OGButton;
	var startAnimation : OGPopUp;
	var startQuest : OGButton;
	var setFlag : OGButton;
	var travelMap : OGButton;
	var travelPoint : OGPopUp;
	
	function Init ( obj : GameObject ) {
		var trg : Trigger = obj.GetComponent ( Trigger );
		if ( trg == null ) { return; }
		
		fireOnce.isChecked = trg.fireOnce;
		if ( trg.endQuest != "(none)" ) { endQuest.text = trg.endQuest; }
		if ( trg.startAnimation != "(none)" ) { startAnimation.selectedOption = trg.startAnimation; }
		if ( trg.startQuest != "(none)" ) { startQuest.text = trg.startQuest; }
		if ( trg.setFlag != "(none)" ) { setFlag.text = trg.setFlag; }
		
		if ( travelMap.text != "<map>" ) {
			trg.travelMap = travelMap.text;
			travelPoint.options = EditorCore.GetSpawnPoints ( travelMap.text );	
		}
		
		if ( trg.travelPoint != "(none)" ) { travelPoint.selectedOption = trg.travelPoint; }
	}
	
	function PickQuest ( btn : OGButton ) {
		EditorPicker.mode = "quest";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickMap ( btn : OGButton ) {
		EditorPicker.mode = "map";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	function PickFlag ( btn : OGButton ) {
		EditorPicker.mode = "flag";
		EditorPicker.button = btn;
		EditorPicker.sender = "MenuBase";
		
		EditorPicker.func = UpdateObject;
		
		OGRoot.GoToPage ( "Picker" );
	}
	
	function UpdateObject () {
		var obj : GameObject = EditorCore.GetSelectedObject();
		
		if ( !obj ) { return; }
		
		if ( obj.GetComponent ( Trigger ) ) {
			var trg : Trigger = obj.GetComponent ( Trigger );
			
			trg.fireOnce = fireOnce.isChecked;
			if ( endQuest.text != "<quest>" ) { trg.endQuest = endQuest.text; }
			if ( startAnimation.selectedOption != "<animation>" ) { trg.startAnimation = startAnimation.selectedOption; }
			if ( startQuest.text != "<quest>" ) { trg.startQuest = startQuest.text; }
			if ( setFlag.text != "<consequence>" ) { trg.setFlag = setFlag.text; }
			
			if ( travelMap.text != "<map>" ) {
				trg.travelMap = travelMap.text;
				travelPoint.options = EditorCore.GetSpawnPoints ( travelMap.text );	
			}
			
			if ( travelPoint.selectedOption != "<spawnpoint>" ) { trg.travelPoint = travelPoint.selectedOption; }
		}
	}
}