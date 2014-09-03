#pragma strict

import DG.Tweening;

@CustomEditor ( OJManager )
public class OJManagerInspector extends Editor {
	private static var currentSequence : int;
	private static var currentKeyframe : int;
	
	override function OnInspectorGUI () {
		var manager : OJManager = target as OJManager;
	
		if ( manager.sequences.Count < 1 ) {
			manager.sequences.Add ( new OJSequence () );
		}

		EditorGUILayout.BeginHorizontal ();

		// Pick sequence
		var sequenceNames : List.< String > = new List.< String > ();

		for ( var s : OJSequence in manager.sequences ) {
			sequenceNames.Add ( s.name );
		}

		currentSequence = EditorGUILayout.Popup ( currentSequence, sequenceNames.ToArray() );

		if ( currentSequence >= manager.sequences.Count ) {
			currentSequence = manager.sequences.Count - 1;

		}

		// Remove sequence
		GUI.backgroundColor = Color.red;
		if ( GUILayout.Button ( "-", GUILayout.Width ( 24 ), GUILayout.Height ( 16 ) ) ) {
			manager.sequences.RemoveAt ( currentSequence );
			return;
		}

		// Add sequence
		GUI.backgroundColor = Color.green;
		if ( GUILayout.Button ( "+", GUILayout.Width ( 24 ), GUILayout.Height ( 16 ) ) ) {
			manager.sequences.Add ( new OJSequence () );
			currentSequence = manager.sequences.Count - 1;
			return;
		}
		
		GUI.backgroundColor = Color.white;
		
		// Sort sequences
		if ( GUILayout.Button ( "Sort" ) ) {
			manager.SortSequences ();
		}
		
		EditorGUILayout.EndHorizontal ();

		EditorGUILayout.Space ();
		var seq : OJSequence = manager.sequences [ currentSequence ];
		
		// Sequence properties
		seq.name = EditorGUILayout.TextField ( "Name", seq.name );

		EditorGUILayout.Space ();
	
		EditorGUILayout.BeginHorizontal ();
		
		if ( GUILayout.Button ( "PLAY" ) ) {
			manager.Play ( currentSequence );
		}
		
		if ( GUILayout.Button ( "PAUSE" ) ) {
			manager.Stop ();
		}
		
		if ( GUILayout.Button ( "RESET" ) ) {
			manager.Reset ();
		}

		EditorGUILayout.EndHorizontal ();
		
		EditorGUILayout.Space ();

		// Pick keyframe
		EditorGUILayout.LabelField ( "Keyframe: " + manager.currentKeyframe + " / " + ( seq.keyframes.Count - 1 ), EditorStyles.boldLabel );
		
		GUILayout.Space ( 30 );
		
		EditorGUILayout.BeginHorizontal ();
		
		if ( seq.keyframes.Count < 1 ) {
			seq.keyframes.Add ( new OJKeyframe () );
		}

		if ( currentKeyframe >= seq.keyframes.Count ) {
			currentKeyframe = seq.keyframes.Count - 1;
		}

		for ( var i : int = 0; i < seq.keyframes.Count; i++ ) {
			if ( i == currentKeyframe ) {
				GUI.backgroundColor = Color.white;
			} else {
				GUI.backgroundColor = Color.grey;
			}

			if ( GUILayout.Button ( i.ToString(), GUILayout.Width ( 24 ), GUILayout.Height ( 16 ) ) ) {
				currentKeyframe = i;
			}
			
			if ( i == currentKeyframe ) {
				var rect : Rect = GUILayoutUtility.GetLastRect ();
				var bRect : Rect = rect;

				bRect.y = rect.y - 24;

				GUI.backgroundColor = Color.red;
				if ( GUI.Button ( bRect, "-" ) ) {
					seq.keyframes.RemoveAt ( i );
					return;
				}
				GUI.backgroundColor = Color.white;

				if ( i > 0 ) {
					bRect.x = rect.x - 20;
					bRect.width = 16;

					if ( GUI.Button ( bRect, "<" ) ) {
						var a : OJKeyframe = seq.keyframes [ i - 1 ];
						var b : OJKeyframe = seq.keyframes [ i ];

						seq.keyframes [ i - 1 ] = b;
						seq.keyframes [ i ] = a;

						currentKeyframe--;
						return;
					}
				}
				
				if ( i < seq.keyframes.Count - 1 ) {
					bRect.x = rect.xMax + 4;
					bRect.width = 16;

					if ( GUI.Button ( bRect, ">" ) ) {
						a = seq.keyframes [ i + 1 ];
						b = seq.keyframes [ i ];

						seq.keyframes [ i + 1 ] = b;
						seq.keyframes [ i ] = a;

						currentKeyframe++;
						return;
					}
				}
			}

			GUI.backgroundColor = Color.white;
		}
		
		GUI.backgroundColor = Color.green;
		if ( GUILayout.Button ( "+", GUILayout.Width ( 24 ), GUILayout.Height ( 16 ) ) ) {
			seq.keyframes.Add ( new OJKeyframe () );
		}

		GUI.backgroundColor = Color.white;
		
		EditorGUILayout.EndHorizontal ();

		EditorGUILayout.Space ();

		var kf : OJKeyframe = seq.keyframes [ currentKeyframe ];
		
		// Transform
		EditorGUILayout.BeginHorizontal ();
		EditorGUILayout.LabelField ( "Transform", EditorStyles.boldLabel );

		if ( GUILayout.Button ( "Copy from scene" ) ) {
			kf.position = manager.transform.position;
			kf.rotation = manager.transform.localEulerAngles;
		}
		EditorGUILayout.EndHorizontal ();
		
		kf.position = EditorGUILayout.Vector3Field ( "Position", kf.position );
		kf.rotation = EditorGUILayout.Vector3Field ( "Rotation", kf.rotation );

		EditorGUILayout.Space ();
		
		EditorGUILayout.LabelField ( "Properties", EditorStyles.boldLabel );
		kf.fov = EditorGUILayout.IntField ( "FOV", kf.fov );
		kf.color = EditorGUILayout.ColorField ( "Color", kf.color );
		kf.wait = EditorGUILayout.FloatField ( "Wait", kf.wait );
		kf.stop = EditorGUILayout.Toggle ( "Stop", kf.stop );
		
		EditorGUILayout.Space ();
		
		EditorGUILayout.LabelField ( "Next tween", EditorStyles.boldLabel );
		kf.time = EditorGUILayout.FloatField ( "Time", kf.time );
		kf.easing = EditorGUILayout.Popup ( "Easing", kf.easing, System.Enum.GetNames ( Ease ) );

	}
}
