#pragma strict

private class StatusBar {
	var health : OGProgressBar;
	var energy : OGProgressBar;
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
	var _crosshair : GameObject;
	var _debugText : OGLabel;
	
	// Static vars
	static var statusBar : StatusBar;
	static var notificationBox : NotificationBox;
	static var crosshair : GameObject;
	
	static var notificationTimer : float = 0.0;
	static var notificationIndefinite : boolean = true;
	
	
	////////////////////
	// Init
	////////////////////
	override function StartPage () {
		GameCore.state = eGameState.Game;
		
		statusBar = _statusBar;
		notificationBox = _notificationBox;
		crosshair = _crosshair;
		
		ShowNotification ( "" );
		
		GameCore.GetInstance().SetPause ( false );
	}
	
	
	////////////////////
	// Update
	////////////////////
	override function UpdatePage () {
		if ( notificationTimer > 0.0 ) {
			notificationTimer -= Time.deltaTime;
		} else if ( !notificationIndefinite ) {
			ShowNotification ( "" );
		}
		
		statusBar.health.SetValue ( ( GameCore.GetPlayer().health * 1.0 / UpgradeManager.GetAbility ( eAbilityID.MaxHealth ) * 1.0 ) );
		statusBar.energy.SetValue ( GameCore.GetPlayer().energy / 100 );
	}
	
	
	////////////////////
	// Aiming
	////////////////////
	static function ToggleCrosshair () {
		crosshair.SetActive ( !crosshair.activeSelf );
	}
	
	
	////////////////////
	// Notifications
	////////////////////
	// Show timed notification
	static function ShowTimedNotification ( msg : String, seconds : float ) {
		notificationTimer = seconds;
		ShowNotification ( msg );
		notificationIndefinite = false;
	}
	
	// Show notification
	static function ShowNotification ( msg : String ) {
		notificationIndefinite = true;
				
		if ( msg != notificationBox.text.text ) {
			notificationBox.text.text = msg;
		}
		
		notificationBox.instance.SetActive ( !(msg == "") );
	}
}
