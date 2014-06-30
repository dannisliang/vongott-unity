#pragma strict

class UIUpgrades extends OGPage {
	public var btnSkull : OGButton;
	public var btnEyes : OGButton;
	public var btnBack : OGButton;
	public var btnArms : OGButton;
	public var btnChest : OGButton;
	public var btnAbdomen : OGButton;
	public var btnLegs : OGButton;
	
	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
	}
	
	
	function Transition ( forward : boolean, callback : Function ) : IEnumerator {
		var time : float;
		
		if ( callback ) {
			var targetTime = System.DateTime.Now.AddSeconds ( time );
			
			while ( System.DateTime.Now < targetTime ) {
				yield null;
			}
			
			callback ();
		}
	}
	
	function Exit () {
		OGRoot.GetInstance().GoToPage ( "HUD" );
	}
	
	function Pick ( b : OGButton ) {		
		var slot : int = 0;
		var eStrings : String[] = System.Enum.GetNames ( eUpgradeRegion );

		for ( var i : int = 0; i < eStrings.Length; i++ ) {
			if ( eStrings[i] == b.name ) {
				slot = i;
				break;
			}
		}

		if ( !GameCore.GetUpgradeManager().GetUpgrade ( slot ) ) {
			return;
		}
		
		GameCore.GetUpgradeManager().Activate ( slot );
	}
	
	override function UpdatePage () {
		if ( Input.GetKeyDown( KeyCode.Escape ) ) {
			Exit ();
		}
	}
}
