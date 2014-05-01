#pragma strict

public class OEHierarchyDrawer extends OEDrawer {
	public var scrollview : Transform;

	private var yOffset : float;

	public function Traverse ( node : Transform, xOffset : float ) {
		for ( var i : int = 0; i < node.childCount; i++ ) {
			var n : String = node.GetChild ( i ).gameObject.name;
			var li : OGListItem = new GameObject ( n ).AddComponent.< OGListItem > ();

			li.text = n;
			li.ApplyDefaultStyles ();

			li.transform.parent = scrollview;
			li.transform.localScale = new Vector3 ( 220 - xOffset, 20, 1 );
			li.transform.localPosition = new Vector3 ( xOffset, yOffset, -1 );

			yOffset += 20;

			li.isTicked = OEWorkspace.GetInstance().IsSelected ( node.GetChild(i).GetComponent.< OFSerializedObject >() );
			li.func = function () {
				OEWorkspace.GetInstance().SelectObject ( node.GetChild(i).GetComponent.< OFSerializedObject >() );
			}; // THIS WON'T WORK

			Traverse ( node.GetChild ( i ), xOffset + 20 );
		}
	}

	public function Start () {
		var root : Transform = OEWorkspace.GetInstance().transform;

		Traverse ( root, 0 );
	}
}
