#pragma strict

public class Mine extends Equipment {
	// Public vars
	public var delay : int = 5;
	public var timer : float = 0;

	private var armed : boolean = false;

	public function Arm () {
		armed = true;
	}

	public function Detonate () {
		DamageManager.GetInstance().SpawnExplosion ( this.transform.position, 5, 100 );
		Destroy ( this.gameObject );
	}

	function Update () {
		if ( armed ) {
			if ( timer >= delay ) {
				Detonate ();

			} else {
				timer += Time.deltaTime;
			}
		}
	}

	
}
