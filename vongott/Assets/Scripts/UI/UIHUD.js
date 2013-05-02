#pragma strict

private class StatusBar {
	var health : OGSlider;
	var energy : OGSlider;
}

private class NotificationBox {
	var instance : GameObject;
	var text : OGLabel;
}

class UIHUD extends OGPage {
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var _statusBar : StatusBar;
	var _notificationBox : NotificationBox;
	
	// Static vars
	static var statusBar : StatusBar;
	static var notificationBox : NotificationBox;
	
	
	////////////////////
	// Init
	////////////////////
	function Start () {
		statusBar = _statusBar;
		notificationBox = _notificationBox;
		
		ShowNotification ( "" );
	}
	
	
	////////////////////
	// Update
	////////////////////
	function Update () {
		if ( Input.GetKeyDown(KeyCode.I) ) {
			OGRoot.GoToPage ( "Inventory" );
		}
	}
	
	////////////////////
	// Notifications
	////////////////////
	// Show notification
	static function ShowNotification ( msg : String ) {
		if ( msg != notificationBox.text.text ) {
			notificationBox.text.text = msg;
		}
	}
}