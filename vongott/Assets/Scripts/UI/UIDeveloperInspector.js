#pragma strict

public class UIDeveloperInspector extends OEComponentInspector {
	public enum Mode { 
		Flags,
		Quests
	}

	public var core : GameCore;
	
	private var mode : Mode;

	override function get type () : System.Type { return typeof ( GameCore ); }
	
	override function Inspector () {
		if ( !core ) { return; }	
	
		width = 380;
		mode = Popup ( "Mode", mode, System.Enum.GetNames ( Mode ) );

		switch ( mode ) {
			case Mode.Flags:
				
				break;

			case Mode.Quests:
				var questManager : OCQuests = GameCore.GetQuestManager ();

				for ( var q : OCQuests.Quest in questManager.userQuests ) {
					LabelField ( q.title );

					offset.x += 20;

					for ( var o : OCQuests.Objective in q.objectives ) {
						var desc : String = o.description;

						if ( desc.Length > 20 ) {
							desc = desc.Substring ( 0, 20 ) + "...";
						}

						o.progress = Slider ( desc, o.progress, 0, o.goal );
					}
					
					offset.x -= 20;
					
					offset.y += 20;
				}

				break;
		}
	}	
}
