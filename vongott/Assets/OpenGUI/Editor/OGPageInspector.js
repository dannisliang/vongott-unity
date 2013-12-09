
#pragma strict

@CustomEditor ( OGPage, true )
public class OGPageInspector extends Editor {
	override function OnInspectorGUI () {
		var page : OGPage = target as OGPage;

		if ( !page ) { return; }
		
		DrawDefaultInspector ();
	
		EditorGUILayout.Space ();

		if ( GUILayout.Button ( "Set current page" ) ) {
			OGRoot.GetInstance().currentPage = page;
			page.gameObject.SetActive ( true );	
			OGRoot.GetInstance().SetDirty();
		}
	}	
}
