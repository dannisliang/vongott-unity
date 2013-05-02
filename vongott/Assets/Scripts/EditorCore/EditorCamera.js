#pragma strict

////////////////////
// Prerequisites
////////////////////
// Public vars
var sensitivity : float = 2.5;
var speed : float = 10.0;
var renderMode : int = 0;

// Private vars
private var mouselook_active = true;
private var rotationY : float = 0.0;


////////////////////
// Public functions
////////////////////
// Rendering
function OnPreRender () {
	GL.wireframe = ( renderMode == 1 );
}

function OnPostRender () {
	GL.wireframe = false;
}

// Init
function Start () {
	
}

// Update
function Update () {
	if ( EditorCore.playMode ) {
		return;
	}
	
	// position
	var x = transform.localPosition.x;
	var y = transform.localPosition.y;
	var z = transform.localPosition.z;
	var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
	var horizontal = Camera.main.transform.TransformDirection ( Vector3.left );
	var vertical = Camera.main.transform.TransformDirection ( Vector3.down );
	
	// grab mode
	if ( EditorCore.grabMode ) {	
		if ( EditorCore.grabRestrict == "y" ) {
			x = 0;
			y = Input.GetAxis("Mouse Y") * sensitivity / 4;
			z = 0;
		} else if ( EditorCore.grabRestrict == "x" ) {
			x = (Input.GetAxis("Mouse X")) * sensitivity / 4;
			y = 0;
			z = 0;
		} else if ( EditorCore.grabRestrict == "z" ) {
			x = 0;
			y = 0;
			z = (Input.GetAxis("Mouse X")) * sensitivity / 4;
		} else {
			x = (Input.GetAxis("Mouse X")) * sensitivity / 4;
			y = Input.GetAxis("Mouse Y") * sensitivity / 4;
			z = (Input.GetAxis("Mouse X")) * sensitivity / 4;
		}
		
		for ( var o : GameObject in EditorCore.GetSelectedObjects() ) {
			o.transform.localPosition = new Vector3 ( o.transform.localPosition.x + x, o.transform.localPosition.y + y, o.transform.localPosition.z + z );
		}
				
		// end grab mode
		if ( Input.GetMouseButtonDown(0) ) {
			EditorCore.SetGrabMode ( false );
		}
		
	// camera mode	
	} else {		
		// scroll wheel
		var translation = Input.GetAxis("Mouse ScrollWheel") * speed;
		
		if ( translation != 0.0 ) {				
			if ( Input.GetKey ( KeyCode.LeftShift ) ) {
				transform.localPosition = new Vector3 ( x, y + translation, z );
			} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				transform.position = transform.position + horizontal * translation;
			} else {		
				transform.position = transform.position + forward * translation * 10;
			}
		}
		
		// right mouse button
		if ( Input.GetMouseButton(1) && !OGRoot.mouseOver ) {    
			var rotationX : float = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivity;
		
			rotationY += Input.GetAxis("Mouse Y") * sensitivity;
			rotationY = Mathf.Clamp (rotationY, -60, 60);
		
			transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
		
		// scroll button
		} else if ( Input.GetMouseButton(2) ) {        
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
		} else if ( Input.GetMouseButtonDown(0) && !OGRoot.mouseOver ) {
			var ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
			var hit : RaycastHit;
			
			if ( Physics.Raycast ( ray, hit ) ) {
				var obj : GameObject = hit.collider.gameObject;
				
				if ( !Input.GetKey ( KeyCode.LeftShift ) ) {
					EditorCore.DeselectAllObjects();
					EditorCore.SelectObject ( obj );
					EditorCore.SetGrabMode( false );
				} else if ( EditorCore.IsObjectSelected ( obj ) ) {
					EditorCore.DeselectObject ( obj );
				} else {
					EditorCore.SelectObject ( obj );
				}
						
			} else {
				EditorCore.DeselectAllObjects ();
				EditorCore.ToggleGrabMode();
			}
		}
	}
}