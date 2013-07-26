#pragma strict

class LightSource extends MonoBehaviour {
	var color : Color = new Color ( 1, 1, 1, 1 );
	var range : float = 10.0;
	var intensity : float = 1.0;
	
	function SetColor ( c : Color ) {
		color = c;
		color.a = 1;
	
		this.GetComponent(Light).color = color;
		this.GetComponent(MeshRenderer).material.color = color;
	}
	
	function SetRange ( r : float ) {
		range = r;
	
		this.GetComponent(Light).range = range;
	}
	
	function SetIntensity ( i : float ) {
		intensity = i;
		
		this.GetComponent(Light).intensity = intensity;
	}
	
	function Update () {
		if ( ( EditorCore.noGizmos || GameCore.started ) && this.GetComponent(MeshRenderer).enabled ) {
			this.GetComponent(MeshRenderer).enabled = false;
			this.GetComponent(BoxCollider).enabled = false;
		
		} else if ( !GameCore.started && !EditorCore.noGizmos && !this.GetComponent(MeshRenderer).enabled ) {
			this.GetComponent(MeshRenderer).enabled = true;
			this.GetComponent(BoxCollider).enabled = true;
			
		}
	}
	
	function Start () {
		SetColor ( color );
		SetRange ( range );
		SetIntensity ( intensity );
	}
}