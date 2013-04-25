#pragma strict

class EditorBillboard extends MonoBehaviour {
	function Update () {
		transform.LookAt(Camera.main.transform.position, -Vector3.up);
	}
}