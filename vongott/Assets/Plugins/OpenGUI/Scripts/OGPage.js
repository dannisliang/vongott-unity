#pragma strict

public class OGPage extends MonoBehaviour {
	public var pageName : String = "New Page";

	public function StartPage () {}
	public function UpdatePage () {}
	public function ExitPage () {}
	
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
	
	public function UpdateStyles () {
		for ( var w : OGWidget in this.transform.GetComponentsInChildren.<OGWidget>(true) ) {
			for ( var styleType : OGStyleType in System.Enum.GetValues ( OGStyleType ) as OGStyleType[] ) {
				if ( OGSkin.IsStyleUsed ( styleType, w.ToEnum() ) ) {
					// Styles
					var wdStyle : OGStyle = w.styles.GetStyle ( styleType ); 
					var wdStyleIndex : int = GetStyleIndex ( w, wdStyle );		
					
					w.styles.SetStyle ( styleType, w.GetRoot().skin.styles [ wdStyleIndex ] );
				}	
			}
		}
	}

	public function ResetStyles () {
		for ( var w : OGWidget in this.transform.GetComponentsInChildren.<OGWidget>(true) ) {
			OGRoot.GetInstance().skin.GetDefaultStyles ( w );
		}	
	}

}
