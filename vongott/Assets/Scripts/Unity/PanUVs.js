#pragma strict

class PanUVs extends MonoBehaviour {
	public class MaterialInfo {
		public var textureNames : String[];
	}
	
	public var materials : MaterialInfo[];
	public var translation : Vector2 = Vector2.zero;
		
	private var mr : MeshRenderer;
	
	function Update () {
		if ( !mr ) {
			mr = this.GetComponent(MeshRenderer);
		}
		
		for ( var i : int = 0; i < materials.Length; i++ ) {
			for ( var s : String in materials[i].textureNames ) {
				var newOffset : Vector2 = mr.materials[i].GetTextureOffset ( s );
			
				newOffset.x += translation.x;
				newOffset.y += translation.y;
			
				mr.materials[i].SetTextureOffset ( s, newOffset );
			}
		}
	}
	
	
}