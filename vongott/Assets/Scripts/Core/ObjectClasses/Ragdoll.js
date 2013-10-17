#pragma strict

class Ragdoll extends MonoBehaviour {
	public function SetActive ( isActive : boolean ) {
		SetObject ( this.gameObject, isActive );
	}
	
	private function SetObject ( obj : GameObject, isActive : boolean ) {
		var bc : BoxCollider = obj.GetComponent(BoxCollider);
		var cc : CapsuleCollider = obj.GetComponent(CapsuleCollider);
		var rb : Rigidbody = obj.GetComponent(Rigidbody);
		var cj : CharacterJoint = obj.GetComponent(CharacterJoint);
		
		if ( rb ) { rb.isKinematic = isActive; }
		if ( bc ) { bc.enabled = isActive; }
		if ( cc ) { cc.enabled = isActive; }
		
		for ( var i = 0; i < obj.transform.childCount; i++ ) {
			SetObject ( obj.transform.GetChild(i).gameObject, isActive );
		}
	}
}