#pragma strict

class EditorQuests extends OGPage {
	var fileModeSwitch : OGPopUp;
	var fileModeSelect : GameObject;
	var fileModeCreate : GameObject;
	
	function SelectMode () {
		if ( fileModeSwitch.selectedOption == "Select" ) {
			fileModeSelect.SetActive ( true );
			fileModeCreate.SetActive ( false );
		} else {
			fileModeSelect.SetActive ( false );
			fileModeCreate.SetActive ( true );
		}
	}
}