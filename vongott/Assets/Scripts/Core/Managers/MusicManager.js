#pragma strict

public class MusicManager extends MonoBehaviour {
	public var channel1 : AudioSource;
	public var channel2 : AudioSource;
	public var fadeDelta : float = 0.25;

	private var shouldPlay : AudioSource;
	private var shouldNotPlay : AudioSource;

	private static var instance : MusicManager;

	public static function GetInstance () : MusicManager {
		return instance;
	}

	public function Start () {
		instance = this;

		channel1.volume = 0;
		channel2.volume = 0;
	}

	public function StopChannel1 () {
		channel1.Stop ();
	}
	
	public function StopChannel2 () {
		channel2.Stop ();
	}

	private function LoadFile ( channel : AudioSource, name : String ) {
		var www = new WWW ( "file://" + Application.dataPath + "/Music/" + name + ".ogg" );

		channel.clip = www.GetAudioClip ( false, false, AudioType.OGGVORBIS );	
		channel.clip.name = name;
	}

	public function LoadCalm ( name : String ) {
		LoadFile ( channel1, name );
	}

	public function LoadAggressive ( name : String ) {
		LoadFile ( channel2, name );
	}

	public function PlayCalm () {
		shouldNotPlay = channel2;
		shouldPlay = channel1;
	}
	
	public function PlayAggressive () {
		shouldNotPlay = channel1;
		shouldPlay = channel2;
	}

	public function Update () {
/*		if ( shouldPlay && shouldPlay.clip && shouldPlay.clip.isReadyToPlay ) {
			if ( !shouldPlay.isPlaying ) {
				shouldPlay.Play ();
			
			} else if ( shouldPlay.volume < 1 ) {
				shouldPlay.volume = shouldPlay.volume + fadeDelta * Time.deltaTime;
			
			}
		}

		if ( shouldNotPlay && shouldNotPlay.clip && shouldNotPlay.isPlaying ) {
			if ( shouldNotPlay.volume > 0 ) {
				shouldNotPlay.volume = shouldNotPlay.volume - fadeDelta * Time.deltaTime;

			} else {
				shouldNotPlay.Stop ();
			}
		}
	*/}
}
