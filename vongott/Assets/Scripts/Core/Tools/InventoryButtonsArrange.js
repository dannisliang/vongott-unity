#pragma strict

@script ExecuteInEditMode()

class InventoryButtonsArrange extends MonoBehaviour {
	function Update () {
		for ( var i = 0; i < this.transform.GetChildCount(); i++ ) {
			var rot : float = ( i - 1.5 ) * ( 360.0 / this.transform.GetChildCount() );
			
			this.transform.GetChild(i).name = i.ToString();
			this.transform.GetChild(i).localEulerAngles = new Vector3 ( rot, 90, 90 );
			this.transform.GetChild(i).GetChild(0).eulerAngles = new Vector3 ( 0, 180, 0 );
		}
	}
}