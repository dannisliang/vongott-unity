class OGWidget extends MonoBehaviour {
	// Enums
	enum anchor_points {
		TopLeft,
		Top,
		TopRight,
		Right,
		Center,
		BottomRight,
		Bottom,
		BottomLeft,
		Left
	};
	
	// Inspector items
	var targetCamera : Camera;
	var margin : Vector3 = new Vector3 ( 0.0, 0.0, 0.0 );
	var anchor = anchor_points.Center;
	
	// Private vars
	private var anchor_position : Vector3 = new Vector3 ( 0.0, 0.0, 0.0 );
	
	// Private classes
	private class Point {
		public var x = 0.0;
		public var y = 0.0;
	
		function Point ( x : float, y : float ) {
			this.x = x;
			this.y = y;
		}
	}
	
	// Update widget
	function UpdateWidget () {		
		if ( targetCamera ) {
			var point = new Point ( 0.0, 0.0 );
		
			switch ( anchor ) {
				case anchor_points.TopLeft:
					point.x = -0.5;
					point.y = 0.5;
					break;
				case anchor_points.Top:
					point.x = 0.0;
					point.y = 0.5;
					break;
				case anchor_points.TopRight:
					point.x = 0.5;
					point.y = 0.5;
					break;
				case anchor_points.Right:
					point.x = 0.5;
					point.y = 0.0;
					break;
				case anchor_points.BottomRight:
					point.x = 0.5;
					point.y = -0.5;
					break;
				case anchor_points.Bottom:
					point.x = 0.0;
					point.y = -0.5;
					break;
				case anchor_points.BottomLeft:
					point.x = -0.5;
					point.y = -0.5;
					break;
				case anchor_points.Left:
					point.x = -0.5;
					point.y = 0.0;
					break;
			}
			
			anchor_position = new Vector3 (
				point.x * ( ( 2.0 * targetCamera.orthographicSize ) * targetCamera.aspect),
				point.y * ( 2.0 * targetCamera.orthographicSize ),
				0.0
			);
			
			this.gameObject.transform.localPosition = new Vector3 ( 
				anchor_position.x + margin.x,
				anchor_position.y + margin.y,
				anchor_position.z + margin.z
			);
		}
	}
	
	function Start () {
	
	}
	
	function Update () {

	}
}