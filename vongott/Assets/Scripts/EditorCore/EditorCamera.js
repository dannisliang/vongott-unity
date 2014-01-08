#pragma strict

////////////////////
// Prerequisites
////////////////////
// Static vars
public static var instance : EditorCamera;

// Public vars
public var sensitivity : float = 2.5;
public var speed : float = 10.0;
public var renderMode : int = 0;
public var cursor : Transform;
public var gizmoX : Material;
public var gizmoY : Material;
public var gizmoZ : Material;
public var gridDark : Material;
public var gridBright : Material;
public var cursorMaterial : Material;
public var boundingBoxMaterial : Material;
public var selectedBoundingBoxMaterial : Material;
public var navMaterial : Material;
public var locked : boolean = false;
public var drawBoxes : List.< GameObject > = new List.< GameObject > ();

// Private vars
private var skyboxCamera : GameObject;
private var clickTimer : float = 0;
private var clickThreshold : float = 0.25;
private var fixPointX : Vector3;
private var fixPointY : Vector3;
private var fixPointZ : Vector3;
private var gizmo : Transform;


////////////////////
// Static functions
////////////////////
// Return instance
public static function GetInstance() : EditorCamera {
	return instance;
}

////////////////////
// Public functions
////////////////////
// Gizmo
function DrawLine ( from : Vector3, to : Vector3 ) {
	GL.Begin( GL.LINES );
	
	GL.Vertex3( from.x, from.y, from.z );
 	GL.Vertex3( to.x, to.y, to.z );

	GL.End();
}

function DrawLine ( from : Vector3, to : Vector3, material : Material ) {
	material.SetPass ( 0 );
	
	DrawLine ( from, to );
}

function DrawXLine () {
	var right : Vector3 = gizmo.position + Vector3.right * 10;
	var left : Vector3 = gizmo.position - Vector3.right * 10;

	DrawLine ( right, left, gizmoX );
}

function DrawYLine () {
	var up : Vector3 = gizmo.position + Vector3.up * 10;
	var down : Vector3 = gizmo.position - Vector3.up * 10;
	
	DrawLine ( up, down, gizmoY );
}

function DrawZLine () {	
	var forward : Vector3 = gizmo.position + Vector3.forward * 10;
	var back : Vector3 = gizmo.position - Vector3.forward * 10;
	
	DrawLine ( forward, back, gizmoZ );
}

// Path
function DrawPath ( actor : Actor ) {
	for ( var i : int = 0; i < actor.path.Count; i++ ) {
		var pointA : Vector3;
		var pointB : Vector3;
		
		if ( actor.pathType == Actor.ePathType.NavPoint ) {
			if ( i == 0 ) {
				pointA = actor.transform.position;
				pointB = actor.path[0].position;
			} else {
				pointA = actor.path[i-1].position;
				pointB = actor.path[i].position;
			
			}
		
		} else if ( i+1 == actor.path.Count ) {	
			pointA = actor.path[i].position;
			pointB = actor.path[0].position;
		
		} else {
			pointA = actor.path[i].position;
			pointB = actor.path[i+1].position;
		
		}
		
		DrawLine ( pointA, pointB, cursorMaterial );
	}
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
	
	for ( counter = -100; counter < 100; counter++ ) {
		GL.Vertex3 ( -EditorCore.gridLineDistance, 0, counter * EditorCore.gridLineDistance * 10 );
		GL.Vertex3 ( EditorCore.gridLineDistance, 0, counter * EditorCore.gridLineDistance * 10 );
		
		GL.Vertex3 ( counter * EditorCore.gridLineDistance * 10, 0, -EditorCore.gridLineDistance );
		GL.Vertex3 ( counter * EditorCore.gridLineDistance * 10, 0, EditorCore.gridLineDistance );
	}
		
	
	GL.End ();
}

// Cursor
function DrawCursor () {
	var r : float = ( Vector3.Distance ( this.transform.position, cursor.position ) ) * 0.04;
	
	gizmoX.SetPass ( 0 );
	GL.Begin ( GL.LINES );
	GL.Vertex3 ( cursor.position.x, cursor.position.y, cursor.position.z );
	GL.Vertex3 ( cursor.position.x + r, cursor.position.y, cursor.position.z );
	GL.End ();
	
	GL.Begin ( GL.TRIANGLES );
	GL.Vertex3 ( cursor.position.x, cursor.position.y, cursor.position.z );
	GL.Vertex3 ( cursor.position.x + (r/3), cursor.position.y, cursor.position.z );
	GL.Vertex3 ( cursor.position.x, cursor.position.y + (r/3), cursor.position.z );
	GL.End ();
		
	gizmoY.SetPass ( 0 );
	GL.Begin ( GL.LINES );
	GL.Vertex3 ( cursor.position.x, cursor.position.y, cursor.position.z );
	GL.Vertex3 ( cursor.position.x, cursor.position.y + r, cursor.position.z );
	GL.End ();
		
	gizmoZ.SetPass ( 0 );
	GL.Begin ( GL.LINES );
	GL.Vertex3 ( cursor.position.x, cursor.position.y, cursor.position.z );
	GL.Vertex3 ( cursor.position.x, cursor.position.y, cursor.position.z + r );
	GL.End ();
	
	GL.Begin ( GL.TRIANGLES );
	GL.Vertex3 ( cursor.position.x, cursor.position.y, cursor.position.z );
	GL.Vertex3 ( cursor.position.x, cursor.position.y, cursor.position.z + (r/3) );
	GL.Vertex3 ( cursor.position.x, cursor.position.y + (r/3), cursor.position.z );
	GL.End ();
}

// Bounding boxes
function DrawBoundingBoxes () {
	for ( var obj : GameObject in drawBoxes ) {
		if ( !obj.activeSelf ) {
			continue;
		}
		
		if ( obj == EditorCore.GetSelectedObject() ) {
			selectedBoundingBoxMaterial.SetPass(0);
		} else {
			boundingBoxMaterial.SetPass(0);
		}
	
		GL.Begin ( GL.LINES );
		
		var bounds : Bounds;
		
		if ( obj.GetComponent(BoxCollider) ) {
			bounds = obj.GetComponent(BoxCollider).bounds;
		} else if ( obj.GetComponent(MeshFilter) ) {
			bounds = obj.GetComponent(MeshFilter).sharedMesh.bounds;
		}
		
		bounds.size.x *= obj.transform.localScale.x;
		bounds.size.y *= obj.transform.localScale.y;
		bounds.size.z *= obj.transform.localScale.z;
		
		var pos : Vector3 = obj.transform.position;
					
		// Bottom plane
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y - bounds.extents.y, pos.z - bounds.extents.z );
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y - bounds.extents.y, pos.z - bounds.extents.z );
		
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y - bounds.extents.y, pos.z - bounds.extents.z );
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y - bounds.extents.y, pos.z + bounds.extents.z );
		
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y - bounds.extents.y, pos.z + bounds.extents.z );
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y - bounds.extents.y, pos.z + bounds.extents.z );
		
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y - bounds.extents.y, pos.z + bounds.extents.z );
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y - bounds.extents.y, pos.z - bounds.extents.z );
		
		// Corner lines
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y - bounds.extents.y, pos.z - bounds.extents.z );
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y + bounds.extents.y, pos.z - bounds.extents.z );
		
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y - bounds.extents.y, pos.z - bounds.extents.z );
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y + bounds.extents.y, pos.z - bounds.extents.z );
		
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y - bounds.extents.y, pos.z + bounds.extents.z );
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y + bounds.extents.y, pos.z + bounds.extents.z );
		
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y - bounds.extents.y, pos.z + bounds.extents.z );
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y + bounds.extents.y, pos.z + bounds.extents.z );
		
		// Top plane
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y + bounds.extents.y, pos.z - bounds.extents.z );
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y + bounds.extents.y, pos.z - bounds.extents.z );
		
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y + bounds.extents.y, pos.z - bounds.extents.z );
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y + bounds.extents.y, pos.z + bounds.extents.z );
		
		GL.Vertex3 ( pos.x + bounds.extents.x, pos.y + bounds.extents.y, pos.z + bounds.extents.z );
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y + bounds.extents.y, pos.z + bounds.extents.z );
		
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y + bounds.extents.y, pos.z + bounds.extents.z );
		GL.Vertex3 ( pos.x - bounds.extents.x, pos.y + bounds.extents.y, pos.z - bounds.extents.z );
	
		GL.End ();
	}
}

// Nav nodes
function DrawNavNodes () {
	navMaterial.SetPass ( 0 );
	
	GL.Begin ( GL.LINES );
	
	for ( var nnc : OPWayPoint in EditorCore.GetWayPoints() ) {
		for ( var n : OPNode in nnc.node.neighbors ) { 
			DrawLine ( nnc.node.position, n.position );
		}
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
	if ( gizmo ) {
		if ( EditorCore.grabRestrict == "x" ) {		
			DrawXLine();
		} else if ( EditorCore.grabRestrict == "y" ) {
			DrawYLine();
		} else if ( EditorCore.grabRestrict == "z" ) {
			DrawZLine();
		}
	}

	// bounding boxes
	DrawBoundingBoxes ();

	// cursor
	if ( !EditorCore.firstPersonMode ) {
		DrawCursor ();
	}
	
	// path
	if ( EditorCore.GetSelectedObject() && EditorCore.GetSelectedObject().GetComponent(Actor) && EditorCore.GetSelectedObject().GetComponent(Actor).path.Count > 0 ) {
		DrawPath ( EditorCore.GetSelectedObject().GetComponent(Actor) );
	}
	
	// draw nav nodes
	DrawNavNodes ();
}

// Init
function Start () {
	skyboxCamera = GameObject.FindWithTag ( "SkyboxCamera" );
	instance = this;
}

// Toggle lock
function ToggleLock () {
	locked = !locked;
}

// Tweens
function GetDist ( vector : Vector3 ) : float {
	return Vector3.Distance ( Camera.main.transform.position, vector );
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
	ToggleLock ();
	iTween.LookTo ( Camera.main.gameObject, { "looktarget": target, "time" : 0.25, "onupdate" : "UpdateRotation", "oncomplete" : "ToggleLock" } );
}

function TweenMoveTo ( position : Vector3 ) {
	iTween.MoveTo ( Camera.main.gameObject, position, 0.25 );
}

function ChangeOrthographicSize ( n : float ) {
	Camera.main.orthographicSize = n;
}

function FocusOn ( position : Vector3 ) {
	TweenTurnTo ( position );
	TweenMoveTo ( position - transform.forward * 5 );
	iTween.ValueTo ( this.gameObject, iTween.Hash ( "from", Camera.main.orthographicSize, "to", 2, "onupdate", "ChangeOrthographicSize", "time", 0.25 ) );
}

// Fix point
function RefreshFixPoint ( useMouse : boolean ) {
	var hit : RaycastHit;
				
	if ( useMouse && Physics.Raycast ( Camera.main.ScreenPointToRay(Input.mousePosition), hit, Mathf.Infinity ) ) {
		cursor.position = hit.point;
	
	} else if ( Physics.Raycast ( Camera.main.transform.position, Camera.main.transform.forward, hit, Mathf.Infinity ) ) {
		cursor.position = hit.point;
	
	}
}

function SetFixPoint ( point : Vector3 ) {
	cursor.position = point;
}

function MoveFixPoint ( direction : Vector3 ) {
	cursor.position += direction * Time.deltaTime;
}

function SetFixPointToSelected () {
	if ( !EditorCore.GetSelectedObject() ) {
		return;
	}
	
	var bounds : Bounds;
	
	if ( EditorCore.GetSelectedObject().GetComponentInChildren(MeshRenderer) ) {
		bounds = EditorCore.GetSelectedObject().GetComponentInChildren(MeshRenderer).bounds;
	} else {
		bounds = EditorCore.GetSelectedObject().GetComponentInChildren(SkinnedMeshRenderer).bounds;
	}
	
	Camera.main.GetComponent(EditorCamera).SetFixPoint ( bounds.center );
}

// Update
function Update () {
	if ( locked ) { return; }

	// Gizmo
	var go : GameObject = EditorCore.GetSelectedObject ();
	if ( go ) {
		gizmo = go.transform;
	}

	// First person mode
	if ( EditorCore.firstPersonMode ) {
		var xDelta : float = Input.GetAxis("Mouse X") * sensitivity * 8;
		var yDelta : float = Input.GetAxis("Mouse Y") * sensitivity * 8;
		var rot : Vector3 = this.transform.localEulerAngles;
	
		rot.y += xDelta;
		rot.x -= yDelta;
		rot.z = 0;
	
		this.transform.position = cursor.position + new Vector3 ( 0, 1.7, 0 );
		this.transform.localRotation = Quaternion.Slerp ( this.transform.localRotation, Quaternion.Euler(rot.x, rot.y, rot.z), Time.deltaTime * 5 );
	
		// skybox camera
		if ( skyboxCamera ) {
			skyboxCamera.transform.rotation = transform.rotation;
			skyboxCamera.transform.localPosition = transform.position / 40;
		}
	
	// Normal mode
	} else {			
		// position
		var x = transform.localPosition.x;
		var y = transform.localPosition.y;
		var z = transform.localPosition.z;
		var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
		var horizontal = Camera.main.transform.TransformDirection ( Vector3.left );
		var vertical = Camera.main.transform.TransformDirection ( Vector3.down );
		
		// right mouse click
		if ( Input.GetMouseButtonDown(1) && !Input.GetKey ( KeyCode.LeftAlt ) ) {
			RefreshFixPoint ( true );
		
		// right mouse drag
		} else if ( Input.GetMouseButton(1) ) {  
			if ( !Input.GetKey ( KeyCode.LeftAlt ) )  { 
				var target : Vector3 = cursor.position;
				
				transform.RotateAround ( target, Quaternion.Euler(0, -45, 0) * ( target - this.transform.position ), Input.GetAxis("Mouse Y") * sensitivity );
		       	transform.RotateAround ( target, Vector3.up, Input.GetAxis("Mouse X") * sensitivity );
		        transform.rotation = Quaternion.Lerp( transform.rotation, Quaternion.LookRotation( target - transform.position ), 50 * Time.deltaTime );
				
			} else {
				var rotationX : float = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivity;
				var rotationY : float = -transform.localEulerAngles.x + Input.GetAxis("Mouse Y") * sensitivity;
			
				transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
			
			}
		
		// middle mouse drag
		} else if ( Input.GetMouseButton(2) && !OGRoot.GetInstance().isMouseOver && OGRoot.GetInstance().currentPage.pageName == "MenuBase" ) {        
	        var panSensitivity : float = sensitivity; 
				
			if ( Camera.main.orthographic ) {
				panSensitivity = panSensitivity * ( Camera.main.orthographicSize / 2 );
			}
	        
	        var h = Input.GetAxis("Mouse X") * panSensitivity / 8;
	        var v = Input.GetAxis("Mouse Y") * panSensitivity / 8;
	
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
		
		// skybox camera
		if ( skyboxCamera ) {
			skyboxCamera.transform.rotation = transform.rotation;
			skyboxCamera.transform.localPosition = transform.position / 40;
		}
		
		// scroll wheel
		if ( !EditorCore.rotateMode && !EditorCore.scaleMode ) {
			var translation = Input.GetAxis("Mouse ScrollWheel");
			var spd : float = speed;
						
			if ( translation != 0.0 && !OGRoot.GetInstance().isMouseOver ) {				
				if ( Input.GetKey ( KeyCode.LeftShift ) || Input.GetKey ( KeyCode.RightShift ) ) {
					spd = spd / 4;
				} else if ( Input.GetKey ( KeyCode.LeftControl ) || Input.GetKey ( KeyCode.RightControl ) ) {
					spd = spd * 4;
				}
				
				if ( !Camera.main.orthographic || Camera.main.orthographic && Input.GetKey ( KeyCode.LeftAlt ) ) {
					transform.position = transform.position + forward * ( translation * spd );
				
				} else {
					if ( Camera.main.orthographicSize > translation * speed ) {
						RefreshFixPoint ( false );
						Camera.main.orthographicSize -= translation * speed;
						transform.position = cursor.position - forward * ( Camera.main.orthographicSize * 4 );
					}
				
				} 
				
			}
		}
	}
}
