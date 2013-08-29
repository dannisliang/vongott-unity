#pragma strict

public class MeshCombine {
    public static function CombineMeshes ( parent : GameObject ) : Mesh {
	    var outputMesh : Mesh = new Mesh ();
	    
	    var meshFilters : MeshFilter[] = parent.GetComponentsInChildren(MeshFilter);
        var combine : CombineInstance[] = new CombineInstance[meshFilters.Length];
        
        var index : int = 0;
        var matIndex : int = -1;

        for ( var i = 0; i < meshFilters.Length; i++)
        {
            if (meshFilters[i].sharedMesh == null) { continue; }
            
            if ( !meshFilters[i].renderer.enabled ) {
            	continue;
            
            } else if ( matIndex == -1) {
                matIndex = i;
            }
                        
            combine[index].mesh = meshFilters[i].sharedMesh;

            combine[index++].transform = meshFilters[i].transform.localToWorldMatrix;
            meshFilters[i].renderer.enabled = false;
        }

        outputMesh.CombineMeshes(combine);

        return outputMesh;
    }
}