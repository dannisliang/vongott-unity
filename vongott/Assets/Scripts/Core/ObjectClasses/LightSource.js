#pragma strict

@script RequireComponent(GUID)

class LightSource extends MonoBehaviour {
	var color : Color = new Color ( 1, 1, 1, 1 );
	var range : float = 10.0;
	var intensity : float = 1.0;
	var prefabPath : String = "";
	
	function GetLightComponent () : Light {
		if ( this.GetComponent(Light) ) {
			return this.GetComponent(Light);
		} else {
			return this.GetComponentInChildren ( Light );
		}
	}
	
	function SetColor ( c : Color ) {		
		color = c;
		color.a = 1;
	
		GetLightComponent().color = color;
	}
	
	function SetRange ( r : float ) {		
		range = r;
	
		GetLightComponent().range = range;
	}
	
	function SetIntensity ( i : float ) {		
		intensity = i;
		
		GetLightComponent().intensity = intensity;
	}
	
	function Update () {

	}
	
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
		
		SetColor ( color );
		SetRange ( range );
		SetIntensity ( intensity );
	}
}