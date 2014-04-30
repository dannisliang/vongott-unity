#pragma strict

public class OEComponentInspector extends MonoBehaviour {
	public var type : OFFieldType;
	@HideInInspector public var selection : OFSerializedObject [];

	public function get typeId () : String {
		return type.ToString();
	}

	public function Init ( selection : OFSerializedObject[] ) {
		this.selection = selection;
		Refresh ();
	}
	
	public function Refresh () { }
}
