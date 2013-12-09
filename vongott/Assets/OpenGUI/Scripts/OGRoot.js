#pragma strict

import System.Collections.Generic;

@script ExecuteInEditMode();
class OGRoot extends MonoBehaviour {
	public static var instance : OGRoot;

	public var skin : OGSkin;
	public var currentPage : OGPage;

	@HideInInspector public var unicode : Dictionary.< int, int >[];
	@HideInInspector public var isMouseOver : boolean = false;

	private var dirty : boolean = false;
	private var widgets : OGWidget[];
	private var labels : OGLabel[];
	private var mouseOver : List.< OGWidget > = new List.< OGWidget > ();
	private var downWidget : OGWidget;
	
	public static function GetInstance () {
		return instance;
	}

	public function GetUnicode ( index : int ) : Dictionary.< int, int > {
		if ( unicode == null ) {
			ReloadFonts ();
		}

		return unicode[index];
	}

	public function ReloadFonts () {
		unicode = new Dictionary.< int, int > [ skin.fonts.Length ];
		
		for ( var i : int = 0; i < skin.fonts.Length; i++ ) {
			if ( unicode[i] == null ) {
				unicode[i] = new Dictionary.< int, int >();
				
				for ( var c : int = 0; c < skin.fonts[i].characterInfo.Length; c++ ) {
					if ( unicode[i].ContainsKey ( skin.fonts[i].characterInfo[c].index ) ) {
						unicode[i][skin.fonts[i].characterInfo[c].index] = c;
					} else {
						unicode[i].Add ( skin.fonts[i].characterInfo[c].index, c );
					}
				}
			}
		}
					
	}

	public function ResetStyles () {
		if ( !widgets ) { return; }
		
		for ( var w : OGWidget in this.transform.GetComponentsInChildren.<OGWidget>(true) ) {
			skin.GetDefaultStyles ( w );
		}	
	}

	public function GoToPage ( pageName : String ) {
		if ( currentPage != null ) {
			currentPage.ExitPage ();
			
			currentPage.gameObject.SetActive ( false );
		}
		
		for ( var p : OGPage in this.GetComponentsInChildren.<OGPage>(true) ) {
			if ( p.pageName == pageName ) {
				currentPage = p;
			}
		}
		
		if ( currentPage != null ) {
			currentPage.gameObject.SetActive ( true );
		
			currentPage.StartPage ();
		}

		SetDirty ();
	}

	public function OnPostRender () {
		if ( widgets != null && labels != null ) {
			GL.PushMatrix();
			GL.LoadPixelMatrix ();

			GL.Begin(GL.QUADS);
			skin.atlas.SetPass(0);
			
			for ( var w : OGWidget in widgets ) {
				if ( w == null || w.GetComponent ( OGLabel ) ) { continue; }
				
				if ( w.isDrawn ) {
					w.DrawGL ();
				}
			}
			
			GL.End ();
			
			for ( var f : int = 0; f < skin.fonts.Length; f++ ) {
				if ( skin.fonts[0] == null ) { continue; }
				
				GL.Begin(GL.QUADS);
				
				if ( skin.fontShader != null ) {
					skin.fonts[f].material.shader = skin.fontShader;
				}
				
				skin.fonts[f].material.SetPass(0);

				for ( var l : OGLabel in labels ) {
					if ( l != null && l.styles.basic != null && l.styles.basic.text.fontIndex == f && l.isDrawn ) {
						l.DrawGL ();
					}
				}
				
				GL.End ();
			}
			
			GL.PopMatrix();
		}
	}
	
	public function ReleaseWidget () {
		downWidget = null;
	}

	public function SetDirty () {
		dirty = true;
	}

	public function Start () {
		if ( currentPage != null && Application.isPlaying ) {
			currentPage.StartPage ();
		}

		UpdateWidgets ();
	}

	public function Update () {
		if ( instance == null ) {
			instance = this;
		}

		// Only update these when playing
		if ( Application.isPlaying && currentPage != null ) {
			// Current page
			currentPage.UpdatePage ();

			// Mouse interaction
			UpdateMouse ();	
		}

		// Update all widgets
		if ( dirty ) {
			UpdateWidgets ();
			dirty = false;
		}
	}

	public function UpdateMouse () {
		// Check all widgets
		mouseOver.Clear ();

		for ( var w : OGWidget in widgets ) {
			if ( w.isDrawn && w.CheckMouseOver() ) {
				mouseOver.Add ( w );
			}
		}

		// Is mouse over anything?
		isMouseOver = mouseOver.Count > 0;

		// Update active widget
		if ( downWidget ) {
			downWidget.UpdateWidget ();
		}

		// Click
		if ( Input.GetMouseButtonDown ( 0 ) ) {
			var topWidget : OGWidget;
			
			for ( var mw : OGWidget in mouseOver ) {
				if ( topWidget == null || mw.transform.position.z < topWidget.transform.position.z ) {
					topWidget = mw;
				}
			}
			
			if ( downWidget && downWidget != topWidget ) {
				downWidget.OnMouseCancel ();
			}
			
			if ( topWidget != null ) {
				topWidget.OnMouseDown ();
				downWidget = topWidget;
			}

		// Release
		} else if ( Input.GetMouseButtonUp ( 0 ) ) {
			if ( downWidget ) {
				if ( downWidget.CheckMouseOver() ) {
					downWidget.OnMouseUp ();

				} else {
					downWidget.OnMouseCancel ();
				
				}
			
			}
		
		// Dragging
		} else if ( Input.GetMouseButton ( 0 ) ) {
			if ( downWidget ) {
				downWidget.OnMouseDrag ();
			}
		
		// Escape key
		} else if ( Input.GetKeyDown ( KeyCode.Escape ) ) {
			if ( downWidget ) {
				downWidget.OnMouseCancel ();
			}
		}
	}	

	public function UpdateWidgets () {
		if ( currentPage == null ) { return; }
		
		// Index font unicode
		if ( unicode == null || unicode.Length != skin.fonts.Length ) {
			ReloadFonts ();
		}
	
		// Update widget lists	
		widgets = currentPage.gameObject.GetComponentsInChildren.<OGWidget>();
		labels = currentPage.gameObject.GetComponentsInChildren.<OGLabel>();
		
		for ( var w : OGWidget in widgets ) {
			if ( w == null || !w.isDrawn ) { continue; }
			
			if ( w.transform.localPosition.z < 0 ) {
				w.transform.localPosition = new Vector3 ( w.transform.localPosition.x, w.transform.localPosition.y, 0 );
			}
			
			w.root = this;			
			w.Recalculate ();
			w.UpdateWidget ();
		}
		
	}
}
