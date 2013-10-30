#pragma strict

class EditorInspectorCombinedMesh extends MonoBehaviour {
	public var buttonContainer : Transform;
	public var buttonPrefab : GameObject;
	
	private var combinedMesh : CombinedMesh;
	
	public function Init ( obj : GameObject ) {
		combinedMesh = obj.GetComponent(CombinedMesh);
	}
	
	public function OnEnable () {
		StartCoroutine ( Refresh() );
	}
	
	public function CreateButtons () {
		for ( var i : int = 0; i < combinedMesh.gameObject.GetComponent(MeshFilter).mesh.subMeshCount; i++ ) {
			CreateButton ( i, combinedMesh.gameObject.GetComponent(MeshRenderer).materials[i] );
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
			listItem.sourceBtn.image = m.mainTexture as Texture2D;
			listItem.nameLbl.text += ": " + m.name;
		}
		
		listItem.trianglesBtn.text = "Set Triangles";
		listItem.trianglesBtn.target = this.gameObject;
		listItem.trianglesBtn.message = "SetTriangles";
		listItem.trianglesBtn.argument = i.ToString();
		
		listItem.sourceBtn.target = this.gameObject;
		listItem.sourceBtn.message = "PickMaterial";
		listItem.sourceBtn.argument = i.ToString();
		
		listItem.gameObject.transform.parent = buttonContainer;
		listItem.gameObject.transform.localPosition = new Vector3 ( 0, i * 60, 0 );
	}
	
	public function SetTriangles ( n : String ) {
		var subMeshIndex : int = int.Parse ( n );
		
		EditorCore.pickerType = CombinedMesh;
		EditorCore.pickerCallback = function ( triangleIndex : int ) {
			var triangle : int[] = new int[3];
			triangle[0] = triangleIndex;
			triangle[1] = triangleIndex + 1;
			triangle[2] = triangleIndex + 2;
		
			Debug.Log ( "SubMesh: " + subMeshIndex + " | Triangle: " + triangleIndex ); 
		
			combinedMesh.GetComponent(MeshFilter).mesh.SetTriangles ( triangle, subMeshIndex );
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
		combinedMesh.GetComponent(MeshFilter).mesh.subMeshCount += 1;
		
		var mats : Material[] = new Material[combinedMesh.GetComponent(MeshRenderer).materials.Length+1];
		
		for ( var i : int = 0; i < mats.Length; i++ ) {
			if ( i < combinedMesh.GetComponent(MeshRenderer).materials.Length ) {
				mats[i] = combinedMesh.GetComponent(MeshRenderer).materials[i];
			}
		}
		
		combinedMesh.GetComponent(MeshRenderer).materials = mats;
		
		StartCoroutine ( Refresh() );
	}
	
	public function PickMaterial ( n : String ) {
		EditorBrowserWindow.rootFolder = "Materials";
		EditorBrowserWindow.initMode = "Use";
		
		EditorBrowserWindow.callback = function ( path : String ) {
			var i : int = int.Parse ( n );
			var mat : Material = Resources.Load ( path ) as Material;
			var mats : Material [] = combinedMesh.GetComponent(MeshRenderer).materials;
			
			mats[i] = mat;		
			combinedMesh.GetComponent(MeshRenderer).materials = mats;	
		};
		
		OGRoot.GoToPage ( "BrowserWindow" );
		
	}
}