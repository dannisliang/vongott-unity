#pragma strict

public class DestructibleObject extends MonoBehaviour {
	public var pieces : GameObject[];
	public var event : OCEvent;

	private function SpawnPieces () : List.< Collider > {
		var list : List.< Collider > = new List.< Collider > ();
		
		for ( var o : GameObject in pieces ) {
			var newObj : GameObject = Instantiate ( o );
			var col : BoxCollider = newObj.GetComponent ( BoxCollider );
			var randScale : float = Random.Range ( 0.25, 1 );
			var bounds : Bounds = this.collider.bounds;

			newObj.transform.parent = this.transform;
			newObj.transform.position = new Vector3 (
					Random.Range ( bounds.min.x, bounds.max.x ),
					Random.Range ( bounds.min.y, bounds.max.y ),
					Random.Range ( bounds.min.z, bounds.max.z ) );
			newObj.transform.localScale = new Vector3 ( randScale, randScale, randScale );

			list.Add ( col );
		}

		return list;
	}

	private function DisableObject () {
		if ( this.renderer ) {
			this.renderer.enabled = false;
		}

		if ( this.collider ) {
			this.collider.enabled = false;
		}

		if ( this.rigidbody ) {
			this.rigidbody.isKinematic = true;
		}
	}

	private function CleanUp ( colliders : List.< Collider > ) : IEnumerator {
		CheckTrigger ();
		
		DisableObject ();

		yield WaitForSeconds ( 5.0 );

		for ( var col : Collider in colliders ) {
			Destroy ( col.gameObject );
		}

		yield WaitForEndOfFrame ();

		Destroy ( this.gameObject );
	}

	private function CheckTrigger () {
		var trigger : Trigger = this.GetComponent ( Trigger );

		if ( trigger != null ) {
			trigger.OnDeath ();
		}
	}

	public function Explode ( position : Vector3, force : float, radius : float ) {
		var colliders : List.< Collider > = SpawnPieces ();

		for ( var col : Collider in colliders ) {
			col.rigidbody.AddExplosionForce ( force, position, radius, 1 );
		}

		StartCoroutine ( CleanUp ( colliders ) );
	}
	
	public function Explode ( force : float, radius : float ) {
		Explode ( this.transform.position, force, radius );
	}
}
