var lineMaterial : Material;
 
function OnPostRender()
{
  	if ( !lineMaterial ) {
  		return;
  	}
  	
    lineMaterial.SetPass( 0 );
    GL.Begin( GL.LINES );
    GL.Color( Color(1,1,1,0.5) );
    GL.Vertex3( 0, 0, 0 );
    GL.Vertex3( 1, 0, 0 );
    GL.Vertex3( 0, 1, 0 );
    GL.Vertex3( 1, 1, 0 );
    GL.Vertex3( 0, 0, 0 );
    GL.Vertex3( 0, 1, 0 );
    GL.Vertex3( 1, 0, 0 );
    GL.Vertex3( 1, 1, 0 );
    GL.End();
}