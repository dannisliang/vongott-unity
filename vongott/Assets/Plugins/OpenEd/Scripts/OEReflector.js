#pragma strict

public class OEReflector {
	public static function GetInspectors () : OEComponentInspector [] {
		var inspectors : List.< OEComponentInspector > = new List.< OEComponentInspector > ();

		for ( var assembly : System.Reflection.Assembly in AppDomain.CurrentDomain.GetAssemblies () ) {
			if ( assembly.FullName.StartsWith ( "Mono.Cecil" ) ) {
				continue;
	    
		    	} else if ( assembly.FullName.StartsWith ( "UnityScript" ) ) {
				continue;

		   	} else if ( assembly.FullName.StartsWith ( "Boo.Lan" ) ) {
				continue;

		    	} else if ( assembly.FullName.StartsWith ( "System" ) ) {
				continue;

		    	} else if ( assembly.FullName.StartsWith ( "I18N" ) ) {
				continue;

		    	} else if ( assembly.FullName.StartsWith ( "UnityEngine" ) ) {
				continue;

		   	} else if ( assembly.FullName.StartsWith ( "UnityEditor" ) ) {
				continue;

		    	} else if ( assembly.FullName.StartsWith ( "mscorlib" ) ) {
				continue;
		    
		    	}
	 
		    	for ( var type : System.Type in assembly.GetTypes () ) {
				if ( !type.IsClass ) {
			    		continue;

				} else if ( type.IsAbstract ) {
			    		continue;

				} else if ( !type.IsSubclassOf ( typeof ( OEComponentInspector ) ) ) {
			    		continue;
				
				}
				
				inspectors.Add ( System.Activator.CreateInstance ( type ) as OEComponentInspector );
			} 
		}

		return inspectors.ToArray ();
	}
}
