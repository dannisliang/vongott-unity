using UnityEngine;
using System.Collections;

//THIS IS JUST THE GUI AND ENTRY POINT FOR USING THE A-STAR CODE.  There is no pathfinding in here! Just look at the FindPath() function.

public class GridPlayground : MonoBehaviour {
	/*public GameObject visibleGridCellPrefab;
	public int gridSize;
	public GameObject[] visibleCells;
	private PathfindingMap map;
	
	public enum PickMode  {Obstacle, ClearObstacle, Start, Goal};
	private float heuristicWeight;
	public static PickMode pickMode = PickMode.Obstacle;
	private MapNode start = null;
	private GameObject startGO = null;
	private MapNode goal = null;
	private GameObject goalGO = null;
	private int selectedMode = 0;
	private ArrayList pathNodes;
	
	private bool colorOpenList;
	private bool colorClosedList;
	
	public Transform follower;
	public bool following = false;
	public int followNode = 0;
	
	void Start () {
		map = new PathfindingGridMap(gridSize,gridSize);
		visibleCells = new GameObject[gridSize*gridSize];
		colorOpenList = true;
		colorClosedList = true;
		heuristicWeight = 10.0f;
		CreateVisibleGrid();//Creates grid and associates Pathfinding nodes with visible nodes.
		
		//Place the camera so the grid is aligned to the center left of the screen.
		float halfSize = gridSize * 0.5f;
		float positionAdjustment = halfSize-0.5f;//The tiles are 1 unit squared and are centered at (0.5,0.5) so you have to account for that.
		float aspectRatio = Screen.width/(float)Screen.height;//Ortho size only sets the camera's FOV height.  the width is based on aspect ratio
		float leftMove = (aspectRatio * positionAdjustment) - positionAdjustment;//This is to put the grid on the left
		Camera.main.transform.position = new Vector3(leftMove + positionAdjustment, 10, positionAdjustment);
		Camera.main.orthographicSize = halfSize;
	}
	

	void Update () {
		// If follower should follow
		if ( following && pathNodes.Count > 0 ) {
			MapNode node = (MapNode) pathNodes[followNode];
			
			follower.LookAt ( node.position );
			follower.localPosition += follower.forward * 2.0f * Time.deltaTime;
			
			if ( Vector3.Distance ( follower.transform.position, node.position ) < 1.0 ) {
				if ( followNode < pathNodes.Count - 1 ) {
					followNode++;	
				}
			}
			
			for ( int i = 0; i < pathNodes.Count-1; i++ ) {				
				MapNode a = (MapNode) pathNodes[i];
				MapNode b = (MapNode) pathNodes[i+1];
				
				Debug.DrawLine ( a.position, b.position );
			}
		}
		
		//Al that is happening here is handling clicks on the grid.
		if(Input.GetMouseButton(0))
		{
			Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	    	RaycastHit hit = new RaycastHit();
	    	if(Physics.Raycast(ray,out hit,100))
	    	{
	    		Texture2D whiteTexture = new Texture2D(1,1);
				whiteTexture.SetPixel(0,0,Color.white);
				whiteTexture.Apply();
				
	    		
				MapNodeWrapper mapNodeWrapper = (MapNodeWrapper)hit.collider.gameObject.GetComponent("MapNodeWrapper");
				MapNode mn = mapNodeWrapper.theNode;
				Color c = Color.white;
				if(pickMode == PickMode.Obstacle)
				{
					mn.obstacle = true;	
					c = Color.black;
				}
				if(pickMode == PickMode.ClearObstacle)
				{
					mn.obstacle = false;	
					c = Color.white;
				}
				else if(pickMode == PickMode.Start)
				{
					//SET THE STARTING NODE
					if(startGO != null)
					{
						startGO.renderer.material.mainTexture = whiteTexture;
						
					}
					start = mn;
					startGO = hit.collider.gameObject;
					c = Color.red;
					
					follower.position = startGO.transform.position;
					follower.eulerAngles = startGO.transform.eulerAngles;
				}
				else if(pickMode == PickMode.Goal)
				{
					//SET THE END/GOAL NODE
					if(goalGO != null)
					{
						goalGO.renderer.material.mainTexture = whiteTexture;
						
					}
					goal = mn;
					goalGO = hit.collider.gameObject;
					c = Color.green;
				}
				Texture2D t = new Texture2D(1,1);
				t.SetPixel(0,0,c);
				t.Apply();
				hit.collider.gameObject.renderer.material.mainTexture = t;
		    }
		}

	}
	
	
	public void OnGUI()
	{
		GUI.BeginGroup(new Rect(Screen.width - 140, 0, 140, 280));
		GUI.Box(new Rect(0, 0, 140, 280), "Path Finding");	
		if(GUI.Button(new Rect(5,30,130,25),"Run A-Star"))
		{
			ResetPath();
			FindPath();
		}
		if(GUI.Button(new Rect(5,65,130,25),"Reset Path"))
		{
			ResetPath();
		}
		
		GUI.Label(new Rect(5,105,130,20), "Mouse Mode");
		string[] strings = new string[4]{"Block Tile","Unblock", "Set Start", "Set Goal"};
		selectedMode = GUI.SelectionGrid(new Rect(0,125,140,50), selectedMode, strings, 2);
		if(selectedMode == 0)
		{
			pickMode = PickMode.Obstacle;
		}
		else if(selectedMode == 1)
		{
			pickMode = PickMode.ClearObstacle;
		}
		else if(selectedMode == 2)
		{
			pickMode = PickMode.Start;
		}
		else if(selectedMode == 3)
		{
			pickMode = PickMode.Goal;
		}
		
		GUI.Label(new Rect(5,185,140,20), "Heuristic: Dist * " + System.String.Format("{0:n2}",heuristicWeight));
		heuristicWeight = GUI.HorizontalSlider(new Rect(5,205,140,20),heuristicWeight,0.0f, 5.0f);
		colorOpenList = GUI.Toggle(new Rect(5,230,140,20),colorOpenList, "Show Open Nodes");
		colorClosedList = GUI.Toggle(new Rect(5,250,140,20),colorClosedList, "Show Closed Nodes");
		
		GUI.EndGroup();
		
	}
	
	private void CreateVisibleGrid()
	{
		for(int x = 0; x < gridSize; x++)
		{
			for(int y = 0; y < gridSize; y++)
			{
				GameObject go = (GameObject)Instantiate(visibleGridCellPrefab, new Vector3(x,y,0), Quaternion.identity);
				//This line is to shrink the tiles a little bit so they have gaps in between them which makes everything look like a grid.
				//Without this the grid would look just like one big square. You couldn't make out the individual tiles.
				go.transform.localScale = new Vector3(0.92f, 1.0f, 0.92f);
				go.transform.localEulerAngles = new Vector3 ( 270f, 0f, 0f );
				visibleCells[y*gridSize+x] = go;
				
				//Associate a PathfindingMap node with a tile.
				MapNode mn = map.GetNode(x,y);
				MapNodeWrapper wrapper = (MapNodeWrapper)go.GetComponent("MapNodeWrapper");
				if(wrapper)
				{
					
					wrapper.theNode = mn;	
					mn.obstacle = false;
				}
				//Color the cell with its own texture
				Texture2D t = new Texture2D(1,1);
				t.SetPixel(0,0,Color.white);
				t.Apply();
				go.renderer.material.mainTexture = t;
				
				
				//Setup initial grid state
				if(y ==gridSize - 3 && x > 5 && x < gridSize - 5)
				{
					mn.obstacle = true;
					t = new Texture2D(1,1);
					t.SetPixel(0,0,Color.black);
					t.Apply();
					go.renderer.material.mainTexture = t;
				}
				if(y == 6 && x ==gridSize/2)
				{
					start = mn;
					startGO = go;
					
					follower.position = go.transform.position;
					follower.eulerAngles = go.transform.eulerAngles;
				}
				else if(x == gridSize/2 && y == gridSize - 2)
				{
					goal = mn;
					goalGO = go;
				} 
				
			}	
		}
		ColorStartAndEnd();
	}
	
	private void ResetGrid()
	{
		for(int x = 0; x < gridSize; x++)
		{
			for(int y = 0; y < gridSize; y++)
			{
				GameObject go = visibleCells[y*gridSize+x];
				MapNodeWrapper wrapper = (MapNodeWrapper)go.GetComponent("MapNodeWrapper");
				if(wrapper)
				{
					MapNode mn = map.GetNode(x,y);
					wrapper.theNode = mn;	
					mn.obstacle = false;
				}
				//Color the cell with its own texture
				Texture2D t = new Texture2D(1,1);
				t.SetPixel(0,0,Color.white);
				t.Apply();
				go.renderer.material.mainTexture = t;
				
			}	
		}	
	}
	
	private void ResetPath()
	{
		for(int x = 0; x < gridSize; x++)
		{
			for(int y = 0; y < gridSize; y++)
			{
				GameObject go = visibleCells[y*gridSize+x];
				MapNodeWrapper wrapper = (MapNodeWrapper)go.GetComponent("MapNodeWrapper");
				if(wrapper)
				{
					MapNode mn = map.GetNode(x,y);
			
					if(mn.obstacle)
						continue;
				}
				//Color the cell with its own texture
				Texture2D t = new Texture2D(1,1);
				t.SetPixel(0,0,Color.white);
				t.Apply();
				go.renderer.material.mainTexture = t;
				
			}	
		}	
		ColorStartAndEnd();
	}
	
	public void ColorStartAndEnd()
	{
		if(goalGO)
		{
			Texture2D greenTexture = new Texture2D(1,1);
			greenTexture.SetPixel(0,0,Color.green);
			greenTexture.Apply();
			goalGO.renderer.material.mainTexture = greenTexture;
		}
		
		if(startGO)
		{
			Texture2D redTexture = new Texture2D(1,1);
			redTexture.SetPixel(0,0,Color.red);
			redTexture.Apply();
			startGO.renderer.material.mainTexture = redTexture;
		}
	}
	
	public void FindPath()
	{
		if(goal != null && start != null)
		{
			Color c = new Color(0.7f,0.7f,0.0f);
			map.Reset();
			//****************************************
			//The actual call to find the path.  returns the path.
			//*
			pathNodes = AStar.Search(start,goal,map,heuristicWeight);
			//*
			//*
			//****************************************
			
			if(colorOpenList)
			{
				//Show the openList
				ArrayList openNodes = AStar.openList.GetAllNodes();
				for(int i = 0; i < openNodes.Count; i++)
				{
					MapNode node = (MapNode)openNodes[i];
					GameObject go = visibleCells[((int)node.position.y)*gridSize+((int)node.position.x)];
					//Color the cell with its own texture
					Texture2D t = new Texture2D(1,1);
					t.SetPixel(0,0,c);
					t.Apply();
					go.renderer.material.mainTexture = t;
					
				}
			}
			
			if(colorClosedList)
			{
				c = new Color(0.4f,0.4f,0.0f);
				//Show the closedList
				ArrayList closedNodes = AStar.closedList.GetAllNodes();
				for(int i = 0; i < closedNodes.Count; i++)
				{
					MapNode node = (MapNode)closedNodes[i];
					GameObject go = visibleCells[((int)node.position.y)*gridSize+((int)node.position.x)];
					//Color the cell with its own texture
					Texture2D t = new Texture2D(1,1);
					t.SetPixel(0,0,c);
					t.Apply();
					go.renderer.material.mainTexture = t;
					
				}
			}
			c = new Color(0,0,0.8f);
			//Now show the path!
			for(int i = 0; i < pathNodes.Count; i++)
			{
				MapNode node = (MapNode)pathNodes[i];
				GameObject go = visibleCells[((int)node.position.y)*gridSize+((int)node.position.x)];
				//Color the cell with its own texture
				Texture2D t = new Texture2D(1,1);
				t.SetPixel(0,0,c);
				t.Apply();
				go.renderer.material.mainTexture = t;
				
			}
			
			ColorStartAndEnd();
			
			following = true;
			
		}
	}*/
}
