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
var selectIdle : Material;
var selectModifying : Material;

// Private vars
private var rotationY : float = 0.0;


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

function DrawPathLine ( path : Vector3[] ) {
	selectIdle.SetPass ( 0 );
	
	GL.Begin( GL.LINES );
	
	for ( var i = 0; i < path.Length; i++ ) {
 		var node : Vector3 = path[i];
 		GL.Vertex3 ( node.x, node.y, node.z );
	}

	GL.End();
}

// Rendering
function OnPreRender () {
	// wireframe
	GL.wireframe = ( renderMode == 1 );
}

function OnPostRender () {
	// wireframe
	GL.wireframe = false;
	
	// path
	if ( EditorCore.drawPath ) {
		DrawPathLine ( EditorCore.drawPath );
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

// Round value
function Round ( val : float, factor : float ) : float {
	return Mathf.Round ( val / factor ) * factor;
}

// Update
function Update () {
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
	
	// modes
	if ( EditorCore.grabMode || EditorCore.rotateMode || EditorCore.scaleMode ) {		
		if ( Input.GetKey ( KeyCode.LeftShift ) ) {
			spd = spd / 16;
		} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
			spd = spd * 4;
		} 
		
		if ( EditorCore.grabRestrict == "y" ) {
			x = 0;
			y = translation * spd;
			z = 0;
		} else if ( EditorCore.grabRestrict == "x" ) {
			x = translation * spd;
			y = 0;
			z = 0;
		} else if ( EditorCore.grabRestrict == "z" ) {
			x = 0;
			y = 0;
			z = translation * spd;
		} else if ( EditorCore.scaleMode && EditorCore.grabRestrict == null ) {
			x = translation * spd;
			y = translation * spd;
			z = translation * spd;
		} else {
			x = 0;
			y = 0;
			z = 0;
		}
		
		var o : GameObject = EditorCore.selectedObject;
		
		var xGrab : float = o.transform.localPosition.x + x;
		var yGrab : float = o.transform.localPosition.y + y;
		var zGrab : float = o.transform.localPosition.z + z;
		
		var xRotate : float = o.transform.localEulerAngles.x + ( x * 2 );
		var yRotate : float = o.transform.localEulerAngles.y + ( y * 2 );
		var zRotate : float = o.transform.localEulerAngles.z + ( z * 2 );
		
		var xScale : float = o.transform.localScale.x + x;
		var yScale : float = o.transform.localScale.y + y;
		var zScale : float = o.transform.localScale.z + z;
		
		if ( EditorCore.snapEnabled ) {
			if ( EditorCore.snap.x > 0 ) {
				xGrab = Round ( xGrab, EditorCore.snap.x );
				xRotate = Round ( xRotate, EditorCore.snap.x );
				xScale = Round ( xScale, EditorCore.snap.x );
			}
			
			if ( EditorCore.snap.y > 0 ) {
				yGrab = Round ( yGrab, EditorCore.snap.y );
				yRotate = Round ( yRotate, EditorCore.snap.y );
				yScale = Round ( yScale, EditorCore.snap.y );
			}
			
			if ( EditorCore.snap.z > 0 ) {
				zGrab = Round ( zGrab, EditorCore.snap.z );
				zRotate = Round ( zRotate, EditorCore.snap.z );
				zScale = Round ( zScale, EditorCore.snap.z );
			}
		}		
		
		if ( EditorCore.grabMode ) {
			o.transform.localPosition = new Vector3 ( xGrab, yGrab, zGrab );
		} else if ( EditorCore.rotateMode ) {
			o.transform.localEulerAngles = new Vector3 ( xRotate, yRotate, zRotate );
		} else if ( EditorCore.scaleMode ) {
			o.transform.localScale = new Vector3 ( xScale, yScale, zScale );
		}
		
		// end mode
		if ( Input.GetMouseButtonDown(0) ) {
			EditorCore.SetGrabMode ( false );
			EditorCore.SetRotateMode ( false );
			EditorCore.SetScaleMode ( false );
			
			EditorCore.ReselectObject();
		}
		
	// camera mode	
	} else {				
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
		if ( Input.GetMouseButton(1) && !OGRoot.mouseOver ) {    
			var rotationX : float = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivity;
		
			rotationY += Input.GetAxis("Mouse Y") * sensitivity;
			rotationY = Mathf.Clamp (rotationY, -60, 60);
		
			transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
		
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
			var ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
			var hit : RaycastHit;
			
			if ( Physics.Raycast ( ray, hit ) ) {
				var obj : GameObject = hit.collider.gameObject;
				
				EditorCore.SelectObject ( obj );						
			
			} else if ( EditorCore.GetSelectedObject() ) {
				EditorCore.DeselectObject ();
			
			}
		}
	}
}