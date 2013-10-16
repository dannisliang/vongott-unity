#pragma strict

@script RequireComponent(GUID)

class InteractiveObject extends MonoBehaviour {
	private function SetColor ( isActive : boolean ) {
		var smr : SkinnedMeshRenderer = this.GetComponentInChildren(SkinnedMeshRenderer);
		var mr : MeshRenderer = this.GetComponent(MeshRenderer);
		var color : Color;
		
		if ( !mr ) {
			mr = this.GetComponentInChildren(MeshRenderer);
		}
		
		if ( isActive ) {
			color = GameCore.GetInstance().selectedOutlineColor;
		
		} else {
			color = GameCore.GetInstance().deselectedOutlineColor;
			
		}
		
		if ( smr ) { smr.renderer.material.SetColor ( "_OutlineColor", color ); }
		if ( mr ) { mr.renderer.material.SetColor ( "_OutlineColor", color ); }
	}
	
	function Focus () {
		var intObj : GameObject = GameCore.GetInteractiveObject();
		
		if ( intObj == this.gameObject || ( intObj && intObj.GetComponent ( LiftableItem ) && intObj.GetComponent ( LiftableItem ).isPickedUp ) ) { return; }
	
		SetColor ( true );
		GameCore.SetInteractiveObject ( this.gameObject );
		InvokePrompt ();
	}
	
	function Unfocus () {		
		SetColor ( false );
		
		if ( GameCore.GetInteractiveObject() == this.gameObject ) {
			GameCore.SetInteractiveObject ( null );
			UIHUD.ShowNotification ( "" );
		}
	}
	
	function NPCCollide ( a : Actor ) {}
	
	function InvokePrompt () {}
	
	function Interact () {}
	
	function UpdateObject () {}
	
	function Awake () {
		this.gameObject.tag = "dynamic";
	}
	
	function Start () {
		if ( !this.GetComponent(GUID) ) {
			this.gameObject.AddComponent(GUID);
		}
		
		SetColor ( false );
	}
	
	function Update () {
		if ( GameCore.GetInteractiveObject() == this.gameObject ) {
			Interact ();
		}
		
		UpdateObject ();
	}
}