#pragma strict

class UIQuests extends OGPage {
	public var list : OGScrollView;
	public var title : OGLabel;
	public var description : OGLabel;
	public var objectives : OGLabel;
	public var image : OGTexture;

	private function Clear () {
		list.position = Vector2.zero;

		for ( var i : int = 0; i < list.transform.childCount; i++ ) {
			Destroy ( list.transform.GetChild ( i ).gameObject );
		}
	}

	private function Populate () : IEnumerator {
		Clear ();

		yield WaitForEndOfFrame ();

		var manager : OCQuests = GameCore.GetQuestManager ();

		for ( var i : int = 0; i < manager.userQuests.Length; i++) {
			var li : OGListItem = new GameObject ( "li_" + manager.userQuests[i].title ).AddComponent.< OGListItem > ();
			
			li.transform.parent = list.transform;
			li.transform.localScale = new Vector3 ( 450, 20, 1 );
			li.transform.localPosition = new Vector3 ( 0, i * 20, 0 );

			li.text = manager.userQuests[i].title;

			if ( manager.userQuests[i].completed ) {
				li.text += " (completed)";
			}

			li.target = this.gameObject;
			li.message = "SelectQuest";
			li.argument = i.ToString ();
			
			li.ApplyDefaultStyles ();

		}
	}

	public function SelectActiveQuest () {
		SelectQuest ( GameCore.GetQuestManager ().activeQuest );
	}

	public function SelectQuest ( n : String ) {
		SelectQuest ( int.Parse ( n ) );
	}

	public function SelectQuest ( i : int ) {
		var manager : OCQuests = GameCore.GetQuestManager ();
	
		if ( i > 0  && i < manager.userQuests.Length ) {
			var quest : OCQuests.Quest = manager.userQuests[i];
			
			title.text = quest.title;
			description.text = quest.description;
			objectives.text = "";
			image.mainTexture = quest.image;

			for ( var o : int = 0; o < quest.objectives.Length; o++ ) {
				var objective : OCQuests.Objective = quest.objectives[o];
				
				objectives.text += objective.description;
			       	
				if ( objective.goal > 0 ) {
					objectives.text += " (" + objective.progress + "/" + objective.goal + ")";
				}

				objectives.text += "\n";
			}
		}
	}

	override function StartPage () {
		StartCoroutine ( Populate () );
		SelectActiveQuest ();
		GameCore.GetInstance().SetPause ( true );
		GameCore.GetInstance().SetControlsActive ( false );
	}
	
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.Q) ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().SetControlsActive ( true );
		}
	}
}
