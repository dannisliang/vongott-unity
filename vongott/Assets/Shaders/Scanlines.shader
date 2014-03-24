Shader "Vongott/Scanlines" {
	Properties {
		_LinesColor("LinesColor", Color) = (0,0,0,1)
		_LinesSize("LinesSize", Range(1,10)) = 1
	}

	SubShader {
		Pass {
			Lighting Off
			ZWrite Off
			Cull Off
			Blend SrcAlpha OneMinusSrcAlpha
			Tags {"Queue"="Transparent"}

         		CGPROGRAM
		 
			#pragma vertex vert 
			#pragma fragment frag
			#include "UnityCG.cginc"

			fixed4 _LinesColor;
			fixed _LinesSize;

			struct v2f {
				half4 pos:POSITION;
				half4 sPos:TEXCOORD;
			};
		 
			v2f vert ( appdata_base v ) {
				v2f o;
				o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
				o.sPos = ComputeScreenPos(o.pos);
			  	return o;
			}
		 
			fixed4 frag(v2f i) : COLOR {
				half2 p = i.sPos.xy / i.sPos.w;
				
				float4 newColor = _LinesColor;

				if ( (int) ( p.y * _ScreenParams.y / ( int ) _LinesSize ) % 2 == 0 ) {
					newColor.a *= 0.2;
				}
				
				return newColor; 
			}
		 
			ENDCG
   		}
	}
}
