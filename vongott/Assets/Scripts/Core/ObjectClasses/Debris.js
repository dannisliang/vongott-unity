#pragma strict

public class Debris extends MonoBehaviour {
	public var sounds : AudioClip [] = new AudioClip [0];
	public var lifetime : float = 10;

	private var timeOut : float = 0.2;


	function Start () {

	}

	function Update () {
		timeOut -= Time.deltaTime;
		lifetime -= Time.deltaTime;

		if ( lifetime <= 0 ) {
			Destroy ( this.gameObject );
		}
	}

	function OnCollisionEnter ( c : Collision ) {
		if ( timeOut < 0 && !c.gameObject.GetComponent.<Debris>() ) {
			var r : int = Random.Range ( 0, sounds.Length );

			SFXManager.GetInstance().Play ( sounds [ r ].name, this.audio );
		}
	}
}
