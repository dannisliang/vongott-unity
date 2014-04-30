#pragma strict

public class OEPrefabsDrawer extends OEDrawer {
	public var prefabDir : String = "Prefabs";
	public var subdirSwitch : OGPopUp;
	public var scrollview : Transform;

	public function SetSubdir ( subDir : String ) {
		var files : Object[] = OEFileSystem.GetFiles ( prefabDir + "/" + subDir );
	}

	public function Start () {
		subdirSwitch.options = OEFileSystem.GetDirectoryNames ( prefabDir ); 
	}
}
