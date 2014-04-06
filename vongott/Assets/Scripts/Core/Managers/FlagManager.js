#pragma strict

static var flagTable : JSONObject;

static function Init () {
	flagTable = Loader.LoadFlags();
}

static function SaveFlags () {
	Saver.SaveFlags ( flagTable );
}

static function SetFlag ( flag : String, state : boolean ) {
	if ( !flagTable ) {
		Init ();
	}
	
	if ( flagTable.GetField ( flag ) ) {
		flagTable.GetField ( flag ).b = state;
	} else {
		flagTable.AddField ( flag, state );
	}
	
	GameCore.Print ( "FlagManager | set flag '" + flag + "' to " + state );
}

static function SetItemFlag ( i : Item, b : boolean ) { 
	SetFlag ( "0_has_item_" + i.gameObject.name, b );
}

static function GetFlag ( flag : String, state : boolean ) {
	if ( !flagTable ) {
		Init ();
	}
	
	if ( flag == "(none)" ) {
		return true;
		
	} else if ( flagTable.GetField ( flag ) ) {
		return flagTable.GetField ( flag ).b == state;
	
	} else {
		return false;
	
	}
}
