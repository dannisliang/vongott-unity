#pragma strict

@script AddComponentMenu ("OpenGUI/Button3D")

class OGButton3D extends MonoBehaviour {
	enum ButtonExecType {
		Press,
		Release
	}
	
	var func : Function;
	var messageTarget : GameObject;
	var message : String;
	var argument : String;
	var pressBack : float;
	var executeOn : ButtonExecType;
	
	// Send message
	function SendMessage () {
		if ( func ) {
			func ();
			return;
		}
		
		if ( !messageTarget ) { Debug.LogError ( "No message target set" ); return; }
		if ( !message ) { Debug.LogError ( "No message set" ); return; }
			
		if ( argument ) {
			messageTarget.SendMessage ( message, argument );
		} else {
			messageTarget.SendMessage ( message );
		}
	}
	
	// Press button
	function PressButton () {
		if ( executeOn == ButtonExecType.Press ) {
			SendMessage ();
			return;
		}
		
		// animate
		if ( pressBack ) {
			transform.localPosition = new Vector3 ( transform.localPosition.x, transform.localPosition.y, transform.localPosition.z + pressBack );		
		}
	}
	
	// Release button
	function ReleaseButton () {
		// animate
		if ( pressBack ) {
			transform.localPosition = new Vector3 ( transform.localPosition.x, transform.localPosition.y, transform.localPosition.z - pressBack );		
		}
		
		if ( executeOn == ButtonExecType.Release ) {
			SendMessage ();
		}
	}
	
	// Init
	function Start () {
	}
	
	// Update
	function Update () {
		var ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
		var hit : RaycastHit;
		
		if ( Physics.Raycast ( ray, hit ) ) {
			var obj : GameObject = hit.collider.gameObject;
			
			if ( obj == gameObject ) {
				if ( Input.GetMouseButtonDown(0) ) {
					PressButton ();
				} else if ( Input.GetMouseButtonUp(0) ) {
					ReleaseButton ();						
				}
			}
		
		}
	}
}