class Room extends MonoBehaviour {
	var isActive : boolean;
	
	function OnTriggerEnter ( other:Collider ) {
		isActive = true;
	}
	
	function OnTriggerExit ( other:Collider ) {
		isActive = false;
	}

	function Update () {
		for ( var i = 0; i < this.gameObject.transform.childCount; i++ ) {
			if ( this.gameObject.activeSelf ) {
				this.gameObject.transform.GetChild(i).gameObject.GetComponent(MeshRenderer).enabled = isActive;
			}
		}
	}
}