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
	public var convoSpeakers : OEObjectField[];

	override function Update () {
		var character : OACharacter = target.GetComponent.< OACharacter >();
	
		character.player = playerObject.Set ( character.player, typeof ( GameObject ), OEObjectField.Target.Scene ) as GameObject;
		character.isEnemy = isEnemy.Set ( character.isEnemy );
		character.behaviour = behaviour.Set ( character.behaviour, System.Enum.GetNames ( typeof ( OABehaviour ) ) );
		character.updatePathInterval = pathUpdate.Set ( character.updatePathInterval );
		
		character.usingWeapons = usingWeapons.Set ( character.usingWeapons );
		character.weaponCategoryPreference = weaponPrefCat.Set ( character.weaponCategoryPreference, character.inventory.definitions.GetCategoryStrings () );
		character.weaponSubcategoryPreference = weaponPrefSubcat.Set ( character.weaponSubcategoryPreference, character.inventory.definitions.GetSubcategoryStrings ( character.weaponCategoryPreference ) );
		
		character.conversationTree = convoTree.Set ( character.conversationTree, typeof ( OCTree ), OEObjectField.Target.File ) as OCTree;
		
		/*if ( character.conversationTree != null ) {
			var rootNodeStrings : String[] = new String[character.conversationTree.rootNodes.Length];
			for ( var i : int = 0; i < rootNodeStrings.Length; i++ ) {
				rootNodeStrings[i] = i.ToString();
			}
			
			convoStartNode.Set ( character.convoRootNode, rootNodeStrings );	
	
			if ( !character.gameObject.activeInHierarchy || character.convoSpeakers.Length != character.conversationTree.speakers.Length ) {
				character.convoSpeakers = new GameObject [ character.conversationTree.speakers.Length ];
			}

			for ( i = 0; i < character.conversationTree.speakers.Length; i++ ) {
				convoSpeakers[i].Set ( character.convoSpeakers[i], typeof ( GameObject ), OEObjectField.Target.Scene );
			}
		}*/
	}	
}
