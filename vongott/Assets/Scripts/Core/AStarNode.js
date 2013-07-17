#pragma strict

import UnityEngine;
import System;
import System.Collections;

class AStarNode implements IComparable {
	var position : Vector3;
	var estimatedTotalCost : float;
	var costSoFar : float;
	var walkable : boolean;
	var inactive : boolean;
	var size : int;	
	var parent : AStarNode;
	
	function AStarNode () {
		estimatedTotalCost = 0.0;
		costSoFar = 1.0;
		walkable = false;
		parent = null;
	}
	
	function AStarNode ( x : float, y : float, z : float ) {
		position.x = x;
		position.y = y;
		position.z = z;
		estimatedTotalCost = 0.0;
		costSoFar = 1.0;
		walkable = false;
		parent = null;
	}
	
	function CompareTo ( obj : System.Object ) : int { 
	    var mn : AStarNode = obj as AStarNode;	    
	    
	    if ( this.estimatedTotalCost < mn.estimatedTotalCost ) {
			return -1;
		} else if ( this.estimatedTotalCost > mn.estimatedTotalCost ) {
			return 1;
		} else {
			return 0;
    	}
    } 
	
}