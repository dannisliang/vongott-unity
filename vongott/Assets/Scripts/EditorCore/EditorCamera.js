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

@HideInInspector var fixPoint : Vector3;


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
	
	// draw center lines
	gridBright.SetPass ( 0 );
			
	GL.Begin ( GL.LINES );
	
	GL.Vertex3 ( -9999, 0, 0 );
	GL.Vertex3 ( 9999, 0, 0 );
	
	GL.Vertex3 ( 0, 0, -9999 );
	GL.Vertex3 ( 0, 0, 9999 );
	
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

// Tweens
function GetDist ( vector : Vector3 ) : float {
	return Vector3.Distance ( Camera.main.transform.localPosition, vector );
}

function GetAngle ( vector : Vector3 ) : float {
	return Vector3.Angle ( vector, Camera.main.transform.position );
}

function GoToTopOf ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, Vector3 ( position.x, position.y + GetDist(position), position.z ), 0.25 );
	iTween.RotateTo ( Camera.main.gameObject, Vector3 ( 90, 0, 0 ), 0.25 );
}

function GoToBottomOf ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, Vector3 ( position.x, position.y - GetDist(position), position.z ), 0.25 );
	iTween.RotateTo ( Camera.main.gameObject, Vector3 ( 270, 0, 0 ), 0.25 );
}

function GoToRightOf ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, Vector3 ( position.x + GetDist(position), position.y, position.z ), 0.25 );
	iTween.RotateTo ( Camera.main.gameObject, Vector3 ( 0, 270, 0 ), 0.25 );
}

function GoToLeftOf ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, Vector3 ( position.x - GetDist(position), position.y, position.z ), 0.25 );
	iTween.RotateTo ( Camera.main.gameObject, Vector3 ( 0, 90, 0 ), 0.25 );
}

function GoToFrontOf ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, Vector3 ( position.x, position.y, position.z - GetDist(position) ), 0.25 );
	iTween.RotateTo ( Camera.main.gameObject, Vector3 ( 0, 0, 0 ), 0.25 );
}

function GoToBackOf ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, Vector3 ( position.x, position.y, position.z + GetDist(position) ), 0.25 );
	iTween.RotateTo ( Camera.main.gameObject, Vector3 ( 0, 180, 0 ), 0.25 );
}

function TweenTurnTo ( target : Vector3 ) {
	iTween.LookTo ( Camera.main.gameObject, { "looktarget": target, "time" : 0.5, "onupdate" : "UpdateRotation" } );
}

function TweenMoveTo ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, position, 0.5 );
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
		if ( Input.GetKey ( KeyCode.LeftShift ) || Input.GetKey ( KeyCode.RightShift ) ) {
			spd = spd / 4;
		} else if ( Input.GetKey ( KeyCode.LeftControl ) || Input.GetKey ( KeyCode.RightControl ) ) {
			spd = spd * 4;
		}
		
		if ( Camera.main.orthographic && Camera.main.orthographicSize > translation * speed ) {
			if ( Input.GetKey ( KeyCode.X ) ) {
				transform.position = transform.position + forward * ( translation * spd );
			} else {
				Camera.main.orthographicSize -= translation * speed;
			}
		
		} else {
			transform.position = transform.position + forward * ( translation * spd );
		
		}
		
	}
	
	// right mouse button
	if ( Input.GetMouseButtonDown(1) ) {
		var hit : RaycastHit;
				
		if ( Physics.Raycast ( Camera.main.transform.position, Camera.main.transform.forward, hit, Mathf.Infinity ) ) {
			fixPoint = hit.point;
		
		} else {
			fixPoint = Vector3.zero;
		
		}
	}
	
	if ( Input.GetMouseButton(1) ) {    
		if ( Input.GetKey ( KeyCode.LeftAlt ) && EditorCore.GetSelectedObject() || Camera.main.orthographic ) { 
			var target : Vector3;
			
			if ( Camera.main.orthographic ) {
				if ( EditorCore.GetSelectedObject() && Input.GetKey ( KeyCode.LeftAlt ) ) {
					target = EditorCore.GetSelectedObject().transform.renderer.bounds.center;
				
				} else if ( fixPoint != Vector3.zero ) {
					target = fixPoint;
				
				} else {
					target = Camera.main.transform.position + (Camera.main.transform.forward * 5.0);
					
				}
				
			} else { 
				target = EditorCore.GetSelectedObject().transform.renderer.bounds.center;	
			
			}
			
	       	transform.RotateAround ( target, Quaternion.Euler(0, -45, 0) * ( target - this.transform.position ), Input.GetAxis("Mouse Y") * sensitivity );
	       	transform.RotateAround ( target, Vector3.up, Input.GetAxis("Mouse X") * sensitivity );
	        transform.LookAt ( target );
			
		} else {
			var rotationX : float = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivity;
			var rotationY : float = -transform.localEulerAngles.x + Input.GetAxis("Mouse Y") * sensitivity;
		
			transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
		
		}
	
	// middle mouse
	} else if ( Input.GetMouseButton(2) && !OGRoot.mouseOver && OGRoot.currentPage.pageName == "MenuBase" ) {        
        var h = Input.GetAxis("Mouse X") * sensitivity / 8;
        var v = Input.GetAxis("Mouse Y") * sensitivity / 8;

        if ( Input.GetKey( KeyCode.LeftControl ) ) {
        	h = h * 4;
        	v = v * 4;
        } else if ( Input.GetKey( KeyCode.LeftShift ) ) {
        	h = h / 4;
        	v = v / 4;
        } 
        
    	transform.position = transform.position + vertical * v;
    	transform.position = transform.position + horizontal * h;
		
	}
}