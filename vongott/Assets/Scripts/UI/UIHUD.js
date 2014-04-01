#pragma strict

private class StatusBar {
	var health : OGProgressBar;
	var energy : OGProgressBar;
}

private class NotificationBox {
	var parent : OGWidget;
	var background : OGSlicedSprite;
	var text : OGLabel;
}

class UIHUD extends OGPage {
	public var statusBar : StatusBar;
	public var notificationBox : NotificationBox;
	public var crosshair : GameObject;
	public var console : GameObject;
	
	private var notificationTimer : float = 0.0;
	private var notificationIndefinite : boolean = true;
	private var showingNotification : boolean = false;

	// Instance
	public static var instance : UIHUD;
	public static function GetInstance () : UIHUD {
		return instance;
	}
	
	// Init
	override function StartPage () {
		instance = this;

		GameCore.state = eGameState.Game;
		
		GameCore.GetInstance().SetPause ( false );
	}
	
	
	// Update
	override function UpdatePage () {
		if ( notificationTimer > 0.0 ) {
			notificationTimer -= Time.deltaTime;
		} else if ( !notificationIndefinite ) {
			ShowNotification ( "" );
		}
		
		statusBar.health.SetValue ( ( GameCore.GetPlayer().health * 1.0 / UpgradeManager.GetAbility ( eAbilityID.MaxHealth ) * 1.0 ) );
		statusBar.energy.SetValue ( GameCore.GetPlayer().energy / 100 );

		var delta : float = Time.deltaTime * 4;

		if ( showingNotification ) {
			if ( notificationBox.parent.anchor.yOffset > -180 ) {
				notificationBox.parent.anchor.yOffset -= delta * 40;
			}

			if ( notificationBox.text.tint.a < 1.0 ) {
				notificationBox.text.tint.a += delta;
			}
			
			if ( notificationBox.background.tint.a < 1.0 ) {
				notificationBox.background.tint.a += delta;
			}
		
		} else {
			if ( notificationBox.parent.anchor.yOffset < -160 ) {
				notificationBox.parent.anchor.yOffset += delta * 20;
			}

			if ( notificationBox.text.tint.a > 0.0 ) {
				notificationBox.text.tint.a -= delta;
			} else {
				notificationBox.text.text = "";
			}

			if ( notificationBox.background.tint.a > 0.0 ) {
				notificationBox.background.tint.a -= delta;
			}

		}
	}
	
	// Console
	public function ToggleConsole () {
		console.SetActive ( !console.activeSelf );

		if ( console.activeSelf ) {	
			GameCore.state = eGameState.Menu;
			InputManager.escFunction = ToggleConsole;
		} else {
			GameCore.state = eGameState.Game;
		}
	}

	// Aiming
	public function ToggleCrosshair () {
		crosshair.SetActive ( !crosshair.activeSelf );
	}
	
	
	// Notifications
	public function ShowTimedNotification ( msg : String, seconds : float ) {
		notificationTimer = seconds;
		ShowNotification ( msg );
		notificationIndefinite = false;
	}
	
	public function ShowNotification ( msg : String ) {
		if ( msg != notificationBox.text.text ) {
			notificationIndefinite = true;
			
			if ( msg != "" ) {
				showingNotification = true;
				notificationBox.text.text = msg;
			} else {
				showingNotification = false;
			}
		}
	}		
}
