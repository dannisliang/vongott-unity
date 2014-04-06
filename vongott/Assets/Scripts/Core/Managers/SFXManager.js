#pragma strict

public class SFXManager extends MonoBehaviour {
	public var sounds : AudioClip [] = new AudioClip[0];

	public static var instance : SFXManager;
	
	public static function GetInstance () : SFXManager {
		return instance;
	}

	public function Start () {
		instance = this;
	}

	public function GetSound ( id : String ) : AudioClip {
		for ( var i : int = 0; i< sounds.Length; i++ ) {
			if ( sounds[i] && sounds[i].name == id ) {
				return sounds[i];
			}
		}

		GameCore.Print ( "SFXManager | Couldn't find clip '" + id + "'" );

		return null;
	}

	public function Stop ( source : AudioSource ) {
		source.Stop ();
		source.clip = null;
	}

	public function Stop ( id : String, source : AudioSource ) {

	}

	public function Stop ( ids : String[], source : AudioSource ) {
		if ( !source.isPlaying || !source.clip ) { return; }
		
		var match : boolean = false;

		for ( var i : int = 0; i < ids.Length; i++ ) {
			if ( ids[i] == source.clip.name ) {
				match = true;
				break;
			}
		}
		
		if ( source.isPlaying && match ) {
			Stop ( source );
		}
	}

	public function Play ( id : String ) {
		Play ( id, Camera.main.gameObject.audio, false );
	}

	public function Play ( id : String, source : AudioSource ) {
		Play ( id, source, false );
	}

	public function Play ( id : String, source : AudioSource, loop : boolean ) {
		if ( source.clip && source.clip.name == id && loop ) {
			return;
		}
	
		if ( source.clip && !source.loop && source.isPlaying ) {
			return;
		}

		source.clip = GetSound ( id );

		source.Stop ();

		if ( source.clip ) {
			source.Play ();
			source.loop = loop;
		}
	}
}
