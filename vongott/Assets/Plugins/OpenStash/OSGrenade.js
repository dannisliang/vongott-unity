#pragma strict

public class OSGrenade extends MonoBehaviour {
	public enum ExplodeTrigger {
		None,
		Timed,
		OnCollision
	}

	@HideInInspector public var item : OSItem;
	
	@HideInInspector public var firingRateIndex : int = 0;
	@HideInInspector public var damageIndex : int = 0;
	
	@HideInInspector public var equippingSoundIndex : int = 0;
	@HideInInspector public var explodingSoundIndex : int = 0;
	@HideInInspector public var holsteringSoundIndex : int = 0;
	@HideInInspector public var throwingSoundIndex : int = 0;

	public var countdown : float = 5;
	public var trigger : ExplodeTrigger;
	public var armed : boolean = false;
	public var explosion : GameObject;
	public var explosionLifetime : float = 5;
	public var eventHandler : GameObject;

	private var thrown : boolean = false;
	private var exploded : boolean = false;
	private var inventory : OSInventory;

	public function SetInventory ( inventory : OSInventory ) {
		this.inventory = inventory;
	}

	public function Throw ( force : Vector3 ) {
		thrown = true;
		
		if ( collider ) {
			collider.enabled = true;
		}
		
		if ( rigidbody ) {	
			rigidbody.useGravity = true;
			rigidbody.isKinematic = false;
			rigidbody.velocity = force;
		}
	}

	public function Explode () {
		if ( explosion ) {
			if ( explosion.activeInHierarchy ) {
				explosion.SetActive ( true );
				explosion.transform.parent = this.transform.parent;
				explosion.transform.position = this.transform.position;
			
			} else {
				explosion = Instantiate ( explosion ) as GameObject;
				explosion.transform.parent = this.transform.parent;
				explosion.transform.position = this.transform.position;
		
			}
		}

		if ( eventHandler ) {
			eventHandler.SendMessage ( "OnGrenadeExplosion", this ); 
		}

		exploded = true;
	}

	public function OnCollisionEnter () {
		if ( armed && trigger == ExplodeTrigger.OnCollision ) {
			Explode ();
		}
	}

	public function Update () {
		if ( exploded ) {
			if ( explosionLifetime <= 0 ) {
				Destroy ( this.gameObject );
				Destroy ( explosion );

			} else {
				explosionLifetime -= Time.deltaTime;

			}
		
		} else if ( armed ) {
			if ( trigger == ExplodeTrigger.Timed ) {
				Explode ();
			}
		
		} else if ( thrown ) {
			if ( countdown <= 0 ) {
				armed = true;
			
			} else {
				countdown -= Time.deltaTime;
			
			}

		}
	}
}
