#pragma strict

public class OECamera extends MonoBehaviour {
	private class Materials {
		public var grid : Material;
		public var selection : Material;
	}
	
	public var rotateSensitivity : Vector2 = new Vector2 ( 5, 5 );
	public var panSensitivity : Vector2 = new Vector2 ( 0.2, 0.2 );
	public var materials : Materials;

	private function DrawGrid () {
		GL.Begin ( GL.LINES );

		materials.grid.SetPass ( 0 );		

		GL.Vertex ( Vector3.right * 1000 );
		GL.Vertex ( Vector3.right * -1000 );
		
		GL.Vertex ( Vector3.forward * 1000 );
		GL.Vertex ( Vector3.forward * -1000 );

		GL.End ();
	}

	private function DrawSelection () {
		GL.Begin ( GL.TRIANGLES );

		materials.selection.SetPass ( 0 );

		for ( var i : int = 0; i < OEWorkspace.GetInstance().selection.Count; i++ ) {
			var go : GameObject = OEWorkspace.GetInstance().selection[i].gameObject;
			var meshFilter : MeshFilter = go.GetComponentInChildren.< MeshFilter > ();

			if ( meshFilter ) {
				var mesh : Mesh = meshFilter.mesh;

				for ( var t : int = 0; t < mesh.triangles.Length; t++ ) {
					GL.Vertex ( mesh.vertices[mesh.triangles[t]] );
				}
			}
		}

		GL.End ();
	}

	public function OnPostRender () {
		if ( materials.grid ) {
			DrawGrid ();
		}

		if ( materials.selection && OEWorkspace.GetInstance().selection.Count > 0 ) {
			DrawSelection ();
		}
	}

	public function Update () {
		// Selection & focus
		if ( OGRoot.GetInstance() && OGRoot.GetInstance().currentPage.name == "Home" && !OGRoot.GetInstance().isMouseOver ) {
			var hit : RaycastHit;
				
			if ( Input.GetMouseButtonDown ( 1 ) || Input.GetMouseButtonDown ( 0 ) && Input.GetKey ( KeyCode.LeftAlt ) ) {
				if ( Physics.Raycast ( this.transform.position, this.transform.forward, hit, Mathf.Infinity ) ) {
					OEWorkspace.GetInstance().SetFocus ( hit.point );
				}
			
			} else if ( Input.GetMouseButtonDown ( 0 ) ) {
				var ray : Ray = this.camera.ScreenPointToRay ( Input.mousePosition );
				
				if ( Physics.Raycast ( ray, hit, Mathf.Infinity ) ) {
					var obj : OFSerializedObject = hit.collider.gameObject.GetComponent.< OFSerializedObject > ();

					if ( obj ) {
						var additive : boolean = Input.GetKey ( KeyCode.LeftShift ) || Input.GetKey ( KeyCode.RightShift );

						OEWorkspace.GetInstance().SelectObject ( obj, additive );
					}
				
				} else {
					OEWorkspace.GetInstance().ClearSelection ();

				}
			}		

			// Pan
			if ( Input.GetMouseButton ( 2 ) || Input.GetMouseButton ( 0 ) && Input.GetKey ( KeyCode.LeftAlt ) && Input.GetKey ( KeyCode.LeftShift ) ) {
				var dx : float = Input.GetAxis ( "Mouse X" ) * panSensitivity.x;
				var dy : float = Input.GetAxis ( "Mouse Y" ) * panSensitivity.y;

				transform.position -= transform.right * dx + transform.up * dy;

			// Rotate
			} else if ( Input.GetMouseButton ( 1 ) || Input.GetMouseButton ( 0 ) && Input.GetKey ( KeyCode.LeftAlt ) ) {
				var target : Vector3 = OEWorkspace.GetInstance().GetFocus ();	
				dx = Input.GetAxis ( "Mouse X" ) * rotateSensitivity.x;
				dy = Input.GetAxis ( "Mouse Y" ) * rotateSensitivity.y;

				transform.RotateAround ( target, Quaternion.Euler ( 0, -45, 0) * ( target - this.transform.position ), dy );
				transform.RotateAround ( target, Vector3.up, dx );
				transform.rotation = Quaternion.LookRotation ( target - this.transform.position );

			// Zoom
			} else {
				var translation = Input.GetAxis("Mouse ScrollWheel");
				var speed : float = 10;			

				if ( translation != 0.0 && !OGRoot.GetInstance().isMouseOver ) {				
					transform.position += transform.forward * ( translation * speed );
				}
			}
		}
	}
}
