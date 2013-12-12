#pragma strict

class EditorInspectorCombinedMesh extends MonoBehaviour {
	public var buttonContainer : Transform;
	public var buttonPrefab : GameObject;
	public var addButton : Transform;
	
	private var combinedMesh : CombinedMesh;
	
	public function Init ( obj : GameObject ) {
		combinedMesh = obj.GetComponent(CombinedMesh);
	}
	
	public function OnEnable () {
		StartCoroutine ( Refresh() );
	}
	
	public function CreateButtons () {
		for ( var i : int = 0; i < combinedMesh.gameObject.GetComponent(MeshFilter).mesh.subMeshCount; i++ ) {
			CreateButton ( i, combinedMesh.gameObject.GetComponent(MeshRenderer).sharedMaterials[i] );
		}
	}
	
	public function ClearButtons () {
		for ( var i : int = 0; i < buttonContainer.childCount; i++ ) {
			Destroy ( buttonContainer.GetChild(i).gameObject );
		}
	}
	
	public function CreateButton ( i : int, m : Material ) {
		var listItem : MaterialListItem = Instantiate ( buttonPrefab ).GetComponent ( MaterialListItem );
		
		listItem.gameObject.name = i.ToString ();
		
		listItem.nameLbl.text = i.ToString();
		
		if ( m ) {
			//listItem.sourceBtn.image = m.mainTexture as Texture2D;
			listItem.nameLbl.text += ": " + m.name;
		} else {
			//listItem.sourceBtn.image = null;
			listItem.nameLbl.text += ": (none)";
		}
		
		listItem.trianglesBtn.text = "Set Triangles";
		listItem.trianglesBtn.target = this.gameObject;
		listItem.trianglesBtn.message = "SetTriangles";
		listItem.trianglesBtn.argument = i.ToString();
		
		listItem.allTriangleBtn.target = this.gameObject;
		listItem.allTriangleBtn.argument = i.ToString();
		
		if ( i == 0 ) {
			listItem.removeBtn.gameObject.SetActive ( false );
		} else {
			listItem.removeBtn.target = this.gameObject;
			listItem.removeBtn.message = "RemoveMaterial";
			listItem.removeBtn.argument = i.ToString();
		}
		
		listItem.sourceBtn.target = this.gameObject;
		listItem.sourceBtn.message = "PickMaterial";
		listItem.sourceBtn.argument = i.ToString();
		
		listItem.gameObject.transform.parent = buttonContainer;
		listItem.gameObject.transform.localPosition = new Vector3 ( 0, i * 60, 0 );
		
		addButton.localPosition = new Vector3 ( 10, 40 + (i+1) * 60, 0 );
	}
	
	private function AddTriangles ( triangles : int[], subMeshIndex : int ) {
		var mesh : Mesh = combinedMesh.GetComponent(MeshFilter).sharedMesh;
		
		// Check if triangles are already in other submeshes
		for ( var s : int = 0; s < mesh.subMeshCount; s++ ) {
			// Rewrite the triangle array
			var triList : List.<int> = new List.<int> ();
		
			if ( s == subMeshIndex ) {
				triList.Add ( triangles[0] );
				triList.Add ( triangles[1] );
				triList.Add ( triangles[2] );
			}
		
			for ( var t : int = 0; t < mesh.GetTriangles ( s ).Length; t += 3 ) {
				var t0 : int = mesh.GetTriangles ( s )[t];
				var t1 : int = mesh.GetTriangles ( s )[t+1];
				var t2 : int = mesh.GetTriangles ( s )[t+2];
				
				// If this triangle is not the selected one, add it
				if ( triangles[0] != t0 || triangles[1] != t1 || triangles[2] != t2 ) {
					triList.Add ( t0 );
					triList.Add ( t1 );
					triList.Add ( t2 );
				
				}
			}
			
			// Convert the triangle list to array
			var triArray : int[] = new int[triList.Count];
			
			for ( var i : int = 0; i < triList.Count; i++ ) {
				triArray[i] = triList[i];
			}
			
			mesh.SetTriangles ( triArray, s );
		}
	}
	
	public function AddAllTriangles ( n : String ) {
		EditorCore.AddAction ( combinedMesh.gameObject );
		
		var subMeshIndex : int = int.Parse ( n );
		var mesh : Mesh = combinedMesh.GetComponent(MeshFilter).sharedMesh;
		
		mesh.SetTriangles ( mesh.triangles, subMeshIndex );
		
		for ( var s : int = 0; s < mesh.subMeshCount; s++ ) {
			if ( s != subMeshIndex ) {
				mesh.SetTriangles ( null, s );
			}
		}
	}
	
	public function SetTriangles ( n : String ) {
		EditorCore.AddAction ( combinedMesh.gameObject );
		
		var subMeshIndex : int = int.Parse ( n );
		
		EditorCore.pickerType = CombinedMesh;
		EditorCore.pickerCallback = function ( triangleIndex : int ) {
			var triangle : int[] = new int[3];
			triangle[0] = combinedMesh.GetComponent(MeshFilter).sharedMesh.triangles [ triangleIndex * 3 ];
			triangle[1] = combinedMesh.GetComponent(MeshFilter).sharedMesh.triangles [ triangleIndex * 3 + 1 ];
			triangle[2] = combinedMesh.GetComponent(MeshFilter).sharedMesh.triangles [ triangleIndex * 3 + 2 ];
				
			AddTriangles ( triangle, subMeshIndex );
		};
		
		EditorCore.HideSelectionBox ();
		
		EditorCore.SetPickMode ( true );
	}
	
	public function Refresh () : IEnumerator {
		ClearButtons ();
		
		yield WaitForEndOfFrame();
		
		CreateButtons ();
	}
	
	public function AddMaterial () {
		EditorCore.AddAction ( combinedMesh.gameObject );
		
		combinedMesh.GetComponent(MeshFilter).mesh.subMeshCount += 1;
		
		var mats : Material[] = new Material[combinedMesh.GetComponent(MeshRenderer).sharedMaterials.Length+1];
		
		for ( var i : int = 0; i < mats.Length; i++ ) {
			if ( i < combinedMesh.GetComponent(MeshRenderer).sharedMaterials.Length ) {
				mats[i] = combinedMesh.GetComponent(MeshRenderer).sharedMaterials[i];
			}
		}
		
		combinedMesh.GetComponent(MeshRenderer).sharedMaterials = mats;
		
		StartCoroutine ( Refresh() );
	}
	
	public function RemoveMaterial ( n : String ) {
		EditorCore.AddAction ( combinedMesh.gameObject );
		
		var i : int = int.Parse ( n );
		
		var matList : List.< Material > = new List.< Material > ();
	
		for ( var m : int = 0; m < combinedMesh.GetComponent(MeshRenderer).sharedMaterials.Length; m++ ) {
			if ( m != i ) {
				matList.Add ( combinedMesh.GetComponent(MeshRenderer).sharedMaterials[m] );
			}
		}
		
		var matArray : Material[] = new Material[matList.Count];
			
		for ( var j : int = 0; j < matList.Count; j++ ) {
			matArray[j] = matList[j];
		}
		
		combinedMesh.GetComponent(MeshRenderer).sharedMaterials = matArray;
		combinedMesh.GetComponent(MeshFilter).mesh.subMeshCount = matArray.Length;
		
		StartCoroutine ( Refresh() );
	}
	
	public function PickMaterial ( n : String ) {
		EditorBrowserWindow.rootFolder = "Materials";
		EditorBrowserWindow.initMode = "Use";
		
		EditorBrowserWindow.callback = function ( path : String ) {
			var i : int = int.Parse ( n );
			var mat : Material = Resources.Load ( path ) as Material;
			var mats : Material [] = combinedMesh.GetComponent(MeshRenderer).sharedMaterials;
			
			mats[i] = mat;		
			combinedMesh.GetComponent(MeshRenderer).sharedMaterials = mats;	
		};
		
		OGRoot.GetInstance().GoToPage ( "BrowserWindow" );
		
	}
}