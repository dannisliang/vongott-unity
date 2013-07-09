#pragma strict

@script RequireComponent ( Actor );

var speed : float = 4.0;
var sight : float = 5;
var attentionSpan : float = 10.0;
var attentionTimer : float = 0.0;
var tracingPoints : List.< Vector3 > = new List.< Vector3 > ();
var tracingTimer : float = 0.0;

function Start () {

}

function PolarToCartesian ( degrees : float, radius : float ) : Vector3 {
     var dividor : float = Mathf.PI / 180.0;
     var radians : float = degrees * dividor;     
     var result : Vector3 = new Vector3 ( 0, 0, 0 );
     
     result.x = Mathf.Cos ( radians ) * radius;
     result.z = Mathf.Sin ( radians ) * radius;
     
     return result;
}

function GetBestPoint ( availablePoints : List.< Vector3 >, targetPos : Vector3 ) : Vector3 {
	var result : Vector3;
	var targetRelative : Vector3 = transform.InverseTransformPoint ( targetPos );
	var angle : float = 20;
	
	for ( var point : Vector3 in availablePoints ) {
		var pointRelative : Vector3 = transform.InverseTransformPoint ( point );
		
		// Select best point
		if ( Mathf.Abs ( targetRelative.x - pointRelative.x ) < angle ) {
			angle = Mathf.Abs ( targetRelative.x - pointRelative.x );
			
			result = point;
		}
	}
	
	return result;
}

function Trace ( target : Transform ) {
	if ( tracingTimer >= 1.0 ) {
		tracingTimer = 0.0;
		tracingPoints.Add ( target.position );
	} else {
		tracingTimer += Time.deltaTime;
	}

	if ( tracingPoints.Count > 0 ) {
		Debug.DrawLine ( transform.position, tracingPoints[0], Color.cyan );
	} else {
		tracingPoints.Add ( target.position );
	}

	for ( var i = 0; i < tracingPoints.Count; i++ ) {
		if ( i < tracingPoints.Count - 1 ) {
			Debug.DrawLine ( tracingPoints[i], tracingPoints[i+1], Color.cyan );
		}
	}
}

function FollowTrace () {
	if ( tracingPoints.Count > 0 ) {
		transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( tracingPoints[0] - transform.position ), 5 * Time.deltaTime );
		transform.localPosition += transform.forward * speed * Time.deltaTime;		
		
		if ( Vector3.Distance ( transform.position, tracingPoints[0] ) < 1.0 ) {
			tracingPoints.RemoveAt ( 0 );
		}
	}
}

function FollowTarget ( target : Transform ) {
	transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( target.position - transform.position ), Time.deltaTime );
	
	if ( Vector3.Distance ( transform.position, target.position ) > 3 ) {
		transform.localPosition += transform.forward * speed * Time.deltaTime;
	}
}

function Chase ( target : Transform ) {
	// Check attention timer
	if ( attentionTimer >= attentionSpan ) {
		this.GetComponent(Actor).GiveUp ();
		attentionTimer = 0;
	
	// Player is out of sight
	} else if ( Physics.Linecast ( this.transform.position + new Vector3 ( 0, 1, 0 ), target.position + new Vector3 ( 0, 1, 0 ), 9 ) ) {
		attentionTimer += Time.deltaTime;
		
		Trace ( target );
		FollowTrace ();
		
		Debug.DrawLine ( this.transform.position + new Vector3 ( 0, 1, 0 ), target.position + new Vector3 ( 0, 1, 0 ), Color.red );
	
	// Player is in sight
	} else {
		if ( attentionTimer > 0 ) { attentionTimer = 0.0; }
		if ( tracingPoints.Count > 0 ) { tracingPoints.Clear(); }
				
		FollowTarget ( target );
				
		Debug.DrawLine ( this.transform.position + new Vector3 ( 0, 1, 0 ), target.position + new Vector3 ( 0, 1, 0 ), Color.green );
	
	}
}