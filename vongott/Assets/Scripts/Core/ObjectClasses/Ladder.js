#pragma strict

public class Ladder extends MonoBehaviour {
	public var segs : int = 10;
	public var blockedTop : boolean = true;

	private var unset : boolean = true;

	public function Update () {
		
	}
	
	public function get segments () : int {
		return segs;
	}

	public function set segments ( value : int ) {
		if ( value == segs && !unset ) { return; }

		unset = false;
		segs = value;

		var template : MeshFilter = this.GetComponentInChildren.< MeshFilter > ();;
		var filters : MeshFilter [] = this.GetComponentsInChildren.< MeshFilter > ();
		var colliders : BoxCollider [] = this.GetComponentsInChildren.< BoxCollider > ();
		var i : int = 0;
		var height : float = template.mesh.bounds.size.y;

		if ( value > filters.Length ) {
			for ( i = 1; i < value; i++ ) {
				if ( i >= filters.Length ) {
					var newFilter : MeshFilter = Instantiate ( template );
					newFilter.transform.parent = this.transform;
					newFilter.transform.localPosition = new Vector3 ( 0, height * i, 0 );
					newFilter.transform.localEulerAngles = Vector3.zero;
					newFilter.gameObject.name = newFilter.gameObject.name.Replace ( "(Clone)", "" );
				
				} else {
					filters[i].transform.localPosition = new Vector3 ( 0, height * i, 0 );
					filters[i].transform.localEulerAngles = Vector3.zero;
				
				}
			}
		
		} else if ( value < filters.Length ) {
			for ( i = filters.Length - 1; i > 1; i-- ) {
				if ( i > value ) {
					Destroy ( filters[i].gameObject );
				
				} else {
					filters[i].transform.localPosition = new Vector3 ( 0, height * i, 0 );
					filters[i].transform.localEulerAngles = Vector3.zero;
				
				}
			}
		}

		for ( i = 0; i < colliders.Length; i++ ) {
			colliders[i].size.y = value * height;
			colliders[i].center.y = value * height / 2;
		}
	}

	public function OnTriggerEnter ( c : Collider ) {
		var player : Player = c.gameObject.GetComponent.< Player > ();

		if ( player ) {
			player.controller.SetLadder ( this );
		}
	}

	public function Start () {
		var from : Vector3 = collider.bounds.center;
		from -= this.transform.forward * 0.5;
		from.y = collider.bounds.max.y - 0.5;

		var hit : RaycastHit;

		blockedTop = Physics.Raycast ( from, Vector3.up, hit, 1.5 );
		segments = segs;
	}
}
