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
			var shaderNames : String [] = OEWorkspace.GetInstance().settings.shaderNames;
			var shaderProperties : String [] = OEWorkspace.GetInstance().settings.shaderProperties;
			var shaderIndex : int = 0;

			for ( var s : int = 0; s < shaderNames.Length; s++ ) {
				if ( shaderNames[s] == m.shader.name ) {
					shaderIndex = s;
				}
			}

			m.name = TextField ( "Name", m.name );

			m.shader = Shader.Find ( shaderNames [ Popup ( "Shader", shaderIndex, shaderNames ) ] );

			for ( s = 0; s < shaderProperties.Length; s++ ) {
				if ( m.HasProperty ( shaderProperties [ s ] ) ) {
					m.SetTexture ( shaderProperties [ s ], AssetLinkField ( shaderProperties [ s ], "materials_" + i + shaderProperties [ s ], target, typeof ( Texture2D ), "png" ) as Texture2D );
				}
			}

			offset.y += 20;
		}
	}	
}
