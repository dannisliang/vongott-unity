#pragma strict

public class OECharacterInspector extends OEComponentInspector {
	public var playerObject : OEObjectField;
	public var isEnemy : OEToggle;
	public var behaviour : OEPopup;
	public var pathUpdate : OEFloatField;
	public var usingWeapons : OEToggle;
	public var weaponPrefCat : OEPopup;
	public var weaponPrefSubcat : OEPopup;
	public var convoTree : OEObjectField;
	public var convoStartNode : OEPopup;
	public var convoSpeakerIndex : OEPopup;
	public var convoSpeakerObject : OEObjectField;

	private var currentSpeaker : int = 0;

	override function Update () {
		var character : OACharacter = target.GetComponent.< OACharacter >();
	
		character.player = playerObject.Set ( character.player, typeof ( GameObject ), OEObjectField.Target.Scene ) as GameObject;
		character.isEnemy = isEnemy.Set ( character.isEnemy );
		character.behaviour = behaviour.Set ( character.behaviour, System.Enum.GetNames ( typeof ( OABehaviour ) ) );
		character.updatePathInterval = pathUpdate.Set ( character.updatePathInterval );
		
		character.usingWeapons = usingWeapons.Set ( character.usingWeapons );
	
		weaponPrefCat.enabled = character.usingWeapons;
		weaponPrefSubcat.enabled = character.usingWeapons;

		character.weaponCategoryPreference = weaponPrefCat.Set ( character.weaponCategoryPreference, character.inventory.definitions.GetCategoryStrings () );
		character.weaponSubcategoryPreference = weaponPrefSubcat.Set ( character.weaponSubcategoryPreference, character.inventory.definitions.GetSubcategoryStrings ( character.weaponCategoryPreference ) );

		character.conversationTree = convoTree.Set ( character.conversationTree, typeof ( OCTree ), OEObjectField.Target.File ) as OCTree;
		
		var rootNodeStrings : String[] = new String[0];
		var speakerStrings : String[] = new String[0];
		
		if ( character.conversationTree ) {
			rootNodeStrings = new String[character.conversationTree.rootNodes.Length];
			for ( var i : int = 0; i < rootNodeStrings.Length; i++ ) {
				rootNodeStrings[i] = i.ToString();
			}
			
			if ( character.convoSpeakers.Length != character.conversationTree.speakers.Length ) {
				character.convoSpeakers = new GameObject [ character.conversationTree.speakers.Length ];
			}
		
			speakerStrings = character.conversationTree.GetSpeakerStrings ();
		
		} else {
			character.convoSpeakers = new GameObject [ 1 ];

		}

		character.convoRootNode = convoStartNode.Set ( character.convoRootNode, rootNodeStrings );	
	
		currentSpeaker = convoSpeakerIndex.Set ( currentSpeaker, speakerStrings );

		character.convoSpeakers[currentSpeaker] = convoSpeakerObject.Set ( character.convoSpeakers[currentSpeaker], typeof ( GameObject ), OEObjectField.Target.Scene ) as GameObject;
	}	
}
