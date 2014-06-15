#pragma strict

import System.Text;
import System.IO;

public class OBManager {
	public function LoadBundle ( path : String ) : OBBundle {
		path = path.Replace ( "\\", "/" );
		var strings : String = path.Split ( "/"[0] );
		var name : String = strings [ strings.Length - 1 ];

		
	}
}
