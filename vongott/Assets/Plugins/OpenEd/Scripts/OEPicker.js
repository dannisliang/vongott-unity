#pragma strict

public class OEPicker extends OGPage {
	public var callback : Function;

	public function Update () {
		if ( Input.GetMouseButtonDown ( 0 ) ) {
			var hit : RaycastHit;
			var ray : Ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
			
			if ( Physics.Raycast ( ray, hit, Mathf.Infinity ) ) {
				var obj : Object = hit.collider.gameObject;

				callback ( obj );
			
			} else {
				callback ( null );	
		
			}	

			OGRoot.GetInstance().GoToPage ( "Home" );
		}
	}
}
