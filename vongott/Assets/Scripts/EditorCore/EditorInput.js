#pragma strict

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
		var point : Vector3 = ray.origin + ( ray.direction * EditorCore.grabDistance );
		var object : GameObject = EditorCore.GetSelectedObject();
		
		// esc key: undo
		if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			EditorCore.SetGrabMode ( false );
			EditorCore.SetRotateMode ( false );
			EditorCore.SetScaleMode ( false );
			EditorCore.SetRestriction ( null );
			EditorCore.UndoCurrentAction ();
		
			EditorCore.FitSelectionBox ();
		
		// mouse click: apply
		} else if ( Input.GetMouseButtonDown(0) ) {
			EditorCore.SetGrabMode ( false );
			EditorCore.SetRotateMode ( false );
			EditorCore.SetScaleMode ( false );
			
			if ( EditorCore.snapEnabled ) {
				EditorCore.GetSelectedObject().transform.localPosition.x = Round ( EditorCore.GetSelectedObject().transform.localPosition.x, EditorCore.gridLineDistance );
				EditorCore.GetSelectedObject().transform.localPosition.y = Round ( EditorCore.GetSelectedObject().transform.localPosition.y, EditorCore.gridLineDistance );
				EditorCore.GetSelectedObject().transform.localPosition.z = Round ( EditorCore.GetSelectedObject().transform.localPosition.z, EditorCore.gridLineDistance );
			
				EditorCore.FitSelectionBox();
			}

			if ( EditorCore.transformEnd ) {
				EditorCore.transformEnd ();
			}
			
			EditorCore.transformEnd = null;

		
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
				object.transform.position = new Vector3 ( point.x, EditorCore.grabOrigPoint.y, EditorCore.grabOrigPoint.z );
			
			} else if ( EditorCore.grabRestrict == "y" ) {
				object.transform.position = new Vector3 ( EditorCore.grabOrigPoint.x, point.y, EditorCore.grabOrigPoint.z );
			
			} else if ( EditorCore.grabRestrict == "z" ) {
				object.transform.position = new Vector3 ( EditorCore.grabOrigPoint.x, EditorCore.grabOrigPoint.y, point.z );
			
			} else if ( EditorCore.grabRestrict == "xz" ) {
				object.transform.position = new Vector3 ( point.x, EditorCore.grabOrigPoint.y, point.z );
						
			} else {
				object.transform.position = point;
			
			}
			
			EditorCore.FitSelectionBox ();
		
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
					xRotate = Round ( xRotate, EditorCore.gridLineDistance / 8 );
					xScale = Round ( xScale, EditorCore.gridLineDistance / 8 );
				
					yRotate = Round ( yRotate, EditorCore.gridLineDistance / 8 );
					yScale = Round ( yScale, EditorCore.gridLineDistance / 8 );
				
					zRotate = Round ( zRotate, EditorCore.gridLineDistance / 8 );
					zScale = Round ( zScale, EditorCore.gridLineDistance / 8 );
				}
			}		
			
			if ( EditorCore.rotateMode ) {
				o.transform.localEulerAngles = new Vector3 ( xRotate, yRotate, zRotate );
				EditorCore.FitSelectionBox ();
	
			} else if ( EditorCore.scaleMode ) {
				o.transform.localScale = new Vector3 ( xScale, yScale, zScale );
				EditorCore.FitSelectionBox ();
				
				// Fit texture
				if ( o.GetComponent(Prefab) && o.GetComponent(Prefab).path.Contains ( "Walls" ) ) {
					o.GetComponent(Prefab).FitTexture();
				}
			
			}
		}
	
	
	// camera mode
	} else if ( OGRoot.currentPage.pageName == "MenuBase" ) {	
		// Z key
		if ( Input.GetKeyDown ( KeyCode.Z ) ) {
			// ^ undo
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				EditorCore.UndoCurrentAction ();
		
			} else {
			// ^ wireframe toggle
				EditorCore.ToggleWireframe();
		
			}
		
		// G key: grab mode
		} else if ( Input.GetKeyDown ( KeyCode.G ) ) {
			EditorCore.SetGrabMode( true );

		// S key
		} else if ( Input.GetKeyDown ( KeyCode.S ) ) {
			// ^ save level
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
					return;
				} else {
					EditorCore.GetInstance().SaveFile ( EditorCore.currentLevel.name );
					return;
				}
				
			} else {
			// ^ scale mode	
				EditorCore.SetScaleMode( true );
			
			}
			
		// R key: rotate mode
		} else if ( Input.GetKeyDown ( KeyCode.R ) ) {
			EditorCore.SetRotateMode( true );
		
		// delete key: delete item
		} else if ( Input.GetKeyDown ( KeyCode.Delete ) ) {
			EditorCore.DeleteSelected();
		
		// D key: duplicate object
		} else if ( Input.GetKeyDown ( KeyCode.D ) ) {
			EditorCore.DuplicateObject();
			
		// numpad period: center object
		} else if ( Input.GetKeyDown ( KeyCode.KeypadPeriod) ) {
			if ( EditorCore.GetSelectedObject() ) {
				Camera.main.GetComponent ( EditorCamera ).FocusOn ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			} else {
				Camera.main.GetComponent ( EditorCamera ).FocusOn ( Vector3.zero );
			}
		
		// numpad 5: orthographic view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad5 ) ) {
			EditorCore.ToggleIsometric();
		
		// numpad 7: top/bottom view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad7 ) && EditorCore.GetSelectedObject() ) {
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				Camera.main.GetComponent ( EditorCamera ).GoToBottomOf ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			} else {
				Camera.main.GetComponent ( EditorCamera ).GoToTopOf ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			}
		
		// numpad 3: right/left view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad3 ) && EditorCore.GetSelectedObject() ) {
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				Camera.main.GetComponent ( EditorCamera ).GoToLeftOf ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			} else {
				Camera.main.GetComponent ( EditorCamera ).GoToRightOf ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			}
			
		// numpad 1: front/back view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad1 ) && EditorCore.GetSelectedObject() ) {
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				Camera.main.GetComponent ( EditorCamera ).GoToBackOf ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			} else {
				Camera.main.GetComponent ( EditorCamera ).GoToFrontOf ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			}
		
		// left mouse button
		} else if ( Input.GetMouseButtonDown(0) && !OGRoot.mouseOver && OGRoot.currentPage.pageName == "MenuBase" ) {
			var newRay : Ray = Camera.main.ScreenPointToRay ( Input.mousePosition );
			var hit : RaycastHit;
			var goal : GameObject;
			
			if ( Physics.Raycast ( newRay, hit ) ) {
				goal = hit.collider.gameObject;
			}
			
			if ( goal != null ) {
				EditorCore.SelectObject ( goal );
			
			} else if ( EditorCore.GetSelectedObject() ) {
				EditorCore.DeselectObject ();
			
			}
		}
	}
}