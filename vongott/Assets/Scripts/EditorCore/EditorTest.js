@script RequireComponent(MeshFilter)
@script RequireComponent(MeshRenderer)

function Start () {
	/*var meshFilters = GetComponentsInChildren(MeshFilter);
    var combine : CombineInstance[] = new CombineInstance[meshFilters.Length];
    for (var i = 0; i < meshFilters.Length; i++){
        combine[i].mesh = meshFilters[i].sharedMesh;
        combine[i].transform = meshFilters[i].transform.localToWorldMatrix;
        meshFilters[i].gameObject.active = false;
    }
    this.GetComponent(MeshFilter).mesh = new Mesh();
    this.GetComponent(MeshFilter).mesh.CombineMeshes(combine);
    this.gameObject.active = true;*/
}