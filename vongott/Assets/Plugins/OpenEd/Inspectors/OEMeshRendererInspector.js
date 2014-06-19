#pragma strict

public class OEMeshRendererInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( MeshRenderer ); }
	
	override function Inspector () {
		var meshRenderer : MeshRenderer = target.GetComponent.< MeshRenderer > ();

		if ( !meshRenderer.material ) {
			meshRenderer.material = new Material ( Shader.Find ("Bumped Diffuse") );
		}

		meshRenderer.receiveShadows = Toggle ( "Receive shadows", meshRenderer.receiveShadows );
		meshRenderer.castShadows = Toggle ( "Cast shadows", meshRenderer.castShadows );

		offset.y += 20;

		for ( var i : int = 0; i < meshRenderer.materials.Length; i++ ) {
			var m : Material = meshRenderer.materials[i];
			var shaders : String [] = [ "Diffuse", "Bumped Diffuse", "Bumped Diffuse Specular" ];
			var shaderIndex : int = 0;

			m.name = TextField ( "Name", m.name );

			for ( var s : int = 0; s < shaders.Length; s++ ) {
				if ( shaders[s] == m.shader.name ) {
					shaderIndex = s;
				}
			}

			m.shader = Shader.Find ( shaders [ Popup ( "Shader", shaderIndex, shaders ) ] );

			if ( m.HasProperty ( "_MainTex" ) ) {
				m.SetTexture ( "_MainTex", AssetLinkField ( "_MainTex", "materials_" + i + "_MainTex", target, typeof ( Texture2D ), "png" ) as Texture2D );
			}

			if ( m.HasProperty ( "_BumpMap" ) ) {
				m.SetTexture ( "_BumpMap", AssetLinkField ( "_BumpMap", "materials_" + i + "_BumpMap", target, typeof ( Texture2D ), "png" ) as Texture2D );
			}

			offset.y += 20;
		}
	}	
}
