﻿#pragma strict

import System.Collections.Generic;

public class OCQuests {
	public class Giver {
		public var name : String;
		public var portrait : Texture2D;

		function QuestGiver ( name : String, portrait : Texture2D ) {
			this.name = name;
			this.portrait = portrait;
		}
	}

	public class Objective {
		public var description : String;
		public var progress : int = 0;
		public var goal : int = 0;

		function Objective ( description : String, goal : int ) {
			this.description = description;
			this.goal = goal;
		}	

		public function get completed () : boolean {
			if ( progress > goal ) {
				progress = goal;
			}

			return progress == goal;
		}

		public function set completed ( value : boolean ) {
			progress = value ? goal : 0;
		}
	}
	
	public class Quest {
		public enum State {
			Ended,
			Begun
		}
		
		public var title : String;
		public var description : String;
		public var objectives : Objective[] = new Objective[0];
		public var xp : int;
		public var giver : Giver;
		public var image : Texture2D;
		public var side : boolean;

		function Quest () {
		}

		function Quest ( title : String, description : String, objectives : Objective[] ) {
			Quest ( title, description, objectives, 0, false, null, null );
		}
		
		function Quest ( title : String, description : String, objectives : Objective[], xp : int ) {
			Quest ( title, description, objectives, xp, false, null, null );
		}
		
		function Quest ( title : String, description : String, objectives : Objective[], xp : int, side : boolean ) {
			Quest ( title, description, objectives, xp, side, null, null );
		}

		function Quest ( title : String, description : String, objectives : Objective[], xp : int, side : boolean, giver : Giver ) {
			Quest ( title, description, objectives, xp, side, giver, null );
		}

		function Quest ( title : String, description : String, objectives : Objective[], xp : int, side : boolean, giver : Giver, image : Texture2D ) {
			this.title = title;
			this.description = description;
			this.objectives = objectives;
			this.xp = xp;
			this.side = side;
			this.giver = giver;
			this.image = image;
		}

		public function get completed () : boolean {
			var completedObjectives : int = 0;

			for ( var i : int = 0; i < objectives.Length; i++ ) {
				if ( objectives[i].completed ) {
					completedObjectives++;
				}
			}

			return completedObjectives == objectives.Length;
		}

		public function set completed ( value : boolean ) {
			for ( var i : int = 0; i < objectives.Length; i++ ) {
				objectives[i].completed = value;
			}
		}

		public function ProgressObjective ( description : String, amount : int ) {
			for ( var i : int = 0; i < objectives.Length; i++ ) {
				if ( description == objectives[i].description ) {
					ProgressObjective ( i, amount );
					break;
				}
			}
		}

		public function ProgressObjective ( i : int, amount : int ) {
			if ( i > 0 && i < objectives.Length ) {
				objectives[i].progress += amount;
			}			
		}
	}

	public var userQuests : Quest[] = new Quest[0];
	public var potentialQuests : Quest[] = new Quest[0];
	public var activeQuest : int = -1;
	
	public function SetActiveQuest ( quest : Quest ) {
		for ( var i : int = 0; i < userQuests.Length; i++ ) {
			if ( userQuests[i] == quest ) {
				activeQuest = i;
				return;
			}
		}

		activeQuest = -1;
	}

	public function GetActiveQuest () : Quest {
		if ( activeQuest > 0 && activeQuest < userQuests.Length ) {
			return userQuests[activeQuest];
		}

		return null;
	}

	public function AddUserQuest ( quest : Quest ) {
		var tmp : List.< Quest > = new List.< Quest > ( userQuests );

		tmp.Add ( quest );

		userQuests = tmp.ToArray ();
	}

	public function RemoveUserQuest ( quest : Quest ) {
		var tmp : List.< Quest > = new List.< Quest > ( userQuests );

		tmp.Remove ( quest );

		userQuests = tmp.ToArray ();
	}
	
	public function AddPotentialQuest ( quest : Quest ) {
		var tmp : List.< Quest > = new List.< Quest > ( potentialQuests );

		tmp.Add ( quest );

		potentialQuests = tmp.ToArray ();
	}

	public function RemovePotentialQuest ( quest : Quest ) {
		var tmp : List.< Quest > = new List.< Quest > ( potentialQuests );

		tmp.Remove ( quest );

		potentialQuests = tmp.ToArray ();
	}

	public function GetUserQuest ( title : String ) : Quest {
		for ( var i : int = 0; i < userQuests.Length; i++ ) {
			if ( userQuests[i].title == title ) {
				return userQuests[i];
			}
		}

		return null;
	}
	
	public function GetPotentialQuest ( title : String ) : Quest {
		for ( var i : int = 0; i < potentialQuests.Length; i++ ) {
			if ( potentialQuests[i].title == title ) {
				return potentialQuests[i];
			}
		}

		return null;
	}

	public function SetQuestState ( title : String, state : Quest.State ) {
		var quest : Quest;
		
		if ( state == Quest.State.Begun ) {
			quest = GetPotentialQuest ( title );

			if ( quest ) {
				AddUserQuest ( quest );
			}	
		
		} else {
			quest = GetUserQuest ( title );

			if ( quest ) {
				quest.completed = true;
			}
		}
	}

	public function IsQuestCompleted ( title : String ) : boolean {
		var quest : Quest = GetUserQuest ( title );

		if ( quest ) {
			return quest.completed;

		} else {
			return false;
				
		}
	}
}
