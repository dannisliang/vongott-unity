#pragma strict

public class OEAudioSourceInspector extends OEComponentInspector {
	private var audioClipTarget : OFAssetLink.Type;
	
	override function get type () : System.Type { return typeof ( AudioSource ); }
	
	override function Inspector () {
		var audio : AudioSource = target.GetComponent.< AudioSource >();

		LabelField ( "Clip" );

		var buttonString : String = "None";

		if ( audio.clip != null ) {
			if ( audio.clip.name.Length > 15 ) {
				buttonString = audio.clip.name.Substring ( 0, 15 ) + "..."; 
			
			} else {
				buttonString = audio.clip.name;
			
			}
		}

		if ( Button ( buttonString, new Rect ( width / 2, offset.y, width / 2, 16 ) ) ) {
			if ( audioClipTarget == OFAssetLink.Type.Resource ) {
				OEWorkspace.GetInstance().PickResource ( function ( path : String ) {
					target.SetAssetLink ( "clip", path, false );
				}, typeof ( AudioClip ), true );
			
			} else {
				OEWorkspace.GetInstance().PickFile ( function ( path : String ) {
					target.SetAssetLink ( "clip", path, true );
				}, ".ogg" );

			}
		}

		offset.y += 20;
	
		var assetLink : OFAssetLink = target.GetAssetLink ( "clip" );

		if ( assetLink != null ) {
			audio.clip = assetLink.GetAudioClip ();
		}

		audio.dopplerLevel = FloatField ( "Doppler level", audio.dopplerLevel );
		audio.ignoreListenerPause = Toggle ( "Ignore pause", audio.ignoreListenerPause );
		audio.ignoreListenerVolume = Toggle ( "Ignore volume", audio.ignoreListenerVolume );
		audio.loop = Toggle ( "Loop", audio.loop );
		audio.maxDistance = FloatField ( "Max distance", audio.maxDistance );
		audio.minDistance = FloatField ( "Min distance", audio.minDistance );
		audio.panLevel = FloatField ( "Pan level", audio.panLevel );
		audio.pitch = Slider ( "Pitch", audio.pitch, -3, 3 );
		audio.playOnAwake = Toggle ( "Play on awake", audio.playOnAwake );
		audio.priority = Slider ( "Priority", audio.priority, 0, 255 );
		audio.rolloffMode = Popup ( "Rolloff mode", audio.rolloffMode, System.Enum.GetNames ( AudioRolloffMode ) );
		audio.spread = FloatField ( "Spread", audio.spread );
		audio.volume = Slider ( "Volume", audio.volume, 0, 1 );
	}	
}
