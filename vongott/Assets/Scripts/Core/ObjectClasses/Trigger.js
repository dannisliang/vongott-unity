#pragma strict

class Trigger extends MonoBehaviour {
	var fireOnce : boolean = true;
	var startAnimation : String = "";
	var startQuest : String = "";
	var endQuest : String = "";
	var setFlag : String = "";
	var travelMap : String = "";
	var travelPoint : String = "";
	
	// Check collision
	function OnTriggerEnter () {
		if ( fireOnce ) {
			this.GetComponent(BoxCollider).enabled = false;
		}
		
		Activate ();
	}
	
	// Before animation
	function BeforeAnim () {
		if ( endQuest != "(none)" && endQuest != "" ) {
			QuestManager.EndQuest ( endQuest );
		}
	}
	
	// After animation
	function AfterAnim () {
		if ( startQuest != "(none)" && startQuest != "" ) {
			QuestManager.StartQuest ( startQuest );
		}
		
		if ( setFlag != "(none)" && setFlag != "" ) {
			FlagManager.SetFlag ( setFlag, true );
		}
		
		if ( travelMap != "(none)" && travelMap != "" ) {
			GameCore.LoadLevel ( travelMap, travelPoint );
		}
	}
	
	// Activate trigger
	function Activate () {
		BeforeAnim ();
		
		if ( startAnimation != "(none)" && startAnimation != "" ) {
			GameCore.StartAnimation ( startAnimation, AfterAnim );

		} else {
			AfterAnim ();
		
		}
	}
	
	// Init
	function Start () {
		if ( GameCore.started ) {
			this.GetComponent(MeshRenderer).enabled = false;
		}
	}
}