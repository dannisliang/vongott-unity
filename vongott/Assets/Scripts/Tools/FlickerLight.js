#pragma strict

public class FlickerLight extends MonoBehaviour {
	public var min : float;
	public var max : float;

	public function Update () {
		light.intensity = Mathf.SmoothStep ( light.intensity, Random.Range ( min, max ), Time.deltaTime * 100 );
	}
}
