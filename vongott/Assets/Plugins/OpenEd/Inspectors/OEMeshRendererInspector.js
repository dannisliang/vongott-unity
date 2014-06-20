#pragma strict

public class OEMeshRendererInspector extends OEComponentInspector {
	var currentMaterial : int  = 0;

	override function get type () : System.Type { return typeof ( MeshRenderer ); }
	
	override function Inspector () {
		var meshRenderer : MeshRenderer = target.GetComponent.< MeshRenderer > ();

		if ( !meshRenderer.material ) {
			meshRenderer.material = new Material ( Shader.Find ("Bumped Diffuse") );
		}

		meshRenderer.receiveShadows = Toggle ( "Receive shadows", meshRenderer.receiveShadows );
		meshRenderer.castShadows = Toggle ( "Cast shadows", meshRenderer.castShadows );

		offset.y += 20;

		LabelField ( "Material #" + currentMaterial );
		
		offset.y += 20;

		if ( currentMaterial > 0 ) {
			if ( Button ( "<", new Rect ( 20, offset.y, 20, 20 ) ) ) {
				currentMaterial--;
			}
		}

		if ( currentMaterial < meshRenderer.materials.Length - 1 ) {
			if ( Button ( ">", new Rect ( width - 40, offset.y, 20, 20 ) ) ) {
				currentMaterial++;
			}
		
		} else {
			if ( Button ( "+", new Rect ( width - 40, offset.y, 20, 20 ) ) ) {
				var tmp : List.< Material > = new List.< Material > ( meshRenderer.materials );

				tmp.Add ( new Material ( Shader.Find ( "Diffuse" ) ) );

				meshRenderer.materials = tmp.ToArray ();
			}
		}
		
		offset.y += 20;

		var m : Material = meshRenderer.materials[currentMaterial];
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
				m.SetTexture ( shaderProperties [ s ], AssetLinkField ( shaderProperties [ s ], "materials_" + currentMaterial + shaderProperties [ s ], target, typeof ( Texture2D ), "png" ) as Texture2D );
			}
		}

		offset.y += 20;

		if ( Button ( "Remove" ) ) {
			tmp = new List.< Material > ();

			tmp.RemoveAt ( currentMaterial );

			meshRenderer.materials = tmp.ToArray ();
		
			currentMaterial = Mathf.Clamp ( currentMaterial, 0, meshRenderer.materials.Length );
		}
	}	
}
