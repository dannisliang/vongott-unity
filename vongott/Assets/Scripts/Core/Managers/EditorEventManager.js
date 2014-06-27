#pragma strict

public class EditorEventManager extends MonoBehaviour {
	public var navmeshMaterial : Material;
	
	public function Play ( btn : OGButton ) {
		if ( !String.IsNullOrEmpty ( OEWorkspace.GetInstance().currentSavePath ) ) {
			GameCore.OverrideSpawnpoint ( OEWorkspace.GetInstance().GetFocus(), Camera.main.transform.eulerAngles );

			GameCore.nextLevel = OEWorkspace.GetInstance().currentSavePath;
			
			OGRoot.GetInstance().GoToPage ( "Loading" );

			Application.LoadLevel ( "game" );
		}
	}

	public function AddTrigger () {
		var go : GameObject = Instantiate ( Resources.Load ( "Prefabs/Meta/trigger" ) ) as GameObject;
		var so : OFSerializedObject = go.GetComponent.< OFSerializedObject > ();
		var workspace : OEWorkspace = OEWorkspace.GetInstance();

		workspace.PlaceAtCursor ( so );
		workspace.SelectObject ( so );
		workspace.RefreshAll ();
	}
	
	public function AddSpawnpoint () {
		var go : GameObject = Instantiate ( Resources.Load ( "Prefabs/Meta/spawnpoint" ) ) as GameObject;
		var so : OFSerializedObject = go.GetComponent.< OFSerializedObject > ();
		var workspace : OEWorkspace = OEWorkspace.GetInstance();

		workspace.PlaceAtCursor ( so );
		workspace.SelectObject ( so );
		workspace.RefreshAll ();
	}
	
	public function AddWaypoint () {
		var go : GameObject = Instantiate ( Resources.Load ( "Prefabs/Meta/waypoint" ) ) as GameObject;
		var so : OFSerializedObject = go.GetComponent.< OFSerializedObject > ();
		var workspace : OEWorkspace = OEWorkspace.GetInstance();

		workspace.PlaceAtCursor ( so );
		workspace.SelectObject ( so );
		workspace.RefreshAll ();

		go.transform.position += Vector3.up / 4;
	}

	public function ToggleNavmesh () {
		var workspace : OEWorkspace = OEWorkspace.GetInstance();
		var navmesh : OPNavMesh = workspace.GetComponentInChildren.< OPNavMesh > ();

		if ( navmesh ) {
			if ( navmesh.GetComponent.< MeshRenderer > () ) {
				Destroy ( navmesh.GetComponent.< MeshRenderer > () );
			
			} else {
				navmesh.gameObject.AddComponent.< MeshRenderer > ();
				navmesh.gameObject.GetComponent.< MeshRenderer > ().material = navmeshMaterial;
			
			}
		}
	}

	public function Exit () {
		Application.LoadLevel ( "main_menu" );
	}

	public function OnMapLoaded () {
		OCQuestEditor.GetInstance().LoadLinkedQuests();
	}
}
