#pragma strict

import System.IO;

public class PrefabTools extends MonoBehaviour {
	@MenuItem ("Vongott/Prefabs/DumpTexture")
	public static function DumpTexture () {
		var target : GameObject = Selection.activeObject as GameObject;
		var texture = AssetPreview.GetAssetPreview ( target );
		var png : byte[] = texture.EncodeToPNG ();
		
		File.WriteAllBytes ( Application.dataPath + "/Dump/" + target.name + ".png", png );
	}

	@MenuItem ( "Vongott/Prefabs/Update Path" )
	static function UpdatePath () {
		for ( var obj : GameObject in Selection.gameObjects ) {
			if ( !obj.GetComponent(Prefab) ) { continue; }
			
			var asset = PrefabUtility.GetPrefabObject(obj);
			var p : String = AssetDatabase.GetAssetPath(asset);
			p = p.Replace("Assets/Resources/","");
			p = p.Replace(".prefab","");
			var split : String[] = p.Split('/'[0]);
			
			var id : String = split[split.Length-1];
			var path : String = "";
			
			for ( var i = 0; i < split.Length - 1; i++ ) {
				path += split[i];
				
				if ( i < split.Length - 2 ) {
					path += "/";
				}
			}
			
			obj.GetComponent(Prefab).id = id;
			obj.GetComponent(Prefab).path = path;
		}
	}
	

}
