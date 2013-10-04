#pragma strict

public class MeshCombine {
    public static function CombineMeshes ( parent : GameObject ) : Mesh {
	    var outputMesh : Mesh = new Mesh ();
	    
	    var meshFilters : Component[] = parent.GetComponentsInChildren(MeshFilter);
        var combine : CombineInstance[] = new CombineInstance[meshFilters.Length];
        
        var index : int = 0;
        var matIndex : int = -1;

        for ( var i = 0; i < meshFilters.Length; i++)
        {
            var mf : MeshFilter = meshFilters[i] as MeshFilter;
            
            if (mf.sharedMesh == null) { continue; }
            
            if ( !mf.renderer.enabled ) {
            	continue;
            
            } else if ( matIndex == -1) {
                matIndex = i;
            }
                        
            combine[index].mesh = mf.sharedMesh;

            combine[index++].transform = mf.transform.localToWorldMatrix;
            mf.renderer.enabled = false;
        }

        outputMesh.CombineMeshes(combine);

        return outputMesh;
    }
}