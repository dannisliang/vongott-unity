#pragma strict

public class OEPicker extends OGPage {
	public var callback : Function;

	public function Update () {
		if ( Input.GetMouseButtonDown ( 0 ) ) {
			var hit : RaycastHit;
			var ray : Ray = this.camera.ScreenPointToRay ( Input.mousePosition );
			
			if ( Physics.Raycast ( ray, hit, Mathf.Infinity ) ) {
				var obj : OFSerializedObject = hit.collider.gameObject.GetComponent.< OFSerializedObject > ();

				callback ( obj );
			
			} else {
				callback ( null );	
		
			}	

			OGRoot.GetInstance().GoToPage ( "Home" );
		}
	}
}
