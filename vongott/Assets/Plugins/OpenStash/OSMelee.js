#pragma strict

public class OSMelee extends MonoBehaviour {
	@HideInInspector public var item : OSItem;
	@HideInInspector public var damageIndex : int;
	@HideInInspector public var firingRateIndex : int;
	@HideInInspector public var rangeIndex : int;
	@HideInInspector public var firingSoundIndex : int;
	@HideInInspector public var equippingSoundIndex : int;
	@HideInInspector public var holsteringSoundIndex : int;
	@HideInInspector public var firingAnimationIndex : int;
	
	public var aimWithMainCamera : boolean = true;
	public var wielder : GameObject;

	private var fireTimer : float = 0;
	private var inventory : OSInventory;
	private var bullet : OSProjectile;
	private var animationStates : List.< AnimationState > = new List.< AnimationState > ();

	public function SetInventory ( inventory : OSInventory ) {
		this.inventory = inventory;
	}

	public function get damage () : float {
		return item.attributes[damageIndex].value;
	}

	public function get firingRate () : float {
		return item.attributes[firingRateIndex].value;
	}
	
	public function get range () : float {
		return item.attributes[rangeIndex].value;
	}
	
	public function get firingSound () : AudioClip {
		return item.sounds[firingSoundIndex];
	}
	
	public function get equippingSound () : AudioClip {
		return item.sounds[equippingSoundIndex];
	}
	
	public function get holsteringSound () : AudioClip {
		return item.sounds[holsteringSoundIndex];
	}

	public function Fire () {
		if ( fireTimer > 0 ) { return; }

		if ( animation && animationStates.Count > firingAnimationIndex ) {
			animation.Play ( animationStates [ firingAnimationIndex ].name );
		}

		var hit : RaycastHit;
		var ray : Ray;

		if ( aimWithMainCamera ) {
			ray = new Ray ( Camera.main.transform.position, Camera.main.transform.forward );

		} else {
			var here : Vector3 = wielder.transform.position;
			here.y = this.transform.position.y;

			ray = new Ray ( here, wielder.transform.forward );

		}

		if ( Physics.Raycast ( ray, hit, range ) ) {
			while ( hit.collider.gameObject == wielder || hit.collider.gameObject == this.gameObject ) {
				ray = new Ray ( hit.point, ray.direction );
				
				Physics.Raycast ( ray, hit, range );

			}

			if ( hit != null ) {
				hit.collider.gameObject.SendMessage ( "OnMeleeHit", this, SendMessageOptions.DontRequireReceiver );
			
			}
		}

		fireTimer = 1 / firingRate;

		item.PlaySound ( firingSoundIndex );
	}

	public function Awake () {
		if ( animation ) {
			for ( var state : Object in animation ) {
				animationStates.Add ( state as AnimationState );
			}
		}
	}

	public function Update () {
		if ( !item ) {
			item = this.GetComponent.< OSItem > ();
			return;
		}

		if ( fireTimer > 0 ) {
			fireTimer -= Time.deltaTime;
		}
	}	
}
