#pragma strict

class SurveillanceCamera extends MonoBehaviour {
	enum eCameraTarget {
		Allies,
		Enemies
	}
	
	var target : eCameraTarget = eCameraTarget.Allies;
}