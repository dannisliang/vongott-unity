#pragma strict

private class StatusBar {
	var health : OGSlider;
	var energy : OGSlider;
}

private class NotificationBox {
	var instance : GameObject;
	var background : GameObject;
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
	static var notificationTimer : float = 0.0;
	
	
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
		} else if ( Input.GetKeyDown(KeyCode.Q) ) {
			OGRoot.GoToPage ( "Quests" );
		} else if ( Input.GetKeyDown(KeyCode.Period) ) {
			GameCore.GoToEditor ();
		}
		
		if ( notificationTimer > 0.0 ) {
			notificationTimer -= Time.deltaTime;
		} else {
			ShowNotification ( "" );
		}
	}
	
	
	////////////////////
	// Notifications
	////////////////////
	// Show timed notification
	static function ShowTimedNotification ( msg : String, seconds : float ) {
		notificationTimer = seconds;
		ShowNotification ( msg );
	}
	
	// Show notification
	static function ShowNotification ( msg : String ) {
		if ( msg != notificationBox.text.text ) {
			notificationBox.text.text = msg;
		}
		
		notificationBox.instance.SetActive ( !(msg == "") );
		
		var length : float = ( msg.Length * 4 ) + 80;
		notificationBox.background.transform.localScale = new Vector3 ( length, notificationBox.background.transform.localScale.y, 1.0 );
		notificationBox.text.transform.localScale = notificationBox.background.transform.localScale;
		notificationBox.instance.GetComponent(OGWidget).anchor.xOffset = -(length/2);
	}
}