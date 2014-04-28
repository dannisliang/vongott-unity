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
	public var sticky : boolean = false;
	public var explosion : GameObject;
	public var explosionLifetime : float = 5;

	private var thrown : boolean = false;
	private var exploded : boolean = false;
	private var inventory : OSInventory;
	private var target : Vector3;
	private var bezier : Bezier;
	private var bezierTimer : float;

	public function SetInventory ( inventory : OSInventory ) {
		this.inventory = inventory;
	}

	public function Throw ( target : Vector3 ) {
		this.transform.parent = this.transform.root.parent;
		
		thrown = true;
		
		if ( collider ) {
			collider.enabled = true;
		}
		
		if ( inventory ) {
			inventory.GetSlot ( item );
		}

		var direction : Vector3 = this.transform.forward;
		bezier = new Bezier ( this.transform.position, direction, Vector3.up, target );
		this.target = target;
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

		exploded = true;
	}

	public function OnCollisionEnter () {
		if ( armed && trigger == ExplodeTrigger.OnCollision ) {
			Explode ();
		}
	}

	public function Update () {
		if ( exploded ) {
			if ( renderer ) {
				renderer.enabled = false;
			}
			
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

			if ( bezierTimer >= 1 ) {
				if ( !sticky && rigidbody ) {	
					rigidbody.useGravity = true;
					rigidbody.isKinematic = false;
				}
			
			} else {
				this.transform.position = bezier.GetPointAtTime ( bezierTimer );
				
				bezierTimer += Time.deltaTime;

			}

		}
	}
}
