#pragma strict

class AStarWayPoint extends MonoBehaviour {
	public var layerMask : LayerMask;
	public var node : AStarNode = new AStarNode();
	
	public function FindNeighbors ( allNodes : AStarWayPoint [] ) {
		var tempList : List.< AStarNode > = new List.< AStarNode > ();
		
		node.position = this.transform.position;
		
		for ( var nodeContainer : AStarWayPoint in allNodes ) {
			if ( nodeContainer != this ) {
				var hit : RaycastHit;
				var here : Vector3 = this.transform.position + new Vector3 ( 0, 0.5, 0 );
				var there : Vector3 = nodeContainer.transform.position;
				var direction : Vector3 = there - here;
				var distance : float = ( here - there ).magnitude;
				
				if ( distance > 6.0 ) {
					distance = 6.0;
				}
				
				Physics.Raycast ( here, direction, hit, distance, layerMask );
				
				if ( hit != null && hit.transform == nodeContainer.transform ) {
					tempList.Add ( nodeContainer.node );
				}
			}
		}
		
		node.neighbors = tempList;
	}
	
	function Update () {
		node.position = this.transform.position;
	}
}