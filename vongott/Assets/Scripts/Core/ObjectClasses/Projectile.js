#pragma strict

class Projectile extends MonoBehaviour {
	var damage : float = 1.0;
	var time : float = 0.0;
	var expirationTime : float = 2.5;
	var speed : float = 1.0;
	var owner : GameObject;
	
	@HideInInspector var collideWith : GameObject;
	
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

	// Update
	function Update () {
		var hit : RaycastHit;
	
		time += Time.deltaTime;
		transform.position += transform.forward * ( speed * Time.deltaTime );
	
		this.GetComponent(TrailRenderer).enabled = GameCore.GetInstance().timeScale != 1.0;
	
		if ( time > expirationTime ) {
			Destroy ( this.gameObject );
		
		} else if ( collideWith ) {
			if ( collideWith.GetComponent ( Actor ) ) {
				collideWith.GetComponent ( Actor ).TakeDamage ( damage );
			
			} else if ( collideWith.GetComponent ( Player ) ) {
				collideWith.GetComponent ( Player ).TakeDamage ( damage );
			
			} else {
				// Leave decal
			
			}
			
			Destroy ( this.gameObject );
		
		} else if ( Physics.Linecast ( transform.position, transform.position + transform.forward * 1.0, hit ) ) {
			Debug.DrawLine ( transform.position, hit.point, Color.green );
			collideWith = hit.collider.gameObject;
		
		}
	}

	// Draw
	function OnDrawGizmos () {
		Gizmos.DrawWireSphere ( transform.position, 0.25 );
	}
}