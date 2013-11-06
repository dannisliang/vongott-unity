#pragma strict

public var yourFilename : String = "";

function Start () {
	var mi = new OBJImporter();
	var mesh = mi.ImportFile(yourFilename);
	
	this.GetComponent(MeshFilter).mesh = mesh;
}

function Update () {

}