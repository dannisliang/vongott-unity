#pragma strict

public class OCNodeInspector extends OEComponentInspector {
	private var node : OCNode;
	private var tree : OCTree;
	private var eventObjectTarget : OEObjectField.Target = OEObjectField.Target.Prefab;

	public function Refresh ( tree : OCTree, node : OCNode, transform : Transform ) {
		this.tree = tree;
		this.node = node;
		this.transform = transform;
	}

	override function get type () : System.Type { return typeof ( OCNode ); }

	override function Inspector () {
		if ( !node ) { return; }

		var loadedQuests : String[] = new String[0];
		var questEditor : OCQuestEditor = OCQuestEditor.GetInstance ();

		if ( questEditor ) {
			loadedQuests = new String [questEditor.loadedQuests.Count];
			
			for ( var i : int = 0; i < loadedQuests.Length; i++ ) {
				loadedQuests[i] = questEditor.loadedQuests[i].title;
			}
		}

		width = 264;
	
		LabelField ( "ID", new Rect ( 0, 0, width / 2, 16 ) );
		LabelField ( node.id.ToString(), new Rect ( width / 2, 0, width / 2, 16 ) );

		offset.y += 20;

		var newType : int = Popup ( "Type", node.type, System.Enum.GetNames ( OCNodeType ) );

		offset.y += 10;

		if ( newType != node.type ) {
			node.SetType ( newType );
			OCTreeEditor.Refresh ();
		}

		var rootNodeStrings : String [] = new String [ tree.rootNodes.Length ];

		for ( i = 0; i < rootNodeStrings.Length; i++ ) {
			rootNodeStrings[i] = i.ToString ();
		}

		switch ( node.type ) {
			case OCNodeType.Speak:
				var newSpeaker : int = Popup ( "Speaker", node.speak.speaker, tree.speakers );

				if ( newSpeaker != node.speak.speaker ) {
					node.speak.speaker = newSpeaker;
					OCTreeEditor.Refresh ();
				}

				var newSmalltalk : boolean = Toggle ( "Smalltalk", node.speak.smalltalk );
				
				if ( newSmalltalk != node.speak.smalltalk ) {
					node.speak.smalltalk = newSmalltalk;
					OCTreeEditor.Refresh ();
				}

				offset.y += 20;

				for ( i = 0; i < node.speak.lines.Length; i++ ) {
					LabelField ( i.ToString () ); 
					node.speak.lines[i].text = TextField ( "", node.speak.lines[i].text, new Rect ( 40, offset.y, width - 40, 60 ) );
					offset.y += 50;
					node.speak.lines[i].audio = AssetLinkField ( "Audio", node.id + ">" + i, tree.gameObject.GetComponent.< OFSerializedObject > (), typeof ( AudioClip ), "ogg" ) as AudioClip;
					node.speak.lines[i].facing = Popup ( "Facing", node.speak.lines[i].facing, tree.speakers  );
					offset.y += 20;
				}
					
				offset.y += 20;

				if ( Button ( "-", new Rect ( 0, offset.y, 24, 16 ) ) ) {
					node.speak.RemoveLine ( node.speak.lines.Length - 1 );
					node.SetOutputAmount ( node.speak.lines.Length );
					OCTreeEditor.Refresh ();
				
				} else if ( Button ( "+", new Rect ( 30, offset.y, 24, 16 ) ) ) {
					node.speak.AddLine ();
					node.SetOutputAmount ( node.speak.lines.Length );
					OCTreeEditor.Refresh ();
				
				} 

				break;

			case OCNodeType.Event:
				node.event.message = TextField ( "Message", node.event.message );

				if ( node.event.eventToTarget || node.event.object == null ) {
					node.event.argument = TextField ( "Argument", node.event.argument );
				}

				eventObjectTarget = Popup ( "Object location", eventObjectTarget, System.Enum.GetNames ( OEObjectField.Target ) );

				LabelField ( "Object" );
			
				var buttonTitle : String = "None";

				if ( !String.IsNullOrEmpty ( node.event.objectId ) ) {
					buttonTitle = "(scene object)";
				
				} else if ( !String.IsNullOrEmpty ( node.event.objectPath ) ) {
					var strings : String [] = node.event.objectPath.Split ( "/"[0] );
					buttonTitle = strings [ strings.Length - 1 ];
				}

				if ( Button ( buttonTitle, new Rect ( width / 2, offset.y, width / 2 - 20, 16 ) ) ) {
					if ( eventObjectTarget == OEObjectField.Target.Scene ) {
						OEWorkspace.GetInstance().PickObject ( function ( picked : GameObject ) {
							var so : OFSerializedObject = picked.GetComponent.< OFSerializedObject > ();

							if ( so ) {
								node.event.objectPath = "";
								node.event.objectId = so.id;
								node.event.object = so.gameObject;
							}
						}, typeof ( OFSerializedObject ) );	
					
					} else {
						OEWorkspace.GetInstance().PickPrefab ( function ( picked : GameObject ) {
							var so : OFSerializedObject = picked.GetComponent.< OFSerializedObject > ();

							if ( so ) {
								node.event.objectId = "";
								node.event.objectPath = so.prefabPath;
								node.event.object = so.gameObject;
							}
						}, typeof ( OFSerializedObject ) );	


					}
				}

				if ( Button ( "x", new Rect ( width - 16, offset.y, 16, 16 ) ) ) {
					node.event.objectId = "";
					node.event.objectPath = "";
				}

				if ( !String.IsNullOrEmpty ( node.event.objectId ) ) {
					node.event.eventToTarget = Toggle ( "Event to object", node.event.eventToTarget );
				
				} else {
					node.event.eventToTarget = false;

				}

				offset.y += 20;

				break;

			case OCNodeType.Jump:
				node.jump.rootNode = Popup ( "Jump to root", node.jump.rootNode, rootNodeStrings );
				break;

			case OCNodeType.SetFlag:
				node.setFlag.flag = TextField ( "Flag", node.setFlag.flag );
				node.setFlag.b = Toggle ( "Bool", node.setFlag.b );
				break;
			
			case OCNodeType.GetFlag:
				node.getFlag.flag = TextField ( "Flag", node.getFlag.flag );
				break;
			
			case OCNodeType.SetQuest:
				if ( loadedQuests.Length > 0 ) {
					var questIndex : int = 0;

					for ( questIndex = loadedQuests.Length - 1; questIndex > 0; questIndex-- ) {
						if ( node.setQuest.quest == loadedQuests[questIndex] ) {
							break;
						}
					}

					LabelField ( "Quest" );
					node.setQuest.quest = loadedQuests [ Popup ( "", questIndex, loadedQuests ) ];
					
					offset.y += 20;

					var quest : OCQuests.Quest = questEditor.loadedQuests[questIndex];

					if ( quest.objectives.Length > 0 ) {
						LabelField ( "Objective" );
						node.setQuest.objective = Popup ( "", node.setQuest.objective, quest.GetObjectiveStrings ( 40 ) );
						
						offset.y += 20;
					}
					
					node.setQuest.completed = Toggle ( "Is completed", node.setQuest.completed );
				
				} else {
					LabelField ( "You need to load a set of quests in the quest editor first." );

				}
				break;
			
			case OCNodeType.GetQuest:
				if ( loadedQuests.Length > 0 ) {
					for ( questIndex = loadedQuests.Length - 1; questIndex > 0; questIndex-- ) {
						if ( node.getQuest.quest == loadedQuests[questIndex] ) {
							break;
						}
					}
					
					LabelField ( "Quest" );
					node.getQuest.quest = loadedQuests [ Popup ( "", questIndex, loadedQuests ) ];
					
					offset.y += 20;
					
					quest = questEditor.loadedQuests[questIndex];

					if ( quest.objectives.Length > 0 ) {
						LabelField ( "Objective" );
						node.getQuest.objective = Popup ( "", node.getQuest.objective, quest.GetObjectiveStrings ( 40 ) );
						
						offset.y += 20;
					}

					node.getQuest.completed = Toggle ( "Must be completed", node.getQuest.completed );
				
				} else {
					LabelField ( "You need to load a set of quests in the quest editor first." );

				}

				break;
						
			case OCNodeType.End:
				node.end.rootNode = Popup ( "Next root", node.end.rootNode, rootNodeStrings );
				break;
		}
	}
}
