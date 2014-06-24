#pragma strict

public class OCQuestEditor extends OGPage {
	private class ObjectiveContainer {
		public var fldDescription : OGTextField;
		public var fldGoal : OGTextField;

		function ObjectiveContainer ( description : String, goal : int, y : float, parent : Transform ) {
			var container : GameObject = new GameObject ( "ObjectiveContainer" );
			container.transform.parent = parent;
			container.transform.localScale = Vector3.one;
			container.transform.localPosition = new Vector3 ( 0, y, 0 );
			
			fldDescription = new GameObject ( "fld_Description" ).AddComponent.< OGTextField > ();
			fldGoal = new GameObject ( "fld_Goal" ).AddComponent.< OGTextField > ();
			
			fldDescription.text = description;
			fldDescription.maxLength = 300;
			fldGoal.text = goal.ToString ();
			fldGoal.regex = "^0-9";

			fldDescription.ApplyDefaultStyles ();
			fldGoal.ApplyDefaultStyles ();
			
			fldDescription.transform.parent = container.transform;
			fldDescription.transform.localPosition = new Vector3 ( 0, 0, 0 );
			fldDescription.transform.localScale = new Vector3 ( 450, 16, 1 );

			fldGoal.transform.parent = container.transform;
			fldGoal.transform.localPosition = new Vector3 ( 460, 0, 0 );
			fldGoal.transform.localScale = new Vector3 ( 85, 16, 1 );
		}

		public function get description () : String {
			return fldDescription.text;
		}
		
		public function get goal () : int {
			var result : int = 0;

			int.TryParse ( fldGoal.text, result );

			return result;
		}
	}

	public var popSwitch : OGPopUp;
	public var fldTitle : OGTextField;
	public var fldDescription : OGTextField;
	public var tbxSide : OGTickBox;
	public var fldXP : OGTextField;
	public var objectives : OGScrollView;
	public var loadedQuests : List.< OCQuests.Quest > = new List.< OCQuests.Quest > ();

	private var savePath : String;
	private var editingQuest : int = 0;
	private var objectiveContainers : List.< ObjectiveContainer > = new List.< ObjectiveContainer > ();

	private static var instance : OCQuestEditor;

	public static function GetInstance () : OCQuestEditor {
		return instance;
	}

	public function Init () {
		instance = this;
	
		if ( OEWorkspace.GetInstance().settings.autoLoadLastMap ) {
			savePath = PlayerPrefs.GetString ( "OCQuestEditor.savePath" );

			if ( !String.IsNullOrEmpty ( savePath ) ) {
				var json : JSONObject = OFReader.LoadFile ( savePath );
			
				loadedQuests = LoadQuestsFromJSON ( json );

				SelectQuest ( 0 );
			}
		}
	}

	override function UpdatePage () {
		if ( editingQuest >= 0 && editingQuest < loadedQuests.Count ) {
			var quest : OCQuests.Quest = loadedQuests[editingQuest];

			quest.title = fldTitle.text;
			quest.description = fldDescription.text;
			quest.side = tbxSide.isTicked;

			var xp : int = 0;

			int.TryParse ( fldXP.text, xp );

			quest.xp = xp;

			var tmp : List.< OCQuests.Objective > = new List.< OCQuests.Objective > ();

			for ( var i : int = 0; i < objectiveContainers.Count; i++ ) {
				var container : ObjectiveContainer = objectiveContainers[i];

				if ( container.goal < 1 ) {
					container.fldGoal.text = "1";
				}

				var objective : OCQuests.Objective = new OCQuests.Objective ( container.description, container.goal );

				tmp.Add ( objective );
			}

			quest.objectives = tmp.ToArray ();
		}
	}

	public static function LoadQuestsFromJSON ( json : JSONObject ) : List.< OCQuests.Quest > {
		var quests : List.< OCQuests.Quest > = new List.< OCQuests.Quest > ();

		for ( var i : int = 0; i < json.list.Count; i++ ) {
			var q : JSONObject = json.list[i];

			var quest : OCQuests.Quest = new OCQuests.Quest ();
			quest.title = q.GetField ( "title" ).str;
			quest.description = q.GetField ( "description" ).str;
			quest.xp = q.GetField ( "xp" ).n;
			quest.side = q.GetField ( "side" ).b;

			var tmp : List.< OCQuests.Objective > = new List.< OCQuests.Objective > ();

			for ( var o : int = 0; o < q.GetField ( "objectives" ).list.Count; o++ ) {
				var objective : JSONObject = q.GetField ( "objectives" ).list[o];

				tmp.Add ( new OCQuests.Objective ( objective.GetField ( "description" ).str, objective.GetField ( "goal" ).n ) );
			}

			quest.objectives = tmp.ToArray ();

			quests.Add ( quest );
		}

		return quests;
	}

	public function Open () {
		var fileBrowser : OEFileBrowser = OEWorkspace.GetInstance().fileBrowser;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Open;
		fileBrowser.filter = ".quests";
		fileBrowser.callback = function ( file : FileInfo ) {
			loadedQuests.Clear ();
			
			savePath = file.FullName;
			
			var json : JSONObject = OFReader.LoadFile ( savePath );

			loadedQuests = LoadQuestsFromJSON ( json );

			SelectQuest ( 0 );
		};
		fileBrowser.sender = "QuestEditor";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}

	public function Save () {
		if ( !String.IsNullOrEmpty ( savePath ) ) {
			var json : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
			
			for ( var quest : OCQuests.Quest in loadedQuests ) {
				var q : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );

				q.AddField ( "title", quest.title );
				q.AddField ( "description", quest.description );
				q.AddField ( "side", quest.side );
				q.AddField ( "xp", quest.xp );

				var objectives : JSONObject = new JSONObject ( JSONObject.Type.ARRAY );
				for ( var objective in quest.objectives ) {
					var o : JSONObject = new JSONObject ( JSONObject.Type.OBJECT );
					
					o.AddField ( "description", objective.description );
					o.AddField ( "goal", objective.goal );

					objectives.Add ( o );
				}

				q.AddField ( "objectives", objectives );

				json.Add ( q );
			}

			OFWriter.SaveFile ( json, savePath );

			PlayerPrefs.SetString ( "OCQuestEditor.savePath", savePath );

		} else {
			SaveAs ();

		}
	}

	private function Refresh () {
		OEWorkspace.GetInstance().StartCoroutine ( function () : IEnumerator {
			popSwitch.options = new String[loadedQuests.Count];
			
			for ( var i : int = 0; i < loadedQuests.Count; i++ ) {
				popSwitch.options[i] = loadedQuests[i].title;
			}
			
			popSwitch.selectedOption = popSwitch.options [ editingQuest ];

			var quest : OCQuests.Quest = loadedQuests [ editingQuest ];
			
			objectiveContainers.Clear ();
			
			for ( i = 0; i < objectives.transform.childCount; i++ ) {
				var go : GameObject = objectives.transform.GetChild ( i ).gameObject;
				Destroy ( go );
			}

			yield WaitForEndOfFrame ();

			var offset : float = 0;

			fldTitle.text = quest.title;
			fldDescription.text = quest.description;
			fldXP.text = quest.xp.ToString ();
			tbxSide.isTicked = quest.side;

			for ( i = 0; i < quest.objectives.Length; i++ ) {
				var oc : ObjectiveContainer = new ObjectiveContainer ( quest.objectives[i].description, quest.objectives[i].goal, offset, objectives.transform );
				
				var btnRemove : OGButton = new GameObject ( "btn_Remove" ).AddComponent.< OGButton > ();

				btnRemove.ApplyDefaultStyles ();
				btnRemove.tint = Color.red;
				btnRemove.text = "X";
				btnRemove.target = this.gameObject;
				btnRemove.message = "RemoveObjective";
				btnRemove.argument = i.ToString ();
				
				btnRemove.transform.parent = objectives.transform;
				btnRemove.transform.localPosition = new Vector3 ( 554, offset, 0 );
				btnRemove.transform.localScale = new Vector3 ( 24, 16, 1 );
				
				offset += 30;

				objectiveContainers.Add ( oc );
			}
			
			var btnAdd : OGButton = new GameObject ( "btn_Add" ).AddComponent.< OGButton > ();

			btnAdd.ApplyDefaultStyles ();
			btnAdd.tint = Color.green;
			btnAdd.text = "+";
			btnAdd.target = this.gameObject;
			btnAdd.message = "AddObjective";
			btnAdd.argument = i.ToString ();
			
			btnAdd.transform.parent = objectives.transform;
			btnAdd.transform.localPosition = new Vector3 ( 0, offset, 0 );
			btnAdd.transform.localScale = new Vector3 ( 24, 16, 1 );
		} () );
	}

	public function AddObjective () {
		var quest : OCQuests.Quest = loadedQuests [ editingQuest ];
		var tmp : List.< OCQuests.Objective > = new List.< OCQuests.Objective > ( quest.objectives );
		
		tmp.Add ( new OCQuests.Objective ( "Do stuff", 3 ) );
		
		quest.objectives = tmp.ToArray ();

		Refresh ();
	}

	public function RemoveObjective ( n : String ) {
		var quest : OCQuests.Quest = loadedQuests [ editingQuest ];
		var i : int = int.Parse ( n );
		
		var tmp : List.< OCQuests.Objective > = new List.< OCQuests.Objective > ( quest.objectives );
		
		tmp.RemoveAt ( i );
		
		quest.objectives = tmp.ToArray ();
		
		Refresh ();
	}

	public function AddQuest () {
		editingQuest = loadedQuests.Count;

		var quest : OCQuests.Quest = new OCQuests.Quest ();
		quest.title = "New quest";

		loadedQuests.Add ( quest );

		Refresh ();
	}
	
	public function RemoveQuest () {
		loadedQuests.RemoveAt ( editingQuest );

		editingQuest = loadedQuests.Count - 1;

		Refresh ();
	}

	public function SelectQuest ( title : String ) {
		for ( var i : int = 0; i < loadedQuests.Count; i++ ) {
			if ( loadedQuests[i].title == title ) {
				SelectQuest ( i );
				break;
			}
		}
	}

	public function SelectQuest ( i : int ) {
		editingQuest = i;

		Refresh ();
	}

	public function SaveAs () {
		var fileBrowser : OEFileBrowser = OEWorkspace.GetInstance().fileBrowser;
		fileBrowser.browseMode = OEFileBrowser.BrowseMode.Save;
		fileBrowser.callback = function ( path : String ) { savePath = path; Save(); };
		fileBrowser.sender = "QuestEditor";
		OGRoot.GetInstance().GoToPage ( "FileBrowser" );
	}
}
