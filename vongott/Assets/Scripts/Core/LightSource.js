#pragma strict

class LightSource extends MonoBehaviour {
	var color : Color = Color.white;
	var range : float = 10.0;
	var intensity : float = 1.0;
	var visible = true;
	
	function SetVisible ( v : boolean ) {
		visible = v;
	}		
	
	function SetColor ( c : Color ) {
		color = c;
	
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
		
		} else if ( !GameCore.started && !EditorCore.noGizmos && !this.GetComponent(MeshRenderer).enabled ) {
			this.GetComponent(MeshRenderer).enabled = true;
			
		}
	}
	
	function Start () {
		this.GetComponent(Light).color = color;
		this.GetComponent(MeshRenderer).material.color = color;
		this.GetComponent(Light).range = range;
		this.GetComponent(Light).intensity = intensity;
	}
}