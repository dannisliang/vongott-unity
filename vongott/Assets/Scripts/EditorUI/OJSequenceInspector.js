#pragma strict

public class OJSequenceInspector extends OEComponentInspector {
	override function get type () : System.Type { return typeof ( OJSequence ); }
	
	private function DrawHandles ( sequence : OJSequence, kf : OJKeyframe ) {
		if ( kf.curve.before != Vector3.zero ) {
			GL.Vertex ( sequence.transform.position + kf.position );
		       	GL.Vertex ( sequence.transform.position + kf.position + kf.curve.before );
		}
		
		if ( kf.curve.after != Vector3.zero ) {
			GL.Vertex ( sequence.transform.position + kf.position );
		       	GL.Vertex ( sequence.transform.position + kf.position + kf.curve.after );
		}
	}

	public function DrawPath ( sequence : OJSequence ) {
		if ( sequence.keyframes.Count > 1 ) {
			for ( var k : int = 1; k < sequence.keyframes.Count; k++ ) {
				GL.Color ( new Color ( 1, 1, 1, 0.5 ) );

				var kf1 : OJKeyframe = sequence.keyframes [ k - 1 ];
				var kf2 : OJKeyframe = sequence.keyframes [ k ];

				for ( var t : float = 0.05; t <= 1.05; t += 0.05 ) {
					var p1 : Vector3 = OJSequence.CalculateBezierPoint ( t - 0.05, sequence.transform.position + kf1.position, sequence.transform.position + kf1.position + kf1.curve.after, sequence.transform.position + kf2.position + kf2.curve.before, sequence.transform.position + kf2.position );
					var p2 : Vector3 = OJSequence.CalculateBezierPoint ( t, sequence.transform.position + kf1.position, sequence.transform.position + kf1.position + kf1.curve.after, sequence.transform.position + kf2.position + kf2.curve.before, sequence.transform.position + kf2.position );
					
					GL.Vertex ( p1 );
				       	GL.Vertex ( p2 );
				}
			}
		
			var kf : OJKeyframe = sequence.keyframes [ OJSequenceEditor.currentKeyframe ];
			
			GL.Color ( new Color ( 0, 1, 1, 0.5 ) );
			DrawHandles ( sequence, kf );
		
			var before : Vector3 = kf.curve.before;
			//kf.curve.before = Handles.PositionHandle ( sequence.transform.position + kf.position + kf.curve.before, Quaternion.Euler ( Vector3.zero ) ) - kf.position - sequence.transform.position;
			
			var after : Vector3 = kf.curve.after;
			//kf.curve.after = Handles.PositionHandle ( sequence.transform.position + kf.position + kf.curve.after, Quaternion.Euler ( Vector3.zero ) ) - kf.position - sequence.transform.position;
		
			if ( kf.curve.symmetrical ) {	
				if ( before != kf.curve.before ) {
					kf.MirrorCurveAfter ();
				
				} else if ( after != kf.curve.after ) {
					kf.MirrorCurveBefore ();
				
				}
			}
		}
		
	}

	override function DrawGL () {
		var sequence : OJSequence = target.GetComponent.< OJSequence >();
		
		GL.Begin ( GL.LINES );
		
		OEWorkspace.GetInstance().cam.materials.highlight.SetPass ( 0 );

		DrawPath ( sequence );
		
		var pos : Vector3 = sequence.cam.transform.position;	
		var t : Transform = Camera.main.transform;

		GL.Color ( new Color ( 0.4, 1.0, 0.4 ) );

		GL.Vertex ( pos - t.right / 6 + t.up / 6 );
		GL.Vertex ( pos + t.right / 6 + t.up / 6 );
		GL.Vertex ( pos + t.right / 6 + t.up / 6 );
		GL.Vertex ( pos - t.up / 6 );
		GL.Vertex ( pos - t.up / 6 );
		GL.Vertex ( pos - t.right / 6 + t.up / 6 );

		GL.End ();
	}	

	override function Inspector () {
		var sequence : OJSequence = target.GetComponent.< OJSequence >();
		var editorOpen : boolean = false;

		for ( var i : int = 0; i < OGRoot.GetInstance().currentPages.Length; i++ ) {
			if ( OGRoot.GetInstance().currentPages [ i ].pageName == "SequenceEditor" ) {
				editorOpen = true;
			}
		}

		if ( !editorOpen ) {
			OJSequenceEditor.sequence = sequence;
			
			var page : OGPage;

			for ( var p : OGPage in OGRoot.GetInstance().transform.GetComponentsInChildren.< OGPage > ( true ) ) {
				if ( p.pageName == "SequenceEditor" ) {
					page = p;
					break;
				}	
			}
		
			if ( page ) {	
				OGRoot.GetInstance().AddToCurrentPages ( page );
				page.gameObject.SetActive ( true );
				page.StartPage ();
				page.UpdateStyles ();
			
			} else {
				Debug.Log ( "Couldn't find page 'SequenceEditor'!" );

			}
		
		} else if ( !sequence.playing && sequence.keyframes.Count > 0 && OJSequenceEditor.currentKeyframe < sequence.keyframes.Count ) {
			var kf : OJKeyframe = sequence.keyframes [ OJSequenceEditor.currentKeyframe ];
			kf.stop = Toggle ( "Stop", kf.stop );
			kf.time = Slider ( "Time", kf.time, 0, sequence.length );
			
			Offset ( 0, 20 );
			
			// Event
			LabelField ( "Event" );
			kf.event.message = TextField ( "Message", kf.event.message );
			kf.event.argument = TextField ( "Argument", kf.event.argument );

			Offset ( 0, 20 );
			
			// Transform
			LabelField ( "Transform" );
			kf.position = Vector3Field ( "Position", kf.position );
			kf.rotation = Vector3Field ( "Rotation", kf.rotation );
			
			// Curve
			Offset ( 0, 20 );
			LabelField ( "Curve" );
			kf.curve.symmetrical = Toggle ( "Symmetrical", kf.curve.symmetrical );
			
			var before : Vector3 = kf.curve.before;
			kf.curve.before = Vector3Field ( "Before", kf.curve.before );
			
			var after : Vector3 = kf.curve.after;
			kf.curve.after = Vector3Field ( "After", kf.curve.after );
			
			if ( kf.curve.symmetrical ) {	
				if ( before != kf.curve.before ) {
					kf.MirrorCurveAfter ();
				
				} else if ( after != kf.curve.after ) {
					kf.MirrorCurveBefore ();
				
				}
			}

			Offset ( 0, 20 );
		
			// Properties	
			LabelField ( "Properties" );
			kf.fov = Slider ( "FOV", kf.fov, 1, 179 );
			kf.brightness = FloatField ( "Brightness", kf.brightness );
			
			// Actions
			Offset ( 0, 20 );

			if ( Button ( "Remove" ) ) {
				sequence.RemoveKeyframe ( OJSequenceEditor.currentKeyframe );
			}
		}
	}

}
