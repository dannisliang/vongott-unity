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
		var spd : float;
		
		var object : GameObject = EditorCore.GetSelectedObject();
		var mousePos : Vector3 = Input.mousePosition;
		var point : Vector3 = Camera.main.WorldToScreenPoint ( object.transform.position );
		
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
			point.x = mousePos.x;
			point.y = mousePos.y;
			
			point = Camera.main.ScreenToWorldPoint ( point );
			
			if ( EditorCore.snapEnabled ) {
				point.x = Round ( point.x, EditorCore.gridLineDistance );
				point.y = Round ( point.y, EditorCore.gridLineDistance );
				point.z = Round ( point.z, EditorCore.gridLineDistance );
			}
			
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
			spd = 10;
			
			if ( Input.GetKey ( KeyCode.LeftShift ) ) {
				spd = spd / 20;
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
			
			var rotate : Vector3 = new Vector3 (
				o.transform.localEulerAngles.x + ( x * 2 ),
				o.transform.localEulerAngles.y + ( y * 2 ),
				o.transform.localEulerAngles.z + ( z * 2 )
			);
			
			var scale : Vector3 = new Vector3 (
				o.transform.localScale.x + x,
				o.transform.localScale.y + y,
				o.transform.localScale.z + z
			);
			
			if ( scale.x < 0.1 || scale.y < 0.1 || scale.z < 0.1 ) {
				return;
			}
			
			if ( EditorCore.snapEnabled ) {
				if ( EditorCore.gridLineDistance > 0 ) {
					rotate.x = Round ( rotate.x, EditorCore.gridLineDistance / 8 );
					scale.x = Round ( scale.x, EditorCore.gridLineDistance / 8 );
				
					rotate.y = Round ( rotate.y, EditorCore.gridLineDistance / 8 );
					scale.y = Round ( scale.y, EditorCore.gridLineDistance / 8 );
				
					rotate.z = Round ( rotate.z, EditorCore.gridLineDistance / 8 );
					scale.z = Round ( scale.z, EditorCore.gridLineDistance / 8 );
				}
			}		
			
			if ( EditorCore.rotateMode ) {
				o.transform.localRotation = Quaternion.Euler ( rotate );
				EditorCore.gizmo.transform.localEulerAngles = Vector3.zero;
				EditorCore.FitSelectionBox ();
	
			} else if ( EditorCore.scaleMode ) {
				o.transform.localScale = scale;
				EditorCore.FitSelectionBox ();
				
				// Fit texture
				if ( o.GetComponent(Prefab) ) {
					o.GetComponent(Prefab).FitTexture();
				}
			
			}
		}
	
	
	// pick mode
	} else if ( EditorCore.pickMode ) {
		// esc key: cancel
		if ( Input.GetKey ( KeyCode.Escape ) ) {
			EditorCore.SetPickMode ( false );
			EditorCore.ReselectObject ();
		
		} else if ( Input.GetMouseButtonDown ( 0 ) ) {
			var mouseHit : RaycastHit;
			var mouseGoal : GameObject;
			
			if ( Physics.Raycast ( Camera.main.ScreenPointToRay ( Input.mousePosition ), mouseHit ) ) {
				mouseGoal = mouseHit.collider.gameObject;
			}
			
			if ( mouseGoal != null ) {				
				if ( EditorCore.pickerType && !mouseGoal.collider.gameObject.GetComponent(EditorCore.pickerType) ) { return; }
			
				var obj : GameObject = EditorCore.GetSelectedObject();
				
				if ( obj != null ) {
					// Return triangles
					if ( obj.GetComponent ( CombinedMesh ) ) {
						//EditorCore.SelectTriangle ( obj, mouseHit.triangleIndex );
						EditorCore.pickerCallback ( mouseHit.triangleIndex );
						
						if ( !Input.GetKey ( KeyCode.LeftShift ) ) {
							EditorCore.pickerCallback = null;
							
							EditorCore.SetPickMode ( false );
							EditorCore.ReselectObject ();
						}
					
						return;				
				
					// Return name and GUID
					} else if ( obj.GetComponent(Keypad) || obj.GetComponent(SurveillanceCamera) || obj.GetComponent(Terminal) && EditorCore.pickerCallback != null ) {
						EditorCore.pickerCallback ( mouseGoal.name, mouseGoal.GetComponent(GUID).GUID );
						EditorCore.pickerCallback = null;
						
						EditorCore.SetPickMode ( false );
						EditorCore.ReselectObject ();
					
						return;
					
					// Return material
					} else if ( obj.GetComponent(Prefab) || obj.GetComponent(Surface) ) {
						var materialPath : String = "";
						
						if ( mouseGoal.GetComponent(Prefab) ) {
							materialPath = mouseGoal.GetComponent(Prefab).materialPath;
																			
						} else if ( mouseGoal.GetComponent(Surface) ) {
							materialPath = mouseGoal.GetComponent(Surface).materialPath;
						
						}
						
						if ( materialPath != "" ) {
							if ( EditorCore.GetSelectedObject().GetComponent(Prefab) ) {
								EditorCore.GetSelectedObject().GetComponent(Prefab).materialPath = materialPath;
								EditorCore.GetSelectedObject().GetComponent(Prefab).ReloadMaterial();
								EditorCore.SetPickMode ( false );
								EditorCore.ReselectObject ();
							
							} else if ( EditorCore.GetSelectedObject().GetComponent(Surface) ) {
								EditorCore.GetSelectedObject().GetComponent(Surface).materialPath = materialPath;
								EditorCore.GetSelectedObject().GetComponent(Surface).ReloadMaterial();
								EditorCore.SetPickMode ( false );
								EditorCore.ReselectObject ();
							
							} else {
								EditorCore.SetPickMode ( false );
								EditorCore.ReselectObject ();
							
							}
						
						}
					
						return;
					}
				}
												
				// Return hit
				if ( EditorCore.pickerCallback != null ) {
					EditorCore.pickerCallback ( mouseHit );
					EditorCore.pickerCallback = null;
					
					EditorCore.SetPickMode ( false );
					EditorCore.ReselectObject ();
				
				}
						
			
			}
		
		}
	
	// first person mode
	} else if ( EditorCore.firstPersonMode ) {
		// Escape key: first person mode off
		if ( Input.GetKeyDown ( KeyCode.P ) || Input.GetKeyDown ( KeyCode.Escape ) ) {
			EditorCore.SetFirstPersonMode( false );
		}
	
		var speed : float = 3;
	
		if ( Input.GetKey ( KeyCode.LeftShift ) ) {
			speed = 8;
		}
	
		if ( Input.GetKey ( KeyCode.W ) ) {
			Camera.main.GetComponent(EditorCamera).MoveFixPoint ( Camera.main.GetComponent(EditorCamera).transform.forward * speed );
		}
		
		if ( Input.GetKey ( KeyCode.S ) ) {
			Camera.main.GetComponent(EditorCamera).MoveFixPoint ( -Camera.main.GetComponent(EditorCamera).transform.forward * speed );
		}
		
		if ( Input.GetKey ( KeyCode.A ) ) {
			Camera.main.GetComponent(EditorCamera).MoveFixPoint ( -Camera.main.GetComponent(EditorCamera).transform.right * speed );
		}
		
		if ( Input.GetKey ( KeyCode.D ) ) {
			Camera.main.GetComponent(EditorCamera).MoveFixPoint ( Camera.main.GetComponent(EditorCamera).transform.right * speed );
		}
		
		if ( Input.GetKeyDown ( KeyCode.F ) ) {
			EditorCore.ToggleFirstPersonGhost();
		}
		
		if ( EditorCore.GetFirstPersonGhost() ) {
			if ( Input.GetKey ( KeyCode.Space ) ) {
				Camera.main.GetComponent(EditorCamera).MoveFixPoint ( Vector3.up * speed );
			}
			
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				Camera.main.GetComponent(EditorCamera).MoveFixPoint ( -Vector3.up * speed );
			}
		} else {
			if ( Input.GetKeyDown ( KeyCode.Space ) ) {
				Camera.main.GetComponent(EditorCamera).cursor.GetComponent(Rigidbody).velocity.y = 4;
			}
		}
		
		
	
				
	// camera mode
	} else if ( OGRoot.currentPage.pageName == "MenuBase" ) {	
		// Z key
		if ( Input.GetKeyDown ( KeyCode.Z ) ) {
			// Undo
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				EditorCore.UndoCurrentAction ();
		
			} else {
			// Wireframe toggle
				EditorCore.ToggleWireframe();
		
			}
			
		// N key
		} else if ( Input.GetKeyDown ( KeyCode.N ) ) {
			EditorCore.UpdateWayPoints ();
		
		// G key: grab mode
		} else if ( Input.GetKeyDown ( KeyCode.G ) ) {
			EditorCore.SetGrabMode( true );

		// P key: first person mode
		} else if ( Input.GetKeyDown ( KeyCode.P ) ) {
			EditorCore.SetFirstPersonMode( true );

		// S key
		} else if ( Input.GetKeyDown ( KeyCode.S ) ) {
			// Save level
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				if ( EditorCore.currentLevel.name == "<Untitled Level>" ) {
					return;
				} else {
					EditorCore.GetInstance().SaveFile ( EditorCore.currentLevel.name );
					return;
				}
			
			// Scale mode	
			} else if ( EditorCore.GetSelectedObject() && !EditorCore.GetSelectedObject().GetComponent(Surface) ) {
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
				Camera.main.GetComponent ( EditorCamera ).cursor.position = EditorCore.GetSelectedObject().transform.renderer.bounds.center;
				Camera.main.GetComponent ( EditorCamera ).FocusOn ( EditorCore.GetSelectedObject().transform.renderer.bounds.center );
			} else {
				Camera.main.GetComponent ( EditorCamera ).cursor.position = Vector3.zero;
				Camera.main.GetComponent ( EditorCamera ).FocusOn ( Vector3.zero );
			}
		
		// numpad 5: orthographic view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad5 ) ) {
			EditorCore.ToggleIsometric();
		
		// numpad 7: top/bottom view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad7 ) ) {			
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				Camera.main.GetComponent ( EditorCamera ).GoToBottomOf ( Camera.main.GetComponent(EditorCamera).cursor.position );
			} else {
				Camera.main.GetComponent ( EditorCamera ).GoToTopOf ( Camera.main.GetComponent(EditorCamera).cursor.position );
			}
		
		// numpad 3: right/left view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad3 ) ) {			
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				Camera.main.GetComponent ( EditorCamera ).GoToLeftOf ( Camera.main.GetComponent(EditorCamera).cursor.position );
			} else {
				Camera.main.GetComponent ( EditorCamera ).GoToRightOf ( Camera.main.GetComponent(EditorCamera).cursor.position );
			}
			
		// numpad 1: front/back view
		} else if ( Input.GetKeyDown ( KeyCode.Keypad1 ) ) {			
			if ( Input.GetKey ( KeyCode.LeftControl ) ) {
				Camera.main.GetComponent ( EditorCamera ).GoToBackOf ( Camera.main.GetComponent(EditorCamera).cursor.position );
			} else {
				Camera.main.GetComponent ( EditorCamera ).GoToFrontOf ( Camera.main.GetComponent(EditorCamera).cursor.position );
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