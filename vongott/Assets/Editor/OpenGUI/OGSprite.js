/*// Enums
enum enum_anchor_point { TopLeft, Top, TopRight, Right, Center, BottomRight, Bottom, BottomLeft, Left };
enum enum_relative_to { Parent, Screen };

// Menu items
var texture : Texture;
var anchorPoint = enum_anchor_point.Center;
var relativeTo = enum_relative_to.Parent;

// Create plane
function CreatePlane ( w:float, h:float ) {
	var m : Mesh = new Mesh ();
	m.name = "Sprite Mesh";
	m.vertices = [Vector3(0, 0, 0),Vector3(w, 0, 0), Vector3(w, h, 0), Vector3(0, h, 0)];
	m.uv = [Vector2(0,0), Vector2(0,1), Vector2(1,1), Vector2(1,0)];
	m.triangles = [0, 1, 2, 0, 2, 3];
	m.RecalculateNormals();
	
	var obj : GameObject = new GameObject ( "Sprite", MeshRenderer, MeshFilter );
	obj.GetComponent(MeshFilter).mesh = m;
}

// Update widget
private function UpdateWidget () {

}

function Start () {
	CreatePlane ( 20, 30 );
}*/