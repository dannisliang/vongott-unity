#pragma strict

@script AddComponentMenu ("OpenGUI/Button3D")

class OGButton3D extends MonoBehaviour {
	enum ButtonExecType {
		Press,
		Release
	}
	
	var cam : Camera;
	var func : Function;
	var messageTarget : GameObject;
	var message : String = "";
	var hoverMessage : String = "";
	var argument : String = "";
	var pressBack : Vector3;
	var executeOn : ButtonExecType;
	
	
	// Hover
	function Hover () {
		if ( !messageTarget ) { return; }
		if ( hoverMessage == "" ) { return; }
		
		if ( argument != "" ) {
			messageTarget.SendMessage ( hoverMessage, argument );
		} else {
			messageTarget.SendMessage ( hoverMessage, this );
		}
	}
	
	// Send message
	function SendMessage () {
		if ( func ) {
			func ();
			return;
		}
		
		if ( !messageTarget ) { Debug.LogError ( "No message target set" ); return; }
		if ( message == "" ) { Debug.LogError ( "No message set" ); return; }
			
		if ( argument != "" ) {
			messageTarget.SendMessage ( message, argument );
		} else {
			messageTarget.SendMessage ( message, this );
		}
	}
	
	// Press button
	function PressButton () {
		if ( executeOn == ButtonExecType.Press ) {
			SendMessage ();
			return;
		}
		
		// animate
		transform.localPosition += pressBack;		
	}
	
	// Release button
	function ReleaseButton () {
		// animate
		transform.localPosition -= pressBack;		
		
		if ( executeOn == ButtonExecType.Release ) {
			SendMessage ();
		}
	}
	
	// Init
	function Start () {
		if ( !cam ) {
			cam = Camera.main;
		}
	}
	
	// Update
	function Update () {
		var ray : Ray = cam.ScreenPointToRay ( Input.mousePosition );
		var hit : RaycastHit;
		
		if ( Physics.Raycast ( ray, hit ) ) {
			var obj : GameObject = hit.collider.gameObject;
			
			if ( obj == gameObject ) {
				if ( Input.GetMouseButtonDown(0) ) {
					PressButton ();
				} else if ( Input.GetMouseButtonUp(0) ) {
					ReleaseButton ();						
				} else {
					Hover ();
				}
			}
		
		}
	}
}