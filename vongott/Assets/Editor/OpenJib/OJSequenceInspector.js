#pragma strict

import DG.Tweening;

@CustomEditor ( OJSequence )
public class OJSequenceInspector extends Editor {
	private static var currentEditorTime : float;
	private static var currentEditorKeyframe : int;
	private static var timelineScale : float = 20;

	override function OnInspectorGUI () {
		var sequence : OJSequence = target as OJSequence;
		var padding : float = 10;
		var currentTime : float = sequence.playing ? sequence.currentTime : currentEditorTime;

		sequence.cam = EditorGUILayout.ObjectField ( "Camera", sequence.cam, typeof ( Camera ), true ) as Camera;

		if ( !sequence.cam ) {
			EditorGUILayout.LabelField ( "Please link a camera first" );
			return;
		}

		// Controls
		EditorGUILayout.BeginHorizontal ();
		
		if ( GUILayout.Button ( "PLAY" ) ) {
			sequence.Play ();
		}
		
		if ( GUILayout.Button ( "PAUSE" ) ) {
			sequence.Stop ();
		}
		
		if ( GUILayout.Button ( "RESET" ) ) {
			currentEditorTime = 0;
			currentTime = 0;
			sequence.Reset ();
		}

		EditorGUILayout.EndHorizontal ();

		EditorGUILayout.Space ();

		timelineScale = EditorGUILayout.Slider ( "Scale", timelineScale + 80, 100, 500 ) - 80;
		
		// Timeline
		EditorGUILayout.BeginHorizontal ();
		
		GUILayout.Box ( "", GUILayout.Height ( 50 ), GUILayout.ExpandWidth ( true ) );
		
		var rect : Rect = GUILayoutUtility.GetLastRect ();

		if ( !sequence.playing && GUILayout.Button ( "+", GUILayout.Width ( 32 ), GUILayout.ExpandHeight ( true ) ) ) {
			currentEditorKeyframe = sequence.AddKeyframe ( currentTime );
		}
		
		EditorGUILayout.EndHorizontal ();

		GUI.BeginScrollView ( rect, new Vector2 ( currentTime * timelineScale, 0 ), new Rect ( 0, 0, padding * 2 + sequence.length * timelineScale, 20 ), GUIStyle.none, GUIStyle.none );
		
		for ( var s : int = 0; s <= sequence.length; s++ ) {
			GUI.Label ( new Rect ( padding - 5 + s * timelineScale, 0, 20, 14 ), s.ToString() );
		}

		GUI.Box ( new Rect ( padding, 34, sequence.length * timelineScale, 2 ), "" );

		GUI.color = Color.red;

		GUI.Box ( new Rect ( padding + currentTime * timelineScale, 20, 2, 30 ), "" );

		for ( var i : int = 0; i < sequence.keyframes.Count; i++ ) {
			var kf : OJKeyframe = sequence.keyframes [ i ];

			GUI.color = i == currentEditorKeyframe ? Color.green : Color.white;

			if ( GUI.Button ( new Rect ( padding - 5 + kf.time * timelineScale, 25.0, 10, 20 ), "" ) ) {
				currentEditorKeyframe = i;
			}
		}

		GUI.color = Color.white;
		
		GUI.EndScrollView ();

		if ( !sequence.playing ) {
			// Scrobble
			EditorGUILayout.Space ();

			EditorGUILayout.BeginHorizontal ();
			currentTime = EditorGUILayout.Slider ( currentTime, 0, sequence.length );
			EditorGUILayout.LabelField ( "/", GUILayout.Width ( 10 ) );
			sequence.length = EditorGUILayout.FloatField ( sequence.length, GUILayout.Width ( 50 ) );
			EditorGUILayout.EndHorizontal ();

			EditorGUILayout.Space ();

			// Properties
			kf = sequence.keyframes [ currentEditorKeyframe ];

			// Transform
			EditorGUILayout.BeginHorizontal ();
			EditorGUILayout.LabelField ( "Transform", EditorStyles.boldLabel );
			if ( GUILayout.Button ( "Copy from scene", GUILayout.Width ( 120 ) ) ) {
				kf.position = sequence.cam.transform.localPosition;
				kf.rotation = sequence.cam.transform.localEulerAngles;
			}
			EditorGUILayout.EndHorizontal ();
			
			kf.position = EditorGUILayout.Vector3Field ( "Position", kf.position );
			kf.rotation = EditorGUILayout.Vector3Field ( "Rotation", kf.rotation );
			
			// Curve
			EditorGUILayout.Space ();
			EditorGUILayout.LabelField ( "Curve", EditorStyles.boldLabel );
			kf.curve.before = EditorGUILayout.Vector3Field ( "Before", kf.curve.before );
			kf.curve.after = EditorGUILayout.Vector3Field ( "After", kf.curve.after );

			EditorGUILayout.Space ();
			
			EditorGUILayout.LabelField ( "Properties", EditorStyles.boldLabel );
			kf.fov = EditorGUILayout.IntField ( "FOV", kf.fov );
			kf.brightness = EditorGUILayout.FloatField ( "Brightness", kf.brightness );
			kf.stop = EditorGUILayout.Toggle ( "Stop", kf.stop );
			kf.time = EditorGUILayout.Slider ( "Time", kf.time, 0, sequence.length );
			
			// Actions
			EditorGUILayout.Space ();

			if ( GUILayout.Button ( "Remove" ) ) {
				sequence.RemoveKeyframe ( currentEditorKeyframe );
			}
		}

		// Make sure the list of keyframes is sorted by time
		if ( !sequence.playing && GUI.changed ) {
			sequence.SortKeyframes ();
			sequence.SetTime ( currentTime );
		}

		if ( !sequence.playing ) {
			currentEditorTime = currentTime;
		}
	}
}
