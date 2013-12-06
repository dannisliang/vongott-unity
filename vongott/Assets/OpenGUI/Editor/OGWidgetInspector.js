#pragma strict

import System.Collections.Generic;

@CustomEditor ( OGWidget, true )
public class OGWidgetInspector extends Editor {
	public static var debug : boolean = false;
	
	private function GetStyles ( widget : OGWidget ) : String[] {
		var tempList : List.< String > = new List.< String >();
		
		if ( widget && widget.GetRoot() ) {
			for ( var style : OGStyle in widget.GetRoot().skin.styles ) {
				tempList.Add ( style.name );
			}
		}
		
		return tempList.ToArray();
	}
	
	private function GetStyleIndex ( widget : OGWidget, style : OGStyle ) : int {
		if ( widget.GetRoot() && widget.GetRoot().skin ) {
			for ( var i : int = 0; i < widget.GetRoot().skin.styles.Length; i++ ) {
				if ( widget.GetRoot().skin.styles[i].name == style.name ) {
					return i;
				}
			}
		}
	
		return 0;
	}
	
	override function OnInspectorGUI () {		
		var widget : OGWidget = target as OGWidget;
				
		if ( !widget || !widget.GetRoot() ) { return; }
		
		// Check for hidden widgets
		if ( widget.hidden && !debug ) {
			GUI.backgroundColor = Color.red;
			if ( GUILayout.Button ( "Turn on debug mode" ) ) {
				debug = true;
			}
			GUI.backgroundColor = Color.white;
			
			EditorGUILayout.Space ();

			EditorGUILayout.LabelField ( "This widget is not supposed to be changed manually," );
			EditorGUILayout.LabelField ( "please refer to the root widget." );

		} else {
			if ( widget.hidden ) {
				GUI.backgroundColor = Color.green;
				if ( GUILayout.Button ( "Turn off debug mode" ) ) {
					debug = false;
				}
				GUI.backgroundColor = Color.white;

				EditorGUILayout.Space();
			}
		
			// Default inspector
			DrawDefaultInspector ();
			
			EditorGUILayout.Space();
			
			// Styles
			var wdStyleIndex : int = GetStyleIndex ( widget, widget.styles.basic );		
			EditorGUILayout.BeginHorizontal();
			EditorGUILayout.LabelField ( "Style" );
			wdStyleIndex = EditorGUILayout.Popup ( wdStyleIndex, GetStyles ( widget ) );
			EditorGUILayout.EndHorizontal ();
			widget.styles.basic = widget.GetRoot().skin.styles [ wdStyleIndex ];
		
			// OGButton
			if ( widget.GetComponent(OGButton) ) {			
				// Active
				var selectedDownIndex : int = GetStyleIndex ( widget, widget.styles.active );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Active' style" );
				selectedDownIndex = EditorGUILayout.Popup ( selectedDownIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.active = widget.GetRoot().skin.styles [ selectedDownIndex ];
				
				// Hover
				var selectedHoverIndex : int = GetStyleIndex ( widget, widget.styles.hover );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Hover' style" );
				selectedHoverIndex = EditorGUILayout.Popup ( selectedHoverIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.hover = widget.GetRoot().skin.styles [ selectedHoverIndex ];
			
			// OGPopUp
			} else if ( widget.GetComponent(OGPopUp) ) {			
				// Active
				var puUpIndex : int = GetStyleIndex ( widget, widget.styles.active );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Active' style" );
				puUpIndex = EditorGUILayout.Popup ( puUpIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.active = widget.GetRoot().skin.styles [ puUpIndex ];
				
				// Hover
				var puHoverIndex : int = GetStyleIndex ( widget, widget.styles.hover );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Hover' style" );
				puHoverIndex = EditorGUILayout.Popup ( puHoverIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.hover = widget.GetRoot().skin.styles [ puHoverIndex ];
			
			// OGDropDown
			} else if ( widget.GetComponent(OGDropDown) ) {			
				// Active
				var ddDownIndex : int = GetStyleIndex ( widget, widget.styles.active );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Active' style" );
				ddDownIndex = EditorGUILayout.Popup ( ddDownIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.active = widget.GetRoot().skin.styles [ ddDownIndex ];
				
				// Hover
				var ddHoverIndex : int = GetStyleIndex ( widget, widget.styles.hover );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Hover' style" );
				ddHoverIndex = EditorGUILayout.Popup ( ddHoverIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.hover = widget.GetRoot().skin.styles [ ddHoverIndex ];

				// Ticked
				var ddTickedIndex : int = GetStyleIndex ( widget, widget.styles.ticked );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Ticked' style" );
				ddTickedIndex = EditorGUILayout.Popup ( ddTickedIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.ticked = widget.GetRoot().skin.styles [ ddTickedIndex ];

			// OGTickBox
			} else if ( widget.GetComponent(OGTickBox) ) {			
				// Ticked
				var tbTickedIndex : int = GetStyleIndex ( widget, widget.styles.ticked );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Ticked' style" );
				tbTickedIndex = EditorGUILayout.Popup ( tbTickedIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.ticked = widget.GetRoot().skin.styles [ tbTickedIndex ];
				
				// Hover
				var tbHoverIndex : int = GetStyleIndex ( widget, widget.styles.hover );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Hover' style" );
				tbHoverIndex = EditorGUILayout.Popup ( tbHoverIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.hover = widget.GetRoot().skin.styles [ tbHoverIndex ];
			
			// OGSlider
			} else if ( widget.GetComponent(OGSlider) ) {			
				// Thumb
				var slThumbIndex : int = GetStyleIndex ( widget, widget.styles.thumb );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Thumb' style" );
				slThumbIndex = EditorGUILayout.Popup ( slThumbIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.thumb = widget.GetRoot().skin.styles [ slThumbIndex ];
			
			// OGTabs
			} else if ( widget.GetComponent(OGTabs) ) {			
				// Down
				var taDownIndex : int = GetStyleIndex ( widget, widget.styles.active );
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField ( "'Down' style" );
				taDownIndex = EditorGUILayout.Popup ( taDownIndex, GetStyles ( widget ) );
				EditorGUILayout.EndHorizontal ();
				widget.styles.active = widget.GetRoot().skin.styles [ taDownIndex ];
				 
			}

			EditorGUILayout.Space();
			
			// Automatic update	
			if ( GUILayout.Button ( "Reset style" ) ) {
				( target as OGWidget ).GetDefaultStyles();
			}
			
			// Automatic update	
			if ( GUI.changed ) {
				( target as OGWidget ).UpdateWidget();
				EditorUtility.SetDirty ( target );
			}
		}
	}
}
