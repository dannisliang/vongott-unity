#pragma strict

class LightSource extends MonoBehaviour {
	var color : Color = new Color ( 1, 1, 1, 1 );
	var range : float = 10.0;
	var intensity : float = 1.0;
	var prefabPath : String = "";
	
	@HideInInspector private var lightComponent : Light;
	
	function SetColor ( c : Color ) {
		if ( !lightComponent ) { Debug.Log ( "No Light component attached!" ); return; }
		
		color = c;
		color.a = 1;
	
		lightComponent.color = color;
	}
	
	function SetRange ( r : float ) {
		if ( !lightComponent ) { Debug.Log ( "No Light component attached!" ); return; }
		
		range = r;
	
		lightComponent.range = range;
	}
	
	function SetIntensity ( i : float ) {
		if ( !lightComponent ) { Debug.Log ( "No Light component attached!" ); return; }
		
		intensity = i;
		
		lightComponent.intensity = intensity;
	}
	
	function Update () {

	}
	
	function Start () {
		if ( this.GetComponent(Light) ) {
			lightComponent = this.GetComponent(Light);
		} else {
			lightComponent = this.GetComponentInChildren ( Light );
		}
		
		SetColor ( color );
		SetRange ( range );
		SetIntensity ( intensity );
	}
}