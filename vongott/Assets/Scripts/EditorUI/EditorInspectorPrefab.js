#pragma strict

class EditorInspectorPrefab extends MonoBehaviour {
	//////////////////
	// Prerequisites
	//////////////////
	// Public vars
	var generic : GameObject;

	var infoLabel : OGLabel;

	var doorLocked : OGTickBox;
	var doorLockLevel : OGPopUp;

	var textField : OGTextField;
	var textPreview : OGLabel;
	
	var editTextButton : OGButton;
	var previewImage : OGTexture;
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
	
	function EditText () {
		obj = EditorCore.GetSelectedObject();
		
		EditorEditText.objectName = obj.name;
		EditorEditText.objectContent = obj.GetComponent(Book).content;
		
		EditorEditText.callback = function ( content : String ) {
			if ( obj.GetComponent(Book) ) {
				obj.GetComponent(Book).content = content;
				textPreview.text = content;
			}
		};
		
		OGRoot.GetInstance().GoToPage ( "EditText" );
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
	// Item
	//////////////////
	
	
	
	//////////////////
	// Wall
	//////////////////
	function FlipWall () {				
		var newObj : String = "";		
		var newRot : Vector3 = obj.transform.localEulerAngles;
		var newPos : Vector3 = obj.transform.localPosition;
		
		if ( obj.name == "wall_basic_corner_90" ) {
			newObj = "wall_basic_corner_270";
			newRot.y += 180;
			
		} else if ( obj.name == "wall_basic_corner_270" ) {
			newObj = "wall_basic_corner_90";
			newRot.y += 180;
		
		} else if ( obj.name == "wall_basic_end" ) {
			newRot.y += 180;
		
		} else {
			newPos.x -= obj.renderer.bounds.extents.x * 2;
			newRot.y += 180;
		
		}
		
		obj.transform.localEulerAngles = newRot;
		obj.transform.localPosition = newPos;
	
		if ( newObj != "" ) {
			EditorCore.ReplaceSelectedObject ( Resources.Load ( "Prefabs/Walls/" + newObj ) as GameObject );
		}
	}
	
	
	//////////////////
	// Door
	//////////////////
	
	
	//////////////////
	// Init
	//////////////////
	function Init ( o : GameObject ) {
		obj = o;
		infoLabel.text = "";
		
		doorLocked.transform.parent.gameObject.SetActive ( false );
		textField.transform.parent.gameObject.SetActive ( false );
		previewImage.transform.parent.gameObject.SetActive ( false );
		editTextButton.transform.parent.gameObject.SetActive ( false );
		
		if ( obj.GetComponentInChildren ( TextMesh ) ) {
			textField.transform.parent.gameObject.SetActive ( true );
			textField.text = obj.GetComponentInChildren ( TextMesh ).text;
		}
		
		if ( obj.GetComponent ( Book ) ) {
			editTextButton.transform.parent.gameObject.SetActive ( true );
			textPreview.text = obj.GetComponent ( Book ).content;
		}
		
		if ( obj.GetComponent ( Door ) ) {
			doorLocked.transform.parent.gameObject.SetActive ( true );
			doorLocked.isTicked = obj.GetComponent ( Door ).locked;
			doorLockLevel.selectedOption = obj.GetComponent ( Door ).lockLevel.ToString();
		}
		
		if ( obj.GetComponent ( Item ) ) {
			var item : Item = obj.GetComponent ( Item );
			
			infoLabel.text += item.title + "\n\n";
			infoLabel.text += item.desc + "\n\n";
			
			for ( var a : Item.Attribute in item.attr ) {
				infoLabel.text += a.type.ToString() + ": " + a.val + "\n";
			}
			
		}
		
		if ( obj.GetComponent(Prefab).path.Contains ( "Walls" ) && obj.GetComponent(Prefab).canChangeMaterial  ) {
			previewImage.transform.parent.gameObject.SetActive ( true );
		
			materialButton.func = function () {
				EditorBrowserWindow.rootFolder = "Materials";
				EditorBrowserWindow.initMode = "Use";
				EditorBrowserWindow.callback = GetMaterial;
				OGRoot.GetInstance().GoToPage ( "BrowserWindow" );
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
	function Update () {
		if ( obj && obj.GetComponent ( Door ) ) {
			obj.GetComponent ( Door ).locked = doorLocked.isTicked;
			obj.GetComponent ( Door ).lockLevel = int.Parse(doorLockLevel.selectedOption);
		}
	}
}