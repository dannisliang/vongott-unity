#pragma strict

private class StatusBar {
	var health : OGProgressBar;
	var energy : OGProgressBar;
}

private class Ammo {
	var bar : OGProgressBar;
	var clip : OGProgressBar;
	var lbl : OGLabel;
	var gameObject : GameObject;
}

private class NotificationBox {
	var parent : OGWidget;
	var background : OGSlicedSprite;
	var text : OGLabel;
}

private class StashSlot {
	var background : OGSlicedSprite;
	var icon : OGTexture;
}

class UIHUD extends OGPage {
	public var ammo : Ammo;
	public var statusBar : StatusBar;
	public var notificationBox : NotificationBox;
	public var crosshair : GameObject;
	public var console : GameObject;
	public var stash : Transform;
	public var stashActiveColor : Color;
	public var stashInactiveColor : Color;
	public var stashSlots : StashSlot[];

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
		
		var p : Player = GameCore.GetPlayer ();

		statusBar.health.SetValue ( p.stats.hp * 1.0 / p.stats.maxHp * 1.0 );
		statusBar.energy.SetValue ( p.stats.mp * 1.0 / p.stats.maxMp * 1.0 );
		
		if ( p.equippedObject ) {
			var itm : OSItem = p.equippedObject;

			if ( itm.ammunition.enabled ) {
				if ( itm.ammunition.max <= 0 ) {
					ammo.lbl.text = "--";
					ammo.bar.SetValue ( 1 );
					ammo.clip.SetValue ( 1 );
				} else {
					ammo.lbl.text = itm.ammunition.clip + " / " + itm.ammunition.value;
					ammo.bar.SetValue ( itm.ammunition.value * 1.0 / itm.ammunition.max * 1.0 );
					ammo.clip.SetValue ( itm.ammunition.clip * 1.0 / itm.GetAttribute ( "Capacity" ) * 1.0 );
				}

				ammo.gameObject.SetActive ( true );
			
			} else {
				ammo.gameObject.SetActive ( false );

			}
		
		} else {
			ammo.gameObject.SetActive ( false );

		}

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

		// Update stash
		var stash : List.< int > = GameCore.GetInventory().quickSlots;

		for ( var i : int = 0; i < stashSlots.Length; i++ ) {
			if ( i < stash.Count ) {
				var slot : OSSlot = GameCore.GetInventory().slots [ stash[i] ];

				if ( slot.item ) {
					stashSlots[i].icon.mainTexture = slot.item.thumbnail;

					if ( slot.equipped ) {
						stashSlots[i].background.tint = stashActiveColor;
						stashSlots[i].icon.tint.a = stashSlots[i].background.tint.a;

					} else {
						stashSlots[i].background.tint = stashInactiveColor;
						stashSlots[i].icon.tint.a = stashSlots[i].background.tint.a;

					}
				
				} else {
					stashSlots[i].icon.mainTexture = null;
					stashSlots[i].background.tint = stashInactiveColor;
					stashSlots[i].icon.tint.a = stashSlots[i].background.tint.a;

				}
			
			} else {
				stashSlots[i].icon.mainTexture = null;
				stashSlots[i].background.tint = stashInactiveColor;
				stashSlots[i].icon.tint.a = stashSlots[i].background.tint.a;

			}
			
		}
	}
	
	// Console
	public function ToggleConsole () {
		if ( !console ) { return; }

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
