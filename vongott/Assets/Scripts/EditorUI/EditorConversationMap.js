#pragma strict

class EditorConversationMap extends MonoBehaviour {
	public static var instance : EditorConversationMap;
	public var connectionCallback : Function;
	public var connectMode : boolean = false;
	public var rootNodes : Transform;
	
	function Start () {
		instance = this;
	}
	
	private function SortRootNodes () {		
		for ( var i : int = 0; i < rootNodes.childCount; i++ ) {
			rootNodes.GetChild ( i ).localPosition = new Vector3 ( 0, i * 30, 0 );
			rootNodes.GetChild ( i ).GetComponentInChildren ( OGButton ).argument = i.ToString();
			rootNodes.GetChild ( i ).gameObject.name = i.ToString();
			rootNodes.GetChild ( i ).GetComponentInChildren ( OGLabel ).text = i.ToString();
		}
	}
	
	public static function GetInstance() : EditorConversationMap {
		return instance;
	}
	
	public function ConnectNodes ( callback : Function ) {
		connectionCallback = callback;
		connectMode = true;
	}
	
	function Update () {

	}
}