#pragma strict

class UIModWheel extends OGPage {
	var selectedMaterial : Material;
	var unselectedMaterial : Material;
	var grid : Transform;
	var human : Transform;
	var markers : Transform;
	var upgName : OGLabel;
	
	function PopulateList () {
		for ( var i = 0; i < grid.GetChildCount(); i++ ) {
			var slot : String = grid.GetChild(i).GetComponent(OGButton3D).argument;
			
			if ( UpgradeManager.GetUpgrade ( slot ) ) {
				grid.GetChild(i).GetChild(0).gameObject.SetActive ( true );
				grid.GetChild(i).GetChild(0).GetComponent(MeshRenderer).material.mainTexture = UpgradeManager.GetUpgrade ( slot ).GetItem().image;
			} else {
				grid.GetChild(i).GetChild(0).GetComponent(MeshRenderer).material.mainTexture = null;
				grid.GetChild(i).GetChild(0).gameObject.SetActive ( false );
			}
		}
	}
	
	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
		PopulateList ();
		Hover ( "" );
	}
	
	function Out ( slot : String ) {
		upgName.text = "";
		
		for ( var i = 0; i < human.GetChildCount(); i++ ) {
			human.GetChild(i).GetComponent(MeshRenderer).material = unselectedMaterial;
			markers.GetChild(i).gameObject.SetActive ( false );
		}
		
		if ( human.localEulerAngles.y != 0 ) {
			iTween.RotateTo ( human.gameObject, iTween.Hash ( "rotation", new Vector3 ( 0, 0, 0 ), "time", 0.5, "ignoretimescale", true ) );

		}
	}
	
	function Hover ( slot : String ) {
		upgName.text = "";
		
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
	
	function Pick ( slot : String ) {		
		if ( !UpgradeManager.GetUpgrade ( slot ) ) {
			return;
		}
		
		OGRoot.GoToPage ( "HUD" );
		UpgradeManager.Activate ( slot );
	}
	
	override function UpdatePage () {
		if ( Input.GetMouseButtonDown(2) || Input.GetKeyDown( KeyCode.Escape ) ) {
			OGRoot.GoToPage ( "HUD" );
		}
	}
}