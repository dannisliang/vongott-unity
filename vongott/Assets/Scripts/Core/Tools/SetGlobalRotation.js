#pragma strict

@script ExecuteInEditMode()
class SetGlobalRotation extends MonoBehaviour {
	public var rotation : Vector3;
	
	function Update () {
		this.transform.eulerAngles = rotation;
	}
}