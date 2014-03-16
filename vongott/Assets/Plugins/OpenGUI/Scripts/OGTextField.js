﻿#pragma strict

public class OGTextField extends OGWidget {
	enum RegExPreset {
		None,
		OnlyNumbers,
		OnlyNumbersAndPeriod,
		OnlyASCII,
		NoSpaces
	}
	
	public var locked : boolean = false;
	public var text : String = "";
	public var maxLength : int = 30;
	public var regex : String;
	public var regexPreset : RegExPreset;

	@HideInInspector public var cursorStyle : OGStyle;
	@HideInInspector public var listening : boolean = false;
	
	private var currentPreset : RegExPreset = RegExPreset.None;
	private var cursorPosition : Vector2;
	private var selectCursorPosition : Vector2;


	//////////////////
	// Interaction
	//////////////////
	override function OnMouseDown () {
		listening = true;
	}

	override function OnMouseCancel () {
		listening = false;
	}


	/////////////////
	// OnGUI draw
	/////////////////
	// Steal TextEditor functionality from OnGUI
	public function OnGUI () {
		if ( listening && isDrawn ) {
			//GUI.color = new Color ( 0, 0, 0, 0 );

			var style : GUIStyle = new GUIStyle();
			style.normal.textColor = styles.basic.text.fontColor;
			style.wordWrap = true;

			var invertedRct : Rect = drawRct;
			invertedRct.y = Screen.height - invertedRct.y - invertedRct.height;
			text = GUI.TextArea ( invertedRct, text, style );

			var controlID : int = GUIUtility.GetControlID(drawRct.GetHashCode(), FocusType.Keyboard);
			var editor : TextEditor = GUIUtility.GetStateObject(typeof(TextEditor), controlID -1 ) as TextEditor;
		
			cursorPosition = new Vector2 ( editor.graphicalCursorPos.x / this.transform.localScale.x, ( editor.graphicalCursorPos.y - 2 ) / this.transform.localScale.y );
		
			if ( !String.IsNullOrEmpty ( regex ) && regex != "\\" && regexPreset != RegExPreset.None ) {
				text = Regex.Replace ( text, "[" + regex + "]", "" );
			}

			//GUI.color = new Color ( 1, 1, 1, 1 );
		}
	}

	
	////////////////////
	// Update
	////////////////////
	override function UpdateWidget () {
		// Persistent vars
		isSelectable = true;

		// Update data
		mouseRct = drawRct;
		isAlwaysOnTop = listening;

		// Styles
		if ( isDisabled ) {
			currentStyle = styles.disabled;
		} else {
			currentStyle = styles.basic;
		}

		// ^ Regex presets
		if ( regexPreset != currentPreset ) {
			currentPreset = regexPreset;
			
			if ( currentPreset == RegExPreset.None ) {
				regex = "";
		
			} else if ( currentPreset == RegExPreset.OnlyNumbers ) {
				regex = "^0-9";
				
			} else if ( currentPreset == RegExPreset.OnlyASCII ) {
				regex = "^a-zA-Z0-9";
				
			} else if ( currentPreset == RegExPreset.NoSpaces ) {
				regex = " ";
				
			} else if ( currentPreset == RegExPreset.OnlyNumbersAndPeriod) {
				regex = "^0-9.";
				
			}
		}
	}


	/////////////////
	// Draw
	/////////////////
	override function DrawSkin () {
		OGDrawHelper.DrawSlicedSprite ( drawRct, currentStyle, drawDepth, alpha, clipTo );
	}

	override function DrawText () {
		if ( !listening ) {
			OGDrawHelper.DrawLabel ( drawRct, text, currentStyle.text, drawDepth, alpha, this );
		}
	}
}
