#pragma strict

////////////////////
// Prerequisites
////////////////////
// Public vars
var sensitivity : float = 2.5;
var speed : float = 5000.0;
var editorCore : EditorCore;

// Private vars
private var mouselook_active = true;
private var rotationY : float = 0.0;


////////////////////
// Public functions
////////////////////
// Init
function Start () {

}

// Update
function Update () {
	if ( EditorCore.menusActive ) {
		return;
	}
	
	// position
	var x = transform.localPosition.x;
	var y = transform.localPosition.y;
	var z = transform.localPosition.z;
	var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
	var horizontal = Camera.main.transform.TransformDirection ( Vector3.left );
	var vertical = Camera.main.transform.TransformDirection ( Vector3.down );
	
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
	if ( Input.GetMouseButton(1) ) {    
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
	} else if ( Input.GetMouseButtonDown(0) ) {
		var ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
		var hit : RaycastHit;
		
		if ( Physics.Raycast ( ray, hit ) ) {
			var obj : GameObject = hit.collider.gameObject;
			
			if ( !Input.GetKey ( KeyCode.LeftShift ) ) {
				editorCore.DeselectAllObjects();
				editorCore.SelectObject ( obj );
			} else if ( editorCore.IsObjectSelected ( obj ) ) {
				editorCore.DeselectObject ( obj );
			} else {
				editorCore.SelectObject ( obj );
			}
					
		} else {
			editorCore.DeselectAllObjects ();
		}
	}
		
	// drag objects
	if ( Input.GetMouseButton(0) ) {	
		if ( editorCore.GetSelectedObjects().Count > 0 ) {
			if ( Input.GetKey ( KeyCode.LeftShift ) ) {
				x = 0;
				y = Input.GetAxis("Mouse Y") * sensitivity / 4;
				z = 0;
			} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				x = -(Input.GetAxis("Mouse X")) * sensitivity / 4;
				y = 0;
				z = 0;
			} else if ( Input.GetKey ( KeyCode.LeftAlt ) ) {
				x = 0;
				y = 0;
				z = -(Input.GetAxis("Mouse X")) * sensitivity / 4;
			} else {
				return;
			}
			
			for ( var o : GameObject in editorCore.GetSelectedObjects() ) {
				o.transform.localPosition = new Vector3 ( o.transform.localPosition.x + x, o.transform.localPosition.y + y, o.transform.localPosition.z + z );
			}
		}
	}
}