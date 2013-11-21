#pragma strict

class MirrorCamera extends MonoBehaviour {
	var mirroredTestObject : Transform;
	
	function Update () {
		var mirroredPos : Vector3 = this.transform.position + Vector3.Reflect ( this.transform.position - Camera.main.transform.position, this.transform.parent.forward );
			
		mirroredTestObject.position = mirroredPos;
		
		this.transform.LookAt ( mirroredPos );
	}
}