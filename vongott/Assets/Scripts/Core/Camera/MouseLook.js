#pragma strict

////////////////////
// Prerequisites
////////////////////
// Public vars
enum RotationAxes { MouseXAndY = 0, MouseX = 1, MouseY = 2 }
var axes : RotationAxes = RotationAxes.MouseXAndY;
var sensitivityX : float = 15.0;
var sensitivityY : float = 15.0;

var minimumX : float = -360.0;
var maximumX : float = 360.0;

var minimumY : float = -60.0;
var maximumY : float = 60.0;

var rotationY : float = 0.0;

// Static vars
static var mouselookActive = true;


////////////////////
// Public functions
////////////////////
// Update
function Update () {
    if ( !mouselookActive ) {
    	return;
    }
        
    if (axes == RotationAxes.MouseXAndY) {
        var rotationX : float = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivityX;

        rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
        rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);

		var newRotation : Quaternion = Quaternion.Lerp ( transform.localRotation, Quaternion.Euler (-rotationY, rotationX, 0), 20 * GameCore.GetInstance().ignoreTimeScale );

		if ( !float.IsNaN(newRotation.x) && !float.IsNaN(newRotation.y) && !float.IsNaN(newRotation.z) && !float.IsNaN(newRotation.w) ) {
			transform.localRotation = newRotation;
    	}
    
    } else if (axes == RotationAxes.MouseX) {
        transform.Rotate(0, Input.GetAxis("Mouse X") * sensitivityX, 0);
    
    } else {
        rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
        rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);

        transform.localRotation = Quaternion.Lerp ( transform.localRotation, Quaternion.Euler ( -rotationY, transform.localEulerAngles.y, 0),  20 * GameCore.GetInstance().ignoreTimeScale );
    }

	//Debug.Log ( GameCore.GetInstance().timeScale ^ -1.0 );
}

// Set active
static function SetActive ( state : boolean ) {
	mouselookActive = state;
	//Screen.lockCursor = state;
	GameCore.Print ( "MouseLook | active: " + state );
}

// Init
function Start () {
	//Screen.lockCursor = true;
}