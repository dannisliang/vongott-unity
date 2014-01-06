#pragma strict

@script RequireComponent(GUID)

class LightSource extends MonoBehaviour {
	var color : Color = new Color ( 1, 1, 1, 1 );
	var range : float = 10.0;
	var intensity : float = 1.0;
	var prefabPath : String = "";
	var hideInGame : boolean = false;
	
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
	
		var l : Light = GetLightComponent();
		
		l.color = color;
	
		if ( l.GetComponent(MeshRenderer) ) {
			l.GetComponent(MeshRenderer).material.color = color;
		}
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
		
		if ( hideInGame && !EditorCore.running ) {
			this.GetComponent ( MeshRenderer ).enabled = false;
			this.GetComponent ( BoxCollider ).enabled = false;
		}
		
		SetColor ( color );
		SetRange ( range );
		SetIntensity ( intensity );
	}
}
