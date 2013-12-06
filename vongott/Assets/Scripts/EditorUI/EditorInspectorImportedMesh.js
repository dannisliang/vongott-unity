#pragma strict

class EditorInspectorImportedMesh extends MonoBehaviour {
	public var buttonContainer : Transform;
	
	private var importedMesh : ImportedMesh;
	
	public function Init ( obj : GameObject ) {
		importedMesh = obj.GetComponent(ImportedMesh);
	}
	
	public function OnEnable () {
		StartCoroutine ( Refresh() );
	}
	
	public function CreateButtons () {
		for ( var i : int = 0; i < importedMesh.gameObject.GetComponent(MeshFilter).mesh.subMeshCount; i++ ) {
			CreateButton ( i, importedMesh.gameObject.GetComponent(MeshRenderer).materials[i] );
		}
	}
	
	public function ClearButtons () {
		for ( var i : int = 0; i < buttonContainer.childCount; i++ ) {
			Destroy ( buttonContainer.GetChild(i).gameObject );
		}
	}
	
	public function CreateButton ( i : int, m : Material ) {
		var btn : OGButton = new GameObject ( i.ToString() + "_btn", OGButton ).GetComponent(OGButton);
		var lbl : OGLabel = new GameObject ( i.ToString() + "_lbl", OGLabel ).GetComponent(OGLabel);
						
		if ( m ) {
			btn.image = m.mainTexture as Texture2D;
			lbl.text = m.name.Replace(" (Instance)", "");
		} else {
			btn.image = null;
			lbl.text = "(none)";
		}
		
		btn.target = this.gameObject;
		btn.message = "PickMaterial";
		btn.argument = i.ToString();
		btn.imageScale = new Vector2 ( 0.8, 0.8 );
		btn.imageOffset = new Vector2 ( 7.5, 7.5 );
		
		btn.transform.parent = buttonContainer;
		btn.transform.localPosition = new Vector3 ( 0, i * 100, 0 );
		btn.transform.localScale = new Vector3 ( 80, 80, 1 );
		
		lbl.transform.parent = buttonContainer;
		lbl.transform.localPosition = new Vector3 ( 90, i * 60, 0 );
		lbl.transform.localScale = new Vector3 ( 200, 20, 1 );
	}
	
	public function Refresh () : IEnumerator {
		ClearButtons ();
		
		yield WaitForEndOfFrame();
		
		CreateButtons ();
	}
	
	public function PickMaterial ( n : String ) {
		EditorBrowserWindow.rootFolder = "Materials";
		EditorBrowserWindow.initMode = "Use";
		
		EditorBrowserWindow.callback = function ( path : String ) {
			var i : int = int.Parse ( n );
			var mat : Material = Resources.Load ( path ) as Material;
			var mats : Material [] = importedMesh.GetComponent(MeshRenderer).sharedMaterials;
			
			mats[i] = mat;		
			importedMesh.GetComponent(MeshRenderer).sharedMaterials = mats;	
		};
		
		OGRoot.GetInstance().GoToPage ( "BrowserWindow" );
		
	}
}