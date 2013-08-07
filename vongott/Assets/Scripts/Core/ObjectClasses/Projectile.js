#pragma strict

class Projectile extends MonoBehaviour {
	var damage : float = 1.0;
	var time : float = 0.0;
	var expirationTime : float = 2.5;
	var speed : float = 1.0;
	var owner : GameObject;
	
	@HideInInspector var collidePos : Vector3 = Vector3.zero;
	@HideInInspector var collideWith : GameObject;

	// Update
	function Update () {
		var hit : RaycastHit;
	
		time += Time.deltaTime;
		
		if ( collidePos == Vector3.zero ) {
			transform.position += transform.forward * ( speed * Time.deltaTime );
		} else {
			transform.position = Vector3.Lerp ( transform.position, collidePos, ( speed * Time.deltaTime ) * 2 );
		}
	
		this.GetComponent(TrailRenderer).enabled = GameCore.GetInstance().timeScale != 1.0;
		this.GetComponent(MeshRenderer).enabled = GameCore.GetInstance().timeScale != 1.0;
	
		if ( time > expirationTime ) {
			Destroy ( this.gameObject );
				
		} else if ( collideWith && !collideWith.GetComponent(Item) && ( collidePos - transform.position ).magnitude < 0.05 ) {
			
			if ( collideWith.GetComponent ( Actor ) ) {
				collideWith.GetComponent ( Actor ).TakeDamage ( damage );
			
			} else if ( collideWith.GetComponent ( Player ) ) {
				collideWith.GetComponent ( Player ).TakeDamage ( damage );
			
			} else {
				// Leave decal
			
			}
			
			Destroy ( this.gameObject );
		
		} else if ( Physics.Linecast ( transform.position, transform.position + transform.forward * 1.0, hit ) ) {
			if ( hit.collider.gameObject == owner ) { return; }
			
			Debug.DrawLine ( transform.position, hit.point, Color.green );
			collidePos = hit.point;
			collideWith = hit.collider.gameObject;
		
		}
	}

	// Draw
	function OnDrawGizmos () {
		Gizmos.DrawWireSphere ( transform.position, 0.25 );
	}
}