#pragma strict

class EditorInspectorShape extends MonoBehaviour { 
	var currentShape : Shape;
	
	public function Add () {
		EditorCore.GetInstance().AddShape ( currentShape );
	}
	
	public function Subtract () {
	
	}
	
	public function Init ( obj : GameObject ) {
		currentShape = obj.GetComponent(Shape);
	}
}