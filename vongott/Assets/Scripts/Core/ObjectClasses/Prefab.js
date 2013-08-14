#pragma strict

class Prefab extends MonoBehaviour {
	var id : String;
	var path : String;

	// Init
	function Start () {
		if ( Application.isPlaying && this.GetComponent(Rigidbody) && !GameCore.started ) {
			Destroy ( this.GetComponent(Rigidbody) );
		}
		
		// Scale texture for certain types
		if ( path.Contains ( "Walls" ) ) {
			FitTexture ();
		}
	}
	
	// Fit fexture
	function FitTexture () {
		this.renderer.material.SetTextureScale ( "_MainTex", new Vector2 ( this.transform.localScale.x, this.transform.localScale.y ) );
		this.renderer.material.SetTextureScale ( "_BumpMap", new Vector2 ( this.transform.localScale.x, this.transform.localScale.y ) );
		this.renderer.material.SetTextureScale ( "_Cube", new Vector2 ( this.transform.localScale.x, this.transform.localScale.y ) );
	}
}