#pragma strict

public class OSFirearm extends MonoBehaviour {
	public var item : OSItem;
	public var accuracyIndex : int;
	public var damageIndex : int;
	public var firingRateIndex : int;
	public var reloadSpeedIndex : int;
	public var firingSoundIndex : int;
	public var reloadSoundIndex : int;
	public var equippingSoundIndex : int;
	public var holsteringSoundIndex : int;
	public var muzzleFlash : GameObject;
	public var muzzleFlashDuration : float = 0.25;

	private var fireTimer : float = 0;
	private var flashTimer : float = 0;
	private var firing : boolean = false;

	public function get accuracy () : float {
		return item.attributes[accuracyIndex].value;
	}
	
	public function get damage () : float {
		return item.attributes[damageIndex].value;
	}

	public function get firingRate () : float {
		return item.attributes[firingRateIndex].value;
	}
	
	public function get firingSound () : AudioClip {
		return item.sounds[firingSoundIndex];
	}

	public function get reloadSpeed () : float {
		return item.attributes[reloadSpeedIndex].value;
	}
	
	public function get reloadSound () : AudioClip {
		return item.sounds[reloadSoundIndex];
	}

	public function get equippingSound () : AudioClip {
		return item.sounds[equippingSoundIndex];
	}
	
	public function get holsteringSound () : AudioClip {
		return item.sounds[holsteringSoundIndex];
	}

	private function Fire () {
		fireTimer = 1 / firingRate;
		flashTimer = muzzleFlashDuration;
	}

	public function Update () {
		if ( !item ) {
			item = this.GetComponent.< OSItem > ();
			return;
		}

		if ( firing ) {
			if ( fireTimer <= 0 ) {
				Fire ();

			}
		}

		if ( fireTimer > 0 ) {
			fireTimer -= Time.deltaTime;
		}

		if ( flashTimer > 0 ) {
			flashTimer -= Time.deltaTime;
		}

		if ( muzzleFlash ) {
			muzzleFlash.SetActive ( flashTimer > 0 );
		}
	}	
}
