#pragma strict

class UIModWheel extends OGPage {
	var animations : OGTween[];
	
	var selectedMaterial : Material;
	var unselectedMaterial : Material;
	var grid : Transform;
	var markers : Transform;
	var upgName : OGLabel;
	
	var normalMaterial : Material;
	var activatedMaterial : Material;
	var hoverMaterial : Material;
	var hoverActivatedMaterial : Material;
	
	private var tempPos : Vector3;
	private var tempRot : Vector3;
	
	override function StartPage () {
		SetButtons ( false );
	
		GameCore.GetInstance().SetPause ( true );
		SetButtonMaterials ( null );
		upgName.text = "";
			
		tempPos = GameCamera.GetInstance().transform.position;
		tempRot = GameCamera.GetInstance().transform.eulerAngles;
		
		GameCamera.GetInstance().SetBlur ( true );
		StartCoroutine ( Transition ( true, function () { SetButtons ( true ); } ) );
	}
	
	function SetButtons ( state : boolean ) {
		for ( var c : Component in grid.GetComponentsInChildren(BoxCollider) ) {
			(c as BoxCollider).enabled = state;
		}
	}
	
	function Out ( b : OGButton3D ) {
		upgName.text = "";
		
		SetButtonMaterials ( null );
	}
	
	function RepositionCamera () {
		GameCamera.GetInstance().SetBlur ( false );
		iTween.MoveTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "position", tempPos, "time", 0.5, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
		iTween.RotateTo ( GameCamera.GetInstance().gameObject, iTween.Hash ( "rotation", tempRot, "time", 0.5, "easetype", iTween.EaseType.easeInOutQuad, "space", "world", "ignoretimescale", true ) );
	}
	
	function SetButtonMaterials ( hover : OGButton3D ) {
		var slot : String;
		var entry : InventoryEntry;
		
		for ( var i = 0; i < grid.childCount; i++ ) {
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
	
	function Transition ( forward : boolean, callback : Function ) : IEnumerator {
		var time : float;
		
		for ( var t : OGTween in animations ) {
			t.Play ( forward );
		
			if ( t.move.enabled && t.move.time > time ) { time = t.move.time; }
			if ( t.rotate.enabled && t.rotate.time > time ) { time = t.rotate.time; }
			if ( t.scale.enabled && t.scale.time > time ) { time = t.scale.time; }
		}	
		
		if ( callback ) {
			var targetTime = System.DateTime.Now.AddSeconds ( time );
			
			while ( System.DateTime.Now < targetTime ) {
				yield null;
			}
			
			callback ();
		}
	}
	
	function Hover ( b : OGButton3D ) {
		upgName.text = "";
		
		var slot : String = b.name;
		
		GameCamera.GetInstance().FocusOnBodyPart ( slot );
								
		if ( !UpgradeManager.GetUpgrade ( slot ) ) {
			SetButtonMaterials ( null );
			return;
		}
		
		SetButtonMaterials ( b );
		
		upgName.text = UpgradeManager.GetUpgradeName ( slot );
	}
	
	function Exit () {
		OGRoot.GoToPage ( "HUD" );
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
			SetButtons ( false );
			RepositionCamera();
			StartCoroutine ( Transition ( false, Exit )	);
		}
	}
}