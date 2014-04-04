#pragma strict

import System.IO;

public class PrefabTools extends MonoBehaviour {
	@MenuItem ("Vongott/Prefabs/DumpTexture")
	public static function DumpTexture () {
		if ( EditorCore.running ) {
			for ( var i : int = 0; i < Selection.gameObjects.Length; i++ ) {
				var target : GameObject = Selection.gameObjects[i];
				EditorCore.GetInstance().StartCoroutine ( EditorCore.GetObjectIcon ( target, null ) );
			}
		}
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
