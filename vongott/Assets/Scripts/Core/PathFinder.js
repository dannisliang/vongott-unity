#pragma strict

var target : Transform;
var speed : float = 2.0;
var sight : float = 20;
var blocked = false;
var lastKnownPosition : Vector3;

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

function Update () {
	var from : Vector3 = this.transform.position;
	var availablePoints : List.< Vector3 > = new List.< Vector3 > ();
	var targetPos : Vector3 = target.position + new Vector3 ( 0, 1, 0 );
	
	// Player is out of sight
	if ( Physics.Linecast ( from, targetPos, 9 ) ) {
		// Check for last known position		
		if ( Vector3.Distance ( transform.position, lastKnownPosition ) < 2.0 ) { lastKnownPosition = Vector3.zero; }
		if ( lastKnownPosition == Vector3.zero ) { return; }
				
		// Feelers
		for ( var i = 0; i < 18; i++ ) {
			var wallHit : RaycastHit = new RaycastHit();	
			var to : Vector3 = from + PolarToCartesian ( ( i * 10 ) - transform.eulerAngles.y, sight );
	
			if ( Physics.Linecast ( from, to, wallHit, 9 ) ) {
				Debug.DrawLine( from, wallHit.point, Color.red);
				
				blocked = ( i == 9 );
			
			} else {
				Debug.DrawLine ( from, to, Color.green );
				availablePoints.Add ( to );
			}
		}
		
		// Determine direction
		var tempTarget : Vector3 = GetBestPoint ( availablePoints, lastKnownPosition );
				
		// Turn towards direction
		if ( tempTarget != Vector3.zero ) {
			Debug.DrawLine ( from, tempTarget, Color.magenta );
			transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( tempTarget - transform.position ), Time.deltaTime );
			
			if ( !blocked ) {		
				transform.localPosition += transform.forward * speed * Time.deltaTime;
			}
		}
		
		Debug.DrawLine ( from, lastKnownPosition, Color.white );
	
	} else {
		transform.rotation = Quaternion.Slerp ( transform.rotation, Quaternion.LookRotation ( target.position - transform.position ), Time.deltaTime );
		lastKnownPosition = target.position;
		
		if ( Vector3.Distance ( transform.position, lastKnownPosition ) > 5 ) {
			transform.localPosition += transform.forward * speed * Time.deltaTime;
		}
		
		Debug.DrawLine ( from, targetPos, Color.cyan );
				
	}
}