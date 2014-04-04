#pragma strict

@script RequireComponent(GUID)

class Prefab extends MonoBehaviour {
	enum eMaterialMapCoordinate {
		None,
		X,
		Y
	}
	
	private class TilingModifier {
		var x : eMaterialMapCoordinate;
		var y : eMaterialMapCoordinate;
		var z : eMaterialMapCoordinate;
	}
	
	public var title : String;
	public var description : String;
	public var path : String;
	public var id : String;
	public var materialPath : String;

	public var tilingModifiers : TilingModifier[];
	public var canChangeMaterial : boolean = false;

	// Init
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
		
		if ( EditorCore.running && this.GetComponent(Rigidbody) ) {
			Destroy ( this.GetComponent(Rigidbody) );
		}
		
		if ( canChangeMaterial ) {
			ReloadMaterial ();
		} else if ( this.renderer ) {
			FitTexture ();
		}
	}
	
	// Update material
	function ReloadMaterial () {
		this.GetComponent(MeshRenderer).material = Resources.Load ( materialPath ) as Material;
		FitTexture ();
	}
	
	// Fit individual properties
	function FitProperty ( m : Material, p : String, x : float, y : float ) {
		if ( m.HasProperty ( p ) ) {
			m.SetTextureScale ( p, new Vector2 ( x, y ) );
		}
	}
	
	// Fit fexture
	function FitTexture () {
		for ( var i = 0; i < this.renderer.materials.Length; i++ ) {
			if ( i >= tilingModifiers.Length ) { return; }
			
			var x : float = 1;
			var y : float = 1;
			
			if ( tilingModifiers[i].x == eMaterialMapCoordinate.X ) {
				x = this.transform.localScale.x;
			} else if ( tilingModifiers[i].x == eMaterialMapCoordinate.Y ) {
				y = this.transform.localScale.x;
			}
			
			if ( tilingModifiers[i].y == eMaterialMapCoordinate.X ) {
				x = this.transform.localScale.y;
			} else if ( tilingModifiers[i].y == eMaterialMapCoordinate.Y ) {
				y = this.transform.localScale.y;
			}	
			
			if ( tilingModifiers[i].z == eMaterialMapCoordinate.X ) {
				x = this.transform.localScale.z;
			} else if ( tilingModifiers[i].z == eMaterialMapCoordinate.Y ) {
				y = this.transform.localScale.z;
			}
			
			FitProperty ( this.renderer.materials[i], "_MainTex", x, y );
			FitProperty ( this.renderer.materials[i], "_BumpMap", x, y );
			FitProperty ( this.renderer.materials[i], "_Cube", x, y );	
		}
	}
}
