#pragma strict

class EditorInspectorShape extends MonoBehaviour { 
	var currentShape : Shape;
	
	public function Union () {
		EditorCore.GetInstance().AddShape ( currentShape, BooleanRTLib.BooleanType.Union );
	}
	
	public function Intersect () {
		EditorCore.GetInstance().AddShape ( currentShape, BooleanRTLib.BooleanType.Intersection );
	}
	
	public function Subtract () {
		EditorCore.GetInstance().AddShape ( currentShape, BooleanRTLib.BooleanType.Subtract );
	}
	
	public function Init ( obj : GameObject ) {
		currentShape = obj.GetComponent(Shape);
	}
}