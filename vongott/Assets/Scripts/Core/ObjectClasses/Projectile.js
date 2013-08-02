#pragma strict

class Projectile extends MonoBehaviour {
	var damage : float = 1.0;
	var time : float = 0.0;
	var speed : float = 1.0;
	var owner : GameObject;
	
	// Collision
	function OnCollisionEnter ( other : Collision ) {
		if ( other.collider.gameObject == this.gameObject ) { return; }
		else if ( other.collider.gameObject.layer == 11 ) { return; }
		else if ( other.collider.gameObject == owner ) { return; }
		
		if ( other.collider.GetComponent ( Actor ) ) {
			other.collider.GetComponent ( Actor ).TakeDamage ( damage );
			Destroy ( this.gameObject );
			return;
		} else {
			Destroy ( this.gameObject );
			return;
		}
	}

	// Debug
	function OnDrawGizmos () {
		Gizmos.DrawWireSphere ( transform.position, 0.25 );
	}
}