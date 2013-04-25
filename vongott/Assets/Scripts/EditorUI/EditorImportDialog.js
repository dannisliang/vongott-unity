#pragma strict

class EditorImportDialog extends OGPage {	
	////////////////////
	// Prerequisites
	////////////////////
	// Public vars
	var background : OGRect;
	var title : OGLabel;
	var objList : OGScrollView;
	var objButton : OGButton;
	var mtlList : OGScrollView;
	var mtlButton : OGButton;

	// Private vars
	private var picked_format : String = "";
	
	
	////////////////////
	// Pick a format
	////////////////////
	// Obj
	var pickObj : Function = function () {
		picked_format = "obj";
		objList.enabled = true;
		mtlList.enabled = false;
	};
	
	// Material
	var pickMtl : Function = function () {
		picked_format = "mtl";
		objList.enabled = false;
		mtlList.enabled = true;
	};
	
	
	////////////////////
	// Init
	////////////////////
	override function Init () {		
		// background
		background = new OGRect ();
		background.x = ( Screen.width / 2 ) - ( Screen.width * 0.4 );
		background.y = ( Screen.height / 2 ) - ( Screen.height * 0.4 );
		background.width = Screen.width * 0.8;
		background.height = Screen.height * 0.8;
		
		// title
		title = new OGLabel ( "Import something.." );
		title.x = background.x + 16;
		title.y = background.y + 16;
		title.style.fontStyle = FontStyle.Bold;
		title.style.fontSize = 14;
		
		// obj button
		objButton = new OGButton ( "OBJ", pickObj );
		objButton.width = 64;
		objButton.height = 16;
		objButton.x = background.x + 16;
		objButton.y = background.y + 48;
		
		// mtl button
		mtlButton = new OGButton ( "MTL", pickMtl );
		mtlButton.width = 64;
		mtlButton.height = 16;
		mtlButton.x = objButton.x + 64 + 16;
		mtlButton.y = background.y + 48;
		
		// obj list
		objList = new OGScrollView ();
			
		objList.x = background.x;
		objList.y = background.y + 128;
		objList.width = background.width;
		objList.height = background.height - 128;
	
		objList.enabled = false;
		
		// mtl list
		mtlList = new OGScrollView ();
				
		mtlList.x = background.x;
		mtlList.y = background.y + 128;
		mtlList.width = background.width;
		mtlList.height = background.height - 128;
	
		mtlList.enabled = false;
	
		// dummy stuff
		var objs : OGWidget[] = new OGWidget[20];
		var mtls : OGWidget[] = new OGWidget[20];
		
		for ( var i = 0; i < 20; i++ ) {
			objs[i] = new OGLabel ( ".obj file " + i );
			objs[i].x = 16;
			objs[i].y = i * 48;
		
			objList.Add ( objs[i] );
			
			mtls[i] = new OGLabel ( ".mtl file " + i );
			mtls[i].x = 16;
			mtls[i].y = i * 48;
		
			mtlList.Add ( mtls[i] );
		}
	
		// add widgets
		OGCore.Add ( background );
		OGCore.Add ( objList );
		OGCore.Add ( mtlList );
		OGCore.Add ( title );
		OGCore.Add ( objButton );
		OGCore.Add ( mtlButton );
	}
	
	////////////////////
	// Update
	////////////////////
	override function Update () {
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			OGPageManager.GoToPage ( "BaseMenu" );
		}
	}
}