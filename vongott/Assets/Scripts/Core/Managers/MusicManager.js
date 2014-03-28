#pragma strict

public class MusicManager extends MonoBehaviour {
	public var channel1 : AudioSource;
	public var channel2 : AudioSource;

	private static var instance : MusicManager;

	public static function GetInstance () : MusicManager {
		return instance;
	}

	public function Start () {
		instance = this;

		channel1.volume = 0;
		channel2.volume = 0;
	}

	public function UnloadChannel1 () {
		channel1.Stop ();
		channel1.clip = null;
	}
	
	public function UnloadChannel2 () {
		channel1.Stop ();
		channel2.clip = null;
	}

	private function FadeTo ( channel : AudioSource, time : float, target : float, callback : String ) {
		iTween.AudioTo ( this.gameObject, iTween.Hash ( "time", time, "audiosource", channel, "volume", target, "oncompletetarget", this.gameObject, "oncomplete", callback ) ); 
	}

	private function LoadFile ( channel : AudioSource, name : String ) {
		var www = new WWW ( "file://" + Application.dataPath + "/Music/" + name + ".ogg" );

		channel.clip = www.GetAudioClip ( false, false, AudioType.OGGVORBIS );	
		channel.clip.name = name;
	}

	public function Play ( name : String ) {
		var channel : AudioSource = channel1;

		if ( channel1.clip && channel1.isPlaying ) {
			FadeTo ( channel1, 4, 0, "UnloadCannel1" );
			channel = channel2;	

		} else if ( channel2.clip && channel2.isPlaying ) {
			FadeTo ( channel2, 4, 0, "UnloadChannel2" );
			channel = channel1;
		}
		
		LoadFile ( channel, name ); 
		FadeTo ( channel, 4, 1, "" );
	}

	public function Update () {
		if ( channel1.clip && !channel1.isPlaying && channel1.clip.isReadyToPlay ) {
			channel1.Play ();
		} else if ( channel2.clip && !channel2.isPlaying && channel2.clip.isReadyToPlay ) {
			channel2.Play ();
		}
	}
}
