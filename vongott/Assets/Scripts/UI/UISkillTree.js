#pragma strict

public class UISkillTree extends OGPage {
	public var lblName : OGLabel;
	public var lblDescription : OGLabel;
	public var lblAttrNames : OGLabel;
	public var lblAttrValues : OGLabel;
	public var btnAction : OGButton;
	public var btnCranium : OGButton;
	public var btnBack : OGButton;
	public var btnChest : OGButton;
	public var btnArms : OGButton;
	public var btnAbdomen : OGButton;
	public var btnLegs : OGButton;

	private var tree : OSSkillTree;
	private var currentRoot : OSSkillTree.Root;
	private var currentSkill : OSSkillTree.Skill;

	private function GetEnabledSkill ( rootName : String ) : OSSkillTree.Skill {
		var root : OSSkillTree.Root = tree.GetRoot ( rootName );

		if ( root ) {
			for ( var skill : OSSkillTree.Skill in root.skills ) {
				if ( skill.enabled ) {
					return skill;
				}
			}
		}

		return null;
	}

	private function ApplyEnabledSkill ( rootName : String, button : OGButton ) {
		var skill : OSSkillTree.Skill = GetEnabledSkill ( rootName );

		if ( skill ) {
			button.enableImage = true;
			button.styles.thumb = OGRoot.GetInstance().skin.GetStyle ( "Icon" + skill.name );
		
		} else {
			button.enableImage = false;
		
		}
	}

	public function BtnAction () {
		if ( currentSkill ) {
			tree.SetActive ( currentRoot.name, currentSkill.name, !currentSkill.active );
			
			btnAction.text = currentSkill.active ? "Deactivate" : "Activate";
		}
	}

	override function StartPage () {
		GameCore.GetInstance().SetPause ( true );
		
		tree = GameCore.GetPlayer().skillTree;

		ApplyEnabledSkill ( "Cranium", btnCranium );			
		ApplyEnabledSkill ( "Back", btnBack );			
		ApplyEnabledSkill ( "Chest", btnChest );			
		ApplyEnabledSkill ( "Arms", btnArms );			
		ApplyEnabledSkill ( "Abdomen", btnAbdomen );			
		ApplyEnabledSkill ( "Legs", btnLegs );			
	}
	
	override function UpdatePage () {
		if ( Input.GetKeyDown(KeyCode.Escape) ) {
			OGRoot.GetInstance().GoToPage ( "HUD" );
			GameCore.GetInstance().SetPause ( false );
		}
	}

	public function SelectRoot ( rootName : String ) {
		currentRoot = tree.GetRoot ( rootName );
		var skill : OSSkillTree.Skill = GetEnabledSkill ( rootName );
	
		if ( skill ) {
			lblName.text = skill.name;
			lblDescription.text = skill.description;
			lblAttrNames.text = "";
			lblAttrValues.text = "";

			for ( var a : OSAttribute in skill.attributes ) {
				lblAttrNames.text += a.name + "\n";
				lblAttrValues.text += a.value + " " + a.suffix + "\n";
			}

			currentSkill = skill;

			btnAction.text = currentSkill.active ? "Deactivate" : "Activate";
		}	
	}
}
