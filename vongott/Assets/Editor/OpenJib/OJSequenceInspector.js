#pragma strict

import DG.Tweening;

@CustomEditor ( OJSequence )
public class OJSequenceInspector extends Editor {
	private static var currentSequence : int;
	private static var currentKeyframe : int;
	
	override function OnInspectorGUI () {
		var sequence : OJSequence = target as OJSequence;
	
		sequence.cam = EditorGUILayout.ObjectField ( "Camera", sequence.cam, typeof ( Camera ), true ) as Camera;

		if ( !sequence.cam ) {
			EditorGUILayout.LabelField ( "Please link a camera first" );
			return;
		}

		EditorGUILayout.BeginHorizontal ();
		
		if ( GUILayout.Button ( "PLAY" ) ) {
			sequence.Play ();
		}
		
		if ( GUILayout.Button ( "PAUSE" ) ) {
			sequence.Stop ();
		}
		
		if ( GUILayout.Button ( "RESET" ) ) {
			sequence.Reset ();
		}

		EditorGUILayout.EndHorizontal ();
		
		EditorGUILayout.Space ();

		// Pick keyframe
		EditorGUILayout.LabelField ( "Keyframe: " + sequence.currentKeyframe + " / " + ( sequence.keyframes.Count - 1 ), EditorStyles.boldLabel );
		
		GUILayout.Space ( 30 );
		
		EditorGUILayout.BeginHorizontal ();
		
		if ( sequence.keyframes.Count < 1 ) {
			sequence.keyframes.Add ( new OJKeyframe () );
		}

		if ( currentKeyframe >= sequence.keyframes.Count ) {
			currentKeyframe = sequence.keyframes.Count - 1;
		}

		for ( var i : int = 0; i < sequence.keyframes.Count; i++ ) {
			if ( i == currentKeyframe ) {
				GUI.backgroundColor = Color.white;
			} else {
				GUI.backgroundColor = Color.grey;
			}

			if ( GUILayout.Button ( i.ToString(), GUILayout.Width ( 24 ), GUILayout.Height ( 16 ) ) ) {
				currentKeyframe = i;
				sequence.SetKeyframePose ( i );
			}
			
			if ( i == currentKeyframe ) {
				var rect : Rect = GUILayoutUtility.GetLastRect ();
				var bRect : Rect = rect;

				bRect.y = rect.y - 24;

				GUI.backgroundColor = Color.red;
				if ( GUI.Button ( bRect, "-" ) ) {
					sequence.keyframes.RemoveAt ( i );
					return;
				}
				GUI.backgroundColor = Color.white;

				if ( i > 0 ) {
					bRect.x = rect.x - 20;
					bRect.width = 16;

					if ( GUI.Button ( bRect, "<" ) ) {
						var a : OJKeyframe = sequence.keyframes [ i - 1 ];
						var b : OJKeyframe = sequence.keyframes [ i ];

						sequence.keyframes [ i - 1 ] = b;
						sequence.keyframes [ i ] = a;

						currentKeyframe--;
						return;
					}
				}
				
				if ( i < sequence.keyframes.Count - 1 ) {
					bRect.x = rect.xMax + 4;
					bRect.width = 16;

					if ( GUI.Button ( bRect, ">" ) ) {
						a = sequence.keyframes [ i + 1 ];
						b = sequence.keyframes [ i ];

						sequence.keyframes [ i + 1 ] = b;
						sequence.keyframes [ i ] = a;

						currentKeyframe++;
						return;
					}
				}
			}

			GUI.backgroundColor = Color.white;
		}
		
		GUI.backgroundColor = Color.green;
		if ( GUILayout.Button ( "+", GUILayout.Width ( 24 ), GUILayout.Height ( 16 ) ) ) {
			sequence.keyframes.Add ( new OJKeyframe () );
		}

		GUI.backgroundColor = Color.white;
		
		EditorGUILayout.EndHorizontal ();

		EditorGUILayout.Space ();

		var kf : OJKeyframe = sequence.keyframes [ currentKeyframe ];
		
		// Transform
		EditorGUILayout.BeginHorizontal ();
		EditorGUILayout.LabelField ( "Transform", EditorStyles.boldLabel );

		EditorGUILayout.EndHorizontal ();
		
		kf.position = EditorGUILayout.Vector3Field ( "Position", kf.position );
		kf.rotation = EditorGUILayout.Vector3Field ( "Rotation", kf.rotation );

		EditorGUILayout.Space ();
		
		EditorGUILayout.LabelField ( "Properties", EditorStyles.boldLabel );
		kf.fov = EditorGUILayout.IntField ( "FOV", kf.fov );
		kf.brightness = EditorGUILayout.FloatField ( "Brightness", kf.brightness );
		kf.wait = EditorGUILayout.FloatField ( "Wait", kf.wait );
		kf.stop = EditorGUILayout.Toggle ( "Stop", kf.stop );
		
		EditorGUILayout.Space ();
		
		EditorGUILayout.LabelField ( "Next tween", EditorStyles.boldLabel );
		kf.time = EditorGUILayout.FloatField ( "Time", kf.time );
		kf.easing = EditorGUILayout.Popup ( "Easing", kf.easing, System.Enum.GetNames ( Ease ) );

		// Adopt data
		kf.position = sequence.cam.transform.position;
		kf.rotation = sequence.cam.transform.localEulerAngles;
	}
}
