#pragma strict

class UIUpgrades extends OGPage {
	var animations : OGTween[];
	
	var upgName : OGLabel;
	
	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
		upgName.text = "";
	}
	
	
	function Transition ( forward : boolean, callback : Function ) : IEnumerator {
		var time : float;
		
		for ( var t : OGTween in animations ) {
			t.Play ( forward );
		
			if ( t.move.enabled && t.move.time > time ) { time = t.move.time; }
			if ( t.rotate.enabled && t.rotate.time > time ) { time = t.rotate.time; }
			if ( t.scale.enabled && t.scale.time > time ) { time = t.scale.time; }
		}	
		
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
		var slot : String = b.name;
		
		if ( !UpgradeManager.GetUpgrade ( slot ) ) {
			return;
		}
		
		UpgradeManager.Activate ( slot );
	}
	
	override function UpdatePage () {
		if ( Input.GetKeyDown( KeyCode.Escape ) ) {
			Exit ();
		}
	}
}
