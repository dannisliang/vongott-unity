#pragma strict

public class AudioSourceTimeScale extends MonoBehaviour {
	public function Update () {
		if ( this.audio ) {
			this.audio.pitch = Time.timeScale;
		}
	}
}
