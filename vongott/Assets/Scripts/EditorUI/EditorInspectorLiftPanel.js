#pragma strict

class EditorInspectorLiftPanel extends MonoBehaviour {
	public var nodeContainer : Transform;
	
	private var liftPanel : LiftPanel;
	
	//////////////////////
	// Destination nodes
	//////////////////////
	public function AddDestination () {
		AddDestination ( liftPanel.liftObject.position, nodeContainer.childCount );
	}
	
	public function AddDestination ( v : Vector3, i : int ) {
		if ( i >= 10 ) { return; }
		
		var obj : GameObject = new GameObject ( i.ToString() );
		var btn : OGButton = obj.AddComponent ( OGButton );
				
		obj.transform.parent = nodeContainer;
		obj.transform.localEulerAngles = Vector3.zero;
		obj.transform.localScale = new Vector3 ( 260, 20, 1 );	
		obj.transform.localPosition = new Vector3 ( 0, 30*i, 0 );
	
		btn.text = v.x + "," + v.y + "," + v.z;
		btn.target = this.gameObject;
		btn.message = "PickDestination";
		btn.GetDefaultStyles();

		UpdateObject();
	}	
		
	public function RemoveDestination () {
		if ( nodeContainer.childCount > 1 ) {
			Destroy ( nodeContainer.GetChild(nodeContainer.childCount-1).gameObject );
		
			UpdateObject();
		}
	}
	
	public function PickDestination ( btn : OGButton ) {
		var v : Vector3 = liftPanel.liftObject.position;
		btn.text = v.x + "," + v.y + "," + v.z;
	
		UpdateObject ();
	}
	
	private function AddNodesFromPanel () {		
		for ( var i : int = 0; i < liftPanel.allDestinations.Count; i++ ) {
			if ( nodeContainer.childCount >= i + 1 ) {
				DestroyImmediate ( nodeContainer.GetChild(i).gameObject );
			}
			
			AddDestination ( liftPanel.allDestinations[i], i );
		}

		for ( i = liftPanel.allDestinations.Count; i < nodeContainer.childCount; i++ ) {
			DestroyImmediate ( nodeContainer.GetChild(i).gameObject );
		}	
	}
	
	private function GetDestinationVectors () : List.<Vector3> {
		var list : List.< Vector3 > = new List.< Vector3 >();
		
		for ( var i : int = 0; i < nodeContainer.childCount; i++ ) {
			var str : String = nodeContainer.GetChild(i).GetComponent(OGButton).text;
			var vectorStr : String[] = str.Split(","[0]);
			
			list.Add ( new Vector3 ( float.Parse(vectorStr[0]), float.Parse(vectorStr[1]), float.Parse(vectorStr[2]) ) );
		}
		
		return list;
	}
	
							
	//////////////////////
	// Init
	//////////////////////
	function Init ( obj : GameObject ) {
		this.gameObject.SetActive ( true );
	
		liftPanel = obj.GetComponentInChildren ( LiftPanel );
		
		AddNodesFromPanel ();
	}
	
	
	//////////////////////
	// Update
	//////////////////////
	function UpdateObject () {	
		liftPanel.allDestinations = GetDestinationVectors();
	}
}
