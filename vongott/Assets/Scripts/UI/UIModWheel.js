#pragma strict

class UIModWheel extends OGPage {
	var selectedMaterial : Material;
	var unselectedMaterial : Material;
	var grid : Transform;
	var human : Transform;
	var markers : Transform;
	var upgName : OGLabel;
	
	var normalMaterial : Material;
	var activatedMaterial : Material;
	var hoverMaterial : Material;
	var hoverActivatedMaterial : Material;
	
	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
		SetButtonMaterials ( null );
		upgName.text = "";
	}
	
	function Out ( b : OGButton3D ) {
		upgName.text = "";
		
		SetButtonMaterials ( null );
		
		for ( var i = 0; i < human.GetChildCount(); i++ ) {
			human.GetChild(i).GetComponent(MeshRenderer).material = unselectedMaterial;
			markers.GetChild(i).gameObject.SetActive ( false );
		}
		
		if ( human.localEulerAngles.y != 0 ) {
			iTween.RotateTo ( human.gameObject, iTween.Hash ( "rotation", new Vector3 ( 0, 0, 0 ), "time", 0.5, "ignoretimescale", true ) );

		}
	}
	
	function SetButtonMaterials ( hover : OGButton3D ) {
		var slot : String;
		var entry : InventoryEntry;
		
		for ( var i = 0; i < grid.GetChildCount(); i++ ) {
			slot = grid.GetChild(i).gameObject.name;
			entry = UpgradeManager.GetUpgrade ( slot );
			
			if ( entry ) {
				grid.GetChild(i).GetChild(0).gameObject.SetActive ( true );
				grid.GetChild(i).GetChild(0).renderer.material.mainTexture = entry.GetItem().image;
				
				if ( entry.activated ) {
					grid.GetChild(i).renderer.material = activatedMaterial;
				} else {
					grid.GetChild(i).renderer.material = normalMaterial;
				}
			} else {
				grid.GetChild(i).GetChild(0).gameObject.SetActive ( false );
				grid.GetChild(i).renderer.material = normalMaterial;
			
			}
		}
		
		if ( hover ) {
			slot = hover.name;
			entry = UpgradeManager.GetUpgrade ( slot );
			
			if ( entry.activated ) {
				hover.renderer.material = hoverActivatedMaterial;	
			} else {
				hover.renderer.material = hoverMaterial;
			}
		}
	}
	
	function Hover ( b : OGButton3D ) {
		upgName.text = "";
		
		var slot : String = b.name;
		
		if ( !UpgradeManager.GetUpgrade ( slot ) ) {
			SetButtonMaterials ( null );
			return;
		} 
		
		SetButtonMaterials ( b );
		
		for ( var i = 0; i < human.GetChildCount(); i++ ) {
			if ( human.GetChild(i).gameObject.name == slot ) {
				human.GetChild(i).GetComponent(MeshRenderer).material = selectedMaterial;												
				markers.GetChild(i).gameObject.SetActive ( true );
				upgName.text = UpgradeManager.GetUpgradeName ( slot );
			
			} else {
				human.GetChild(i).GetComponent(MeshRenderer).material = unselectedMaterial;
				markers.GetChild(i).gameObject.SetActive ( false );
			
			}
		}
		
		if ( slot == "Back" ) {
			iTween.RotateTo ( human.gameObject, iTween.Hash ( "rotation", new Vector3 ( 0, 180, 0 ), "time", 0.5, "ignoretimescale", true ) );
		} else if ( human.localEulerAngles.y != 0 ) {
			iTween.RotateTo ( human.gameObject, iTween.Hash ( "rotation", new Vector3 ( 0, 0, 0 ), "time", 0.5, "ignoretimescale", true ) );

		}
	}
	
	function Pick ( b : OGButton3D ) {		
		var slot : String = b.name;
		
		if ( !UpgradeManager.GetUpgrade ( slot ) ) {
			return;
		}
		
		UpgradeManager.Activate ( slot );
	}
	
	override function UpdatePage () {
		if ( Input.GetMouseButtonDown(2) || Input.GetKeyDown( KeyCode.Escape ) ) {
			OGRoot.GoToPage ( "HUD" );
		}
	}
}