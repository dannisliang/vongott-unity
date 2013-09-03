#pragma strict

class EditorInspectorPrefab extends MonoBehaviour {
	//////////////////
	// Prerequisites
	//////////////////
	// Public vars
	var generic : GameObject;

	var textField : OGTextField;
	
	var previewImage : OGImage;
	var materialButton : OGButton;
	
	@HideInInspector var obj : GameObject;

	//////////////////
	// Text
	//////////////////
	function UpdateText () {
		obj = EditorCore.GetSelectedObject();
		var tm : TextMesh = obj.GetComponentInChildren ( TextMesh );
		
		if ( tm != null ) {
			tm.text = textField.text;
		}
	}
	
	
	//////////////////
	// Material
	//////////////////
	function GetMaterial ( matPath : String ) {
		obj = EditorCore.GetSelectedObject();
		
		obj.GetComponent(Prefab).materialPath = matPath;
		obj.GetComponent(Prefab).ReloadMaterial();
	}
	
	function PickMaterial () {
		EditorCore.SetPickMode ( true );
		
	}
	
	
	//////////////////
	// Init
	//////////////////
	function Init ( obj : GameObject ) {
		textField.transform.parent.gameObject.SetActive ( false );
		previewImage.transform.parent.gameObject.SetActive ( false );
		
		if ( obj.GetComponentInChildren ( TextMesh ) ) {
			textField.transform.parent.gameObject.SetActive ( true );
			textField.text = obj.GetComponentInChildren ( TextMesh ).text;
		}
		
		if ( obj.GetComponent(Prefab).path.Contains ( "Walls" ) && obj.GetComponent(Prefab).canChangeMaterial  ) {
			previewImage.transform.parent.gameObject.SetActive ( true );
		
			materialButton.func = function () {
				EditorBrowserWindow.rootFolder = "Materials";
				EditorBrowserWindow.initMode = "Use";
				EditorBrowserWindow.callback = GetMaterial;
				OGRoot.GoToPage ( "BrowserWindow" );
			};
			
			materialButton.text = "";
			for ( var i = 0; i < obj.renderer.material.name.Length; i++ ) {
				if ( i < 12 ) {
					materialButton.text += obj.renderer.material.name[i];
				}
			}
			materialButton.text += "...";
			
			if ( obj.renderer.material.mainTexture ) {
				previewImage.image = obj.renderer.material.mainTexture as Texture2D;
			} else {
				previewImage.image = null;
			}
		}
	}
	
	
	//////////////////
	// Update
	//////////////////
	function UpdateObject () {
		
	}
}