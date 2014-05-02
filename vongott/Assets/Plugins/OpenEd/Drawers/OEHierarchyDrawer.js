#pragma strict

public class OEHierarchyDrawer extends OEDrawer {
	public var scrollview : Transform;

	private var yOffset : float;
	private var updateNames : Dictionary.< GameObject, OGListItem > = new Dictionary.< GameObject, OGListItem > ();

	public function Traverse ( node : Transform, xOffset : float ) {
		for ( var i : int = 0; i < node.childCount; i++ ) {
			var n : String = node.GetChild ( i ).gameObject.name;
			var li : OGListItem = new GameObject ( n ).AddComponent.< OGListItem > ();

			updateNames.Add ( node.GetChild ( i ).gameObject, li );
			li.ApplyDefaultStyles ();

			li.transform.parent = scrollview;
			li.transform.localScale = new Vector3 ( 220 - xOffset, 20, 1 );
			li.transform.localPosition = new Vector3 ( xOffset, yOffset, -1 );

			yOffset += 20;

			var obj : OFSerializedObject = node.GetChild(i).GetComponent.< OFSerializedObject >();
			li.isTicked = OEWorkspace.GetInstance().IsSelected ( obj );
			
			li.target = OEWorkspace.GetInstance().gameObject;
		       	
			if ( obj ) {
				li.message = "SelectObject";
				li.argument = obj.id;
			
			} else {
				li.message = "ClearSelection";
	
			}

			Traverse ( node.GetChild ( i ), xOffset + 20 );
		}
	}

	public function Update () {
		for ( var kvp : KeyValuePair.< GameObject, OGListItem > in updateNames ) {
			kvp.Value.text = kvp.Key.name;
		}
	}

	public function Start () {
		var root : Transform = OEWorkspace.GetInstance().transform;

		Traverse ( root, 0 );
	}
}
