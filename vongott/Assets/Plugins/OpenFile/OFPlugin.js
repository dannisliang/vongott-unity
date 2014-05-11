#pragma strict

public class OFPlugin {
	public function Serialize ( input : Component ) : JSONObject {}
	public function Deserialize ( input : JSONObject, output : Component ) {}
	public function CheckType ( type : System.Type ) : boolean {}
}
