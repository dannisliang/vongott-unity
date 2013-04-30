#pragma strict

private class Tab {
	var label : String;
	var message : String;
	var argument : String;

	function Tab ( l : String, m : String, a : String ) {
		label = l;
		message = m;
		argument = a;
	}
}

enum TabDirection {
	Horizontal,
	Vertical
}

class OGTabs extends OGWidget {
	var messageTarget : GameObject;
	var tabs : List.<Tab> = new List.<Tab>();
	var direction : TabDirection = TabDirection.Horizontal;
	var activeTab = 0;
	
	var normal : GUIStyle;
	
	@HideInInspector var boxPos : Vector2 = Vector2.zero; 
	
	public function AddTab ( label : String, message : String, argument : String ) {
		tabs.Add ( new Tab ( label, message, argument ) );
	}
	
	override function UpdateWidget () {
		if ( direction == TabDirection.Vertical ) {
			boxPos.y = activeTab * transform.localScale.y;
		} else {
			boxPos.x = activeTab * transform.localScale.x;
		}
	}
	
	override function Draw ( x : float, y : float ) {
		GUI.depth = depth;
		
		if ( direction == TabDirection.Horizontal ) {
			GUI.Box ( Rect ( x + boxPos.x, y, transform.localScale.x, transform.localScale.y ), "" );
			for ( var i = 0; i < tabs.Count; i++ ) {				
				if ( GUI.Button ( Rect ( x + ( i * transform.localScale.x ), y, transform.localScale.x, transform.localScale.y ), tabs[i].label, normal ) ) {
					if ( tabs[i].label != "" ) {	
						messageTarget.SendMessage ( tabs[i].message, tabs[i].argument );
						activeTab = i;
					}
				}
			}
		} else {
			GUI.Box ( Rect ( x, y + boxPos.y, transform.localScale.x, transform.localScale.y ), "" );
			for ( i = 0; i < tabs.Count; i++ ) {				
				if ( GUI.Button ( Rect ( x, y + ( i * transform.localScale.y ), transform.localScale.x, transform.localScale.y ), tabs[i].label, normal ) ) {
					if ( tabs[i].label != "" ) {
						messageTarget.SendMessage ( tabs[i].message, tabs[i].argument );
						activeTab = i;
					}
				}
			}
		}
	}
}