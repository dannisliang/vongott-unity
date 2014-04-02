#pragma strict

@script ExecuteInEditMode()

public class ArrangeWidgetsInGrid extends MonoBehaviour {
	public var rows : int = 0;
	public var spacing : float = 10;
	public var arrangeNow : boolean = false;

	public function Update () {
		if ( arrangeNow ) {
			var x : int = 0;
			var y : int = 0;
			
			for ( var i : int = 0; i < transform.childCount; i++ ) {
				transform.GetChild(i).localPosition = new Vector3 ( x * spacing, y * spacing, transform.GetChild(i).localPosition.z );
				
				if ( x < rows - 1 ) {
					x++;
				} else {
					x = 0;
					y++;
				}
			}

			arrangeNow = false;
		}
	}
}
