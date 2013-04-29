#pragma strict

private class Tab {
	var label : String;
	var message : String;
	var argument : String;
}

enum TabDirection {
	Horizontal,
	Vertical
}

class OGTabs extends OGWidget {
	var messageTarget : GameObject;
	var tabs : Tab[];
	var direction : TabDirection = TabDirection.Horizontal;
	var activeTab = 0;
	
	var normal : GUIStyle;
	var activated : GUIStyle;
	
	override function Draw ( x : float, y : float ) {
		GUI.depth = depth;
		
		if ( direction == TabDirection.Horizontal ) {
			GUI.Box ( Rect ( x, y, transform.localScale.x * tabs.Length, transform.localScale.y ), "" );
			for ( var i = 0; i < tabs.Length; i++ ) {				
				if ( GUI.Button ( Rect ( x + ( i * transform.localScale.x ), y, transform.localScale.x, transform.localScale.y ), tabs[i].label, normal ) ) {
					messageTarget.SendMessage ( tabs[i].message, tabs[i].argument );
					activeTab = i;
				}
			}
		} else {
			GUI.Box ( Rect ( x, y, transform.localScale.x, transform.localScale.y * tabs.Length ), "" );
			for ( i = 0; i < tabs.Length; i++ ) {				
				if ( GUI.Button ( Rect ( x, y + ( i * transform.localScale.y ), transform.localScale.x, transform.localScale.y ), tabs[i].label, normal ) ) {
					messageTarget.SendMessage ( tabs[i].message, tabs[i].argument );
					activeTab = i;
				}
			}
		}
	}
}