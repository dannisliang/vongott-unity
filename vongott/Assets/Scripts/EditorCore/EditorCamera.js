#pragma strict

////////////////////
// Prerequisites
////////////////////
// Public vars
var sensitivity : float = 2.5;
var speed : float = 10.0;
var renderMode : int = 0;
var gizmo : Transform;
var gizmoX : Material;
var gizmoY : Material;
var gizmoZ : Material;
var gridDark : Material;
var gridBright : Material;
var selectIdle : Material;
var selectModifying : Material;
var rotationY : float = 0.0;
var orbitX : float = 0.0;
var orbitY : float = 0.0;


////////////////////
// Public functions
////////////////////
// Gizmo
function DrawXLine () {
	gizmoX.SetPass( 0 );
	
	GL.Begin( GL.LINES );
	
	GL.Vertex3( gizmo.position.x - 9999, gizmo.position.y, gizmo.position.z );
 	GL.Vertex3( gizmo.position.x + 9999, gizmo.position.y, gizmo.position.z );

	GL.End();
}

function DrawYLine () {
	gizmoY.SetPass( 0 );
	
	GL.Begin( GL.LINES );
	
	GL.Vertex3( gizmo.position.x, gizmo.position.y - 9999, gizmo.position.z );
	GL.Vertex3( gizmo.position.x, gizmo.position.y + 9999, gizmo.position.z );

	GL.End();
}

function DrawZLine () {
	gizmoZ.SetPass( 0 );
	
	GL.Begin( GL.LINES );
	
	GL.Vertex3( gizmo.position.x, gizmo.position.y, gizmo.position.z - 9999 );
 	GL.Vertex3( gizmo.position.x, gizmo.position.y, gizmo.position.z + 9999 );

	GL.End();
}

// Grid
function DrawGrid () {
	var distance : float = EditorCore.gridLineDistance;
	var amount : int = ( EditorCore.gridLineBrightFrequency * 10 ) * distance;
	var mark : int = EditorCore.gridLineBrightFrequency;
	
	var half : float = amount / 2.0;
	var counter : int;
	
	// draw dark lines
	gridDark.SetPass ( 0 );
			
	GL.Begin ( GL.LINES );
	
	for ( var i = 0; i < amount + 1; i++ ) {
		GL.Vertex3 ( ( i * distance ) - half, 0.0, -half );
		GL.Vertex3 ( ( i * distance ) - half, 0.0, half );
		
		GL.Vertex3 ( -half, 0.0, ( i * distance ) - half );
		GL.Vertex3 ( half, 0.0, ( i * distance ) - half );
	}
	
	GL.End ();
	
	// draw bright lines
	gridBright.SetPass ( 0 );
			
	GL.Begin ( GL.LINES );
	
	for ( i = 0; i < ( amount / mark ) + 1 ; i++ ) {
		GL.Vertex3 ( ( i * ( distance * mark ) ) - half, 0.0, -half );
		GL.Vertex3 ( ( i * ( distance * mark ) ) - half, 0.0, half );
		
		GL.Vertex3 ( -half, 0.0, ( i * ( distance * mark ) ) - half );
		GL.Vertex3 ( half, 0.0, ( i * ( distance * mark ) ) - half );
	}
	
	GL.End ();
}

// Rendering
function OnPreRender () {
	// wireframe
	GL.wireframe = ( renderMode == 1 );
}

function OnPostRender () {
	// wireframe
	GL.wireframe = false;
	
	// grid
	if ( EditorCore.gridEnabled ) {
		DrawGrid ();
	}
		
	// gizmo
    if ( EditorCore.grabRestrict == "x" ) {		
	    DrawXLine();
	} else if ( EditorCore.grabRestrict == "y" ) {
		DrawYLine();
	} else if ( EditorCore.grabRestrict == "z" ) {
		DrawZLine();
	}
}

// Init
function Start () {
	
}

// Turn
function TweenTurn ( angle : Vector3 ) {
	iTween.RotateTo ( Camera.main.gameObject, angle, 0.5 );
	rotationY = -angle.x;
}

// Move
function TweenMoveToTop ( position : Vector3 ) {
	var distance : float = Vector3.Distance ( Camera.main.transform.localPosition, position );
	iTween.MoveTo ( Camera.main.gameObject, new Vector3 ( position.x, position.y + distance, position.z ), 0.5 );
}

function TweenMoveToFront ( position : Vector3 ) {
	var distance : float = Vector3.Distance ( Camera.main.transform.localPosition, position );
	iTween.MoveTo ( Camera.main.gameObject, new Vector3 ( position.x, position.y, position.z - distance ), 0.5 );
}

function TweenMoveToLeft ( position : Vector3 ) {
	var distance : float = Vector3.Distance ( Camera.main.transform.localPosition, position );
	iTween.MoveTo ( Camera.main.gameObject, new Vector3 ( position.x - distance, position.y, position.z ), 0.5 );
}

function TweenMoveTo ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, position, 0.5 );
}

// Clamp angle
static function ClampAngle (angle : float, min : float, max : float) {
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp (angle, min, max);
}

// Update
function Update () {
	if ( EditorCore.grabMode || EditorCore.scaleMode || EditorCore.rotateMode ) { return; }
	
	// position
	var x = transform.localPosition.x;
	var y = transform.localPosition.y;
	var z = transform.localPosition.z;
	var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
	var horizontal = Camera.main.transform.TransformDirection ( Vector3.left );
	var vertical = Camera.main.transform.TransformDirection ( Vector3.down );
	
	// scroll wheel
	var translation = Input.GetAxis("Mouse ScrollWheel");
	var spd : float = speed;
	
	// camera mode			
	if ( translation != 0.0 && !OGRoot.mouseOver ) {				
		if ( Input.GetKey ( KeyCode.LeftShift ) ) {
			transform.localPosition = new Vector3 ( x, y + ( translation * speed ), z );
		} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
			transform.position = transform.position + horizontal * ( translation * speed );
		} else {		
			transform.position = transform.position + forward * ( translation * speed ) * 10;
		}
	}
	
	// right mouse button
	if ( Input.GetMouseButton(1) ) {    
		if ( EditorCore.GetSelectedObject() && Input.GetKey ( KeyCode.LeftControl ) ) { 
			var target : Transform = EditorCore.GetSelectedObject().transform;	
			
			orbitX += Input.GetAxis("Mouse X") * sensitivity;
	        orbitY -= Input.GetAxis("Mouse Y") * sensitivity;
	 		
	 		orbitY = ClampAngle(orbitY, -90, 90);
	 		rotationY = -orbitY;
	 		    
	        var rotation = Quaternion.Euler ( orbitY, orbitX, 0);
	        var position = rotation * Vector3 ( 0.0, 0.0, -Vector3.Distance(transform.position, target.position) ) + target.position;
	        
	        transform.rotation = rotation;
	        transform.position = position;
			
		} else {
			var rotationX : float = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivity;
		
			rotationY += Input.GetAxis("Mouse Y") * sensitivity;
			rotationY = Mathf.Clamp (rotationY, -90, 90);
		
			transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
		
		}
	
	// scroll button
	} else if ( Input.GetMouseButton(2) && !OGRoot.mouseOver && OGRoot.currentPage.pageName == "MenuBase" ) {        
        var h = Input.GetAxis("Mouse X") * sensitivity / 8;
        var v = Input.GetAxis("Mouse Y") * sensitivity / 8;

        if ( Input.GetKey( KeyCode.LeftControl ) ) {
        	transform.position = transform.position + forward * v * 10;
        	transform.position = transform.position + horizontal * -h;
        } else {
        	transform.position = transform.position + vertical * v;
        	transform.position = transform.position + horizontal * h;
   		}
		
	// left mouse button
	} else if ( Input.GetMouseButtonDown(0) && !OGRoot.mouseOver && OGRoot.currentPage.pageName == "MenuBase" ) {
		var ray : Ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
		var hit : RaycastHit;
		
		if ( Physics.Raycast ( ray, hit ) ) {
			var obj : GameObject = hit.collider.gameObject;
			
			EditorCore.SelectObject ( obj );						
		
		} else if ( EditorCore.GetSelectedObject() ) {
			EditorCore.DeselectObject ();
		
		}
	}
}