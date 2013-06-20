#pragma strict

////////////////////
// Prerequisites
////////////////////
static var grabDistance : float;
static var grabOrigPoint : Vector3;

////////////////////
// Static functions
////////////////////
// Round value
function Round ( val : float, factor : float ) : float {
	return Mathf.Round ( val / factor ) * factor;
}

// Update
function Update () {
	// transform modes
	if ( EditorCore.grabMode || EditorCore.scaleMode || EditorCore.rotateMode ) {
		var ray : Ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
		var point : Vector3 = ray.origin + ( ray.direction * grabDistance );
		var object : GameObject = EditorCore.GetSelectedObject();
		
		// esc key: undo
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			EditorCore.SetGrabMode ( false );
			EditorCore.SetRotateMode ( false );
			EditorCore.SetScaleMode ( false );
			EditorCore.SetRestriction ( null );
			EditorCore.UndoCurrentAction ();
		
		// mouse click: apply
		} else if ( Input.GetMouseButtonDown(0) ) {
			EditorCore.SetGrabMode ( false );
			EditorCore.SetRotateMode ( false );
			EditorCore.SetScaleMode ( false );
			
			if ( EditorCore.snapEnabled ) {
				EditorCore.GetSelectedObject().transform.localPosition.x = Round ( EditorCore.GetSelectedObject().transform.localPosition.x, EditorCore.gridLineDistance );
				EditorCore.GetSelectedObject().transform.localPosition.y = Round ( EditorCore.GetSelectedObject().transform.localPosition.y, EditorCore.gridLineDistance );
				EditorCore.GetSelectedObject().transform.localPosition.z = Round ( EditorCore.GetSelectedObject().transform.localPosition.z, EditorCore.gridLineDistance );
			}
			
			EditorCore.ReselectObject();
		
		// X key: x axis
		} else if ( Input.GetKeyDown ( KeyCode.X ) ) {
			if ( EditorCore.grabRestrict == "x" ) {
				EditorCore.SetRestriction ( null );
			
			} else {
				EditorCore.SetRestriction ( "x" );
			
			}
			
		// Y key: y axis
		} else if ( Input.GetKeyDown ( KeyCode.Y ) ) {
			if ( EditorCore.grabRestrict == "y" ) {
				EditorCore.SetRestriction ( null );
			
			} else {
				EditorCore.SetRestriction ( "y" );
			
			}
			
		// Z key: z axis
		} else if ( Input.GetKeyDown ( KeyCode.Z ) ) {
			if ( EditorCore.grabRestrict == "z" ) {
				EditorCore.SetRestriction ( null );
			
			} else {
				EditorCore.SetRestriction ( "z" );
			
			}
	
		}

		// translate
		if ( EditorCore.grabMode ) {
			if ( EditorCore.grabRestrict == "x" ) {
				object.transform.position = new Vector3 ( point.x, grabOrigPoint.y, grabOrigPoint.z );
			
			} else if ( EditorCore.grabRestrict == "y" ) {
				object.transform.position = new Vector3 ( grabOrigPoint.x, point.y, grabOrigPoint.z );
			
			} else if ( EditorCore.grabRestrict == "z" ) {
				object.transform.position = new Vector3 ( grabOrigPoint.x, grabOrigPoint.y, point.z );
			
			} else {
				EditorCore.GetSelectedObject().transform.position = point;
			
			}													
		
		// scale & rotate
		} else if ( EditorCore.rotateMode || EditorCore.scaleMode ) {		
			// position
			var x = transform.localPosition.x;
			var y = transform.localPosition.y;
			var z = transform.localPosition.z;
			var forward = Camera.main.transform.TransformDirection ( Vector3.forward );
			var horizontal = Camera.main.transform.TransformDirection ( Vector3.left );
			var vertical = Camera.main.transform.TransformDirection ( Vector3.down );
			
			// scroll wheel
			var translation = Input.GetAxis("Mouse ScrollWheel");
			var spd : float = 10;
			
			if ( Input.GetKey ( KeyCode.LeftShift ) ) {
				spd = spd / 16;
			} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				spd = spd * 4;
			} 
			
			if ( EditorCore.grabRestrict == "y" ) {
				x = 0;
				y = translation * spd;
				z = 0;
			} else if ( EditorCore.grabRestrict == "x" ) {
				x = translation * spd;
				y = 0;
				z = 0;
			} else if ( EditorCore.grabRestrict == "z" ) {
				x = 0;
				y = 0;
				z = translation * spd;
			} else if ( EditorCore.scaleMode && EditorCore.grabRestrict == null ) {
				x = translation * ( spd / 2 );
				y = translation * ( spd / 2 );
				z = translation * ( spd / 2 );
			} else {
				x = 0;
				y = 0;
				z = 0;
			}
			
			var o : GameObject = EditorCore.selectedObject;
			
			var xRotate : float = o.transform.localEulerAngles.x + ( x * 2 );
			var yRotate : float = o.transform.localEulerAngles.y + ( y * 2 );
			var zRotate : float = o.transform.localEulerAngles.z + ( z * 2 );
			
			var xScale : float = o.transform.localScale.x + x;
			var yScale : float = o.transform.localScale.y + y;
			var zScale : float = o.transform.localScale.z + z;
			
			if ( EditorCore.snapEnabled ) {
				if ( EditorCore.gridLineDistance > 0 ) {
					xRotate = Round ( xRotate, EditorCore.gridLineDistance );
					xScale = Round ( xScale, EditorCore.gridLineDistance );
				
					yRotate = Round ( yRotate, EditorCore.gridLineDistance );
					yScale = Round ( yScale, EditorCore.gridLineDistance );
				
					zRotate = Round ( zRotate, EditorCore.gridLineDistance );
					zScale = Round ( zScale, EditorCore.gridLineDistance );
				}
			}		
			
			if ( EditorCore.rotateMode ) {
				o.transform.localEulerAngles = new Vector3 ( xRotate, yRotate, zRotate );
			} else if ( EditorCore.scaleMode ) {
				o.transform.localScale = new Vector3 ( xScale, yScale, zScale );
			}
		}
	
	
	// camera mode
	} else if ( OGRoot.currentPage.pageName == "MenuBase" ) {	
		// tab key: toggle menu
		if ( Input.GetKeyDown ( KeyCode.Tab ) ) {
			EditorCore.menusActive = !EditorCore.menusActive;
		
		// Z key: wireframe toggle
		} else if ( Input.GetKeyDown ( KeyCode.Z ) ) {
			EditorCore.ToggleWireframe();
		
		// G key: grab mode
		} else if ( Input.GetKeyDown ( KeyCode.G ) ) {
			grabDistance = Vector3.Distance ( Camera.main.transform.position, EditorCore.GetSelectedObject().transform.position );
			grabOrigPoint = EditorCore.GetSelectedObject().transform.position;
			EditorCore.SetGrabMode( true );
		
		// S key: scale mode
		} else if ( Input.GetKeyDown ( KeyCode.S ) ) {
			EditorCore.SetScaleMode( true );
			
		// R key: rotate mode
		} else if ( Input.GetKeyDown ( KeyCode.R ) ) {
			EditorCore.SetRotateMode( true );
		
		// delete key: delete item
		} else if ( Input.GetKeyDown ( KeyCode.Delete ) ) {
			EditorCore.DeleteSelected();
		
		// D key: duplicate object
		} else if ( Input.GetKeyDown ( KeyCode.D ) ) {
			EditorCore.DuplicateObject();
		
		// numpad period: zoom to object
		} else if ( Input.GetKeyDown ( KeyCode.KeypadPeriod) ) {
			if ( EditorCore.GetSelectedObject() ) {
				//Camera.main.GetComponent ( EditorCamera ).TweenMoveTo ( EditorCore.GetSelectedObject().transform.localPosition );
			}
		
		// numpad 5: orthographic view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad5 ) ) {
			EditorCore.ToggleIsometric();
		
		// numpad 7: top view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad7 ) ) {
			Camera.main.GetComponent ( EditorCamera ).TweenTurn ( new Vector3 ( 90.0, 0.0, 0.0 ) );
			
			if ( EditorCore.GetSelectedObject() ) {
				Camera.main.GetComponent ( EditorCamera ).TweenMoveToTop ( EditorCore.GetSelectedObject().transform.localPosition );
			}
		
		// numpad 1: left view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad1 ) ) {
			Camera.main.GetComponent ( EditorCamera ).TweenTurn ( new Vector3 ( 0.0, 90.0, 0.0 ) );
		
			if ( EditorCore.GetSelectedObject() ) {
				Camera.main.GetComponent ( EditorCamera ).TweenMoveToLeft ( EditorCore.GetSelectedObject().transform.localPosition );
			}
		
		// numpad 3: front
		} else if ( Input.GetKeyDown ( KeyCode.Keypad3 ) ) {
			Camera.main.GetComponent ( EditorCamera ).TweenTurn ( new Vector3 ( 0.0, 0.0, 0.0 ) );
		
			if ( EditorCore.GetSelectedObject() ) {
				Camera.main.GetComponent ( EditorCamera ).TweenMoveToFront ( EditorCore.GetSelectedObject().transform.localPosition );
			}
		
		// ALT modifier
		} else if ( Input.GetKeyDown ( KeyCode.LeftAlt ) ) {
			if ( EditorCore.GetSelectedObject() ) {
				//Camera.main.GetComponent ( EditorCamera ).TweenTurnTo ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			}
				
		// CTRL modifier
		} else if ( Input.GetKey ( KeyCode.LeftControl ) ) {
			
			// S key: save level
			if ( Input.GetKeyDown ( KeyCode.S ) ) {
				if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
					return;
				} else {
					EditorCore.SaveFile ( EditorCore.currentLevel.name );
					return;
				}
			
			// Z key: undo
			} else if ( Input.GetKeyDown ( KeyCode.Z ) ) {
				EditorCore.UndoCurrentAction ();
			
			}
		
		// left mouse button
		} else if ( Input.GetMouseButtonDown(0) && !OGRoot.mouseOver && OGRoot.currentPage.pageName == "MenuBase" ) {
			var newRay : Ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
			var hit : RaycastHit;
			
			if ( Physics.Raycast ( newRay, hit ) ) {
				var obj : GameObject = hit.collider.gameObject;
				
				EditorCore.SelectObject ( obj );						
			
			} else if ( EditorCore.GetSelectedObject() ) {
				EditorCore.DeselectObject ();
			
			}
		}
	}
}