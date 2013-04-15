#pragma strict

static var flag_table = new Hashtable();

static function SetFlag ( flag : String ) {
	flag_table[flag] = true;
}

static function GetFlag ( flag : String ) {
	if ( flag_table[flag] ) {
		return true;
	} else {
		return false;
	}
}