Shader "Vongott/Rim Lighting" {
	Properties {
		_MainColor ( "Diffuse Color", Color ) = (0,0,0,0)
		_RimColor ( "Rim Color", Color ) = (1,1,1,1)
		_RimPower ( "Rim Power", Range(0.1,10) ) = 3.0
	}
	
	SubShader {
		Tags { "RenderType" = "Opaque" }
		
		CGPROGRAM
		#pragma surface surf Lambert
		
		struct Input {
			float3 viewDir;
		};		
		
		float4 _MainColor;
		float4 _RimColor;
		float _RimPower;
		
		void surf ( Input IN, inout SurfaceOutput o ) {
			o.Albedo = _MainColor.rgb;
						
			half rim = 1 - saturate ( dot ( normalize ( IN.viewDir ), o.Normal ) );
			
			o.Emission = _RimColor.rgb * pow ( rim, _RimPower );
		}
		
		ENDCG
	}
	
	Fallback "Diffuse"
}