/*! Shaderfield v1.0 — live shaders + motion effects for websites and video. One file, no dependencies.
 * Fret and Skein adapted from shader.gallery (MIT, E. T. Carter). Halo and Thermal are native rewrites
 * inspired by Paper Shaders. Current, Harmonia, Mesh and motion helpers are original to Shaderfield.
 */
(function () {
  "use strict";
  if (window.Shaderfield && window.Shaderfield.Field) return;
  const PALETTES = {
    ion: [[0.231, 0.510, 0.965], [0.659, 0.333, 0.969], [0.133, 0.827, 0.933], [0.957, 0.247, 0.369]],
    plasma: [[0.30, 0.20, 0.95], [1.0, 0.45, 0.15], [0.95, 0.25, 0.55], [0.15, 0.10, 0.45]],
    solar: [[0.55, 0.15, 0.08], [1.0, 0.85, 0.5], [1.0, 0.5, 0.1], [0.3, 0.08, 0.05]],
    ember: [[1.0, 0.45, 0.2], [1.0, 0.78, 0.4], [0.95, 0.25, 0.42], [0.6, 0.22, 0.9]],
    aurora: [[0.18, 0.86, 0.62], [0.22, 0.58, 1.0], [0.68, 0.94, 0.42], [0.12, 0.8, 0.88]],
    aqua: [[0.0, 0.733, 1.0], [0.0, 1.0, 0.882], [1.0, 1.0, 1.0], [0.16, 0.24, 0.6]],
    heat: [[0.196, 0.396, 0.906], [1.0, 0.302, 0.0], [1.0, 0.906, 0.478], [0.067, 0.125, 0.412]],
    mono: [[0.85, 0.87, 0.92], [0.55, 0.6, 0.72], [0.96, 0.96, 0.97], [0.45, 0.5, 0.62]],
    phosphor: [[0.290, 0.871, 0.502], [0.239, 0.863, 0.518], [0.85, 1.0, 0.9], [0.02, 0.12, 0.06]],
    cobalt: [[0.267, 0.455, 1.0], [0.169, 0.416, 1.0], [0.75, 0.82, 1.0], [0.02, 0.03, 0.1]],
    idea: [[0.227, 0.235, 0.965], [0.18, 0.847, 0.984], [0.604, 0.612, 0.953], [0.29, 0.675, 0.973]],
    synth: [[1.0, 0.31, 0.85], [1.0, 0.894, 0.361], [1.0, 0.373, 0.635], [0.043, 0.016, 0.125]],
    ledger: [[0.122, 0.616, 0.333], [0.086, 0.086, 0.086], [0.35, 0.8, 0.5], [0.98, 0.98, 0.973]],
  };
  const MESH_FILTER = { ember: "none", ion: "hue-rotate(185deg) saturate(1.1)", aurora: "hue-rotate(115deg) saturate(1.1)", mono: "grayscale(1) brightness(1.15)" };

  const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const HEAD = `precision highp float;
uniform float u_time; uniform vec2 u_resolution; uniform float u_pixelRatio; uniform vec3 u_palette[4]; uniform vec3 u_mouse;
`;
  const WHEEL = `float wheelW(float s,float c){float d=abs(s-c);return max(0.0,1.0-min(d,4.0-d));}
vec3 wheelCol(float k,vec3 c0,vec3 c1,vec3 c2,vec3 c3){float s=fract(k)*4.0;
float a=wheelW(s,0.0),b=wheelW(s,1.0),cc=wheelW(s,2.0),dd=wheelW(s,3.0);
return (c0*a+c1*b+c2*cc+c3*dd)/max(a+b+cc+dd,0.001);}
`;
  const HASH = "float hash21(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}\n";
  const VNOISE = "float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}\n";

  // ── Current (Blastlabs Flow): line-integral flow streaks ──
  const F_CURRENT = HEAD + `
uniform float u_scale; uniform float u_current; uniform float u_length; uniform float u_density; uniform float u_mouseInfluence;
const int NSTEP = 24;
float hash21(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
vec3 noised(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);vec2 du=30.0*f*f*(f*(f-2.0)+1.0);
float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));
float k1=b-a,k2=c-a,k3=a-b-c+d;float v=a+k1*u.x+k2*u.y+k3*u.x*u.y;return vec3(v,du.x*(k1+k3*u.y),du.y*(k2+k3*u.x));}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
const mat2 M2=mat2(0.80,0.60,-0.60,0.80);
vec2 velocity(vec2 p,float t,float scl,float cur){vec2 q=p*scl;vec3 n1=noised(q+vec2(t*0.11,-t*0.07));
vec3 n2=noised(M2*q*2.3+vec2(-t*0.16,t*0.12)+7.3);vec2 g=n1.yz+(M2*n2.yz*2.3)*0.45;vec2 v=vec2(g.y,-g.x)*0.55;v+=cur*vec2(0.96,0.28);return v;}
float specks(vec2 q,float dens){vec2 qa=vec2(0.94*q.x-0.34*q.y,0.34*q.x+0.94*q.y);float n=vnoise(qa*0.42+13.0);float thr=0.87-0.12*dens;
float faint=smoothstep(thr,thr+0.05,n);float leader=smoothstep(thr+0.05,thr+0.11,n);return faint*faint*0.25+leader;}
void main(){
vec3 c0=u_palette[0],c1=u_palette[1],c2=u_palette[2],c3=u_palette[3];
float pr=max(u_pixelRatio,0.25);vec2 res=u_resolution;float aspect=res.x/res.y;vec2 uv=gl_FragCoord.xy/res;
vec2 p=vec2((uv.x-0.5)*aspect,uv.y-0.5);float t=u_time;float scl=max(u_scale,0.3)*1.6;
float cur=clamp(u_current,0.0,2.0)*0.5;float dens=clamp(u_density,0.0,1.0);float lenPx=clamp(u_length,6.0,80.0);
float pxF=pr/res.y;float hF=lenPx/float(NSTEP)*pxF;float stepPx=lenPx/float(NSTEP);
vec2 mF=(u_mouse.xy/res-0.5)*vec2(aspect,1.0);float mAmt=u_mouseInfluence*u_mouse.z;
vec2 v0=velocity(p,t,scl,cur);{vec2 d=p-mF;float r2=dot(d,d)+0.01;v0+=mAmt*vec2(-d.y,d.x)*0.06/r2;}
float spd0=length(v0);float acc=0.0,wsum=0.0;float phaseK=6.2831/(lenPx*0.9);float travel=t*9.0;float spdSum=0.0;
float jit=hash21(gl_FragCoord.xy*0.731+0.5)-0.5;
for(int dir=0;dir<2;dir++){float sgn=(dir==0)?1.0:-1.0;vec2 q=p;
for(int i=0;i<NSTEP;i++){vec2 v=velocity(q,t,scl,cur);vec2 d=q-mF;float r2=dot(d,d)+0.01;v+=mAmt*vec2(-d.y,d.x)*0.06/r2;
float sp=length(v);float hh=(i==0)?hF*(0.5+jit):hF;q+=sgn*v/max(sp,1e-4)*hh;
float s=sgn*(float(i)+0.5+jit)*stepPx;float tap=1.0-float(i+1)/float(NSTEP+1);tap=tap*(2.0-tap);
float ph=0.72+0.28*cos(s*phaseK-travel*phaseK);float w=tap*ph;acc+=w*specks(q*res.y/pr,dens);wsum+=w;spdSum+=sp;}}
float lic=acc/max(wsum,1e-4);float spd=(spd0+spdSum)/float(2*NSTEP+1);
float spdN=clamp(spd/(0.42+cur*0.55),0.0,1.6);spdN=smoothstep(0.12,1.15,spdN)*1.3;float spdG=spdN*spdN*0.6;
float trail=smoothstep(0.008,0.16,lic);trail*=0.12+0.88*spdN*sqrt(spdN);trail+=0.45*smoothstep(0.22,0.60,lic)*spdG;
vec3 slowCol=mix(c0,c3,0.35)*0.55;vec3 fastCol=c2;vec3 hotCol=mix(c1,vec3(1.0),0.35);
vec3 lineCol=mix(slowCol,fastCol,smoothstep(0.10,0.65,spdN));lineCol=mix(lineCol,hotCol,smoothstep(0.75,1.25,spdN));
float mottle=vnoise(p*3.0+vec2(t*0.05,0.0))*0.5+vnoise(p*7.0-vec2(0.0,t*0.04))*0.5;
vec3 deep=mix(c3,c0,0.4)*0.07+vec3(0.008,0.010,0.016);vec3 haze=mix(c0,c2,0.5)*0.22;
vec3 ground=mix(deep,haze,spdG*(0.55+0.25*mottle));ground+=c1*0.04*smoothstep(0.9,1.3,spdN);
vec3 col=ground+lineCol*trail*1.15;col+=fastCol*0.03*spdG;
vec2 vq=uv-0.5;col*=1.0-0.20*smoothstep(0.30,1.0,length(vq)*1.42);
gl_FragColor=vec4(col,1.0);}`;

  const SHOCK = "uniform vec2 u_wc; uniform vec2 u_shockC; uniform float u_shockR; uniform float u_shockA; uniform float u_ca;\n";

  // ── Fret (Nodepath): Truchet circuits ──
  const F_FRET = HEAD + SHOCK + `
uniform float u_scale; uniform float u_line; uniform float u_phase; uniform float u_glow; uniform float u_weld; uniform float u_seed;
uniform vec2 u_pan; uniform float u_pulse; uniform float u_rot; uniform float u_warp;
` + HASH + WHEEL + `
vec3 maze(vec2 fc){
float pr=u_pixelRatio; vec2 res=u_resolution; vec2 ctr=res*0.5; float t=u_time; float HALFPI=1.5707963;
float refScale=min(res.x,res.y)/(max(pr,1.0)*400.0);
float cell=max(u_scale,8.0)*refScale*pr;
vec2 p=fc-u_wc;
float rn=length(p)/min(res.x,res.y);
float sa=u_rot+u_warp*3.0*(1.0-smoothstep(0.0,0.9,rn));
float cs=cos(sa), sn=sin(sa); p=mat2(cs,sn,-sn,cs)*p; p+=u_wc-ctr;
vec2 uv=p/cell+u_pan;
vec2 id=floor(uv); vec2 f=fract(uv);
float hsh=hash21(id+vec2(u_seed*1.7,u_seed*2.3));
if(hsh>0.5) f.x=1.0-f.x;
float d1=abs(length(f)-0.5); float d2=abs(length(f-vec2(1.0))-0.5);
float d,ang;
if(d1<d2){d=d1;ang=atan(f.y,f.x);}else{d=d2;ang=atan(1.0-f.y,1.0-f.x);}
float lw=max(u_line,0.5)*refScale*pr/cell;
float core=smoothstep(lw,lw*0.25,d);
float halo=lw/(d+lw*1.4); halo=halo*halo*(0.4+0.7*u_glow);
vec3 c0=u_palette[0],c1=u_palette[1],c2=u_palette[2],c3=u_palette[3];
float hue=dot(uv,vec2(0.06,0.085))+hsh*0.12*(1.0-u_weld)+t*0.02;
vec3 pathCol=wheelCol(hue,c0,c1,c2,c3);
float dirn=(hsh>0.5)?-1.0:1.0;
float sLocal=ang/HALFPI+(id.x+id.y)*0.5;
float ph=mix((sLocal-u_phase)*dirn,dot(uv,vec2(0.5))-u_phase,u_weld);
float pulse=0.5+0.5*sin(6.2831853*ph); pulse=pow(pulse,3.0)*u_pulse;
float ring=u_shockA*exp(-pow((length(fc-u_shockC)-u_shockR)/(cell*0.9),2.0));
float lit=core*(0.85+1.0*pulse)+halo*(0.7+0.6*pulse);
lit*=1.0+ring*4.0;
float rr=length((fc-ctr)/res);
vec3 ground=wheelCol(0.55+rr*0.3+t*0.01,c0,c1,c2,c3)*0.16;
vec3 col=ground+pathCol*lit+pathCol*core*pulse*0.7+mix(pathCol,vec3(1.0),0.5)*ring*0.25;
col*=mix(0.9,1.0,1.0-smoothstep(0.7,1.35,rr));
return col;}
void main(){
vec2 fc=gl_FragCoord.xy; vec3 col;
if(u_ca>0.05){
 vec2 dir=normalize(fc-u_resolution*0.5+0.001)*u_ca*u_pixelRatio;
 col=vec3(maze(fc+dir).r,maze(fc).g,maze(fc-dir).b);
} else col=maze(fc);
gl_FragColor=vec4(col,1.0);
}`;

  // ── Skein (Weftline): woven filaments ──
  const F_SKEIN = HEAD + SHOCK + `
uniform float u_scale; uniform float u_line; uniform float u_phase; uniform float u_glow; uniform float u_wave; uniform float u_wphase;
uniform float u_vary; uniform float u_rotate; uniform float u_scatter; uniform float u_depth; uniform float u_seed;
uniform float u_pulse; uniform float u_draw; uniform float u_panx;
` + HASH + WHEEL + `
vec3 skein(vec2 fc){
float pr=u_pixelRatio; vec2 res=u_resolution; vec2 ctr=res*0.5; float t=u_time;
float refScale=min(res.x,res.y)/(max(pr,1.0)*400.0);
float cell=max(u_scale,8.0)*refScale*pr;
float rad=u_rotate*0.0174532925; float ca=cos(rad), sa=sin(rad);
vec2 pp=fc-ctr;
vec2 uv=vec2(ca*pp.x+sa*pp.y,-sa*pp.x+ca*pp.y)/cell; uv.x+=u_panx;
vec2 sd=vec2(u_seed*31.7,u_seed*17.3);
float best=1e3, bestId=0.0;
for(int k=-2;k<=2;k++){
 float yId=floor(uv.y)+float(k);
 float jit=(hash21(vec2(yId,5.0)+sd)-0.5)*u_scatter*0.7;
 float rA=hash21(vec2(yId,21.0)+sd); float rF=hash21(vec2(yId,22.0)+sd);
 float rP=hash21(vec2(yId,23.0)+sd); float rS=hash21(vec2(yId,24.0)+sd);
 float dir=hash21(vec2(yId,25.0)+sd)<0.5?-1.0:1.0;
 float amp=u_wave*mix(1.0,0.35+1.3*rA,u_vary);
 float frq=1.2*mix(1.0,0.5+1.1*rF,u_vary);
 float spd=mix(1.0,dir*(0.3+1.6*rS),u_vary);
 float phs=yId*1.7+u_seed*1.37+u_vary*rP*6.2831853;
 float cy=yId+0.5+jit+amp*sin(uv.x*frq+phs+u_wphase*spd);
 float dd=abs(uv.y-cy);
 if(dd<best){best=dd;bestId=yId;}
}
float d=best;
float depth=1.0-hash21(vec2(bestId,11.0)+sd)*u_depth*0.7;
float lw=max(u_line,0.5)*refScale*pr/cell*mix(0.6,1.0,depth);
float core=smoothstep(lw,lw*0.25,d);
float halo=lw/(d+lw*1.4); halo=halo*halo*(0.4+0.7*u_glow);
vec3 c0=u_palette[0],c1=u_palette[1],c2=u_palette[2],c3=u_palette[3];
float hue=bestId*0.14+hash21(vec2(bestId,3.0)+sd)*0.1+t*0.02;
vec3 pathCol=wheelCol(hue,c0,c1,c2,c3);
float dirn=mod(bestId,2.0)<0.5?1.0:-1.0;
float ph=uv.x*0.5*dirn-u_phase*dirn+bestId*0.5;
float pulse=0.5+0.5*sin(6.2831853*ph); pulse=pow(pulse,3.0)*u_pulse;
float edge=u_draw*1.5-0.25-hash21(vec2(bestId,7.0)+sd)*0.25;
float mask=smoothstep(edge+0.02,edge-0.06,fc.x/res.x);
float ring=u_shockA*exp(-pow((length(fc-u_shockC)-u_shockR)/(cell*0.9),2.0));
float lit=(core*(0.85+1.0*pulse)+halo*(0.7+0.6*pulse))*depth*mask;
lit*=1.0+ring*4.0;
float rr=length((fc-ctr)/res);
vec3 ground=wheelCol(0.55+rr*0.3+t*0.01,c0,c1,c2,c3)*0.16;
vec3 col=ground+pathCol*lit+pathCol*core*pulse*0.7*mask+mix(pathCol,vec3(1.0),0.5)*ring*0.25;
col*=mix(0.9,1.0,1.0-smoothstep(0.7,1.35,rr));
return col;}
void main(){
vec2 fc=gl_FragCoord.xy; vec3 col;
if(u_ca>0.05){
 vec2 dir=normalize(fc-u_resolution*0.5+0.001)*u_ca*u_pixelRatio;
 col=vec3(skein(fc+dir).r,skein(fc).g,skein(fc-dir).b);
} else col=skein(fc);
gl_FragColor=vec4(col,1.0);
}`;

  // ── Harmonia: modular times-table chords ──
  const F_HARMONIA = HEAD + `
uniform float u_points; uniform float u_mult; uniform float u_line; uniform float u_R; uniform vec2 u_ctr;
uniform float u_glow; uniform float u_spin; uniform float u_dots; uniform float u_bg; uniform float u_mult2; uniform float u_ring;
const vec3 BG=vec3(0.035,0.035,0.043); const int MAXP=150;
` + WHEEL + `
float segDist(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),1.0),0.0,1.0);return length(pa-ba*h);}
void main(){
vec2 fc=gl_FragCoord.xy; vec2 res=u_resolution; float t=u_time;
float lw=max(u_line,0.2)*min(res.x,res.y)/400.0;
float nP=max(floor(u_points+0.5),6.0);
float R=u_R; vec2 ctr=u_ctr; float TWO=6.2831853;
vec3 c0=u_palette[0],c1=u_palette[1],c2=u_palette[2],c3=u_palette[3];
vec3 acc=vec3(0.0);
if(length(fc-ctr)<R+lw*40.0){
for(int i=0;i<MAXP;i++){
 if(float(i)>=nP) break;
 float fi=float(i);
 float aA=TWO*fi/nP+u_spin; float aB=TWO*(fi*u_mult)/nP+u_spin;
 vec2 A=ctr+R*vec2(cos(aA),sin(aA)); vec2 B=ctr+R*vec2(cos(aB),sin(aB));
 float d=segDist(fc,A,B);
 float core=smoothstep(lw,0.0,d);
 float halo=lw/(d+lw*1.4); halo=halo*halo*0.5;
 float dA=length(fc-A); float dt=smoothstep(lw*2.8,lw*1.5,dA)*u_dots;
 vec3 cc=wheelCol(fi/nP+t*0.008,c0,c1,c2,c3);
 acc+=cc*((core+halo*u_glow)*0.42+dt*0.9);
}}
if(u_bg>0.01){
 vec2 bc=res*0.5; vec2 erad=res*0.66; float nP2=64.0; float spin2=-t*0.007;
 vec3 bg=vec3(0.0);
 for(int i=0;i<64;i++){
  float fi=float(i);
  float aA=TWO*fi/nP2+spin2; float aB=TWO*(fi*u_mult2)/nP2+spin2;
  vec2 A=bc+erad*vec2(cos(aA),sin(aA)); vec2 B=bc+erad*vec2(cos(aB),sin(aB));
  float d=segDist(fc,A,B);
  bg+=wheelCol(fi/nP2+0.3+t*0.005,c0,c1,c2,c3)*smoothstep(lw*1.5,0.0,d)*0.13;
 }
 acc+=bg*u_bg;
}
if(u_ring>0.0){float dr=abs(length(fc-ctr)-R);acc+=mix(vec3(1.0),c2,0.35)*smoothstep(lw*1.1,0.0,dr)*0.55*u_ring;}
acc=vec3(1.0)-exp(-acc*1.1);
gl_FragColor=vec4(BG+acc,1.0);
}`;

  // ── Halo (Gloww / Coming Soon): radial bloom with wandering focal point ──
  const F_HALO = HEAD + HASH + `
uniform float u_radius; uniform float u_falloff; uniform float u_core; uniform float u_grain; uniform vec2 u_focal;
void main(){vec2 res=u_resolution;vec2 fc=gl_FragCoord.xy;float m=min(res.x,res.y);vec2 p=(fc-res*0.5)/m;
vec3 c0=u_palette[0],c1=u_palette[1],c2=u_palette[2];
float r=max(u_radius,0.01);float d0=length(p)/r;
vec2 q=p-u_focal*r*0.85*(1.0-clamp(d0,0.0,1.0));float d=length(q)/r;
float g=clamp(1.0-d,0.0,1.0);g=pow(g,0.35/max(u_falloff,0.02));
vec3 col=c0*smoothstep(0.0,0.45,g);
col=mix(col,c1,smoothstep(0.3,0.75,g));
col=mix(col,mix(c2,vec3(1.0),0.6),smoothstep(0.68,1.0,g)*u_core);
col+=(hash21(fc+fract(u_time*7.3)*91.0)-0.5)*u_grain;
gl_FragColor=vec4(max(col,0.0),1.0);}`;

  // ── Thermal (Shader Trials): contoured heat field ──
  const F_THERMAL = HEAD + HASH + VNOISE + `
uniform float u_blobs; uniform float u_size; uniform float u_bands; uniform float u_contour; uniform float u_glow; uniform float u_grain;
vec3 ramp(float x,vec3 a,vec3 b,vec3 c,vec3 d){x=clamp(x,0.0,1.0)*5.0;
if(x<1.0)return mix(vec3(0.0),a,x);if(x<2.0)return mix(a,b,x-1.0);if(x<3.0)return mix(b,c,x-2.0);if(x<4.0)return mix(c,d,x-3.0);return mix(d,vec3(1.0),(x-4.0)*0.6);}
void main(){vec2 res=u_resolution;vec2 fc=gl_FragCoord.xy;float m=min(res.x,res.y);vec2 p=(fc-res*0.5)/m;float t=u_time;float asp=res.x/m;
vec3 c0=u_palette[0],c1=u_palette[1],c2=u_palette[2],c3=u_palette[3];
p+=0.035*(vec2(vnoise(p*4.0+t*0.3),vnoise(p*4.0-t*0.27+5.0))-0.5);
float f=0.0;
for(int i=0;i<6;i++){float fi=float(i);if(fi>=u_blobs)break;
vec2 c=vec2(sin(t*0.23*(1.0+fi*0.21)+fi*1.7)*0.36*asp,cos(t*0.19*(1.0+fi*0.13)+fi*2.3)*0.28);
float r=(0.10+0.035*sin(fi*3.1+t*0.4))*u_size;f+=r*r/(dot(p-c,p-c)+0.004);}
vec2 mp=(u_mouse.xy-res*0.5)/m;float mr=0.11*u_size;f+=u_mouse.z*mr*mr/(dot(p-mp,p-mp)+0.004);
float h=1.0-exp(-f*(0.18+0.4*u_glow));
float b=max(u_bands,1.0);float hq=floor(h*b)/b;float hh=mix(h,hq,u_contour*0.75);
float e=abs(fract(h*b)-0.5);float line=(1.0-smoothstep(0.0,0.07,0.5-e))*u_contour*smoothstep(0.04,0.2,h);
vec3 col=ramp(hh,c3,c0,c2,c1);
col+=line*mix(c1,vec3(1.0),0.5)*0.35;
vec2 vq=fc/res-0.5;col*=1.0-0.25*smoothstep(0.3,0.9,length(vq)*1.4);
col+=(hash21(fc+fract(t*7.3)*91.0)-0.5)*u_grain;
gl_FragColor=vec4(max(col,0.0),1.0);}`;


  // ── Shared helpers for textured (WebGL2) effects ──
  const VERT2 = "#version 300 es\nin vec2 a;out vec2 vUv;void main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.,1.);}";
  const GLYPH_SETS = {
    ascii: [0, 128, 131200, 14336, 459200, 469440, 4357252, 18157905, 11512810, 15724526],
    blocks: [0, 328000, 22041621, 22369621, 11512810, 33554431],
    binary: [0, 4591758, 15324974],
  };
  const CHARSET_NAMES = Object.keys(GLYPH_SETS);
  const glyphBits = (i) => { const r = GLYPH_SETS[CHARSET_NAMES[Math.round(i) | 0]] || GLYPH_SETS.ascii, g = new Uint32Array(16); r.forEach((v, k) => (g[k] = v >>> 0)); return { bits: g, count: r.length }; };
  const hex3 = (h) => { h = (h || "#000").replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const lum3 = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif', MONO_F = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace', SERIF_F = '"Instrument Serif", "Times New Roman", serif';
  const PANELS = new Map();
  // Text panel: lines centred on a solid ground. size is a fraction of height; text is fitted to 86% of the width.
  function textPanel(w, h, text, o = {}) {
    const key = [w, h, text, o.size, o.font, o.weight, o.fg, o.bg, o.ls, o.fit, o.align].join("|");
    if (PANELS.has(key)) return PANELS.get(key);
    if (PANELS.size > 40) PANELS.clear();
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"), lines = String(text || "").split("\n");
    if (o.bg !== "transparent") { x.fillStyle = o.bg || "#000"; x.fillRect(0, 0, w, h); }
    let size = (o.size || 0.06) * h; const font = (s) => `${o.weight || 500} ${s}px ${o.font || SANS}`;
    x.font = font(size); if ("letterSpacing" in x) x.letterSpacing = o.ls || "0em";
    const mw = Math.max(1, ...lines.map(l => x.measureText(l).width)), fit = (o.fit || 0.86) * w;
    if (mw > fit) { size *= fit / mw; x.font = font(size); }
    x.fillStyle = o.fg || "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
    const lh = size * (o.lh || 1.18), top = h / 2 - ((lines.length - 1) * lh) / 2;
    let tw = 0; lines.forEach((l, i) => { x.fillText(l, w / 2, top + i * lh); tw = Math.max(tw, x.measureText(l).width); });
    const th = (lines.length - 1) * lh + size * 1.5;
    c._rect = [(w / 2 - tw / 2 - 6) / w, (h / 2 - th / 2) / h, (w / 2 + tw / 2 + 6) / w, (h / 2 + th / 2) / h];
    c._size = size; PANELS.set(key, c); return c;
  }
  const ATLASES = {};
  function glyphAtlas(charset) {
    if (ATLASES[charset]) return ATLASES[charset];
    const glyphs = Array.from(new Set(Array.from(charset))).filter(g => g.trim());
    const count = glyphs.length, grid = Math.ceil(Math.sqrt(count)), cp = 64;
    const c = document.createElement("canvas"); c.width = c.height = grid * cp;
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `600 ${Math.round(cp * 0.72)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    glyphs.forEach((g, i) => x.fillText(g, ((i % grid) + 0.5) * cp, (Math.floor(i / grid) + 0.5) * cp));
    return (ATLASES[charset] = { canvas: c, count, grid });
  }
  const phrases = (c, e) => String(c.text || e.text || "").split("|");
  const KATAKANA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z*+-<>¦=:.";
  const wander = (c, t, ax = 0.3, ay = 0.18) => { const wx = 0.5 + ax * Math.sin(t * 0.47) + 0.06 * Math.sin(t * 1.3), wy = 0.5 + ay * Math.sin(t * 0.71 + 1) ; return [lerp(wx, c.mouse[0] / c.w, c.mouse[2]), lerp(wy, 1 - c.mouse[1] / c.h, c.mouse[2])]; };

  // ── Sweep (AI Revolution Sweep): a glyph band swaps one line for the next ──
  const F_SWEEP = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uFrom; uniform sampler2D uTo;
uniform vec2 uResolution; uniform float uProgress; uniform vec2 uDir;
uniform float uBand; uniform float uSoftness; uniform float uTurbulence; uniform float uTrail;
uniform float uGlyphPx; uniform float uSpacing;
uniform uint uGlyphs[16]; uniform int uGlyphCount;
uniform vec3 uInk; uniform float uTint; uniform float uGlow; uniform float uAberration;
uniform float uFlicker; uniform float uDensity; uniform float uDisplace; uniform float uContrast;
uniform float uBrightness; uniform float uThreshold; uniform float uFade;
uniform vec3 uBg; uniform float uBgLum; uniform float uTime; uniform float uLod;
#define S(a, b, t) smoothstep(a, b, t)
float glyphBit (int index, ivec2 p) {
  if (p.x < 0 || p.x > 4 || p.y < 0 || p.y > 4) return 0.0;
  uint bits = uGlyphs[index];
  return float((bits >> uint((4 - p.x) + 5 * p.y)) & 1u);
}
float hash21 (vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash31 (vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
vec4 panel (sampler2D tex, vec2 uv, float lod, vec2 fringe) {
  vec4 c = textureLod(tex, uv, lod);
  c.r = textureLod(tex, uv + fringe, lod).r;
  c.b = textureLod(tex, uv - fringe, lod).b;
  return c;
}
float L(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
void main () {
  vec2 uv = vUv;
  float cellPx = max((5.0 + 2.0 * uSpacing) * uGlyphPx, 1.0);
  vec2 frag = uv * uResolution;
  vec2 cell = floor(frag / cellPx);
  vec2 cellUv = (cell + 0.5) * cellPx / uResolution;
  float extent = max(0.5 * (abs(uDir.x) + abs(uDir.y)), 1e-4);
  float axis = dot(cellUv - 0.5, uDir) / (2.0 * extent) + 0.5;
  float band = max(uBand, 1e-3);
  float rowSeed = hash21(vec2(floor(cell.y * 0.5), 19.7)) - 0.5;
  float cellSeed = hash21(cell * 0.37 + 3.1) - 0.5;
  axis += (rowSeed * 0.8 + cellSeed * 0.4) * uTurbulence * band;
  float feather = max(clamp(uSoftness, 0.0, 1.0) * band, 1e-4);
  float glowSpan = band * (1.0 + uTrail) + feather;
  float travel = 1.0 + band * (1.0 + uTrail) + uTurbulence * band;
  float behind = uProgress * travel - axis;
  float swap = S(band * 0.30, band * 0.62, behind);
  float enter = S(0.0, feather, behind);
  float leave = 1.0 - S(band, band + max(uTrail, 0.001) * band, behind);
  float ascii = clamp(enter * leave, 0.0, 1.0);
  float aura = (1.0 - S(0.0, glowSpan, abs(behind - band * 0.5))) * S(-feather * 2.0, feather, behind);
  vec2 fringe = (uDir * uAberration * max(ascii, aura * 0.5)) / uResolution;
  vec2 texUv = vec2(uv.x, 1.0 - uv.y);
  float sliceH = max(cellPx * 1.6, 2.0);
  float slice = floor(frag.y / sliceH);
  float tick = floor(uTime * 12.0);
  float tear = (hash21(vec2(slice * 1.7, tick * 0.31)) - 0.5) * step(0.45, hash21(vec2(slice, tick)));
  texUv.x += (tear * 2.0 * uDisplace * ascii) / uResolution.x;
  vec4 rawFrom = panel(uFrom, texUv, 0.0, fringe);
  vec4 rawTo = panel(uTo, texUv, 0.0, fringe);
  vec3 base = mix(rawFrom.rgb, rawTo.rgb, swap);
  vec2 cellTexUv = vec2(cellUv.x, 1.0 - cellUv.y);
  if (aura > 0.002) {
    vec2 spread = vec2(cellPx) / uResolution;
    float edge = 0.0;
    for (int i = 0; i < 5; i++) {
      vec2 tap = vec2(float(i == 1) - float(i == 2), float(i == 3) - float(i == 4)) * spread;
      vec3 sh = mix(textureLod(uFrom, texUv + tap, uLod).rgb, textureLod(uTo, texUv + tap, uLod).rgb, swap);
      vec3 br = mix(textureLod(uFrom, texUv + tap, uLod + 2.5).rgb, textureLod(uTo, texUv + tap, uLod + 2.5).rgb, swap);
      edge += abs(L(sh) - L(br));
    }
    edge = clamp(edge / (5.0 * 0.16), 0.0, 1.0);
    base += uInk * edge * aura * clamp(uGlow, 0.0, 2.0) * 0.5 * 1.4;
  }
  if (ascii > 0.002) {
    vec3 cellRgb = mix(panel(uFrom, cellTexUv, uLod, fringe).rgb, panel(uTo, cellTexUv, uLod, fringe).rgb, swap);
    float lum = L(cellRgb);
    float ink = abs(lum - uBgLum);
    float present = S(uThreshold * 0.5, uThreshold + 0.02, ink);
    vec3 broadRgb = mix(textureLod(uFrom, cellTexUv, uLod + 2.5).rgb, textureLod(uTo, cellTexUv, uLod + 2.5).rgb, swap);
    float detail = abs(lum - L(broadRgb));
    present *= mix(0.5, 1.0, S(0.01, uThreshold + 0.06, detail));
    present *= step(hash21(cell + 11.3), clamp(uDensity, 0.0, 1.0));
    float roll = hash31(vec3(cell, floor(uTime * 18.0)));
    present *= 1.0 - clamp(uFlicker, 0.0, 1.0) * step(roll, 0.4);
    float t = clamp(ink / 0.35, 0.0, 1.0);
    float amount = clamp((t - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
    float churn = hash31(vec3(cell, floor(uTime * 15.0))) - 0.5;
    float picked = clamp(amount + churn * 0.25, 0.0, 1.0);
    int index = min(int(picked * float(uGlyphCount)), uGlyphCount - 1);
    ivec2 local = ivec2(floor((frag - cell * cellPx) / max(uGlyphPx, 0.001)));
    int pad = int(uSpacing);
    float on = glyphBit(index, ivec2(local.x - pad, local.y - pad));
    vec3 contentInk = clamp(uBg + (cellRgb - uBg) / max(ink, 0.2), 0.0, 1.0);
    vec3 glyphColor = mix(contentInk, uInk, clamp(uTint, 0.0, 1.0));
    float level = 0.72 + 0.28 * hash21(cell * 0.91 + 7.7);
    glyphColor *= level;
    glyphColor = mix(glyphColor, vec3(1.0), amount * amount * level * 0.55);
    float lit = on * ascii * present;
    base = mix(base, uBg, clamp(uFade, 0.0, 1.0) * ascii * (1.0 - on));
    base = base + glyphColor * lit;
  }
  outColor = vec4(clamp(base, 0.0, 1.0), 1.0);
}`;
  // ── Rain (Living in the Matrix): glyph rain that lights the page beneath it ──
  const F_RAIN = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent; uniform sampler2D uAtlas;
uniform vec2 uResolution; uniform float uTime; uniform float uCell;
uniform float uGlyphCount; uniform float uAtlasGrid;
uniform vec3 uColor; uniform vec3 uHeadColor;
uniform float uSpeed; uniform float uSpeedVar; uniform float uDensity; uniform float uTrail;
uniform float uGlow; uniform float uMutate; uniform float uLayers; uniform float uDim;
uniform float uLight; uniform float uLightRadius; uniform float uLightHeight; uniform float uRelief;
uniform vec3 uBg; uniform float uShow;
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float glyphMask(vec2 px, float cell, float seed) {
  vec2 id = floor(px / cell);
  vec2 f = fract(px / cell); f = f * 0.74 + 0.13; f.x = 1.0 - f.x;
  float tick = floor(uTime * uMutate * 1.6 + hash21(id + seed) * 9.0);
  float idx = floor(hash21(id * 1.71 + vec2(seed + tick * 7.31, tick * 0.613)) * uGlyphCount);
  vec2 auv = (vec2(mod(idx, uAtlasGrid), floor(idx / uAtlasGrid)) + f) / uAtlasGrid;
  return texture(uAtlas, auv).a;
}
float colSpeed(float col, float seed) { return uSpeed * mix(1.0, mix(0.35, 1.0, hash11(col * 0.37 + seed + 3.1)), uSpeedVar) * 0.5; }
float colOffset(float col, float seed) { return hash11(col * 1.713 + seed) * 9.0; }
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3 page(vec2 uv) { return mix(uBg, texture(uContent, clamp(uv, 0.0, 1.0)).rgb, uShow); }
void main () {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 cuv = vec2(vUv.x, 1.0 - vUv.y);
  float yn = 1.0 - frag.y / uResolution.y;
  const float scales[3] = float[3](1.0, 1.5, 2.2);
  const float weights[3] = float[3](1.0, 0.45, 0.22);
  const float seeds[3] = float[3](0.0, 19.7, 41.3);
  float g = 0.0, headG = 0.0;
  for (int l = 0; l < 3; l++) {
    if (float(l) >= uLayers) break;
    float cell = uCell * scales[l];
    float col = floor(frag.x / cell);
    float sp = colSpeed(col, seeds[l]);
    float T = uTime * sp + colOffset(col, seeds[l]);
    float phase = fract(yn + T), cyc = floor(yn + T);
    float gate = step(hash21(vec2(col, cyc) + seeds[l]), uDensity);
    float b = clamp(uTrail / (phase * 22.0), 0.0, 1.3) - 0.04;
    if (b <= 0.0 || gate < 0.5) continue;
    float m = glyphMask(frag, cell, seeds[l] + cyc * 0.173);
    float head = 1.0 - smoothstep(0.0, cell / uResolution.y * 1.2, phase);
    g += m * b * weights[l] * (1.0 + head * uGlow * 1.4);
    headG += m * head * weights[l] * uGlow;
  }
  vec3 content = page(cuv);
  vec2 e = vec2(3.0, 0.0) / uResolution;
  float lC = lum(content);
  vec3 N = normalize(vec3(-(lum(page(cuv + e.xy)) - lum(page(cuv - e.xy))) * uRelief * 4.0,
                          -(lum(page(cuv + e.yx)) - lum(page(cuv - e.yx))) * uRelief * 4.0, 1.0));
  float reliefMix = clamp(uRelief, 0.0, 1.0);
  float lightSum = 0.0;
  float sigma2 = uLightRadius * uLightRadius * 0.5;
  float reach = uLightRadius * 1.6;
  float stride = max(1.0, ceil((uLightRadius * 1.7) / (uCell * 12.0)));
  float baseCol = floor(floor(frag.x / uCell) / stride);
  for (int o = -12; o <= 12; o++) {
    float c = (baseCol + float(o)) * stride;
    if (c < 0.0) continue;
    float dx = (c + 0.5) * uCell - frag.x;
    float wx = 1.0 - smoothstep(reach * 0.7, reach, abs(dx));
    if (wx <= 0.0) continue;
    float T = uTime * colSpeed(c, 0.0) + colOffset(c, 0.0);
    float k0 = floor(1.0 - frag.y / uResolution.y + T);
    for (int h = 0; h < 2; h++) {
      float k = k0 + float(h);
      if (step(hash21(vec2(c, k)), uDensity) < 0.5) continue;
      float lamp = 0.6 + 0.4 * hash11(c * 3.97 + k * 0.713);
      vec3 dv = vec3(dx, (1.0 - (k - T)) * uResolution.y - frag.y, uLightHeight);
      float d2 = dot(dv, dv);
      vec3 L = dv * inversesqrt(max(d2, 1.0));
      lightSum += exp(-d2 / sigma2) * mix(1.0, 0.25 + 0.75 * max(dot(N, L), 0.0), reliefMix) * wx * lamp;
    }
  }
  float ls = lightSum * uLight * (0.6 + 0.4 * uGlow);
  float lit = 2.2 * ls / (ls + 1.1);
  vec3 col = content * mix(clamp(1.0 - uDim, 0.0, 1.0), 1.0, smoothstep(0.0, 1.0, lit));
  col += uColor * lit * 0.03 * (1.0 - lC * 0.75);
  vec3 glyphCol = mix(mix(uColor, uColor * 0.24 + vec3(0.02), lC), uHeadColor, clamp(headG, 0.0, 1.0));
  float gA = clamp(g, 0.0, 1.0);
  col = col * (1.0 - gA * mix(0.3, 0.88, lC)) + glyphCol * min(g, 1.5) * mix(1.0, 0.92, lC);
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
  // ── Asciify lens + glyph graph (It Pays Off) ──
  const F_ASCII = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform vec2 uResolution; uniform float uGlyphPx; uniform float uSpacing;
uniform uint uGlyphs[16]; uniform int uGlyphCount;
uniform float uRadius; uniform float uSoftness; uniform vec2 uPointer; uniform float uActive;
uniform vec3 uBg; uniform float uBackingLum; uniform float uBgOpacity; uniform float uLod;
uniform float uContrast; uniform float uBrightness; uniform float uInvert; uniform float uStrength;
uniform float uDotPx; uniform float uDotLod; uniform float uGlowAmt; uniform float uAberration;
uniform float uReveal; uniform float uErase; uniform vec4 uTextRect; uniform float uTextMode;
uniform float uTime; uniform float uLoop; uniform vec3 uGraphInk; uniform float uGraphH; uniform float uGraphOn; uniform float uTotal;
#define S(a, b, t) smoothstep(a, b, t)
float glyphBit (int index, ivec2 p) {
  if (p.x < 0 || p.x > 4 || p.y < 0 || p.y > 4) return 0.0;
  uint bits = uGlyphs[index];
  return float((bits >> uint((4 - p.x) + 5 * p.y)) & 1u);
}
float hash21 (vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec4 C (vec2 uv, float lod) {
  vec4 c = textureLod(uContent, uv, lod);
  float g = S(uErase - 0.003, uErase + 0.003, uv.x) * (1.0 - S(uReveal - 0.003, uReveal + 0.003, uv.x));
  return vec4(mix(uBg, c.rgb, g), 1.0);
}
vec4 sampleFringe (vec2 uv, float lod, vec2 off) {
  vec4 c = C(uv, lod);
  c.r = C(uv + off, lod).r;
  c.b = C(uv - off, lod).b;
  return c;
}
vec4 sceneMain () {
  vec2 uv = vUv;
  float cellPx = (5.0 + 2.0 * uSpacing) * uGlyphPx;
  vec2 frag = uv * uResolution;
  vec2 cell = floor(frag / cellPx);
  vec2 cellUv = (cell + 0.5) * cellPx / uResolution;
  float aspect = uResolution.x / uResolution.y;
  float dist = length((cellUv - uPointer) * vec2(aspect, 1.0));
  float radius = max(uRadius * uActive, 1e-4);
  float inner = radius * (1.0 - clamp(uSoftness, 0.0, 1.0));
  float lens = (1.0 - S(inner, radius, dist)) * uActive;
  float mask = clamp(lens, 0.0, 1.0) * clamp(uStrength, 0.0, 1.0);
  float apply = mask < 0.003 ? 0.0 : step(hash21(cell), mask);
  vec2 texUv = vec2(uv.x, 1.0 - uv.y);
  if (apply < 0.5) return C(texUv, 0.0);
  vec2 textureUv = vec2(cellUv.x, 1.0 - cellUv.y);
  vec2 lensDir = (cellUv - uPointer) * vec2(aspect, 1.0);
  vec2 fringe = normalize(lensDir + 1e-5) * clamp(uAberration, 0.0, 1.0) * 0.005 * S(uRadius * 0.15, uRadius, dist) * uActive;
  fringe = vec2(fringe.x / aspect, -fringe.y);
  float inRect = step(uTextRect.x, texUv.x) * step(texUv.x, uTextRect.z) * step(uTextRect.y, texUv.y) * step(texUv.y, uTextRect.w);
  if (inRect * uTextMode > 0.5) {
    vec2 dotIdx = floor(frag / uDotPx);
    vec2 dotUv = (dotIdx + 0.5) * uDotPx / uResolution;
    vec2 fUv = vec2(dotUv.x, 1.0 - dotUv.y);
    vec4 ink = sampleFringe(fUv, uDotLod, fringe);
    float inkLum = dot(ink.rgb, vec3(0.299, 0.587, 0.114));
    float density = abs(inkLum - uBackingLum);
    density = clamp((density - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
    density = mix(density, 1.0 - density, clamp(uInvert, 0.0, 1.0));
    float d = length(frag - (dotIdx + 0.5) * uDotPx) / (uDotPx * 0.5);
    float reach = sqrt(density);
    float on = (1.0 - S(reach - 0.3, reach + 0.2, d)) * step(0.03, density);
    vec3 inkColor = clamp(uBg + (ink.rgb - uBg) / max(abs(inkLum - uBackingLum), 0.2), 0.0, 1.0);
    vec4 soft = sampleFringe(fUv, uDotLod + 2.5, fringe);
    float softLum = dot(soft.rgb, vec3(0.299, 0.587, 0.114));
    float halo = clamp(abs(softLum - uBackingLum) * 2.2, 0.0, 1.0) * clamp(uGlowAmt, 0.0, 1.0) * 0.55;
    vec3 haloColor = clamp(uBg + (soft.rgb - uBg) / max(abs(softLum - uBackingLum), 0.2), 0.0, 1.0);
    vec3 col = mix(mix(uBg, haloColor, halo), inkColor, on);
    return vec4(col, 1.0);
  }
  vec4 pixel = sampleFringe(textureUv, uLod, fringe);
  float lum = dot(pixel.rgb, vec3(0.299, 0.587, 0.114));
  float amount = abs(lum - uBackingLum);
  amount = clamp((amount - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
  amount = mix(amount, 1.0 - amount, clamp(uInvert, 0.0, 1.0));
  // Glyph cells average over the small text, so lift them into a readable range.
  amount = clamp(amount * 2.6, 0.0, 1.0);
  int index = min(int(amount * float(uGlyphCount)), uGlyphCount - 1);
  ivec2 local = ivec2(floor((frag - cell * cellPx) / uGlyphPx));
  int pad = int(uSpacing);
  float on = glyphBit(index, ivec2(local.x - pad, local.y - pad));
  vec3 glyphColor = clamp(uBg + (pixel.rgb - uBg) / max(abs(lum - uBackingLum), 0.2), 0.0, 1.0);
  vec3 base = mix(C(texUv, 0.0).rgb, uBg, clamp(uBgOpacity, 0.0, 1.0));
  return vec4(mix(base, glyphColor, on), 1.0);
}
float wave (float x, float k) {
  return 0.5 * sin(6.2832 * (1.3 * x + k)) + 0.3 * sin(6.2832 * (2.9 * x + k * 1.7)) + 0.2 * sin(6.2832 * (6.1 * x + k * 2.3));
}
// Vertical character columns that grow from the bottom up, one after another
// left to right. Heights trend upward like a rising graph; a bright glyph
// leads each column and the characters inside it stream upward.
vec4 graph (vec2 frag) {
  float cellPx = (5.0 + 2.0 * uSpacing) * uGlyphPx;
  vec2 cell = floor(frag / cellPx);
  vec2 cuv = (cell + 0.5) * cellPx / uResolution;
  float t = uLoop * uTotal;
  // Outro: the columns climb to fill the full height as random character rain.
  float o = clamp((t - (uTotal - 3.2) - hash21(vec2(cell.x, 2.2)) * 0.35) / 1.3, 0.0, 1.0);
  float grow = o * o * (3.0 - 2.0 * o);
  float area = mix(uGraphH, 1.0, grow);
  float y = cuv.y / area;
  if (y > 1.2) return vec4(0.0);
  float outro = 1.0 - S(uTotal - 0.4, uTotal - 0.02, t);
  float col = step(mod(cell.x, 2.0), 0.5);
  float x = cuv.x;
  // All columns rise together at the start, then their heights keep moving.
  // uLoop-based phases use whole cycles so the last frame matches the first.
  float ph = 6.2832 * uLoop;
  float seed = hash21(vec2(cell.x, 3.7));
  float live = 0.5 * sin(ph * 3.0 + x * 7.0 + seed * 6.2832)
    + 0.3 * sin(ph * 5.0 - x * 11.0 + seed * 3.1)
    + 0.2 * sin(ph * 9.0 + seed * 12.0);
  float target = clamp(0.5 + 0.28 * live, 0.08, 0.95);
  float p = 1.0 - pow(1.0 - clamp((t - 0.05 - seed * 0.15) / 0.8, 0.0, 1.0), 3.0);
  float tall = clamp(1.02 + 0.05 * live, 0.9, 1.1);
  float h = mix(target, tall, grow) * p;
  float cellY = cellPx / (uResolution.y * area);
  float inside = col * step(y, h) * step(0.001, p);
  float head = inside * (1.0 - step(cellY, h - y));
  float flow = hash21(vec2(cell.x, floor(cell.y - uTime * mix(7.0, 14.0, grow))));
  float body = inside * (0.28 + 0.4 * flow + 0.25 * (y / max(h, 0.01)));
  float amount = max(body, head);
  amount *= 0.82 + 0.18 * hash21(cell + floor(uTime * 10.0) * 0.173);
  amount = clamp(amount, 0.0, 1.0);
  int index = min(int(amount * float(uGlyphCount)), uGlyphCount - 1);
  ivec2 local = ivec2(floor((frag - cell * cellPx) / uGlyphPx));
  int pad = int(uSpacing);
  float on = glyphBit(index, ivec2(local.x - pad, local.y - pad));
  float fade = 1.0 - S(mix(0.85, 1.05, grow), mix(1.05, 1.2, grow), y);
  return vec4(uGraphInk, clamp(on * amount * fade, 0.0, 1.0) * outro);
}
void main () {
  vec4 c = sceneMain();
  if (uGraphOn > 0.5) {
    vec4 g = graph(vUv * uResolution);
    c.rgb = mix(c.rgb, g.rgb, g.a);
  }
  outColor = c;
}`;

  // ── Decrypt (Meridian Launch): text is read as a cipher of best-fit glyphs; lenses decode it ──
  const F_DECRYPT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent; uniform sampler2D uCells; uniform sampler2D uAtlas; uniform sampler2D uGlyphIdx; uniform vec4 uLens2;
uniform vec2 uRes; uniform vec2 uCellPx; uniform vec2 uGrid; uniform vec2 uAtlasGrid; uniform vec2 uAtlasPad; uniform vec2 uAtlasInner;
uniform int uGlyphCount; uniform vec2 uPointer; uniform float uActive; uniform float uRadius; uniform float uSoftness;
uniform float uColored; uniform vec3 uColor; uniform float uBrightness; uniform float uLegibility;
uniform float uScramble; uniform float uScrambleSpeed; uniform float uEdgeWidth; uniform float uEdgeFlicker;
uniform float uEdgeGlow; uniform float uEdgeTint; uniform float uAberration; uniform float uPassthrough;
uniform vec3 uBg; uniform float uTime;
float hash (vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec4 samp (vec2 p) { vec2 uv = clamp(p / uRes, vec2(0.001), vec2(0.999)); return texture(uContent, uv); }
void lens (vec2 pc, vec4 L, inout float e, inout float ring, inout vec2 dir) {
  if (L.w < 0.001) return;
  float dist = length(pc - L.xy), radius = max(L.z, 1.0), inner = radius * (1.0 - clamp(uSoftness, 0.02, 1.0));
  e = max(e, (1.0 - smoothstep(inner, radius, dist)) * L.w);
  float bandW = max(radius * clamp(uEdgeWidth, 0.0, 1.0) * 0.5, 6.0), bd = dist - mix(inner, radius, 0.5);
  float r = exp(-bd * bd / (2.0 * bandW * bandW)) * L.w;
  if (r > ring) { ring = r; dir = (pc - L.xy) / max(dist, 1e-3); }
}
void main () {
  vec2 pc = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  float e = 0.0, ring = 0.0; vec2 dir = vec2(1.0, 0.0);
  lens(pc, vec4(uPointer, uRadius, uActive), e, ring, dir); lens(pc, uLens2, e, ring, dir);
  float ca = uAberration * ring;
  vec4 rC = samp(pc);
  vec3 real = vec3(samp(pc + dir * ca).r, rC.g, samp(pc - dir * ca).b);
  vec2 cellPos = pc / uCellPx;
  vec2 cell = clamp(floor(cellPos), vec2(0.0), uGrid - 1.0);
  vec4 info = vec4(texelFetch(uCells, ivec2(cell), 0).rgb, texelFetch(uGlyphIdx, ivec2(cell), 0).r);
  float glyph = floor(info.a * 255.0 + 0.5);
  float rerollP = clamp(uScramble * 0.35 + ring * uEdgeFlicker, 0.0, 1.0);
  float speed = max(uScrambleSpeed, 0.001) * (1.0 + ring * 2.5);
  float ft = floor(uTime * speed);
  float swap = step(1.0 - rerollP, hash(cell * 3.3 + vec2(ft * 0.717, ft * 0.523))) * step(0.5, glyph);
  float pick = hash(cell + vec2(ft * 0.613, ft * 0.831));
  glyph = mix(glyph, floor(pick * float(uGlyphCount - 1)) + 1.0, swap);
  vec2 local = clamp(cellPos - cell, 0.0, 1.0);
  float gx = mod(glyph, uAtlasGrid.x), gy = floor(glyph / uAtlasGrid.x);
  vec2 atlasUv = vec2((gx + uAtlasPad.x + local.x * uAtlasInner.x) / uAtlasGrid.x, (gy + uAtlasPad.y + local.y * uAtlasInner.y) / uAtlasGrid.y);
  vec2 atlasStep = uAtlasInner / uAtlasGrid;
  float mask = textureGrad(uAtlas, atlasUv, dFdx(cellPos) * atlasStep, dFdy(cellPos) * atlasStep).a * step(0.5, glyph);
  vec3 cellCol = info.rgb; vec3 lw = vec3(0.299, 0.587, 0.114);
  vec3 dev = cellCol - uBg; float mag = dot(abs(dev), lw);
  float target = clamp(uLegibility, 0.0, 1.0) * 0.75;
  vec3 vivid = clamp(uBg + dev * clamp(target / max(mag, 0.01), 1.0, 32.0), 0.0, 1.0);
  float vividMag = dot(abs(vivid - uBg), lw);
  vivid = mix(vivid, vec3(1.0), clamp((target - vividMag) / max(target, 1e-3), 0.0, 1.0));
  vec3 mono = uColor * mix(0.35, 1.2, clamp(mag * 1.6, 0.0, 1.0));
  vec3 glyphColor = mix(mono, vivid, clamp(uColored, 0.0, 1.0));
  glyphColor = clamp(uBg + (glyphColor - uBg) * uBrightness, 0.0, 1.0);
  glyphColor = mix(glyphColor, uColor * max(uBrightness, 1.0) * (0.6 + dot(vivid, lw)), ring * clamp(uEdgeTint, 0.0, 1.0));
  glyphColor = clamp(uBg + (glyphColor - uBg) * (1.0 + ring * uEdgeGlow * 1.6), 0.0, 1.0);
  vec3 base = mix(uBg, real, clamp(uPassthrough, 0.0, 1.0));
  vec3 col = mix(mix(base, glyphColor, mask), real, e);
  outColor = vec4(col, 1.0);
}`;
  const CIPHER_IN = [[0.28, 0.26], [0.72, 0.14], [0.28, 0.56], [0.72, 0.44], [0.28, 0.86], [0.72, 0.74]];
  let CIPHER_ATLAS = null;
  function cipherAtlas() {
    if (CIPHER_ATLAS) return CIPHER_ATLAS;
    const PAD = 8, glyphs = [" "]; for (let i = 33; i < 127; i++) glyphs.push(String.fromCharCode(i));
    const cellH = 64, cellW = 48, padW = cellW + PAD * 2, padH = cellH + PAD * 2;
    const cols = Math.ceil(Math.sqrt(glyphs.length)), rows = Math.ceil(glyphs.length / cols);
    const s = document.createElement("canvas"); s.width = cols * padW; s.height = rows * padH;
    const x = s.getContext("2d", { willReadFrequently: true }); x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `600 ${Math.floor(Math.min(cellH * 0.92, cellW / 0.58))}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    glyphs.forEach((g, i) => x.fillText(g, (i % cols) * padW + padW / 2, Math.floor(i / cols) * padH + padH / 2));
    const img = x.getImageData(0, 0, s.width, s.height), vec = new Float32Array(glyphs.length * 6), r = cellH * 0.26;
    for (let g = 0; g < glyphs.length; g++) {
      const ox = (g % cols) * padW + PAD, oy = Math.floor(g / cols) * padH + PAD;
      for (let c = 0; c < 6; c++) {
        const cx = CIPHER_IN[c][0] * cellW, cy = CIPHER_IN[c][1] * cellH; let sum = 0, tot = 0;
        for (let yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++) for (let xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++) {
          const dx = xx + 0.5 - cx, dy = yy + 0.5 - cy; if (dx * dx + dy * dy > r * r) continue; tot++;
          if (xx < -PAD || yy < -PAD || xx >= cellW + PAD || yy >= cellH + PAD) continue;
          sum += img.data[((oy + yy) * img.width + ox + xx) * 4 + 3];
        }
        vec[g * 6 + c] = tot ? sum / (tot * 255) : 0;
      }
    }
    for (let c = 0; c < 6; c++) { let pk = 0; for (let g = 0; g < glyphs.length; g++) pk = Math.max(pk, vec[g * 6 + c]); if (pk > 0) for (let g = 0; g < glyphs.length; g++) vec[g * 6 + c] /= pk; }
    return (CIPHER_ATLAS = { canvas: s, vec, count: glyphs.length, cols, rows, pad: [PAD / padW, PAD / padH], inner: [cellW / padW, cellH / padH] });
  }
  // CPU cell pass: per cell, six regional ink levels matched against each glyph's shape vector.
  const CIPHERS = new WeakMap();
  function cipherCells(panel, cw, ch) {
    const key = cw.toFixed(2) + "x" + ch.toFixed(2), got = CIPHERS.get(panel); if (got && got.key === key) return got;
    const A = cipherAtlas(), W = panel.width, H = panel.height, data = panel.getContext("2d").getImageData(0, 0, W, H).data;
    const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), mk = () => { const c = document.createElement("canvas"); c.width = cols; c.height = rows; return c; };
    const colC = mk(), idxC = mk(), ci = colC.getContext("2d").createImageData(cols, rows), ii = idxC.getContext("2d").createImageData(cols, rows);
    const nx = 6, ny = 8, v = new Float32Array(6);
    for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
      v.fill(0); let sr = 0, sg = 0, sb = 0, levSum = 0, inkLev = 0, ir = 0, ig = 0, ib = 0;
      for (let gy = 0; gy < ny; gy++) for (let gx = 0; gx < nx; gx++) {
        const px = gx / (nx - 1), py = gy / (ny - 1), X = Math.min(W - 1, (cx + px) * cw | 0), Y = Math.min(H - 1, (cy + py) * ch | 0), o = (Y * W + X) * 4;
        const R = data[o] / 255, G = data[o + 1] / 255, B = data[o + 2] / 255, lev = 0.299 * R + 0.587 * G + 0.114 * B;
        const idx = (py < 0.41 ? 0 : py < 0.71 ? 2 : 4) + (px < 0.5 ? 0 : 1);
        if (lev > v[idx]) v[idx] = lev; levSum += lev; sr += R; sg += G; sb += B;
        if (lev > inkLev) { inkLev = lev; ir = R; ig = G; ib = B; }
      }
      const n = nx * ny, peak = Math.max(...v), o = (cy * cols + cx) * 4; let best = 0;
      let cr = sr / n, cg = sg / n, cb = sb / n;
      if (peak >= 0.025) {
        const mean = levSum / n, sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
        const lift = sm(1.5, 3, inkLev / Math.max(mean, 1e-4)) * sm(0.025, 0.04, inkLev), lifted = lerp(peak, 1, lift);
        for (let i = 0; i < 6; i++) v[i] = Math.min(v[i] / peak, 1) * lifted;
        cr = lerp(cr, ir, lift); cg = lerp(cg, ig, lift); cb = lerp(cb, ib, lift);
        let bd = 1e9; for (let g = 0; g < A.count; g++) { let dd = 0; for (let i = 0; i < 6; i++) { const df = v[i] - A.vec[g * 6 + i]; dd += df * df; } if (dd < bd) { bd = dd; best = g; } }
      }
      ci.data[o] = cr * 255; ci.data[o + 1] = cg * 255; ci.data[o + 2] = cb * 255; ci.data[o + 3] = 255;
      ii.data[o] = best; ii.data[o + 3] = 255;
    }
    colC.getContext("2d").putImageData(ci, 0, 0); idxC.getContext("2d").putImageData(ii, 0, 0);
    const res = { key, cols, rows, col: colC, idx: idxC }; CIPHERS.set(panel, res); return res;
  }
  const WALLS = new Map();
  function dataWall(w, h, text, k) {
    const key = w + "x" + h + "|" + text; if (WALLS.has(key)) return WALLS.get(key); if (WALLS.size > 8) WALLS.clear();
    const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
    x.fillStyle = "#000"; x.fillRect(0, 0, w, h);
    const A = ["invoice", "ledger", "route", "signal", "draft", "query", "vector", "sensor", "budget", "contract", "grid", "record", "policy", "schema", "forecast", "cluster", "node", "index", "region", "shipment", "claim", "ticket"];
    const B = ["pending review", "flagged", "unresolved", "awaiting input", "out of sync", "duplicated", "missing field", "needs approval", "stale", "unmatched", "queued", "in conflict"];
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    x.fillStyle = "#62676e"; x.font = `400 ${15 * k}px ${SANS}`; x.textBaseline = "middle";
    for (let cx = 36 * k; cx < w; cx += 300 * k) for (let y = 30 * k; y < h; y += 26 * k) x.fillText(`\u2022  ${A[Math.floor(rnd() * A.length)]} ${Math.floor(rnd() * 9000 + 1000)} \u2014 ${B[Math.floor(rnd() * B.length)]}`, cx, y);
    if (text) {
      x.font = `600 ${110 * k}px ${SANS}`; if ("letterSpacing" in x) x.letterSpacing = "-0.04em";
      let s = 110 * k; const tw = x.measureText(text).width; if (tw > w * 0.8) { s *= w * 0.8 / tw; x.font = `600 ${s}px ${SANS}`; }
      const mw = x.measureText(text).width; x.fillStyle = "#000"; x.fillRect(w / 2 - mw / 2 - 40 * k, h / 2 - s * 0.9, mw + 80 * k, s * 1.8);
      x.fillStyle = "#f4f5f2"; x.textAlign = "center"; x.fillText(text, w / 2, h / 2);
    }
    WALLS.set(key, c); return c;
  }

  // ── Sand (Launch Film): content gathers from drifting grains as a formation line passes, then scatters ──
  const F_SAND = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent; uniform vec2 uRes; uniform float uDensity; uniform float uStagger;
uniform float uLine; uniform float uBand; uniform vec3 uBg;
float hash (vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float rowP (float y) { return clamp((uLine + uBand - y) / uBand, 0.0, 1.0); }
void main () {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec2 cell = floor(px / uDensity);
  float d = hash(cell) * uStagger;
  float p = rowP((cell.y + 0.5) * uDensity);
  float t = clamp((p - d) / max(1.0 - d, 1e-3), 0.0, 1.0);
  float vis = step(0.9995, t);
  vec4 tex = texture(uContent, vec2(vUv.x, 1.0 - vUv.y));
  outColor = vec4(mix(uBg, tex.rgb, vis * tex.a), 1.0);
}`;
  const V_SAND_PTS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform vec2 uGrid; uniform vec2 uOrigin; uniform float uDensity; uniform float uStagger;
uniform float uSpread; uniform float uGravity; uniform float uDrift; uniform float uSwirl;
uniform float uTime; uniform float uFade; uniform float uSize; uniform float uLine; uniform float uBand;
out vec2 vCenter; out float vSize; out float vAlpha; out float vLod; out float vMerge;
float hash (vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float rowP (float y) { return clamp((uLine + uBand - y) / uBand, 0.0, 1.0); }
void main () {
  float fid = float(gl_VertexID);
  vec2 cell = vec2(mod(fid, uGrid.x), floor(fid / uGrid.x)) + uOrigin;
  float h1 = hash(cell), h2 = hash(cell + vec2(1.7, 9.1)), h3 = hash(cell + vec2(5.5, 2.9)), h4 = hash(cell + vec2(8.4, 4.2));
  float d = h1 * uStagger;
  vec2 home = (cell + 0.5) * uDensity;
  float p = rowP(home.y);
  float t = clamp((p - d) / max(1.0 - d, 1e-3), 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 3.0);
  if (t >= 0.9995) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vCenter = vec2(0.0); vSize = 0.0; vAlpha = 0.0; vLod = 0.0; vMerge = 0.0; return; }
  vec2 dir = normalize(vec2(h2 - 0.5, h3 - 0.5) + vec2(1e-4, 0.0));
  float reach = 0.08 + 0.92 * pow(h4, 2.4);
  vec2 off = dir * uSpread * reach;
  off.y += uGravity * uSpread * (0.25 + 0.75 * h4);
  vec2 pos = mix(home + off, home, e);
  vec2 perp = vec2(-dir.y, dir.x);
  pos += perp * (h2 - 0.5) * 2.0 * uSwirl * sin(e * 3.14159);
  float tt = uTime * uDrift;
  float amp = (1.0 - e) * (uSpread * 0.05 + 2.5);
  pos += vec2(sin(tt * (4.0 + 5.0 * h2) + h3 * 40.0), cos(tt * (3.5 + 5.5 * h3) + h2 * 40.0)) * amp;
  pos += vec2(h4 - 0.5, h1 - 0.5) * uDensity * 3.0 * (1.0 - smoothstep(0.5, 0.85, t));
  float sizeCss = mix(uSize, uDensity * 1.3, smoothstep(0.55, 1.0, e));
  vCenter = home; vSize = sizeCss; vAlpha = mix(uFade, 1.0, e); vLod = (1.0 - e) * 1.5; vMerge = smoothstep(0.75, 0.97, t);
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);
  gl_PointSize = max(sizeCss, 1.0);
}`;
  const F_SAND_PTS = `#version 300 es
precision highp float;
uniform sampler2D uContent; uniform vec2 uRes;
in vec2 vCenter; in float vSize; in float vAlpha; in float vLod; in float vMerge;
out vec4 outColor;
void main () {
  vec2 o = gl_PointCoord - 0.5;
  vec2 uv = clamp((vCenter + o * vSize) / uRes, 0.0, 1.0);
  vec4 tex = textureLod(uContent, uv, vLod);
  float mask = mix(1.0 - smoothstep(0.25, 0.5, length(o)), 1.0, vMerge);
  float a = vAlpha * mask * tex.a;
  if (a < 0.01) discard;
  outColor = vec4(tex.rgb, a);
}`;
  function sandLine(c, p, box) {
    const B = p.band * c.k, L = p.cycle, tl = c.t % L, IN = 1.25, OUT = 0.85, lo = box[0] - B - 20 * c.k, hi = box[1] + 20 * c.k;
    const line = tl > L - OUT ? hi + (lo - hi) * Math.pow(clamp((tl - (L - OUT)) / OUT), 3) : lo + (hi - lo) * (1 - Math.pow(1 - clamp(tl / IN), 3));
    return lerp(line, c.mouse[1] + B * 0.5, c.mouse[2]);
  }

  // ── Assemble (No Peace): an image or line of text gathers from an orbiting swarm, then unravels ──
  function bgMask(d, w, h) {
    const bg = new Uint8Array(w * h), q = [];
    const ref = [0, 0, 0]; let n = 0;
    for (let x = 0; x < w; x++) for (let y = 0; y < 2; y++) { const i = (y * w + x) * 4; ref[0] += d[i]; ref[1] += d[i + 1]; ref[2] += d[i + 2]; n++; }
    ref[0] /= n; ref[1] /= n; ref[2] /= n;
    for (let x = 0; x < w; x++) { bg[x] = 1; q.push(x); }
    for (let y = 0; y < h * 0.85; y++) for (const x of [0, w - 1]) { const i = y * w + x; if (!bg[i]) { bg[i] = 1; q.push(i); } }
    const T = 8;
    while (q.length) {
      const i = q.pop(), x = i % w, y = (i / w) | 0, a = i * 4;
      for (let k = 0; k < 4; k++) {
        const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx; if (bg[j]) continue; const b = j * 4;
        const st = Math.abs(d[a] - d[b]) + Math.abs(d[a + 1] - d[b + 1]) + Math.abs(d[a + 2] - d[b + 2]);
        const dr = Math.abs(d[b] - ref[0]) + Math.abs(d[b + 1] - ref[1]) + Math.abs(d[b + 2] - ref[2]);
        if (st < T && dr < 70) { bg[j] = 1; q.push(j); }
      }
    }
    const m = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      let c = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) c += bg[(y + dy) * w + x + dx] ? 0 : 1;
      m[y * w + x] = c >= 6 ? (c === 9 ? 1 : 0.55) : 0;
    }
    return m;
  }
  
  const V_ASM = `
attribute vec4 aHome; attribute vec4 aSeed; attribute vec3 aCol;
uniform float uT, uForm, uYaw, uScale, uSweep, uFade, uCx, uSat, uBurst;
uniform vec3 uTint; uniform vec2 uView; uniform float uCy, uPx;
varying vec3 vCol; varying float vA;
void main(){
  bool dust = aHome.w < 0.0;
  float ny = (aHome.y / 540.0) * 0.5 + 0.5;
  float st = 0.55 * aSeed.x + 0.45 * (1.0 - ny);
  float p = dust ? 0.0 : clamp(uForm * 1.8 - st * 0.8, 0.0, 1.0);
  p = p * p * (3.0 - 2.0 * p);
  vec3 h = vec3(aHome.xy * uScale, aHome.z * uScale);
  float cy = cos(uYaw), sy = sin(uYaw);
  h = vec3(h.x * cy + h.z * sy, h.y, -h.x * sy + h.z * cy);
  float rr = pow(aSeed.y, 0.7);
  float r = (dust ? 300.0 + rr * 900.0 : 90.0 + rr * 620.0) * (1.0 + uBurst * 0.35 * aSeed.z);
  float ang = aSeed.z * 6.2832 + aSeed.w * 1.2 + uT * (0.25 + 0.9 / (0.25 + rr * 3.0)) * (dust ? 0.25 : 1.0);
  float thick = (aSeed.w - 0.5) * (dust ? 900.0 : 120.0 + rr * 160.0);
  vec3 sc = vec3(cos(ang) * r, thick + sin(ang) * r * 0.32, sin(ang) * r * 0.9);
  float tilt = -0.35; sc.xy = vec2(sc.x * cos(tilt) - sc.y * sin(tilt), sc.x * sin(tilt) + sc.y * cos(tilt));
  float tw = (1.0 - p);
  sc.xy += vec2(sin(uT * 1.1 + aSeed.y * 23.0), cos(uT * 0.9 + aSeed.z * 19.0)) * 22.0;
  // swirl the handoff: rotate path around the vertical axis as it lands
  float sw = tw * tw * (2.4 + aSeed.y * 3.0);
  vec3 hs = vec3(h.x * cos(sw) - h.z * sin(sw), h.y, h.x * sin(sw) + h.z * cos(sw));
  vec3 pos = mix(sc, hs, p);
  pos.xy += vec2(sin(uT * 2.0 + aSeed.x * 40.0), cos(uT * 1.7 + aSeed.w * 40.0)) * 0.7 * p;
  float s = 1500.0 / (1500.0 - pos.z);
  vec2 scr = vec2(uCx, uCy) + pos.xy * s;
  gl_Position = vec4(scr.x / (uView.x * 0.5) - 1.0, 1.0 - scr.y / (uView.y * 0.5), 0.0, 1.0);
  gl_PointSize = (dust ? 1.2 + aSeed.x * 2.2 : 2.3 + tw * aSeed.x * 1.6) * s * uPx;
  float lum = dot(aCol, vec3(0.3, 0.59, 0.11));
  float hl = min(pow(lum, 2.0) * 1.9, 1.5);
  vec3 c = mix(vec3(lum), aCol, uSat) * uTint * (0.35 + hl);
  float band = exp(-pow((scr.x - uSweep) / 140.0, 2.0)) * 1.6 * p;
  vec3 hot = uTint * vec3(1.0, 0.8, 0.6) * 1.1;
  vCol = mix(hot, c, p) * (1.0 + band);
  float flick = 0.6 + 0.4 * sin(uT * 2.6 + aSeed.x * 60.0);
  vA = uFade * (dust ? 0.3 * flick : aHome.w * mix(0.55 * flick, 0.95, p));
}`;
  const F_ASM_PTS = `
precision mediump float;
varying vec3 vCol; varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vA;
  gl_FragColor = vec4(vCol * a, a);
}`;
  const F_ASM = HEAD + `uniform vec3 uBg; uniform vec3 uGlow; uniform float uForm; uniform vec2 uC;
void main(){ vec2 d = (gl_FragCoord.xy - uC) / vec2(900.0, 700.0) / (u_resolution.y / 1080.0); float g = max(0.0, 1.0 - length(d) / 0.7);
gl_FragColor = vec4(uBg + uGlow * 0.16 * uForm * g * g, 1.0); }`;
  const ASM_TONES = { solar: { tint: [1.12, 0.9, 0.66], sat: 0.55, glow: [1, 0.67, 0.35], bg: "#050403" }, mono: { tint: [0.95, 0.97, 1.05], sat: 0.12, glow: [0.75, 0.82, 1], bg: "#030405" }, ember: { tint: [1.25, 0.66, 0.42], sat: 0.7, glow: [1, 0.43, 0.24], bg: "#060302" } };
  const ASM_CACHE = new WeakMap(); let ASM_DEFAULT = null;
  function assembleData(src, step, isImg) {
    let byStep = ASM_CACHE.get(src); if (!byStep) ASM_CACHE.set(src, byStep = {}); if (byStep[step]) return byStep[step];
    const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height, fit = 920 / sh;
    const w = Math.max(2, Math.floor(sw * fit / step)), h = Math.max(2, Math.floor(920 / step));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d", { willReadFrequently: true });
    g.drawImage(src, 0, 0, w, h); let d; try { d = g.getImageData(0, 0, w, h).data; } catch (err) { return null; }
    const M = isImg ? bgMask(d, w, h) : null, hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
    const home = [], seed = [], col = []; let n = 0; const cx = w * step / 2, cy = h * step / 2;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = (j * w + i) * 4, r = d[k] / 255, gg = d[k + 1] / 255, b = d[k + 2] / 255, lum = 0.3 * r + 0.59 * gg + 0.11 * b;
      const wgt = (M ? M[j * w + i] : (lum > 0.08 ? 1 : 0)) * (0.35 + 0.65 * clamp((lum - 0.2) / 0.6, 0, 1)); if (wgt < 0.04) continue;
      const s1 = hash(n, 1.3), s2 = hash(n, 2.7), s3 = hash(n, 5.1), s4 = hash(n, 9.9);
      home.push(i * step - cx + (s1 - 0.5) * step, j * step - cy + (s2 - 0.5) * step, (lum - 0.6) * 200, wgt); seed.push(s1, s2, s3, s4); col.push(r, gg, b); n++;
    }
    for (let a = 0; a < 3500; a++) { home.push(0, 0, 0, -1); seed.push(hash(a, 11.1), hash(a, 12.2), hash(a, 13.3), hash(a, 14.4)); col.push(0.75, 0.7, 0.62); }
    return (byStep[step] = { home: new Float32Array(home), seed: new Float32Array(seed), col: new Float32Array(col), count: home.length / 4 });
  }
  function asmSource(c, e) {
    if (c.source && (c.source.naturalWidth || c.source.width)) return [c.source, c.source.nodeName === "IMG"];
    if (c.text != null || !BASE_URL) return [textPanel(1600, 920, phrases(c, e)[0] || "Peace", { size: 0.36, font: SERIF_F, weight: 400, fg: "#fff", bg: "#000", fit: 0.94 }), false];
    if (!ASM_DEFAULT) { ASM_DEFAULT = new Image(); ASM_DEFAULT.src = BASE_URL + "assets/thinker.jpg"; }
    return ASM_DEFAULT.complete && ASM_DEFAULT.naturalWidth ? [ASM_DEFAULT, true] : [textPanel(1600, 920, "", { bg: "#000" }), false];
  }
  function asmTimes(c, p) {
    const L = p.cycle, tl = c.t % L, oe = (x) => { x = clamp(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }, ein = (x) => Math.pow(clamp(x), 3), eout = (x) => 1 - Math.pow(1 - clamp(x), 3);
    const tEnd = tl - (L - 1.4); let form = oe((tl - 0.3) / 1.4); if (tEnd > 0) form = 1 - ein(tEnd / 1.1);
    return { L, tl, form, burst: tEnd > 0 ? clamp(tEnd / 0.6) : 0, fade: eout(tl / 0.5) * (1 - ein((tl - (L - 0.5)) / 0.5)) };
  }

  // ── Canvas 2D helpers ──
  const h2 = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  const n2 = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const rgbaHex = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const pcss = (c, a) => `rgba(${c.map(v => Math.round(v * 255)).join(",")},${a == null ? 1 : a})`;
  // cover-fit a DW×DH design space onto the canvas; returns [scale, ox, oy]
  const cover = (ctx, c, DW, DH) => { const s = Math.max(c.w / DW, c.h / DH), ox = (c.w - DW * s) / 2, oy = (c.h - DH * s) / 2; ctx.setTransform(s, 0, 0, s, ox, oy); return [s, ox, oy]; };
  const toDesign = (c, DW, DH) => { const s = Math.max(c.w / DW, c.h / DH), ox = (c.w - DW * s) / 2, oy = (c.h - DH * s) / 2; return [(c.mouse[0] - ox) / s, (c.mouse[1] - oy) / s]; };
  const buf = (s, k, w, h) => { let b = s[k]; if (!b) b = s[k] = document.createElement("canvas"); if (b.width !== w || b.height !== h) { b.width = w; b.height = h; } return b; };
  let GRAIN_C = null;
  const grainTex = () => { if (GRAIN_C) return GRAIN_C; GRAIN_C = document.createElement("canvas"); GRAIN_C.width = GRAIN_C.height = 256; const g = GRAIN_C.getContext("2d"), img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = h2(i, 7.7) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } g.putImageData(img, 0, 0); return GRAIN_C; };
  const filmGrain = (ctx, w, h, t, amt) => { if (amt <= 0) return; const f = Math.floor(t * 24); ctx.save(); ctx.globalAlpha = amt; ctx.globalCompositeOperation = "overlay"; ctx.fillStyle = ctx.createPattern(grainTex(), "repeat");
    ctx.translate(-h2(f, 1) * 256, -h2(f, 2) * 256); ctx.fillRect(0, 0, w + 256, h + 256); ctx.restore(); };
  const E3 = { out: (x) => 1 - Math.pow(1 - clamp(x), 3), in: (x) => Math.pow(clamp(x), 3), io: (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }, sine: (x) => -(Math.cos(Math.PI * clamp(x)) - 1) / 2 };

  // ── Aurora (Going to Be Alright): curtain sheets sweep across a night sky over a lake ──
  const AUR_PAL = { aurora: { base: "#effff6", c1: "#3dffa8", c2: "#7a5cff", sky: ["#010307", "#050d18", "#0a1822"] }, ember: { base: "#fff4ec", c1: "#ff8a6b", c2: "#b04dff", sky: ["#050307", "#120914", "#22101a"] }, aqua: { base: "#f0fbff", c1: "#4ad8ff", c2: "#3b5bff", sky: ["#010307", "#040b1a", "#081426"] } };
  const AUR = { CW: 960, CH: 540, LAKE: 385 };
  AUR.STARS = Array.from({ length: 170 }, (_, i) => [h2(i, 1) * 960, h2(i, 2) * (385 - 60), h2(i, 3)]);
  AUR.RIDGE = Array.from({ length: 121 }, (_, i) => { const x = (i / 120) * 960; return [x, 336 + n2(x * 0.012, 3) * 34 + n2(x * 0.05, 7) * 10 - Math.sin((i / 120) * Math.PI) * 18]; });
  function auroraSheets(a, T, pal, sweepX, intensity) {
    const { CW, CH } = AUR; a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, CW, CH); if (intensity <= 0.001) return;
    a.globalCompositeOperation = "lighter";
    const g = a.createLinearGradient(0, 0, 0, -1);
    g.addColorStop(0, rgbaHex(pal.base, 0)); g.addColorStop(0.025, rgbaHex(pal.base, 1)); g.addColorStop(0.1, rgbaHex(pal.c1, 0.95)); g.addColorStop(0.42, rgbaHex(pal.c1, 0.32)); g.addColorStop(0.7, rgbaHex(pal.c2, 0.28)); g.addColorStop(1, rgbaHex(pal.c2, 0));
    a.fillStyle = g; const SHEETS = [0.5, 0.38, 0.32, 0.26, 0.2];
    for (let i = 0; i < SHEETS.length; i++) {
      const ph = i * 1.7, hB = 105 + i * 20;
      for (let x = 0; x < CW; x += 3) {
        const base = 205 + 36 * Math.sin(x * 0.0045 + T * 0.22 + ph) + 15 * Math.sin(x * 0.013 - T * 0.41 + ph * 2) - i * 9;
        const h = hB * (0.55 + 0.9 * n2(x * 0.01 + i * 10, T * 0.15)), ray = 0.3 + 0.7 * Math.pow(n2(x * 0.09 + T * 0.55 + i * 5, i + T * 0.3), 2);
        const d = sweepX - x, mask = clamp(d / 110, 0, 1) + Math.exp(-(((d - 18) / 46) ** 2)) * 1.4, al = SHEETS[i] * ray * intensity * mask;
        if (al < 0.004) continue; a.globalAlpha = Math.min(1, al); a.setTransform(1, 0, 0, h, x, base); a.fillRect(0, -1, 3.3, 1);
      }
    }
    a.setTransform(1, 0, 0, 1, 0, 0); a.globalAlpha = 1; a.globalCompositeOperation = "source-over";
  }
  function drawAurora(ctx, c, p, s) {
    const { CW, CH, LAKE } = AUR, pal = AUR_PAL[c.palName] || AUR_PAL.aurora, T = c.t, L = p.cycle, tl = T % L, tSw = tl - 1.4;
    let sweepX = -140 + E3.io(tSw / 2.6) * (CW + 420);
    const [mx] = toDesign(c, CW, CH); sweepX = lerp(sweepX, mx + 60, c.mouse[2]);
    const intensity = p.intensity * (1 + 0.35 * E3.out((tl - 4) / 1.6)) * (1 - E3.out((tl - (L - 1.7)) / 1.7) * (1 - c.mouse[2]));
    const aur = buf(s, "aur", CW, CH), glow = buf(s, "glow", CW, CH), fr = buf(s, "frame", CW, CH);
    const a = aur.getContext("2d"), gl = glow.getContext("2d"), x = fr.getContext("2d");
    auroraSheets(a, T, pal, sweepX, intensity);
    gl.clearRect(0, 0, CW, CH); gl.filter = "blur(9px)"; gl.drawImage(aur, 0, 0); gl.filter = "none";
    const sky = x.createLinearGradient(0, 0, 0, LAKE); sky.addColorStop(0, pal.sky[0]); sky.addColorStop(0.6, pal.sky[1]); sky.addColorStop(1, pal.sky[2]);
    x.fillStyle = sky; x.fillRect(0, 0, CW, CH);
    for (const [sx, sy, ss] of AUR.STARS) { x.globalAlpha = (0.2 + 0.6 * ss) * (0.65 + 0.35 * Math.sin(T * 1.7 + ss * 30)) * p.stars; x.fillStyle = "#fff"; x.fillRect(sx, sy, ss > 0.9 ? 1.6 : 1, ss > 0.9 ? 1.6 : 1); }
    x.globalAlpha = 1;
    const pre = E3.out((tl - 0) / 1.4) * (1 - E3.in(tSw / 1.6)) * (1 - c.mouse[2]);
    if (pre > 0) { const rg = x.createRadialGradient(40, 300, 0, 40, 300, 260); rg.addColorStop(0, rgbaHex(pal.c1, 0.28 * pre * p.intensity)); rg.addColorStop(1, rgbaHex(pal.c1, 0)); x.fillStyle = rg; x.fillRect(0, 0, CW, LAKE); }
    x.globalCompositeOperation = "lighter"; x.drawImage(glow, 0, 0); x.drawImage(glow, 0, 0); x.globalAlpha = 0.75; x.drawImage(aur, 0, 0); x.globalAlpha = 1;
    const beamA = Math.max(Math.sin(Math.PI * clamp(tSw / 2.6)) * (1 - c.mouse[2]), 0.6 * c.mouse[2]) * p.intensity;
    if (beamA > 0.01) { const bg = x.createLinearGradient(sweepX - 60, 0, sweepX + 60, 0); bg.addColorStop(0, rgbaHex(pal.c1, 0)); bg.addColorStop(0.5, rgbaHex(pal.base, 0.22 * beamA)); bg.addColorStop(1, rgbaHex(pal.c1, 0)); x.fillStyle = bg; x.fillRect(sweepX - 60, 0, 120, LAKE); }
    x.globalCompositeOperation = "source-over";
    const lk = x.createLinearGradient(0, LAKE, 0, CH); lk.addColorStop(0, pal.sky[2]); lk.addColorStop(1, pal.sky[0]); x.fillStyle = lk; x.fillRect(0, LAKE, CW, CH - LAKE);
    if (p.reflection > 0) { x.globalCompositeOperation = "lighter";
      for (let y = LAKE; y < CH; y += 3) { const d = y - LAKE, sy = 250 - d * 1.1, off = Math.sin(y * 0.35 + T * 2.2) * (1 + d * 0.03); x.globalAlpha = 0.65 * p.reflection * (1 - 0.8 * d / (CH - LAKE)); x.drawImage(glow, 0, sy - 5, CW, 5, off, y, CW, 3); }
      x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; }
    x.beginPath(); x.moveTo(0, LAKE + 1); AUR.RIDGE.forEach(([rx, ry]) => x.lineTo(rx, ry)); x.lineTo(CW, LAKE + 1); x.closePath(); x.fillStyle = "#020306"; x.fill();
    x.strokeStyle = rgbaHex(pal.c1, 0.18 * intensity); x.lineWidth = 1; x.beginPath(); AUR.RIDGE.forEach(([rx, ry], i) => (i ? x.lineTo(rx, ry) : x.moveTo(rx, ry))); x.stroke();
    const vg = x.createRadialGradient(CW / 2, CH * 0.45, CH * 0.3, CW / 2, CH * 0.45, CH * 0.95); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)"); x.fillStyle = vg; x.fillRect(0, 0, CW, CH);
    filmGrain(x, CW, CH, T, p.grain);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.w, c.h); cover(ctx, c, CW, CH); ctx.imageSmoothingEnabled = true; ctx.drawImage(fr, 0, 0); ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Horizon (Anticipating the Future): a sunset synth terrain flying toward the camera ──
  const HOR = { W: 1920, H: 1080, HZ: 610 };
  HOR.STARS = Array.from({ length: 140 }, (_, i) => [h2(i, 1) * 1920, h2(i, 2) * (610 - 80), h2(i, 3)]);
  const horHeight = (x, z) => { const n = n2(x * 0.35, z * 0.35) * 0.65 + n2(x * 0.9, z * 0.9) * 0.35, ax = Math.abs(x), valley = clamp((ax - 1.4) / 4.5, 0, 1); return n * valley * valley * (2.2 + ax * 0.35); };
  function drawHorizon(ctx, c, p) {
    const { W, H, HZ } = HOR, T = c.t, pal = c.pal, grid = pcss(pal[0]);
    ctx.setTransform(1, 0, 0, 1, 0, 0); cover(ctx, c, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, "#0b0420"); g.addColorStop(0.7, "#2a0b4a"); g.addColorStop(1, "#6a1553"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const [x, y, s] of HOR.STARS) { ctx.globalAlpha = (0.25 + 0.6 * s) * (0.7 + 0.3 * Math.sin(T * 2 + s * 20)); ctx.fillStyle = "#fff"; ctx.fillRect(x, y, s > 0.85 ? 3 : 2, s > 0.85 ? 3 : 2); }
    ctx.globalAlpha = 1;
    const rise = E3.out(T / 3.2), R = 250 * p.sun, cy = HZ + 90 - rise * 190;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, HZ); ctx.clip();
    const sg = ctx.createLinearGradient(0, cy - R, 0, cy + R); sg.addColorStop(0, pcss(pal[1])); sg.addColorStop(0.55, pcss(pal[2])); sg.addColorStop(1, "#b41e8c");
    ctx.shadowColor = pcss(pal[2]); ctx.shadowBlur = 90; ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 9; i++) { const y = cy + 10 + i * 30 + ((T * 18) % 30), th = 3 + i * 1.6; ctx.fillRect(W / 2 - R, y, R * 2, th); }
    ctx.globalCompositeOperation = "source-over"; ctx.restore();
    const hg = ctx.createLinearGradient(0, HZ - 60, 0, HZ + 40); hg.addColorStop(0, "rgba(255,80,170,0)"); hg.addColorStop(0.6, "rgba(255,80,170,0.45)"); hg.addColorStop(1, "rgba(255,80,170,0)");
    ctx.fillStyle = hg; ctx.fillRect(0, HZ - 60, W, 100); ctx.fillStyle = "#07020f"; ctx.fillRect(0, HZ, W, H - HZ);
    const f = 900, camH = 1.25, dz = 0.55, near = 0.35, far = 26, cols = 44, span = 13, zc = T * p.rate;
    const [mx] = toDesign(c, W, H), sway = (mx / W - 0.5) * 2 * c.mouse[2] * 2.5;
    const j0 = Math.ceil((zc + near) / dz), j1 = Math.floor((zc + far) / dz);
    const row = (j) => { const zw = j * dz, z = zw - zc, pts = []; for (let i = 0; i <= cols; i++) { const x = -span + (i / cols) * span * 2; pts.push([W / 2 + ((x - sway) * f) / z, HZ + ((camH - horHeight(x, zw) * p.peaks) * f) / z]); } return { pts, z }; };
    let prev = row(j1);
    for (let j = j1 - 1; j >= j0; j--) {
      const cur = row(j), fade = clamp(1 - cur.z / far, 0, 1), a = Math.pow(fade, 1.4);
      ctx.fillStyle = "#07020f"; ctx.beginPath(); prev.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); for (let i = cur.pts.length - 1; i >= 0; i--) ctx.lineTo(cur.pts[i][0], cur.pts[i][1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = grid; ctx.globalAlpha = 0.15 + 0.85 * a; ctx.lineWidth = 1 + 2.2 * a; ctx.beginPath();
      cur.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); for (let i = 0; i < cur.pts.length; i++) { ctx.moveTo(prev.pts[i][0], prev.pts[i][1]); ctx.lineTo(cur.pts[i][0], cur.pts[i][1]); }
      ctx.stroke(); ctx.globalAlpha = 1; prev = cur;
    }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.6)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Blink (Supreme Effort Squares): a field of blinking squares; each line dissolves in square by square ──
  const ss3 = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ihash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const BLINK_P = new Map();
  function blinkPanel(text, size, cell, fg) {
    const key = [text, size, cell, fg].join("|"); if (BLINK_P.has(key)) return BLINK_P.get(key); if (BLINK_P.size > 24) BLINK_P.clear();
    const W = 1920, H = 1080, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d", { willReadFrequently: true });
    x.fillStyle = fg; x.font = `500 ${size}px ${SANS}`; if ("letterSpacing" in x) x.letterSpacing = "-0.005em"; x.textAlign = "center"; x.textBaseline = "middle";
    let tw = x.measureText(text).width; if (tw > W * 0.9) { size *= W * 0.9 / tw; x.font = `500 ${size}px ${SANS}`; tw = x.measureText(text).width; }
    x.fillText(text, W / 2, H / 2);
    const c0 = Math.floor((W / 2 - tw / 2 - 4) / cell), c1 = Math.ceil((W / 2 + tw / 2 + 4) / cell), r0 = Math.floor((H / 2 - size * 0.62) / cell), r1 = Math.ceil((H / 2 + size * 0.62) / cell);
    const data = x.getImageData(0, 0, W, H).data, cells = [];
    for (let r = r0; r < r1; r++) for (let q = c0; q < c1; q++) {
      let ink = 0; for (let yy = 0; yy < cell && !ink; yy += 2) for (let xx = 0; xx < cell; xx += 2) { const px = q * cell + xx, py = r * cell + yy; if (px < W && py < H && data[(py * W + px) * 4 + 3] > 20) { ink = 1; break; } }
      cells.push({ q, r, ink, u: (q - c0) / Math.max(1, c1 - c0 - 1), h: ihash(q * 7 + 1, r * 13 + 5) });
    }
    const out = { canvas: c, cells }; BLINK_P.set(key, out); return out;
  }
  function drawBlink(ctx, c, p, s, e) {
    const W = 1920, H = 1080, T = c.t, paper = p.paper >= 0.5, BG = paper ? "#fafaf8" : "#0a0b0a", FG = paper ? "#161616" : "#eeeeea", col = c.pal[0].map(v => Math.round(v * 255)).join(",");
    const sq = p.square, cell = sq + p.gap, off = p.gap / 2, cols = Math.ceil(W / cell), rows = Math.ceil(H / cell), BLINK = 0.7, FLASH = 0.1;
    const ph = phrases(c, e), L = p.hold, k = Math.floor(T / L), t = T - k * L, loop = (T % (L * ph.length)) / (L * ph.length);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = BG; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H);
    const [mx, my] = toDesign(c, W, H), mr = 220;
    const area = p.field * E3.sine(T / 0.4), density = lerp(0.04, 0.12, loop), top = 1 - area, mode = Math.round(p.edges);
    const fade = (x, y) => mode === 1 ? ss3(0.25, 0.75, x) : mode === 2 ? ss3(0.25, 0.75, 1 - x) : mode === 3 ? 1 - ss3(0.3, 0.8, Math.hypot((x - 0.5) * 1.8, (y - 0.5) * 1.8)) : 1;
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) / rows; const vert = area > 0 && y >= top - 0.02 ? ss3(top, top + Math.max(0.12, area * 0.7), y) : 0;
      for (let q = 0; q < cols; q++) {
        const cx = q * cell + cell / 2, cy = r * cell + cell / 2, near = c.mouse[2] * Math.max(0, 1 - Math.hypot(cx - mx, cy - my) / mr);
        const m = Math.max(vert * fade((q + 0.5) / cols, (y - top) / Math.max(area, 0.01)), near); if (m <= 0.01) continue;
        const i = r * cols + q, pp = ihash(i, 911) * BLINK, n = Math.floor((T + pp) / BLINK); let a = 0.06;
        if (ihash(i, n) < density + near * 0.5) { const sn = Math.sin(((T + pp) / BLINK - n) * Math.PI); a += (0.85 * (0.4 + 0.6 * ihash(n, i)) - a) * sn * sn; }
        ctx.fillStyle = `rgba(${col},${a * m})`; ctx.fillRect(q * cell + off, r * cell + off, sq, sq);
      }
    }
    const pn = blinkPanel(ph[k % ph.length], p.size * 1080, cell, FG), e0 = L - 0.4;
    for (const cl of pn.cells) {
      const rt = 0.04 + cl.u * 0.32 + cl.h * 0.1, et = e0 + cl.u * 0.22 + cl.h * 0.08; if (t < rt || t > et + FLASH) continue;
      const x = cl.q * cell, y = cl.r * cell; if (t < et) ctx.drawImage(pn.canvas, x, y, cell, cell, x, y, cell, cell); if (!cl.ink) continue;
      const f = t < rt + FLASH ? 1 - (t - rt) / FLASH : t > et ? 1 - (t - et) / FLASH : 0; if (f > 0) { ctx.fillStyle = `rgba(${col},${f * 0.85})`; ctx.fillRect(x + off, y + off, sq, sq); }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Drift + Sparkle (Idea Reveal): a drifting colour field, and a four-point sparkle that punches through to it ──
  const DRIFT_B = [{ x: 0.30, y: 0.62, r: 0.55, fx: 0.31, fy: 0.23, ph: 0 }, { x: 0.12, y: 0.95, r: 0.45, fx: 0.27, fy: 0.35, ph: 1.7 }, { x: 0.78, y: 0.28, r: 0.42, fx: 0.22, fy: 0.29, ph: 3.1 }, { x: 0.72, y: 0.82, r: 0.38, fx: 0.33, fy: 0.21, ph: 4.4 }];
  function driftField(x, c, t, zoom, p) {
    const W = c.w, H = c.h, CX = W / 2, CY = H / 2, S = Math.max(W, H * 16 / 9);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.fillStyle = "#070920"; x.fillRect(0, 0, W, H);
    x.translate(CX, CY); x.scale(zoom, zoom); x.translate(-CX, -CY); x.globalCompositeOperation = "lighter";
    const [mx, my] = [c.mouse[0] / W, c.mouse[1] / H];
    DRIFT_B.forEach((b, i) => {
      const bx = (b.x + Math.sin(t * b.fx * p.flow + b.ph) * 0.08 + (mx - 0.5) * 0.12 * c.mouse[2] * (i % 2 ? -1 : 1)) * W, by = (b.y + Math.cos(t * b.fy * p.flow + b.ph) * 0.08 + (my - 0.5) * 0.12 * c.mouse[2]) * H, r = b.r * S;
      const cc = c.pal[i].map(v => Math.round(v * 255)).join(","), g = x.createRadialGradient(bx, by, 0, bx, by, r);
      g.addColorStop(0, `rgba(${cc},${0.62 * p.glow})`); g.addColorStop(0.45, `rgba(${cc},${0.26 * p.glow})`); g.addColorStop(1, `rgba(${cc},0)`); x.fillStyle = g; x.fillRect(0, 0, W, H);
    });
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over";
  }
  const starPath = (k) => typeof Path2D !== "undefined" ? new Path2D(`M0,-1 Q${k},${-k} 1,0 Q${k},${k} 0,1 Q${-k},${k} -1,0 Q${-k},${-k} 0,-1Z`) : null;
  let STAR_P = null;
  function drawSparkle(ctx, c, p, s) {
    const W = c.w, H = c.h, L = p.cycle, t = c.t % L, sg = (a, b) => clamp((t - a) / (b - a)), ex = (v) => v >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(v));
    STAR_P = STAR_P || starPath(0.16);
    const cx = lerp(W / 2, c.mouse[0], c.mouse[2] * 0.6), cy = lerp(H / 2, c.mouse[1], c.mouse[2] * 0.6), base = Math.min(W, H) * 0.075 * p.size;
    const G = 1.2, Z0 = 2.0, ZA = 2.28, ZE = 3.12, out0 = L - 0.9;
    const grow = E3.out(sg(0, G)), a = Math.sin(Math.PI / 2 * sg(Z0, ZA)), pz = sg(ZA, ZE), q = Math.pow(pz, 1.7), Rm = base * (1 - 0.2 * a), end = Math.hypot(W, H) * 2.6;
    const R = t < ZA ? lerp(base * 0.05, base, grow) * (1 - 0.2 * a) : Rm * Math.pow(end / Rm, q);
    const rot = 360 * E3.io(sg(0, Z0)) - 14 * a + 59 * Math.pow(pz, 1.25);
    const fade = 1 - sg(out0, L);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.filter = "none";
    ctx.fillStyle = "#050616"; ctx.fillRect(0, 0, W, H);
    const fld = buf(s, "field", W, H), fx = fld.getContext("2d");
    if (t >= ZA - 0.05) {
      driftField(fx, c, c.t, lerp(1.7, 1, ex(sg(ZA, ZE + 0.35))), p);
      if (t < ZE) { fx.globalCompositeOperation = "destination-in"; fx.filter = `blur(${Math.max(0.6, R * 0.006).toFixed(2)}px)`; fx.translate(cx, cy); fx.rotate(rot * Math.PI / 180); fx.scale(R, R); fx.fillStyle = "#fff"; fx.fill(STAR_P); fx.setTransform(1, 0, 0, 1, 0, 0); fx.filter = "none"; fx.globalCompositeOperation = "source-over"; }
      ctx.globalAlpha = fade; ctx.drawImage(fld, 0, 0); ctx.globalAlpha = 1;
    }
    if (t < ZE + 0.05) {
      const col = sg(0.2, 0.6) * (1 - sg(ZA - 0.05, ZA + 0.22)), rim = sg(Z0 + 0.05, ZA) * (1 - sg(ZE - 0.18, ZE)), gA = Math.max(col, rim * 0.7) * (1 - clamp((R - 300 * c.k) / (400 * c.k))), gR = Math.min(R, 260 * c.k);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * Math.PI / 180); ctx.scale(R, R);
      if (gA > 0.02) { ctx.shadowColor = `rgba(74,160,248,${(0.85 * gA).toFixed(2)})`; ctx.shadowBlur = 6 + gR * 0.5; }
      if (t < 0.6) { ctx.globalAlpha = 1 - sg(0.2, 0.6); ctx.fillStyle = "#fff"; ctx.fill(STAR_P); }
      const gr = ctx.createLinearGradient(1, -1, -1, 1); gr.addColorStop(0, "#7fcbff"); gr.addColorStop(0.5, pcss(c.pal[3])); gr.addColorStop(1, "#2f7ff0");
      ctx.globalAlpha = Math.max(col, t < 0.6 ? 0 : 0); ctx.fillStyle = gr; ctx.fill(STAR_P);
      if (rim > 0.01) { ctx.globalAlpha = rim; ctx.lineWidth = 1.5 / R * c.k * 2; ctx.strokeStyle = "rgba(200,230,255,0.9)"; ctx.stroke(STAR_P); }
      ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    const bl = sg(ZE - 0.2, ZE) * (1 - sg(ZE, ZE + 0.35));
    if (bl > 0) { const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6); g.addColorStop(0, `rgba(255,255,255,${0.9 * 0.22 * bl})`); g.addColorStop(0.45, `rgba(200,225,255,${0.35 * 0.22 * bl})`); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  }

  // ── Filings + Gather (Magnetic Filings · Magnett Promo): a grid of iron filings turns to follow a moving magnet ──
  const FIL = { W: 1920, H: 1080, P0: [1920 * 1.3, 1080 * 1.3], P1: [1300, 640], P2: [520, 420], C: [960, 540], Q1: [650, 540], Q2: [1270, 540], R1: 300 };
  FIL.A0 = Math.atan2(FIL.P2[1] - 540, FIL.P2[0] - 960); FIL.R0 = Math.hypot(FIL.P2[0] - 960, FIL.P2[1] - 540); FIL.OE = [960 + 300 * Math.cos(FIL.A0), 540 + 300 * Math.sin(FIL.A0)];
  function filPoles(t, L) {
    const k = L / 12, A = 2.5 * k, O = 4.5 * k, Pp = 7.5 * k, S = 9.4 * k, SD = L - S, F = FIL, sw = E3.io; t = ((t % L) + L) % L; let p;
    if (t < A) { const e = sw((t - 0.7 * k) / (A - 0.7 * k)); p = [lerp(F.P0[0], F.P1[0], e), lerp(F.P0[1], F.P1[1], e)]; }
    else if (t < O) { const e = sw((t - A) / (O - A)); p = [lerp(F.P1[0], F.P2[0], e), lerp(F.P1[1], F.P2[1], e) - Math.sin(Math.PI * e) * 240]; }
    else if (t < Pp) { const e = sw((t - O) / (Pp - O)), a = F.A0 + Math.PI * 2 * e, r = lerp(F.R0, F.R1, e); p = [960 + r * Math.cos(a), 540 + r * Math.sin(a)]; }
    else if (t < S) { const e = sw((t - Pp) / (1.4 * k)); p = [lerp(F.OE[0], F.Q1[0], e), lerp(F.OE[1], F.Q1[1], e)]; }
    else { const e = sw((t - S - 0.5 * k) / (SD - 0.5 * k)); p = [lerp(F.Q1[0], F.P0[0], e), lerp(F.Q1[1], F.P0[1], e)]; }
    return { p, q: F.Q2, s2: E3.out((t - Pp - 0.4 * k) / (1.4 * k)) * (1 - sw((t - S) / (1.1 * k))) };
  }
  function mouseTrail(s, c, W, H) {
    const h = s.hist || (s.hist = []), [mx, my] = toDesign(c, W, H); h.push([c.t, mx, my]); while (h.length > 90) h.shift();
    return (t) => { for (let i = h.length - 1; i >= 0; i--) if (h[i][0] <= t) return [h[i][1], h[i][2]]; return h.length ? [h[0][1], h[0][2]] : [mx, my]; };
  }
  function drawFilings(ctx, c, p, s) {
    const { W, H } = FIL, paper = p.paper >= 0.5, bg = paper ? "#f4f4f3" : "#0c0c0d", ink = paper ? "#171717" : "#ececea", z = c.mouse[2], trail = mouseTrail(s, c, W, H);
    const cell = p.cell, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, ox = (W - (cols - 1) * cell) / 2, oy = (H - (rows - 1) * cell) / 2;
    const at = (t) => { const m = filPoles(t, p.cycle); if (z > 0.001) { const mp = trail(t); m.p = [lerp(m.p[0], mp[0], z), lerp(m.p[1], mp[1], z)]; m.s2 *= 1 - z; } return m; };
    const now = at(c.t), cam = 1.03 - 0.03 * Math.cos(2 * Math.PI * c.t / p.cycle);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.w, c.h); const [sc, tx, ty] = cover(ctx, c, W, H);
    ctx.translate(now.p[0], now.p[1]); ctx.scale(cam, cam); ctx.translate(-now.p[0], -now.p[1]);
    const len = cell * 0.56, th = Math.max(2, cell * 0.075); ctx.strokeStyle = ink; ctx.lineWidth = th; ctx.lineCap = "round";
    ctx.beginPath();
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const cx = ox + q * cell, cy = oy + r * cell, d0 = Math.hypot(now.p[0] - cx, now.p[1] - cy), m = at(c.t - d0 / 3200 * p.lag);
      const dx = m.p[0] - cx, dy = m.p[1] - cy, d1 = Math.hypot(dx, dy) || 1, ex = cx - m.q[0], ey = cy - m.q[1], d2 = Math.hypot(ex, ey) || 1;
      const vx = dx / d1 / d1 + m.s2 * ex / d2 / d2, vy = dy / d1 / d1 + m.s2 * ey / d2 / d2, a = Math.atan2(vy, vx);
      const near = Math.max(Math.max(0, 1 - d1 / 340), m.s2 * Math.max(0, 1 - d2 / 340)), hl = Math.max(0, (len * (1 + near * 0.45) - th) / 2), ca = Math.cos(a) * hl, sa = Math.sin(a) * hl;
      ctx.moveTo(cx - ca, cy - sa); ctx.lineTo(cx + ca, cy + sa);
    }
    ctx.stroke();
    if (p.magnet >= 0.5) {
      const pole = paper ? "#e4572e" : "#f07a4f";
      ctx.fillStyle = pole; ctx.beginPath(); ctx.arc(now.p[0], now.p[1], 9, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.arc(now.p[0], now.p[1], 19, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
      if (now.s2 > 0.01) { ctx.globalAlpha = now.s2; ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(now.q[0], now.q[1], 9, 0, 6.2832); ctx.fill(); ctx.globalAlpha = now.s2 * 0.18; ctx.beginPath(); ctx.arc(now.q[0], now.q[1], 19, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  const MK = { gap: 30, len: 17, thick: 4.5, dot: 30 };
  function gatherMagnet(t, U) {
    const C = FIL.C, sw = E3.io;
    if (t < U.Orbit) return [C[0], lerp(1300, C[1], sw((t - U.Pull) / 1.2))];
    if (t < U.Logo) { const e = sw((t - U.Orbit) / (U.Logo - U.Orbit)), a = Math.PI / 2 + Math.PI * 2 * e, r = 330 * Math.sin(Math.PI * e); return [C[0] + r * Math.cos(a), C[1] + r * Math.sin(a) * 0.8]; }
    return [C[0], lerp(C[1], 1300, sw((t - U.Out - 0.9) / 0.9))];
  }
  function drawGather(ctx, c, p, s) {
    const { W, H, C } = FIL, paper = p.paper >= 0.5, bg = paper ? "#f4f4f3" : "#0c0c0d", ink = paper ? "#171717" : "#ececea", L = p.cycle, k = L / 10, T = c.t % L, z = c.mouse[2];
    const U = { Pull: 0.4 * k, Orbit: 2.2 * k, Logo: 4.6 * k, Out: 7.4 * k }, sw = E3.io, cell = p.cell;
    if (!s.grid || s.cell !== cell) {
      const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, ox = (W - (cols - 1) * cell) / 2, oy = (H - (rows - 1) * cell) / 2, ci = Math.round((C[0] - ox) / cell), ri = Math.round((C[1] - oy) / cell); s.grid = []; s.cell = cell;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const dc = q - ci, dr = r - ri, mark = Math.abs(dc) <= 2 && Math.abs(dr) <= 2 && (dc || dr) ? [dc * MK.gap, dr * MK.gap] : null, gx = ox + q * cell, gy = oy + r * cell;
        s.grid.push({ gx, gy, base: h2(q, r) * 180, ph: h2(r, q + 9) * 6.283, mark, d: Math.hypot(gx - C[0], gy - C[1]) }); }
    }
    const [mx, my] = toDesign(c, W, H), mag = (t) => { const m = gatherMagnet(t, U); return z > 0.001 ? [lerp(m[0], mx, z), lerp(m[1], my, z)] : m; };
    const tL = T - U.Logo, tO = T - U.Out, now = mag(T), len0 = cell * 0.56, th0 = Math.max(2, cell * 0.075), loop = 2 * Math.PI * T / L, release = sw((tO - 0.6) / 1.4);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H); ctx.strokeStyle = ink; ctx.lineCap = "round";
    for (const f of s.grid) {
      const kk = (f.mark ? sw(tL / 1.1) * (1 - sw((tO - 0.5) / 1.3)) : sw((tL - f.d / 2600) / 0.9) * (1 - sw((tO - 0.5 - f.d / 2600) / 1.1))) * (1 - z);
      const x = f.mark ? lerp(f.gx, now[0] + f.mark[0], kk) : lerp(f.gx, now[0], kk * 0.8), y = f.mark ? lerp(f.gy, now[1] + f.mark[1], kk) : lerp(f.gy, now[1], kk * 0.8);
      const dd = Math.hypot(now[0] - x, now[1] - y), room = (1 - kk) * (1 - clamp((dd - 46) / 70)), vis = (f.mark ? 1 : 1 - kk) * (1 - room); if (vis < 0.02) continue;
      const m = mag(T - dd / 3200 * (1 - kk)), dx = m[0] - x, dy = m[1] - y, d = Math.hypot(dx, dy) || 1, field = Math.atan2(dy, dx) * 180 / Math.PI;
      const rest = f.base + 24 * Math.sin(loop * 2 + f.ph) + 10 * Math.sin(loop * 5 + f.ph * 2), hold = Math.max(E3.out((T - U.Pull - 0.3 - f.d / 1400) / 0.9) * (1 - release), z);
      const diff = ((((field - rest) % 180) + 270) % 180) - 90, len = f.mark ? lerp(len0, MK.len, kk) : len0, th = f.mark ? lerp(th0, MK.thick, kk) : th0;
      const st = (1 + hold * (1 - kk) * Math.max(0, 1 - d / 360) * 0.5) * (0.4 + 0.6 * vis), a = (rest + diff * hold) * Math.PI / 180, hl = Math.max(0, (len * st - th) / 2);
      ctx.globalAlpha = vis; ctx.lineWidth = th * (0.4 + 0.6 * vis); ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * hl, y - Math.sin(a) * hl); ctx.lineTo(x + Math.cos(a) * hl, y + Math.sin(a) * hl); ctx.stroke();
    }
    const aM = Math.max(E3.out((T - U.Pull) / 0.4) * (1 - E3.in((tO - 0.9) / 0.6)), z), live = Math.max(clamp((T - U.Pull) / 0.4) * (1 - clamp((tL - 0.2) / 0.4)), z);
    const land = tL > 0 && tL < 0.5 ? Math.sin(tL / 0.5 * Math.PI) : 0, sq = 1 + 0.18 * land, pulse = 1 + 0.07 * Math.sin(c.t * 5.2) * live, sz = MK.dot * (0.5 + 0.5 * aM) * pulse;
    if (aM > 0.01) {
      ctx.globalAlpha = aM; ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(now[0], now[1], sz / 2 * sq, sz / 2 / sq, 0, 0, 6.2832); ctx.fill();
      if (live > 0.02) { ctx.globalAlpha = aM * live * 0.9; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(now[0], now[1], MK.dot * (1 + 0.9 * live) / 2 * pulse, 0, 6.2832); ctx.stroke(); }
      if (tL > 0 && tL < 0.9) { const r = tL / 0.9; ctx.globalAlpha = (1 - r) * 0.6; ctx.lineWidth = 3 * (1 - r) + 0.5; ctx.beginPath(); ctx.arc(now[0], now[1], 20 + r * 260, 0, 6.2832); ctx.stroke(); }
    }
    ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Lattice + Orbits (Ideas to Reality Promo): wireframe cube lattice fly-through; tilted rings with comets ──
  const LCV = []; for (let b = 0; b < 8; b++) LCV.push([b & 1 ? 1 : -1, b & 2 ? 1 : -1, b & 4 ? 1 : -1]);
  const LCE = []; for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) { const d = a ^ b; if (d === 1 || d === 2 || d === 4) LCE.push([a, b]); }
  const LAT_C = []; for (let k = -7; k <= 0; k++) for (let j = -3; j <= 3; j++) for (let i = -5; i <= 5; i++) LAT_C.push({ i, j, k, seed: h2(i * 31 + j * 7 + k * 131, 4) });
  function drawLattice(ctx, c, p) {
    const W = 1920, H = 1080, SP = 2.4, DZ = 3.2, F = 1100, ink = c.pal[2];
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H);
    const [mx, my] = toDesign(c, W, H), panX = (mx / W - 0.5) * 2 * c.mouse[2], panY = (my / H - 0.5) * 2 * c.mouse[2];
    const CX = W / 2 - panX * 160, CY = H / 2 - panY * 120, camZ = -2.3, adv = (c.t * p.rate) % DZ, cx0 = panX * 1.2, cy0 = panY * 0.8;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const items = LAT_C.map(L => ({ L, z: L.k * DZ + adv + 3.2 })).sort((a, b) => b.z - a.z);
    for (const { L, z } of items) {
      const dz = z - camZ; if (dz < 0.15) continue;
      const a = clamp(1 - dz / (8 * DZ)) * clamp((dz - 0.15) / 0.8) * (0.35 + 0.65 * L.seed); if (a < 0.01) continue;
      const rx = c.t * 0.35 * p.spin + L.seed * 6.28, ry = c.t * 0.5 * p.spin + L.seed * 3.1, x0 = L.i * SP - cx0, y0 = L.j * SP - cy0;
      const P = LCV.map(v => { const x = v[0] * 0.5 * p.size, y = v[1] * 0.5 * p.size, zz = v[2] * 0.5 * p.size, y1 = y * Math.cos(rx) - zz * Math.sin(rx), z1 = y * Math.sin(rx) + zz * Math.cos(rx), x2 = x * Math.cos(ry) + z1 * Math.sin(ry), z2 = -x * Math.sin(ry) + z1 * Math.cos(ry); return [x0 + x2, y0 + y1, z + z2]; });
      ctx.strokeStyle = pcss(ink, a); ctx.lineWidth = Math.max(1, 2.4 * F / dz / 300); ctx.beginPath();
      for (const [ia, ib] of LCE) { const A = P[ia], B = P[ib]; if (A[2] - camZ < 0.12 || B[2] - camZ < 0.12) continue; const fa = F / (A[2] - camZ), fb = F / (B[2] - camZ); ctx.moveTo(CX + A[0] * fa, CY + A[1] * fa); ctx.lineTo(CX + B[0] * fb, CY + B[1] * fb); }
      ctx.stroke();
    }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.7)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  function drawOrbits(ctx, c, p) {
    const W = 1920, H = 1080, TAU = Math.PI * 2, CX = W / 2, CY = H / 2, O = c.t, ink = c.pal[2].map(v => Math.round(v * 255)).join(",");
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H);
    const [mx, my] = toDesign(c, W, H), ti = (my / H - 0.5) * c.mouse[2], ro = (mx / W - 0.5) * c.mouse[2];
    const R = [{ r: 165, n: 2, sp: 1.6, ph: 0 }, { r: 360, n: 3, sp: 0.9, ph: 2.1 }, { r: 560, n: 4, sp: 0.6, ph: 4.2 }];
    R.forEach((g, i) => {
      const r = g.r * p.scale * (1 + 0.04 * Math.sin(O * 0.7 + g.ph)), tilt = clamp(0.55 + 0.45 * Math.sin(O * 0.31 * p.sway + g.ph) + ti * 1.2, 0, 1.45), rot = 0.35 * Math.sin(O * 0.17 * p.sway + g.ph * 1.3) + ro * 0.8, ct = Math.cos(tilt);
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(rot); ctx.strokeStyle = `rgba(${ink},0.16)`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, r, Math.max(0.5, r * ct), 0, 0, TAU); ctx.stroke();
      for (let k = 0; k < g.n; k++) {
        const a = O * g.sp * p.rate + (k * TAU) / g.n + g.n, x = r * Math.cos(a), y = r * ct * Math.sin(a), ang = Math.atan2(r * ct * Math.cos(a), -r * Math.sin(a)), m = 6 + r * 0.028, depth = 0.7 + 0.3 * Math.sin(a);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(2.1, 1); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, m * 1.8);
        gr.addColorStop(0, `rgba(${ink},${0.95 * depth})`); gr.addColorStop(0.45, `rgba(${ink},${0.6 * depth})`); gr.addColorStop(1, `rgba(${ink},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, m * 1.8, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.restore();
    });
    const orR = 26 * p.scale, g = ctx.createRadialGradient(CX, CY, 0, CX, CY, orR * 3.2); g.addColorStop(0, `rgba(${ink},1)`); g.addColorStop(0.3, `rgba(${ink},1)`); g.addColorStop(0.36, `rgba(${ink},0.3)`); g.addColorStop(1, `rgba(${ink},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, orR * 3.2, 0, TAU); ctx.fill(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Prism (Product Video): six spectrum blobs orbit and screen-blend into a soft wash ──
  const PRISM_H = [[1, 0.373, 0.427], [1, 0.702, 0.278], [1, 0.902, 0.427], [0.29, 0.871, 0.502], [0.22, 0.741, 0.973], [0.506, 0.549, 0.973]];
  function drawPrism(ctx, c, p) {
    const W = 1920, H = 1080, CX = 960, CY = 540, t = c.t * p.flow; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H);
    const [mx, my] = toDesign(c, W, H), kick = 1 + 0.15 * (0.5 + 0.5 * Math.sin(c.t * 1.3)) * p.pulse; ctx.translate(CX, CY); ctx.scale(kick, kick); ctx.translate(-CX, -CY);
    ctx.globalCompositeOperation = "screen";
    PRISM_H.forEach((h, i) => { const x = lerp(CX + Math.cos(t * 0.5 + i * 1.3) * 580, mx, c.mouse[2] * 0.25), y = lerp(CY + Math.sin(t * 0.62 + i * 2.1) * 320, my, c.mouse[2] * 0.25), R = 380 * 1.9 * p.size;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, pcss(h, p.glow)); g.addColorStop(0.35, pcss(h, p.glow * 0.55)); g.addColorStop(1, pcss(h, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); });
    ctx.globalCompositeOperation = "source-over"; ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  const P = (key, label, min, max, step, def, unit) => ({ key, label, min, max, step, def, unit: unit || "" });
  const lerp = (a, b, t) => a + (b - a) * t;

  const EFFECTS = {
    current: {
      name: "Current", from: "Blastlabs Flow", kind: "GLSL", res: 0.5, rawPr: true, palette: "plasma",
      desc: "Line-integral flow streaks that speed up, heat up and bend around the cursor.",
      hint: "Move to bend the current",
      params: [P("scale", "Scale", 0.4, 3, 0.05, 1.2), P("current", "Current", 0, 2, 0.05, 0.7), P("length", "Trail", 6, 80, 1, 32), P("density", "Density", 0, 1, 0.01, 0.55)],
      frag: F_CURRENT,
      uniforms: (c, p) => ({ u_scale: p.scale, u_current: p.current, u_length: p.length, u_density: p.density, u_mouseInfluence: 1 }),
    },
    fret: {
      name: "Fret", from: "Nodepath Launch", kind: "GLSL", res: 0.75, palette: "ion",
      desc: "Truchet arcs that join into endless circuits, with light pulses running along every path.",
      hint: "Move to swirl · Click for a shockwave",
      params: [P("cell", "Cell", 10, 60, 1, 24), P("line", "Line", 0.5, 4, 0.05, 1.3), P("glow", "Glow", 0, 1, 0.01, 0.6), P("pulse", "Pulse", 0, 1.5, 0.01, 1), P("weld", "Weld", 0, 1, 0.01, 0.2), P("warp", "Swirl", 0, 1, 0.01, 0.15), P("split", "Chroma split", 0, 4, 0.05, 0.6)],
      frag: F_FRET,
      uniforms: (c, p) => ({ u_scale: p.cell, u_line: p.line, u_glow: p.glow, u_pulse: p.pulse, u_weld: p.weld, u_phase: c.t * 0.45, u_seed: 4, u_pan: [c.t * 0.05, c.t * 0.025], u_rot: c.t * 0.01, u_warp: p.warp + c.mouse[2] * 0.35, u_ca: p.split + c.shockA * 3 }),
    },
    skein: {
      name: "Skein", from: "Weftline Launch", kind: "GLSL", res: 0.75, palette: "aurora",
      desc: "Woven filaments that ripple at their own pace, drift sideways and draw in from the left.",
      hint: "Click for a shockwave",
      params: [P("cell", "Spacing", 10, 60, 1, 22), P("line", "Line", 0.5, 4, 0.05, 1.3), P("wave", "Wave", 0, 1.5, 0.01, 0.55), P("vary", "Variety", 0, 1, 0.01, 0.7), P("tilt", "Tilt", -45, 45, 1, -8, "°"), P("scatter", "Scatter", 0, 1, 0.01, 0.5), P("depth", "Depth", 0, 1, 0.01, 0.6), P("glow", "Glow", 0, 1, 0.01, 0.6), P("draw", "Draw-in", 0, 1, 0.01, 1), P("split", "Chroma split", 0, 4, 0.05, 0.4)],
      frag: F_SKEIN,
      uniforms: (c, p) => ({ u_scale: p.cell, u_line: p.line, u_wave: p.wave, u_vary: p.vary, u_rotate: p.tilt, u_scatter: p.scatter, u_depth: p.depth, u_glow: p.glow, u_draw: p.draw, u_phase: c.t * 0.4, u_wphase: c.t * 0.8, u_panx: c.t * 0.25, u_seed: 2, u_pulse: 0.9, u_ca: p.split + c.shockA * 3 }),
    },
    harmonia: {
      name: "Harmonia", from: "Harmonia Launch", kind: "GLSL", res: 0.75, palette: "ion",
      desc: "Times-table chords on a circle. Shift the multiplier and cardioids, nephroids and roses appear.",
      hint: "Move left and right to shift the multiplier",
      params: [P("points", "Points", 20, 150, 1, 120), P("mult", "Multiplier", 2, 40, 0.01, 2), P("drift", "Drift", 0, 0.5, 0.005, 0.06), P("radius", "Radius", 0.2, 0.48, 0.005, 0.38), P("line", "Line", 0.3, 2, 0.05, 0.7), P("glow", "Glow", 0, 1.5, 0.01, 0.8), P("dots", "Dots", 0, 1, 0.01, 0.5), P("field", "Field", 0, 1, 0.01, 0.35), P("ring", "Ring", 0, 1, 0.01, 0.5)],
      frag: F_HARMONIA,
      uniforms: (c, p) => ({ u_points: p.points, u_mult: p.mult + c.t * p.drift + c.mouse[2] * (c.mouse[0] / c.w - 0.5) * 6, u_R: Math.min(c.w, c.h) * p.radius, u_ctr: [c.w / 2, c.h / 2], u_line: p.line, u_glow: p.glow, u_dots: p.dots, u_bg: p.field, u_ring: p.ring, u_spin: c.t * 0.05, u_mult2: 3 + c.t * 0.01 }),
    },
    halo: {
      name: "Halo", from: "Gloww Announcement · Coming Soon", kind: "GLSL", res: 0.75, palette: "aqua",
      desc: "A soft radial bloom with a slowly orbiting focal point. Made for hero backgrounds.",
      hint: "Move to pull the focal point",
      params: [P("radius", "Radius", 0.1, 1.4, 0.01, 0.8), P("falloff", "Falloff", 0.05, 0.6, 0.01, 0.24), P("focal", "Focal", 0, 1, 0.01, 0.7), P("spin", "Orbit", 0, 60, 1, 14, "°/s"), P("core", "Core", 0, 1, 0.01, 0.8), P("grain", "Grain", 0, 0.15, 0.005, 0.03)],
      frag: F_HALO,
      uniforms: (c, p) => {
        const a = c.t * p.spin * Math.PI / 180;
        let dx = Math.cos(a), dy = Math.sin(a);
        const mx = c.mouse[0] - c.w / 2, my = c.mouse[1] - c.h / 2, ml = Math.hypot(mx, my) || 1;
        dx = lerp(dx, mx / ml, c.mouse[2]); dy = lerp(dy, my / ml, c.mouse[2]);
        return { u_radius: p.radius + Math.sin(c.t * 0.6) * 0.04, u_falloff: p.falloff, u_core: p.core, u_grain: p.grain, u_focal: [dx * p.focal, dy * p.focal] };
      },
    },
    thermal: {
      name: "Thermal", from: "Shader Trials Announcement", kind: "GLSL", res: 0.75, palette: "heat",
      desc: "Drifting heat sources merge into a banded thermal map. The cursor adds heat.",
      hint: "Move to add heat",
      params: [P("blobs", "Sources", 1, 6, 1, 5), P("size", "Size", 0.4, 2, 0.01, 1), P("bands", "Bands", 2, 24, 1, 9), P("contour", "Contour", 0, 1, 0.01, 0.5), P("glow", "Glow", 0, 1, 0.01, 0.6), P("grain", "Grain", 0, 0.15, 0.005, 0.03)],
      frag: F_THERMAL,
      uniforms: (c, p) => ({ u_blobs: p.blobs, u_size: p.size, u_bands: p.bands, u_contour: p.contour, u_glow: p.glow, u_grain: p.grain }),
    },
    mesh: {
      name: "Mesh", from: "Kinetic Opening", kind: "Canvas 2D", res: 1, palette: "ember", palettes: ["ember", "ion", "aurora", "mono"],
      desc: "A spring lattice that glows by tension. Every kick travels across it like a struck net.",
      hint: "Move to push · Click to strike",
      params: [P("energy", "Energy", 0, 2, 0.01, 1), P("stiffness", "Stiffness", 0.04, 0.3, 0.005, 0.12), P("damping", "Damping", 0.95, 0.995, 0.001, 0.978), P("kicks", "Kicks / s", 0, 3, 0.05, 0.8)],
    },
    decrypt: {
      name: "Decrypt", from: "Meridian Launch", kind: "GLSL", gl2: true, res: 1, palette: "aqua", palettes: ["aqua", "ion", "phosphor", "ember"],
      desc: "Text is rebuilt from best-fit glyphs and kept scrambled. A lens with a glowing, aberrated rim decodes it as it passes.",
      hint: "Move to decode", text: "Something is thinking.",
      params: [P("radius", "Lens", 0.05, 1, 0.01, 0.34), P("softness", "Softness", 0.02, 1, 0.01, 0.5), P("cell", "Cell", 8, 32, 0.5, 15), P("scramble", "Scramble", 0, 1, 0.01, 0.1), P("edge", "Edge glow", 0, 4, 0.05, 2), P("split", "Chroma split", 0, 30, 0.5, 10), P("pass", "Pass-through", 0, 1, 0.01, 0.15), P("size", "Text size", 0.04, 0.25, 0.002, 0.12)],
      frag: F_DECRYPT,
      uniforms: (c, p, e) => decryptU(c, p, textPanel(c.w, c.h, phrases(c, e)[0], { size: p.size, weight: 600, fg: "#f4f5f2", bg: "#000", ls: "-0.04em" }), false),
    },
    datawall: {
      name: "Data Wall", from: "Meridian Launch", kind: "GLSL", gl2: true, res: 1, palette: "aqua", palettes: ["aqua", "ion", "phosphor", "ember"],
      desc: "A wall of backlog items held in cipher. Two lenses hunt across it and decode what they cross.",
      hint: "Move to steer the first lens", text: "",
      params: [P("radius", "Lens", 0.05, 0.6, 0.01, 0.22), P("softness", "Softness", 0.02, 1, 0.01, 0.5), P("cell", "Cell", 8, 32, 0.5, 15), P("scramble", "Scramble", 0, 1, 0.01, 0.1), P("edge", "Edge glow", 0, 4, 0.05, 2), P("split", "Chroma split", 0, 30, 0.5, 10), P("pass", "Pass-through", 0, 1, 0.01, 0.15)],
      frag: F_DECRYPT,
      uniforms: (c, p, e) => decryptU(c, p, dataWall(c.w, c.h, phrases(c, e)[0], c.k), true),
    },
    sand: {
      name: "Sand", from: "Launch Film", kind: "GLSL", gl2: true, res: 1, palette: "mono", palettes: ["mono"],
      desc: "Each line forms out of drifting grains as a formation line sweeps down, holds, then blows back to dust.",
      hint: "Move up and down to gather and scatter", text: "Money still moves slowly.|Forms. Fees. Waiting.|Transactions, made effortless.",
      params: [P("grain", "Grain", 1.5, 8, 0.1, 3), P("spread", "Spread", 20, 600, 5, 220), P("band", "Band", 60, 600, 5, 260), P("swirl", "Swirl", 0, 200, 1, 60), P("drift", "Drift", 0, 2, 0.01, 0.7), P("gravity", "Gravity", -1, 1, 0.01, 0.35), P("cycle", "Cycle", 2.5, 12, 0.1, 5, "s"), P("size", "Text size", 0.03, 0.2, 0.002, 0.07)],
      frag: F_SAND,
      uniforms: (c, p, e) => {
        const ph = phrases(c, e), pn = textPanel(c.w, c.h, ph[Math.floor(c.t / p.cycle) % ph.length], { size: p.size, fg: "#f2f2ee", bg: "transparent" });
        const box = [pn._rect[1] * c.h, pn._rect[3] * c.h], d = Math.max(1, p.grain * c.k);
        c._sand = { pn, box, d, line: sandLine(c, p, box) };
        return { uContent: pn, uRes: [c.w, c.h], uDensity: d, uStagger: 0.7, uLine: c._sand.line, uBand: p.band * c.k, uBg: hex3("#0b0c0e") };
      },
      points: {
        vert: V_SAND_PTS, frag: F_SAND_PTS,
        uniforms: (c, p) => {
          const s = c._sand, r0 = Math.max(0, Math.floor((s.box[0] - 4) / s.d)), r1 = Math.min(Math.ceil(c.h / s.d), Math.ceil((s.box[1] + 4) / s.d)), gx = Math.ceil(c.w / s.d), gy = r1 - r0;
          return { count: gx * gy, uContent: s.pn, uRes: [c.w, c.h], uGrid: [gx, gy], uOrigin: [0, r0], uDensity: s.d, uStagger: 0.7, uSpread: p.spread * c.k, uGravity: p.gravity, uDrift: p.drift,
            uSwirl: p.swirl * c.k, uTime: c.t, uFade: 0.85, uSize: Math.max(1, 1.6 * c.k), uLine: s.line, uBand: p.band * c.k };
        },
      },
    },
    assemble: {
      name: "Assemble", from: "No Peace", kind: "GLSL", res: 1, palette: "solar", palettes: ["solar", "mono", "ember"],
      desc: "Thousands of particles orbit in a tilted ring, then swirl in to rebuild an image, catch a sweep of light and unravel again.",
      hint: "Move to turn it · set src for your own image",
      params: [P("grain", "Density", 2, 6, 1, 3), P("scale", "Scale", 0.4, 1.6, 0.01, 1), P("offset", "Offset", -0.4, 0.4, 0.01, 0), P("cycle", "Cycle", 5, 20, 0.5, 10, "s"), P("bloom", "Bloom", 0, 1.5, 0.01, 0.9)],
      frag: F_ASM,
      uniforms: (c, p) => { const tn = ASM_TONES[c.palName] || ASM_TONES.solar, a = asmTimes(c, p), vw = c.w / c.k; c._asm = { tn, a, vw };
        return { uBg: hex3(tn.bg), uGlow: tn.glow, uForm: a.form, uC: [c.w * (0.5 + p.offset), c.h / 2] }; },
      points: { vert: V_ASM, frag: F_ASM_PTS,
        uniforms: (c, p, e) => {
          const [src, img] = asmSource(c, e), D = assembleData(src, Math.round(p.grain), img); if (!D) return null;
          const { tn, a, vw } = c._asm;
          return { count: D.count, blend: "add", attribs: { aHome: [D.home, 4], aSeed: [D.seed, 4], aCol: [D.col, 3] },
            uT: c.t, uForm: a.form, uYaw: 0.22 * Math.sin(c.t * 0.38) + 0.05 + (c.mouse[0] / c.w - 0.5) * 1.4 * c.mouse[2], uScale: (0.9 + 0.06 * a.tl / a.L) * p.scale, uSweep: -300 + (vw + 580) * (a.tl < 3 ? 0 : 1 - Math.pow(1 - clamp((a.tl - 3) / 1.2), 3)) * 1.0,
            uFade: a.fade, uCx: vw * (0.5 + p.offset), uCy: 585, uSat: tn.sat, uBurst: a.burst, uTint: tn.tint, uView: [vw, 1080], uPx: c.k };
        } },
      post: (ctx, c, p, r) => {
        if (p.bloom <= 0) return;
        const s = r.scratch || (r.scratch = document.createElement("canvas")), sw = Math.max(2, c.w >> 2), sh = Math.max(2, c.h >> 2);
        if (s.width !== sw || s.height !== sh) { s.width = sw; s.height = sh; }
        const g = s.getContext("2d"); g.clearRect(0, 0, sw, sh); g.drawImage(ctx.canvas, 0, 0, sw, sh);
        const f = c.w / 1920; ctx.save(); ctx.globalCompositeOperation = "lighter";
        ctx.filter = `blur(${10 * f}px)`; ctx.globalAlpha = 0.9 * p.bloom / 0.9 * 0.5; ctx.drawImage(s, 0, 0, c.w, c.h);
        ctx.filter = `blur(${40 * f}px)`; ctx.globalAlpha = 0.7 * p.bloom / 0.9 * 0.5; ctx.drawImage(s, 0, 0, c.w, c.h); ctx.restore();
      },
    },
    aurora: {
      name: "Aurora", from: "Going to Be Alright", kind: "Canvas 2D", res: 1, palette: "aurora", palettes: ["aurora", "ember", "aqua"],
      desc: "Aurora curtains sweep in from the left over a ridge and a rippling lake, flare, then fade to start again.",
      hint: "Move to lead the sweep",
      params: [P("intensity", "Intensity", 0.2, 2, 0.01, 1), P("cycle", "Cycle", 5, 20, 0.5, 9, "s"), P("reflection", "Reflection", 0, 1, 0.01, 1), P("stars", "Stars", 0, 1, 0.01, 1), P("grain", "Grain", 0, 0.2, 0.005, 0.07)],
      draw: (ctx, c, p, s) => drawAurora(ctx, c, p, s),
    },
    horizon: {
      name: "Horizon", from: "Anticipating the Future", kind: "Canvas 2D", res: 1, palette: "synth", palettes: ["synth", "aqua", "aurora", "ember"],
      desc: "A striped sun rises behind a wireframe valley that flies toward the camera.",
      hint: "Move to steer",
      params: [P("rate", "Flight", 0, 6, 0.05, 2), P("peaks", "Peaks", 0, 2.5, 0.01, 1), P("sun", "Sun", 0.4, 1.6, 0.01, 1)],
      draw: (ctx, c, p) => drawHorizon(ctx, c, p),
    },
    blink: {
      name: "Blink", from: "Supreme Effort Squares", kind: "Canvas 2D", res: 1, palette: "ledger", palettes: ["ledger", "phosphor", "cobalt", "ember"],
      desc: "A field of squares blinks up from the floor. Each line dissolves in square by square, holds, then blinks out.",
      hint: "Move to stir the squares", text: "A supreme goal needs supreme effort.|Good enough never wins.|Supreme effort. Supreme results.",
      params: [P("square", "Square", 4, 40, 1, 12), P("gap", "Gap", 0, 16, 1, 4), P("field", "Field", 0, 1.02, 0.01, 0.4), P("edges", "Edge fade", 0, 3, 1, 0), P("hold", "Hold", 1.2, 6, 0.1, 2.6, "s"), P("paper", "Paper", 0, 1, 1, 1), P("size", "Text size", 0.02, 0.12, 0.002, 0.06)],
      draw: drawBlink,
    },
    drift: {
      name: "Drift", from: "Idea Reveal", kind: "Canvas 2D", res: 0.5, palette: "idea", palettes: ["idea", "ion", "aurora", "ember"],
      desc: "Four soft colour pools drift and overlap on deep navy. Built as something for glass to refract.",
      hint: "Move to part the colour",
      params: [P("flow", "Flow", 0, 4, 0.01, 1), P("glow", "Glow", 0.2, 1.6, 0.01, 1)],
      draw: (ctx, c, p) => driftField(ctx, c, c.t, 1, p),
    },
    sparkle: {
      name: "Sparkle", from: "Idea Reveal", kind: "Canvas 2D", res: 1, palette: "idea", palettes: ["idea", "ion", "aurora", "ember"],
      desc: "A four-point sparkle spins in, inhales, then punches toward the camera and becomes the window onto a colour field.",
      hint: "Move to place the sparkle",
      params: [P("size", "Size", 0.4, 3, 0.01, 1.4), P("cycle", "Cycle", 4, 14, 0.1, 6, "s"), P("flow", "Flow", 0, 4, 0.01, 1), P("glow", "Glow", 0.2, 1.6, 0.01, 1)],
      draw: drawSparkle,
    },
    filings: {
      name: "Filings", from: "Magnetic Filings", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono"],
      desc: "A grid of iron filings turns to face a magnet as it sweeps, arcs and orbits. Far filings answer a beat late; a second pole repels.",
      hint: "Move to become the magnet",
      params: [P("cell", "Cell", 24, 120, 1, 54), P("lag", "Lag", 0, 3, 0.01, 1), P("cycle", "Cycle", 6, 30, 0.5, 12, "s"), P("magnet", "Show magnet", 0, 1, 1, 1), P("paper", "Paper", 0, 1, 1, 1)],
      draw: drawFilings,
    },
    gather: {
      name: "Gather", from: "Magnett Promo", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono"],
      desc: "Filings at rest catch a passing magnet, then collapse inward and lock into a 5×5 mark around it before letting go.",
      hint: "Move to pull the filings",
      params: [P("cell", "Cell", 24, 120, 1, 54), P("cycle", "Cycle", 6, 24, 0.5, 10, "s"), P("paper", "Paper", 0, 1, 1, 1)],
      draw: drawGather,
    },
    lattice: {
      name: "Lattice", from: "Ideas to Reality Promo", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono", "aqua", "ember", "aurora"],
      desc: "An endless lattice of slowly turning wireframe cubes flows toward the camera and fades into the dark.",
      hint: "Move to steer the camera",
      params: [P("rate", "Flight", 0, 4, 0.01, 0.8), P("spin", "Spin", 0, 3, 0.01, 1), P("size", "Cube", 0.3, 2, 0.01, 1)],
      draw: drawLattice,
    },
    orbits: {
      name: "Orbits", from: "Ideas to Reality Promo", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono", "aqua", "ember", "aurora"],
      desc: "Three rings tilt and sway around a glowing core, each carrying comets that stretch along their path.",
      hint: "Move to tilt the rings",
      params: [P("scale", "Scale", 0.3, 1.6, 0.01, 0.9), P("rate", "Orbit", 0, 3, 0.01, 1), P("sway", "Sway", 0, 3, 0.01, 1)],
      draw: drawOrbits,
    },
    prism: {
      name: "Prism", from: "Product Video", kind: "Canvas 2D", res: 0.5, palette: "plasma", palettes: ["plasma"],
      desc: "Six spectrum blobs orbit on black and screen-blend into a soft, breathing rainbow wash.",
      hint: "Move to draw the colour in",
      params: [P("flow", "Flow", 0, 3, 0.01, 1), P("size", "Size", 0.4, 2, 0.01, 1), P("glow", "Glow", 0.1, 1, 0.01, 0.62), P("pulse", "Pulse", 0, 2, 0.01, 1)],
      draw: drawPrism,
    },
    sweep: {
      name: "Sweep", from: "AI Revolution Sweep", kind: "GLSL", gl2: true, res: 1, palette: "phosphor", palettes: ["phosphor", "cobalt", "ledger", "ember"],
      desc: "A band of glyphs sweeps across the frame, tears the scanlines and swaps one line of text for the next.",
      hint: "Move across to scrub the sweep", text: "Every few centuries, the ground shifts.|AI is turning thought into infrastructure.|This is our industrial revolution.",
      params: [P("glyph", "Glyph", 0.5, 4, 0.05, 2), P("band", "Band", 0.05, 0.6, 0.01, 0.28), P("trail", "Trail", 0, 2, 0.01, 0.75), P("turbulence", "Turbulence", 0, 1, 0.01, 0.5), P("glow", "Glow", 0, 2, 0.01, 2), P("split", "Chroma split", 0, 12, 0.1, 5), P("tear", "Tear", 0, 40, 0.5, 14), P("flicker", "Flicker", 0, 1, 0.01, 0.35), P("hold", "Hold", 0.4, 6, 0.1, 1.6, "s"), P("charset", "Charset", 0, 2, 1, 0), P("size", "Text size", 0.02, 0.12, 0.002, 0.045)],
      frag: F_SWEEP,
      uniforms: (c, p, e) => {
        const ph = phrases(c, e), n = ph.length, per = p.hold + 1.4, i = Math.floor(c.t / per), lt = c.t - i * per;
        const q = clamp((lt - p.hold) / 1.4), prog = lerp(1 - Math.pow(1 - q, 3), c.mouse[0] / c.w, c.mouse[2]);
        const o = { size: p.size, font: MONO_F, fg: "#e6e8e3", bg: "#0a0b0a", ls: "0.02em" }, bg = hex3("#0a0b0a");
        const gp = Math.max(p.glyph * c.k, 0.5), g = glyphBits(p.charset);
        return { uFrom: textPanel(c.w, c.h, ph[((i % n) + n) % n], o), uTo: textPanel(c.w, c.h, ph[(((i + 1) % n) + n) % n], o), uResolution: [c.w, c.h], uProgress: prog, uDir: [1, 0],
          uBand: p.band, uSoftness: 0.45, uTurbulence: p.turbulence, uTrail: p.trail, uGlyphPx: gp, uSpacing: 1, uLod: Math.max(0, Math.log2(7 * gp) - 1), uGlyphs: g.bits, uGlyphCount: { int: g.count },
          uInk: c.pal[0], uTint: 0.75, uGlow: p.glow, uAberration: p.split * c.k, uFlicker: p.flicker, uDensity: 0.9, uDisplace: p.tear * c.k, uContrast: 1.2, uBrightness: 0, uThreshold: 0.1, uFade: 0.75, uBg: bg, uBgLum: lum3(bg), uTime: c.t };
      },
    },
    rain: {
      name: "Rain", from: "Living in the Matrix", kind: "GLSL", gl2: true, res: 1, palette: "cobalt", palettes: ["cobalt", "phosphor", "ember", "mono"],
      desc: "Columns of glyph rain fall over a line of text. Each falling head lights the words it passes.",
      hint: "", text: "Are we living in the matrix?",
      params: [P("cell", "Cell", 8, 40, 1, 15), P("rate", "Fall", 0.05, 1, 0.01, 0.2), P("density", "Density", 0.02, 0.8, 0.01, 0.32), P("trail", "Trail", 0.2, 3, 0.05, 1.4), P("glow", "Glow", 0, 3, 0.01, 1.75), P("light", "Light", 0, 3, 0.01, 1.2), P("layers", "Layers", 1, 3, 1, 2), P("mutate", "Mutate", 0, 3, 0.01, 0), P("show", "Text", 0, 1, 0.01, 1), P("size", "Text size", 0.02, 0.14, 0.002, 0.056)],
      frag: F_RAIN,
      uniforms: (c, p, e) => {
        const a = glyphAtlas(KATAKANA), bg = hex3("#05070c");
        return { uContent: textPanel(c.w, c.h, phrases(c, e)[0], { size: p.size, fg: "#e8ecf5", bg: "#05070c", ls: "-0.02em" }), uAtlas: a.canvas, uResolution: [c.w, c.h], uTime: c.t + 7.3, uCell: p.cell * c.k,
          uGlyphCount: a.count, uAtlasGrid: a.grid, uColor: c.pal[0], uHeadColor: c.pal[1], uSpeed: p.rate, uSpeedVar: 0.5, uDensity: p.density, uTrail: p.trail, uGlow: p.glow, uMutate: p.mutate,
          uLayers: p.layers, uDim: 0.08, uLight: p.light, uLightRadius: 160 * c.k, uLightHeight: 172 * c.k, uRelief: 0, uBg: bg, uShow: p.show };
      },
    },
    asciify: {
      name: "Asciify", from: "It Pays Off", kind: "GLSL", gl2: true, res: 1, palette: "ledger", palettes: ["ledger", "phosphor", "cobalt"],
      desc: "A soft lens turns whatever sits under it into 5×5 glyphs or halftone dots. It reads text along the line on its own.",
      hint: "Move to steer the lens", text: "Effort compounds quietly.",
      params: [P("radius", "Lens", 0.05, 0.45, 0.005, 0.16), P("softness", "Softness", 0, 1, 0.01, 1), P("glyph", "Glyph", 0.5, 4, 0.05, 2), P("dots", "Dots", 0, 1, 1, 0), P("charset", "Charset", 0, 2, 1, 0), P("glow", "Glow", 0, 1, 0.01, 0.75), P("split", "Chroma split", 0, 1, 0.01, 0.75), P("invert", "Invert", 0, 1, 1, 0), P("paper", "Paper", 0, 1, 1, 1), P("size", "Text size", 0.03, 0.2, 0.002, 0.11)],
      frag: F_ASCII,
      uniforms: (c, p, e) => asciiU(c, p, e, false),
    },
    graph: {
      name: "Glyph Graph", from: "It Pays Off", kind: "GLSL", gl2: true, res: 1, palette: "ledger", palettes: ["ledger", "phosphor", "cobalt"],
      desc: "Columns of glyphs rise from the floor like a chart, keep moving, then climb to fill the frame and loop.",
      hint: "", text: "",
      params: [P("height", "Height", 0.1, 0.9, 0.01, 0.4), P("cycle", "Cycle", 4, 30, 0.5, 12, "s"), P("glyph", "Glyph", 0.5, 4, 0.05, 2), P("charset", "Charset", 0, 2, 1, 0), P("paper", "Paper", 0, 1, 1, 1), P("size", "Text size", 0.03, 0.2, 0.002, 0.07)],
      frag: F_ASCII,
      uniforms: (c, p, e) => asciiU(c, p, e, true),
    },
  };
  function decryptU(c, p, panel, two) {
    const ch = Math.max(6, p.cell * c.k), cw = ch * 0.75, cc = cipherCells(panel, cw, ch), A = cipherAtlas(), R = Math.min(c.w, c.h) * p.radius;
    const L = 5, tl = c.t % L, io = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    const burst = Math.max(Math.exp(-Math.pow(tl / 0.2, 2)), Math.exp(-Math.pow((tl - L) / 0.2, 2)));
    let lx, ly;
    if (two) { lx = c.w * (0.5 + 0.34 * Math.sin(c.t * 0.31) + 0.08 * Math.sin(c.t * 0.9)); ly = c.h * (0.5 + 0.3 * Math.sin(c.t * 0.47 + 1.2)); }
    else { lx = -R + (c.w + 2 * R) * io(tl / L); ly = c.h / 2 + c.h * 0.065 * Math.sin(c.t * 1.4); }
    const px = lerp(lx, c.mouse[0], c.mouse[2]), py = lerp(ly, c.mouse[1], c.mouse[2]);
    const l2 = two ? [c.w * (0.5 - 0.36 * Math.sin(c.t * 0.27 + 2)), c.h * (0.5 - 0.28 * Math.cos(c.t * 0.39)), R * 0.7, 1] : [0, 0, 0, 0];
    return { uContent: panel, uCells: cc.col, uGlyphIdx: cc.idx, uAtlas: A.canvas, uRes: [c.w, c.h], uCellPx: [cw, ch], uGrid: [cc.cols, cc.rows], uAtlasGrid: [A.cols, A.rows], uAtlasPad: A.pad, uAtlasInner: A.inner,
      uGlyphCount: { int: A.count }, uPointer: [px, py], uActive: 1, uRadius: R, uSoftness: p.softness, uLens2: l2, uColored: 1, uColor: c.pal[0], uBrightness: 1, uLegibility: 1,
      uScramble: p.scramble + 0.9 * burst, uScrambleSpeed: 6 + 18 * burst, uEdgeWidth: 0.2, uEdgeFlicker: 1, uEdgeGlow: p.edge, uEdgeTint: 0.75, uAberration: p.split * c.k, uPassthrough: p.pass, uBg: [0, 0, 0], uTime: c.t };
  }
  function asciiU(c, p, e, graph) {
    const paper = p.paper >= 0.5, BGc = paper ? "#fafaf8" : "#0a0b0a", bg = hex3(BGc);
    const pn = textPanel(c.w, c.h, phrases(c, e)[0], { size: p.size, fg: paper ? "#161616" : "#e6e8e3", bg: BGc, ls: "-0.005em" }), r = pn._rect;
    const gp = Math.max(p.glyph * c.k, 0.5), g = glyphBits(p.charset), dot = Math.max(1.25, gp * 0.75);
    const sx = 0.5 + 0.5 * Math.sin(c.t * 0.55), lx = r[0] - 0.03 + (r[2] - r[0] + 0.06) * (0.5 - 0.5 * Math.cos(c.t * 0.5));
    const ptr = [lerp(lx, c.mouse[0] / c.w, c.mouse[2]), lerp(0.5 + Math.sin(c.t * 2.1) * 0.012 + (sx - 0.5) * 0.02, 1 - c.mouse[1] / c.h, c.mouse[2])];
    const cyc = graph ? p.cycle : 1;
    return { uContent: pn, uResolution: [c.w, c.h], uGlyphPx: gp, uSpacing: 1, uGlyphs: g.bits, uGlyphCount: { int: g.count }, uRadius: graph ? 0 : p.radius, uSoftness: graph ? 1 : p.softness,
      uPointer: ptr, uActive: graph ? 0 : 1, uBg: bg, uBackingLum: lum3(bg), uBgOpacity: 1, uLod: Math.max(0, Math.log2(7 * gp) - 1), uContrast: 1, uBrightness: 0, uInvert: graph ? 0 : p.invert, uStrength: 1,
      uDotPx: dot, uDotLod: Math.max(0, Math.log2(dot) - 1), uGlowAmt: graph ? 0.75 : p.glow, uAberration: graph ? 0.75 : p.split, uReveal: 2, uErase: -1, uTextRect: r, uTextMode: graph ? 0 : p.dots,
      uTime: c.t, uLoop: (c.t % cyc) / cyc, uTotal: cyc, uGraphInk: c.pal[0], uGraphH: graph ? p.height : 0.4, uGraphOn: graph ? 1 : 0 };
  }
  const ORDER = Object.keys(EFFECTS);

  // ── WebGL renderer: one shared context, blitted into each field's 2D canvas ──
  // (browsers cap live WebGL contexts at ~8–16; sharing one keeps any number of fields alive)
  const SHARED = { canvas: null, gl: null, gl2: false, progs: {}, U: {}, tex: new WeakMap(), bufs: new WeakMap(), quad: null };
  const BASE_URL = (document.currentScript && document.currentScript.src || "").replace(/[^/?#]*([?#].*)?$/, "");
  function sharedGL() {
    if (SHARED.gl && !SHARED.gl.isContextLost()) return SHARED.gl;
    if (!SHARED.canvas) {
      SHARED.canvas = document.createElement("canvas");
      SHARED.canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); SHARED.gl = null; SHARED.progs = {}; SHARED.tex = new WeakMap(); });
      SHARED.canvas.addEventListener("webglcontextrestored", () => { SHARED.gl = null; SHARED.progs = {}; SHARED.tex = new WeakMap(); });
    }
    const go = { preserveDrawingBuffer: true, antialias: false, alpha: false };
    const gl = SHARED.canvas.getContext("webgl2", go) || SHARED.canvas.getContext("webgl", go);
    SHARED.gl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
    if (!gl || gl.isContextLost()) return null;
    SHARED.gl = gl; SHARED.progs = {}; SHARED.tex = new WeakMap();
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); SHARED.quad = buf; SHARED.bufs = new WeakMap();
    return gl;
  }
  function sharedProg(gl, id, pass) {
    const key = pass ? id + ":" + pass : id;
    if (SHARED.progs[key]) return SHARED.progs[key];
    const e = EFFECTS[id], P2 = pass ? e[pass] : null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("[shaderfield]", id, gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, P2 ? P2.vert : e.gl2 ? VERT2 : VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, P2 ? P2.frag : e.frag));
    gl.linkProgram(p);
    return (SHARED.progs[key] = { p, loc: gl.getAttribLocation(p, "a"), U: {} });
  }
  // Canvas/image/video → texture, re-uploaded only when its _sfv version changes (videos every frame)
  function bindTex(gl, unit, src) {
    let t = SHARED.tex.get(src); const v = src._sfv || 0, video = src.nodeName === "VIDEO";
    gl.activeTexture(gl.TEXTURE0 + unit);
    if (!t) { t = { tex: gl.createTexture(), v: -1 }; SHARED.tex.set(src, t); }
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    if (t.v !== v || video) {
      if (video && src.readyState < 2) return;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      const mip = SHARED.gl2 && !src._sfNoMip;
      if (mip) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      t.v = v;
    }
  }
  class GLRenderer {
    constructor(canvas) { this.kind = "gl"; this.canvas = canvas; this.ctx = canvas.getContext("2d"); }
    draw(c, id, params, palette) {
      const gl = sharedGL(); if (!gl) return;
      if (EFFECTS[id].gl2 && !SHARED.gl2) return;
      const sc = SHARED.canvas;
      if (sc.width < c.w || sc.height < c.h) { sc.width = Math.max(sc.width, c.w); sc.height = Math.max(sc.height, c.h); }
      const e = EFFECTS[id], pr = sharedProg(gl, id);
      gl.useProgram(pr.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, SHARED.quad); gl.enableVertexAttribArray(pr.loc); gl.vertexAttribPointer(pr.loc, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, c.w, c.h);
      let unit = 0, cur = pr;
      const set = (n, v) => {
        const pr = cur;
        if (v instanceof Uint32Array) n += "[0]";
        let l = pr.U[n]; if (l === undefined) l = pr.U[n] = gl.getUniformLocation(pr.p, n);
        if (l === null || v == null) return;
        if (typeof v === "number") gl.uniform1f(l, v);
        else if (v instanceof Uint32Array) gl.uniform1uiv(l, v);
        else if (v.int !== undefined) gl.uniform1i(l, v.int);
        else if (v.nodeName || (typeof ImageBitmap !== "undefined" && v instanceof ImageBitmap)) { bindTex(gl, unit, v); gl.uniform1i(l, unit++); }
        else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
        else if (v.length === 4) gl.uniform4f(l, v[0], v[1], v[2], v[3]);
        else gl.uniform3f(l, v[0], v[1], v[2]);
      };
      set("u_time", c.t); set("u_resolution", [c.w, c.h]); set("u_pixelRatio", e.rawPr ? c.pr : Math.max(1, c.pr));
      set("u_mouse", [c.mouse[0], c.h - c.mouse[1], c.mouse[2]]);
      set("u_wc", [lerp(c.w / 2, c.mouse[0], c.mouse[2]), lerp(c.h / 2, c.h - c.mouse[1], c.mouse[2])]);
      set("u_shockC", [c.shockX, c.h - c.shockY]); set("u_shockR", c.shockR); set("u_shockA", c.shockA);
      let l = pr.U.u_palette; if (l === undefined) l = pr.U.u_palette = gl.getUniformLocation(pr.p, "u_palette");
      if (l) gl.uniform3fv(l, new Float32Array((PALETTES[palette] || PALETTES[e.palette]).flat()));
      c.pal = PALETTES[palette] || PALETTES[e.palette]; c.palName = PALETTES[palette] ? palette : e.palette;
      const u = e.uniforms(c, params, e);
      for (const k in u) set(k, u[k]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (e.points) {
        const q = e.points.uniforms(c, params, e, u); if (q && q.count > 0) {
          const p2 = cur = sharedProg(gl, id, "points"); gl.useProgram(p2.p); gl.disableVertexAttribArray(pr.loc); unit = 0;
          const on = [];
          for (const k in q) {
            if (k === "count" || k === "blend") continue;
            if (k === "attribs") { for (const a in q.attribs) { const [arr, sz] = q.attribs[a]; let b = SHARED.bufs.get(arr); const loc = gl.getAttribLocation(p2.p, a); if (loc < 0) continue;
              if (!b) { b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); SHARED.bufs.set(arr, b); }
              gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, sz, gl.FLOAT, false, 0, 0); on.push(loc); } continue; }
            set(k, q[k]);
          }
          gl.enable(gl.BLEND);
          if (q.blend === "add") gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
          gl.drawArrays(gl.POINTS, 0, q.count); gl.disable(gl.BLEND); on.forEach(l => gl.disableVertexAttribArray(l));
        }
      }
      this.ctx.drawImage(sc, 0, sc.height - c.h, c.w, c.h, 0, 0, c.w, c.h);
      if (e.post) e.post(this.ctx, c, params, this);
    }
    destroy() {}
  }

  // ── Canvas 2D spring mesh (Kinetic Opening) ──
  const mrand = (k) => { const s = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
  function tensionColor(t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t; let f;
    if (t < 0.1) { f = t / 0.1; return [40 + f * 20, 14 + f * 8, 5 + f * 3]; }
    if (t < 0.3) { f = (t - 0.1) / 0.2; return [60 + f * 120, 22 + f * 38, 8 + f * 8]; }
    if (t < 0.55) { f = (t - 0.3) / 0.25; return [180 + f * 50, 60 + f * 60, 16 + f * 14]; }
    if (t < 0.8) { f = (t - 0.55) / 0.25; return [230 + f * 25, 120 + f * 100, 30 + f * 90]; }
    f = (t - 0.8) / 0.2; return [255, 220 + f * 35, 120 + f * 120];
  }
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(4)})`;
  class MeshRenderer {
    constructor(canvas) { this.kind = "2d"; this.canvas = canvas; this.ctx = canvas.getContext("2d"); this.sim = null; this.events = []; }
    build(w, h) {
      const COLS = 40, MX = w * 0.06, MY = h * 0.06, SX = (w - MX * 2) / (COLS - 1);
      const ROWS = Math.max(6, Math.round((h - MY * 2) / SX) + 1), SY = (h - MY * 2) / (ROWS - 1), N = COLS * ROWS;
      const s = { w, h, COLS, ROWS, MX, MY, SX, SY, N, step: 0, px: new Float32Array(N), py: new Float32Array(N), vx: new Float32Array(N), vy: new Float32Array(N), rx: new Float32Array(N), ry: new Float32Array(N), springs: [] };
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c; s.rx[i] = s.px[i] = MX + c * SX; s.ry[i] = s.py[i] = MY + r * SY;
        if (c < COLS - 1) s.springs.push(i, i + 1, SX);
        if (r < ROWS - 1) s.springs.push(i, i + COLS, SY);
      }
      this.sim = s; this.events = [];
    }
    radial(x, y, str, rad, t) {
      const s = this.sim; if (!s) return;
      const R = rad * Math.max(s.SX, s.SY);
      for (let i = 0; i < s.N; i++) {
        const dx = s.rx[i] - x, dy = s.ry[i] - y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < R && d > 0.1) { let f = 1 - d / R; f *= f; s.vx[i] += dx / d * str * f; s.vy[i] += dy / d * str * f; }
      }
      if (t != null) this.events.push({ t, x, y, big: rad > 5 ? 2.4 : 1 });
    }
    edge(k, energy, t) {
      const s = this.sim, sc = s.SX / 44.6, e = Math.floor(mrand(k) * 4), len = e % 2 === 0 ? s.COLS : s.ROWS;
      const size = 4 + Math.floor(mrand(k + 0.3) * 6), start = Math.floor(mrand(k + 0.7) * Math.max(1, len - size)), str = (26 + mrand(k + 0.9) * 12) * energy * sc;
      for (let q = start; q < start + size; q++) {
        const f0 = 1 - Math.abs(q - start - size * 0.5) / (size * 0.5), f = f0 * f0 * str;
        if (e === 0) s.vy[q] += f; else if (e === 2) s.vy[(s.ROWS - 1) * s.COLS + q] -= f;
        else if (e === 1) s.vx[q * s.COLS + s.COLS - 1] -= f; else s.vx[q * s.COLS] += f;
      }
      const mid = start + size * 0.5;
      const pos = e === 0 ? [s.MX + mid * s.SX, s.MY] : e === 1 ? [s.MX + (s.COLS - 1) * s.SX, s.MY + mid * s.SY] : e === 2 ? [s.MX + mid * s.SX, s.MY + (s.ROWS - 1) * s.SY] : [s.MX, s.MY + mid * s.SY];
      this.events.push({ t, x: pos[0], y: pos[1], big: 1 });
    }
    step(p) {
      const s = this.sim, { px, py, vx, vy, rx, ry, springs } = s, K = p.stiffness, D = p.damping;
      for (let q = 0; q < springs.length; q += 3) {
        const a = springs[q], b = springs[q + 1], L = springs[q + 2];
        const dx = px[b] - px[a], dy = py[b] - py[a], d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.001) continue;
        const f = K * (d - L) / d, fx = dx * f, fy = dy * f;
        vx[a] += fx; vy[a] += fy; vx[b] -= fx; vy[b] -= fy;
      }
      for (let i = 0; i < s.N; i++) {
        vx[i] = (vx[i] + (rx[i] - px[i]) * 0.003) * D; vy[i] = (vy[i] + (ry[i] - py[i]) * 0.003) * D;
        px[i] += vx[i]; py[i] += vy[i];
      }
      s.step++;
      if (p.kicks > 0 && mrand(s.step * 0.137) < p.kicks / 60) this.edge(s.step * 1.71, p.energy, s.step / 60);
    }
    draw(c, id, p, palette) {
      const { w, h } = c, ctx = this.ctx;
      if (!this.sim || this.sim.w !== w || this.sim.h !== h) this.build(w, h);
      const target = Math.floor(c.t * 60);
      if (target < this.sim.step) this.build(w, h);
      let n = 0; while (this.sim.step < target && n++ < (c.live ? 4 : 900)) this.step(p);
      if (c.live && this.sim.step < target - 4) this.sim.step = target;
      const s = this.sim, sc = s.SX / 44.6, T = s.step / 60;
      if (c.mouse[2] > 0.5 && c.mouseV > 0.5) this.radial(c.mouse[0], c.mouse[1], Math.min(6, c.mouseV * 0.25) * p.energy * sc, 3);
      if (c.burst) { this.radial(c.burst[0], c.burst[1], 30 * p.energy * sc, 9, T); c.burst = null; }
      this.canvas.style.filter = MESH_FILTER[palette] || "none";
      const { px, py, vx, vy, springs } = s, lk = Math.max(sc, 0.75);
      ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#0a0806"; ctx.fillRect(0, 0, w, h);
      this.events = this.events.filter(e => T - e.t < 0.6 && T >= e.t);
      let flash = 0; for (const e of this.events) flash = Math.max(flash, 0.04 * Math.pow(0.88, (T - e.t) * 60));
      if (flash > 0.001) { ctx.fillStyle = `rgba(220,100,25,${flash.toFixed(4)})`; ctx.fillRect(0, 0, w, h); }
      const tScale = 1 / (((s.SX + s.SY) * 0.5) * 0.35), breathe = 0.85 + 0.15 * Math.sin(T * 0.8);
      ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
      for (let pass = 0; pass < 2; pass++) for (let q = 0; q < springs.length; q += 3) {
        const a = springs[q], b = springs[q + 1], L = springs[q + 2];
        const dx = px[b] - px[a], dy = py[b] - py[a], ten = Math.abs(Math.sqrt(dx * dx + dy * dy) - L) * tScale;
        let al, lw;
        if (pass === 0) { al = (0.04 + ten * 0.18) * breathe; lw = (3.5 + ten * 8) * lk; }
        else { al = Math.min(1, (0.12 + ten * 0.6) * breathe); lw = (0.6 + ten * 1.6) * lk; }
        if (al < 0.005) continue;
        ctx.beginPath(); ctx.moveTo(px[a], py[a]); ctx.lineTo(px[b], py[b]);
        ctx.strokeStyle = rgba(tensionColor(ten), al); ctx.lineWidth = lw; ctx.stroke();
      }
      for (let i = 0; i < s.N; i++) {
        const sp = Math.hypot(vx[i], vy[i]) / sc; let br = sp * 0.2; if (br < 0.02) continue; if (br > 1) br = 1;
        if (sp > 3) {
          const bi = Math.min(1, (sp - 3) / 15);
          ctx.beginPath(); ctx.arc(px[i], py[i], (4 + bi * 12) * lk, 0, 6.2832); ctx.fillStyle = rgba([220 + bi * 35, 80 + bi * 60, 15 + bi * 40], bi * 0.35); ctx.fill();
          ctx.beginPath(); ctx.arc(px[i], py[i], (2 + bi * 4) * lk, 0, 6.2832); ctx.fillStyle = rgba([255, 220, 170], bi * 0.6); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(px[i], py[i], (0.8 + br * 2) * lk, 0, 6.2832); ctx.fillStyle = rgba([255, 170 + br * 70, 90 + br * 120], 0.12 + br * 0.75); ctx.fill();
      }
      for (const e of this.events) {
        const dt = T - e.t, life = 1 - dt * 2, ring = 1 - dt * 1.8; if (life <= 0) continue;
        const R = ((1 - life) * 100 + 20) * e.big * sc, al = life * life * 0.8;
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, R);
        g.addColorStop(0, `rgba(255,210,150,${al.toFixed(3)})`); g.addColorStop(0.2, `rgba(240,120,30,${(al * 0.6).toFixed(3)})`);
        g.addColorStop(0.5, `rgba(180,70,10,${(al * 0.25).toFixed(3)})`); g.addColorStop(1, "rgba(120,40,5,0)");
        ctx.beginPath(); ctx.arc(e.x, e.y, R, 0, 6.2832); ctx.fillStyle = g; ctx.fill();
        if (ring > 0) { ctx.beginPath(); ctx.arc(e.x, e.y, (15 + (1 - ring) * 120) * e.big * sc, 0, 6.2832); ctx.strokeStyle = `rgba(240,130,40,${(ring * ring * 0.5).toFixed(3)})`; ctx.lineWidth = 2 * ring * e.big * lk; ctx.stroke(); }
      }
      ctx.globalCompositeOperation = "source-over";
      const v = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.72);
      v.addColorStop(0, "rgba(10,8,6,0)"); v.addColorStop(1, "rgba(10,8,6,0.6)"); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    }
    destroy() {}
  }

  // Generic Canvas 2D effect: e.draw(ctx, c, params, palette, state)
  class FxRenderer {
    constructor(canvas, e) { this.kind = "2d"; this.canvas = canvas; this.ctx = canvas.getContext("2d"); this.e = e; this.s = {}; }
    draw(c, id, p, palette) { c.pal = PALETTES[palette] || PALETTES[this.e.palette]; c.palName = PALETTES[palette] ? palette : this.e.palette; this.canvas.style.filter = ""; this.e.draw(this.ctx, c, p, this.s, this.e); }
    destroy() { this.e.destroy && this.e.destroy(this.s); }
  }

  // ── Controller + shared frame loop ──
  const live = new Set(); let raf = 0;
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // rAF drives frames; a watchdog keeps fields alive where rAF is throttled (hidden or embedded frames)
  let lastTick = 0, watchdog = 0;
  const nextFrame = (f) => { if (!watchdog) watchdog = setInterval(() => { if (performance.now() - lastTick > 120) f(performance.now()); }, 40); return 1; };
  function loop(now) {
    lastTick = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); nextFrame(loop);
    const s = now / 1000;
    for (const c of live) {
      const dt = Math.min(0.1, s - (c.last || s)); c.last = s;
      if (c.paused) continue;
      if (!c.fixed) { const r = c.el.getBoundingClientRect(); if (r.width === 0 || r.bottom < -120 || r.top > innerHeight + 120 || r.right < 0 || r.left > innerWidth) continue; }
      if (!(reduced && c.respectReducedMotion)) c.clock += dt * (c.params.speed ?? 1);
      c.render(c.clock, true);
    }
  }
  const defaults = (e) => Object.fromEntries(e.params.map(p => [p.key, p.def]));

  class Field {
    constructor(el, o = {}) {
      this.el = el; this.clock = o.time ?? 0; this.visible = true; this.paused = o.autoplay === false;
      this.respectReducedMotion = o.respectReducedMotion !== false;
      this.m = { x: 0, y: 0, z: 0, tz: 0, v: 0, px: 0, py: 0 }; this.shock = { x: 0, y: 0, t: -99 }; this.burst = null; this.fixed = null;
      this.text = o.text; this.source = o.source || null;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      if (typeof IntersectionObserver === "function") { this.io = new IntersectionObserver(es => { this.visible = es[es.length - 1].isIntersecting; }, { rootMargin: "120px" }); this.io.observe(el); }
      this.setEffect(o.effect || "current", o.palette, o.params);
      if (o.interactive !== false) this.bind();
      live.add(this); if (!raf) { raf = requestAnimationFrame(loop); nextFrame(loop); }
    }
    bind() {
      const el = this.el, pos = (e) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r.width, r.height]; };
      this.onMove = (e) => { const [x, y, w, h] = pos(e); this.m.cx = x / w; this.m.cy = y / h; this.m.tz = 1; };
      this.onLeave = () => { this.m.tz = 0; };
      this.onDown = (e) => { const [x, y, w, h] = pos(e); this.shock = { cx: x / w, cy: y / h, t: performance.now() / 1000 }; this.burstAt = [x / w, y / h]; };
      el.addEventListener("pointermove", this.onMove); el.addEventListener("pointerleave", this.onLeave); el.addEventListener("pointerdown", this.onDown);
    }
    setEffect(id, palette, params) {
      const e = EFFECTS[id] || EFFECTS.current; this.id = EFFECTS[id] ? id : "current"; this.effect = e;
      this.params = Object.assign({ speed: 1 }, defaults(e), params || {});
      this.palette = palette && PALETTES[palette] && (!e.palettes || e.palettes.includes(palette)) ? palette : e.palette;
      const kind = e.Renderer ? "r:" + this.id : e.kind === "Canvas 2D" ? (e.draw ? "2d:" + this.id : "2d") : "gl";
      if (!this.r || this.rk !== kind) {
        if (this.r) { this.r.destroy(); this.r.canvas.remove(); }
        const cv = document.createElement("canvas");
        cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
        this.el.insertBefore(cv, this.el.firstChild);
        this.r = e.Renderer ? new e.Renderer(cv, e) : kind === "gl" ? new GLRenderer(cv) : e.draw ? new FxRenderer(cv, e) : new MeshRenderer(cv); this.rk = kind;
      }
      return this;
    }
    setText(s) { this.text = s; return this; }
    setSource(src) { if (typeof src === "string") { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => { i._sfv = 1; this.source = i; }; i.src = src; } else this.source = src; return this; }
    set(k, v) { if (typeof k === "object") Object.assign(this.params, k); else this.params[k] = v; return this; }
    setPalette(p) { if (PALETTES[p]) this.palette = p; return this; }
    get canvas() { return this.r.canvas; }
    size() {
      if (this.fixed) return this.fixed;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = this.el.clientWidth || 300, h = this.el.clientHeight || 150, s = dpr * (this.effect.res || 1);
      return [Math.max(2, Math.round(w * s)), Math.max(2, Math.round(h * s)), s];
    }
    render(t, isLive) {
      if (t != null) this.clock = t;
      const [w, h, pr] = this.size(), cv = this.r.canvas;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      const m = this.m; m.z += (m.tz - m.z) * 0.08;
      const nx = (m.cx ?? 0.5) * w, ny = (m.cy ?? 0.5) * h;
      m.v = Math.hypot(nx - m.x, ny - m.y) / Math.max(1, pr); m.x += (nx - m.x) * 0.25; m.y += (ny - m.y) * 0.25;
      const now = performance.now() / 1000, age = now - this.shock.t;
      const shockA = age < 1.6 ? Math.pow(1 - age / 1.6, 2) : 0;
      const c = { t: this.clock, w, h, pr, live: !!isLive, text: this.text, source: this.source, k: h / 1080, mouse: [m.x, m.y, m.z], mouseV: m.v, shockX: (this.shock.cx ?? 0.5) * w, shockY: (this.shock.cy ?? 0.5) * h, shockR: Math.max(0, age) * Math.min(w, h) * 0.9, shockA };
      if (this.burstAt) { c.burst = [this.burstAt[0] * w, this.burstAt[1] * h]; this.burstAt = null; }
      this.r.draw(c, this.id, this.params, this.palette);
      return this;
    }
    png() { this.render(); return this.r.canvas.toDataURL("image/png"); }
    async record(o = {}) {
      const seconds = o.seconds || 6, width = o.width || 1920, height = o.height || 1080, fps = o.fps || 60;
      const types = ["video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
      const mime = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
      if (!mime) throw new Error("Video recording is not supported in this browser");
      this.fixed = [width, height, width / Math.max(1, this.el.clientWidth) * (this.effect.res < 1 ? 1 : 1)];
      this.render();
      const stream = this.r.canvas.captureStream(fps), rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: o.bitrate || 16e6 }), chunks = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const stopped = new Promise(r => (rec.onstop = r));
      rec.start(250);
      const t0 = performance.now();
      await new Promise(res => { const iv = setInterval(() => { const p = (performance.now() - t0) / 1000 / seconds; o.onProgress && o.onProgress(Math.min(1, p)); if (p >= 1) { clearInterval(iv); res(); } }, 100); });
      rec.stop(); await stopped; stream.getTracks().forEach(t => t.stop()); this.fixed = null;
      return new Blob(chunks, { type: mime.split(";")[0] });
    }
    destroy() {
      live.delete(this); this.io && this.io.disconnect();
      if (this.onMove) { this.el.removeEventListener("pointermove", this.onMove); this.el.removeEventListener("pointerleave", this.onLeave); this.el.removeEventListener("pointerdown", this.onDown); }
      this.r.destroy(); this.r.canvas.remove();
    }
  }
  const mount = (el, o) => new Field(el, o);

  // ── <shader-field> custom element ──
  const PARAM_KEYS = ["speed", ...new Set(ORDER.flatMap(id => EFFECTS[id].params.map(p => p.key)))];
  if (typeof customElements !== "undefined" && !customElements.get("shader-field")) {
    customElements.define("shader-field", class extends HTMLElement {
      static get observedAttributes() { return ["effect", "palette", "text", "src", ...PARAM_KEYS]; }
      connectedCallback() {
        if (!this.style.display) this.style.display = "block";
        if (this.f) return;
        const params = {};
        for (const k of new Set(["speed", ...Object.values(EFFECTS).flatMap(e => e.params.map(p => p.key))])) { const v = parseFloat(this.getAttribute(k)); if (!isNaN(v)) params[k] = v; }
        this.f = mount(this, { effect: this.getAttribute("effect") || "current", palette: this.getAttribute("palette"), params, interactive: this.hasAttribute("interactive"), text: this.getAttribute("text") ?? undefined });
        if (this.getAttribute("src")) this.f.setSource(this.getAttribute("src"));
      }
      disconnectedCallback() { this.f && this.f.destroy(); this.f = null; }
      attributeChangedCallback(n, o, v) {
        if (!this.f || o === v) return;
        if (n === "effect") this.f.setEffect(v, this.getAttribute("palette"));
        else if (n === "palette") this.f.setPalette(v);
        else if (n === "text") this.f.setText(v);
        else if (n === "src") this.f.setSource(v);
        else { const x = parseFloat(v); if (!isNaN(x)) this.f.set(n, x); }
      }
      get field() { return this.f; }
    });
  }

  // ── Motion helpers (DOM) ──
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const rnd = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const sr = (i, k) => rnd(i, k) * 2 - 1;
  const oExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const oBack = (p) => { const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const oCubic = (p) => 1 - Math.pow(1 - p, 3);
  const GLYPHS = "01<>/\\#_*+=[]{}$%&@".split("");
  const TYPE_MODES = { soft: [0.018, 0.9], decode: [0.03, 0.8], flip: [0.035, 0.9], scatter: [0.022, 1.1], glitch: [0.025, 0.9] };

  // Type entrances (Nodepath Launch): soft · decode · flip · scatter · glitch
  function typeIn(el, o = {}) {
    const mode = TYPE_MODES[o.mode] ? o.mode : "soft", [A, B] = o.accent || ["#22d3ee", "#f43f5e"];
    const text = el.dataset.sfText || el.textContent; el.dataset.sfText = text;
    el.textContent = ""; el.setAttribute("aria-label", text);
    if (mode === "flip") el.style.perspective = "600px";
    const chars = [...text], spans = chars.map(ch => { const s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.style.cssText = "display:inline-block;white-space:pre;opacity:0;transform-origin:50% 100%;"; s.textContent = ch; el.appendChild(s); return s; });
    const [st, dur] = TYPE_MODES[mode], t0 = performance.now() / 1000 + (o.delay || 0), total = chars.length * st + dur + 0.1;
    const tok = el._sfTok = {};
    return new Promise(res => {
      const tick = () => {
        if (el._sfTok !== tok) return res();
        const T = performance.now() / 1000 - t0;
        spans.forEach((s, i) => {
          const ch = chars[i], lt = T - i * st, p = clamp(lt / dur);
          let tf = "", op = p > 0 ? 1 : 0, blur = 0, glyph = ch, col = "", split = mode === "decode" && lt > 0 ? 5 * Math.exp(-lt * 3) : 0;
          if (mode === "decode") { if (p > 0 && p < 1 && ch !== " ") { glyph = GLYPHS[Math.floor(rnd(i, Math.floor(T * 12)) * GLYPHS.length)]; col = A; } tf = `translateY(${(1 - oCubic(p)) * 0.3}em)`; op = clamp(p * 2); }
          else if (mode === "soft") { const e = oCubic(p); tf = `translateY(${(1 - e) * 0.35}em)`; blur = (1 - e) * 6; op = p; }
          else if (mode === "flip") { const e = oBack(p); tf = `rotateX(${(1 - e) * -110}deg) translateY(${(1 - e) * 0.5}em) scale(${0.6 + 0.4 * e})`; op = clamp(p * 3); }
          else if (mode === "scatter") { const e = oExpo(p), k = 1 - e; tf = `translate(${sr(i, 1) * k * 3}em, ${sr(i, 2) * k * 2}em) rotate(${sr(i, 3) * k * 90}deg) scale(${1 + k * 0.8 * rnd(i, 4)})`; blur = k * 14; op = clamp(p * 1.5); }
          else { const j = 1 - oCubic(p); tf = `translateX(${j}em) skewX(${j * -24}deg)`; op = clamp(p * 1.6); blur = j * 10; split += 8 * j; }
          s.style.transform = tf; s.style.opacity = op; s.style.color = col;
          s.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
          s.style.textShadow = split > 0.3 ? `${split.toFixed(1)}px 0 ${A}, ${(-split).toFixed(1)}px 0 ${B}` : "none";
          if (s.textContent !== glyph) s.textContent = glyph;
        });
        if (T < total) rafFx(tick); else res();
      };
      tick();
    });
  }

  // Pixel curtain (Closebook Launch): cover in scattered order, swap, reveal in a new order
  function shuffle(n, seed) { let s = seed | 0; const r = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function curtain(el, o = {}) {
    const color = o.color || "#ffffff", cols = o.cols || 24, cover = o.cover ?? 0.55, fade = o.fade ?? 0.18, hold = o.hold ?? 0.12, seed = o.seed || Math.floor(Math.random() * 1e6);
    const r = el.getBoundingClientRect(), rows = Math.max(3, Math.round(r.height / (r.width / cols))), n = cols * rows;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const grid = document.createElement("div");
    grid.style.cssText = `position:absolute;inset:0;display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);pointer-events:none;z-index:20;`;
    const cells = []; for (let i = 0; i < n; i++) { const c = document.createElement("div"); c.style.cssText = `background:${color};opacity:0;`; grid.appendChild(c); cells.push(c); }
    el.appendChild(grid);
    const o1 = shuffle(n, seed), o2 = shuffle(n, seed * 7 + 3), step = cover / n, b = cover + fade + hold / 2, r0 = b + hold / 2, t0 = performance.now() / 1000;
    let swapped = false;
    return new Promise(res => {
      const tick = () => {
        const T = performance.now() / 1000 - t0;
        if (!swapped && T >= b) { swapped = true; o.onSwap && o.onSwap(); }
        for (let i = 0; i < n; i++) { const op = clamp((T - o1[i] * step) / fade) * (1 - clamp((T - r0 - o2[i] * step) / fade)); cells[i].style.opacity = op; cells[i].style.boxShadow = op > 0.99 ? `0 0 0 1px ${color}` : "none"; }
        if (T < r0 + cover + fade) rafFx(tick); else { grid.remove(); res(); }
      };
      tick();
    });
  }

  // Scroll-linked word reveal (Tended HR, Closebook Launch). Wrap words in *stars* to accent them.
  function revealWords(el, o = {}) {
    const dim = o.dim ?? 0.15, acc = o.accent || "inherit";
    const text = el.dataset.sfText || el.textContent.trim(); el.dataset.sfText = text; el.textContent = "";
    el.style.display = "flex"; el.style.flexWrap = "wrap"; el.style.columnGap = "0.26em";
    const words = text.split(/\s+/).map(w => { const s = document.createElement("span"); s.textContent = w.replace(/\*/g, ""); if (w.includes("*")) s.style.color = acc; s.style.display = "inline-block"; el.appendChild(s); return s; });
    const n = words.length, stp = n > 1 ? 0.8 / (n - 1) : 0;
    const update = () => {
      const r = el.getBoundingClientRect(), vh = window.innerHeight, p = clamp((vh * 0.85 - r.top) / (vh * 0.55 + r.height * 0.5));
      words.forEach((s, i) => { const t = clamp((p - i * stp) / 0.2); s.style.opacity = dim + (1 - dim) * t; s.style.transform = `translateY(${((1 - oExpo(t)) * 0.12).toFixed(3)}em)`; });
    };
    const paint = (p) => words.forEach((s, i) => { const t = clamp((p - i * stp) / 0.2); s.style.opacity = dim + (1 - dim) * t; s.style.transform = `translateY(${((1 - oExpo(t)) * 0.12).toFixed(3)}em)`; });
    if (o.manual) { paint(o.progress || 0); const stop = () => {}; stop.set = paint; return stop; }
    const root = o.scroller || window; root.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
    const stop = () => { root.removeEventListener("scroll", update); window.removeEventListener("resize", update); }; stop.set = paint; return stop;
  }

  // Spring follower (Cursor Gallery): el chases the pointer inside area
  function springFollow(el, area, o = {}) {
    let k = o.stiffness ?? 0.18, d = o.damping ?? 0.72;
    let tx = 0, ty = 0, cx = 0, cy = 0, vx = 0, vy = 0, on = false, id = 0;
    el.style.position = "absolute"; el.style.left = "0"; el.style.top = "0"; el.style.pointerEvents = "none"; el.style.opacity = "0"; el.style.transition = "opacity .25s";
    const move = (e) => { const r = area.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; if (!on) { cx = tx; cy = ty; on = true; el.style.opacity = "1"; } };
    const leave = () => { on = false; el.style.opacity = "0"; };
    const tick = () => {
      vx = (vx + (tx - cx) * k) * d; vy = (vy + (ty - cy) * k) * d; cx += vx; cy += vy;
      el.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(${clamp(vx * 0.8, -18, 18)}deg) scale(${1 + Math.min(0.25, Math.hypot(vx, vy) * 0.008)})`;
      if (!stopped) rafFx(tick);
    };
    let stopped = false;
    area.addEventListener("pointermove", move); area.addEventListener("pointerleave", leave); tick();
    const stop = () => { stopped = true; area.removeEventListener("pointermove", move); area.removeEventListener("pointerleave", leave); };
    stop.set = (x) => { k = x.stiffness ?? k; d = x.damping ?? d; }; return stop;
  }

  // ── More motion helpers ──
  const EZ = { out: oCubic, expo: oExpo, back: oBack, in: (p) => p * p * p, inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2), smooth: (p) => p * p * (3 - 2 * p), pop: (p) => { p = clamp(p); const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }, spring: (t) => (t <= 0 ? 0 : 1 - (1 + 18 * t) * Math.exp(-18 * t)) };
  const now = () => performance.now() / 1000;
  const rel = (el) => { if (getComputedStyle(el).position === "static") el.style.position = "relative"; };
  const rafFx = (f) => { let done = false; const go = () => { if (done) return; done = true; cancelAnimationFrame(a); clearTimeout(b); f(); }; const a = requestAnimationFrame(go), b = setTimeout(go, 50); };
  function play(dur, fn) { return new Promise(res => { const t0 = now(); const tick = () => { const t = now() - t0; fn(Math.min(t, dur)); if (t < dur) rafFx(tick); else res(); }; tick(); }); }
  function loopFx(fn) { let on = true; const t0 = now(); const tick = () => { if (!on) return; fn(now() - t0); rafFx(tick); }; tick(); return () => { on = false; }; }
  function masked(el, by) {
    const text = el.dataset.sfText || el.textContent.trim(); el.dataset.sfText = text; el.setAttribute("aria-label", text); el.textContent = "";
    el.style.display = "flex"; el.style.flexWrap = "wrap"; if (by === "word") el.style.columnGap = "0.26em";
    return (by === "word" ? text.split(/\s+/) : [...text]).map(u => {
      const m = document.createElement("span"); m.setAttribute("aria-hidden", "true"); m.style.cssText = "display:inline-block;overflow:hidden;padding-bottom:0.1em;margin-bottom:-0.1em;";
      const i = document.createElement("span"); i.style.cssText = "display:inline-block;white-space:pre;"; i.textContent = u; m.appendChild(i); el.appendChild(m); return i;
    });
  }
  // Letter / word rise through a mask (Gloww, Blastlabs, Closebook, Dev Agency, Orfa Agents)
  function rise(el, o = {}) {
    const by = o.by || "char", parts = masked(el, by), st = o.stagger ?? (by === "word" ? 0.07 : 0.045), d = o.duration ?? (by === "word" ? 0.6 : 1.1), ez = EZ[o.ease || (by === "word" ? "out" : "expo")], out = !!o.out, dl = o.delay || 0;
    parts.forEach(p => (p.style.transform = `translateY(${out ? 0 : 115}%)`));
    return play(dl + parts.length * st + d, t => parts.forEach((p, i) => { const k = ez(clamp((t - dl - i * st) / d)); p.style.transform = `translateY(${out ? -k * 115 : (1 - k) * 115}%)`; }));
  }
  // Line-by-line masked heading with exit (App Features, Desktop Features)
  function lineRise(el, o = {}) {
    const lines = el._sfLines || (el._sfLines = [...el.children]);
    lines.forEach(k => { if (!k._sfMask) { const m = document.createElement("div"); m.style.cssText = "overflow:hidden;padding-bottom:0.08em;"; k.parentNode.insertBefore(m, k); m.appendChild(k); k._sfMask = m; } });
    const out = !!o.out, st = out ? 0.04 : o.stagger ?? 0.08, d = out ? 0.45 : o.duration ?? 0.9;
    return play(lines.length * st + d, t => lines.forEach((k, i) => { const p = clamp((t - i * st) / d); k.style.transform = `translateY(${out ? -Math.pow(p, 3) * 112 : (1 - oCubic(p)) * 112}%)`; }));
  }
  // Number tween with tabular figures (Tended HR, Closebook)
  function countUp(el, o = {}) {
    const f = o.from ?? 0, to = o.to ?? 100, d = o.duration ?? 1.6, dec = o.decimals ?? 0; el.style.fontVariantNumeric = "tabular-nums";
    const fm = v => (o.prefix || "") + v.toLocaleString(o.locale || "en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (o.suffix || "");
    return play((o.delay || 0) + d, t => { el.textContent = fm(f + (to - f) * oExpo(clamp((t - (o.delay || 0)) / d))); });
  }
  // Check circle that pops in with overshoot (Tended HR, Closebook)
  function tick(el, o = {}) {
    const s = o.size || 26, acc = o.color || "#34d399", dl = o.delay || 0;
    el.innerHTML = `<div style="position:relative;width:${s}px;height:${s}px"><div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${o.ring || "rgba(242,242,244,0.25)"};box-sizing:border-box"></div><div style="position:absolute;inset:0;border-radius:50%;background:${acc};display:flex;align-items:center;justify-content:center;transform:scale(0);opacity:0"><svg width="${s * 0.55}" height="${s * 0.55}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div></div>`;
    const f = el.firstChild.children[1];
    return play(dl + 0.5, t => { const p = clamp((t - dl) / 0.5); f.style.transform = `scale(${EZ.pop(p)})`; f.style.opacity = clamp(p * 3); });
  }
  // Staggered progress bars (Tended HR, Orfa Agents)
  function bars(el, o = {}) {
    const v = o.values || [1, 1, 1, 1], h = o.height || 8, st = o.stagger ?? 0.28; el.innerHTML = ""; el.style.display = "grid"; el.style.gridTemplateColumns = o.columns || `repeat(${v.length},1fr)`; el.style.gap = (o.gap ?? 8) + "px";
    const fills = v.map(() => { const tr = document.createElement("div"); tr.style.cssText = `height:${h}px;border-radius:${h / 2}px;background:${o.track || "rgba(242,242,244,0.1)"};overflow:hidden`; const f = document.createElement("div"); f.style.cssText = `height:100%;width:0;border-radius:${h / 2}px;background:${o.color || "#f2f2f4"}`; tr.appendChild(f); el.appendChild(tr); return f; });
    return play(v.length * st + 0.5, t => fills.forEach((f, j) => { f.style.width = oExpo(clamp((t - j * st) / 0.5)) * v[j] * 100 + "%"; }));
  }
  // Ping or blink status dot (Desktop Features, Orfa Agents)
  function pulseDot(el, o = {}) {
    const c = o.color || "#38bdf8", s = o.size || 8, per = o.period || 1, off = o.offset || 0;
    Object.assign(el.style, { position: "relative", display: "inline-block", width: s + "px", height: s + "px", borderRadius: "50%", background: c, flexShrink: "0" });
    const r = document.createElement("span"); r.style.cssText = `position:absolute;inset:0;border-radius:50%;background:${c}`; el.appendChild(r);
    const stop = loopFx(t => { if (o.mode === "blink") { el.style.opacity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin((t + off) * 9)); r.style.opacity = 0; return; } const f = oCubic(Math.min(1, ((t + off) % per) / per / 0.75)); r.style.transform = `scale(${1 + f})`; r.style.opacity = 1 - f; });
    return () => { stop(); r.remove(); };
  }
  // Iris close to a hairline, or a vertical shutter (Orfa Agents, Dev Agency)
  function iris(el, o = {}) {
    rel(el); const c = o.content || el.firstElementChild, acc = o.color || "#34d399", rev = !!o.open, sh = !!o.shutter, D = sh ? 0.7 : 1.05;
    const ln = document.createElement("div"); ln.style.cssText = `position:absolute;top:50%;height:1px;background:${acc};pointer-events:none;z-index:5;opacity:0`; if (!sh) el.appendChild(ln);
    return play(D, t => { const tt = rev ? D - t : t; const y = sh ? EZ.in(clamp(tt / D)) : EZ.inOut(clamp(tt / 0.55)), x = sh ? 0 : EZ.inOut(clamp((tt - 0.5) / 0.5));
      c.style.clipPath = `inset(${y * 50}% ${x * 50}% ${y * 50}% ${x * 50}%)`; ln.style.left = ln.style.right = x * 50 + "%"; ln.style.opacity = EZ.smooth(clamp((y - 0.7) / 0.3)) * (x < 0.98 ? 1 : 0); }).then(() => ln.remove());
  }
  const bez = (x1, y1, x2, y2) => { const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => { x = clamp(x); let t = x; for (let i = 0; i < 8; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; } return Y(clamp(t)); }; };
  const ROLL = bez(0.76, 0, 0.24, 1);
  // Word swap by typing: delete the last word, pause, type the next; the caret blinks while idle (Signpost Typewriter)
  function typeSwap(el, words, o = {}) {
    const TY = o.type ?? 0.055, DL = o.del ?? 0.032, hold = o.hold ?? 1.6, gap = o.gap ?? 0.12, block = o.caret === "block";
    el.textContent = ""; el.style.display = "inline-flex"; el.style.alignItems = "center"; el.style.gap = block ? "0.07em" : "0.08em"; el.style.whiteSpace = "nowrap";
    const txt = document.createElement("span"), car = document.createElement("span"); el.append(txt, car);
    car.style.cssText = `flex:none;display:inline-block;width:${block ? "0.55em" : "0.05em"};height:0.8em;background:${o.caretColor || "currentColor"};`;
    const seg = words.map((w, i) => { const prev = words[(i - 1 + words.length) % words.length], d = prev.length * DL, s = d + gap, e = s + w.length * TY; return { w, prev, d, s, e, L: e + hold }; });
    const total = seg.reduce((a, b) => a + b.L, 0);
    return loopFx(t => {
      let u = t % total, i = 0; while (u > seg[i].L) { u -= seg[i].L; i++; } const g = seg[i]; let text, active = true, last = 0;
      if (t < seg[0].L && i === 0) { text = g.w; active = false; last = 0; }
      else if (u < g.d) text = g.prev.slice(0, g.prev.length - Math.floor(u / DL) - 1);
      else if (u < g.s) { text = ""; active = false; last = g.d; }
      else if (u < g.e) text = g.w.slice(0, Math.floor((u - g.s) / TY) + 1);
      else { text = g.w; active = false; last = g.e; }
      if (txt.textContent !== text) txt.textContent = text;
      car.style.opacity = active || Math.floor((u - last + 0.53) / 0.53) % 2 === 0 ? 1 : 0;
    });
  }
  const HUES = ["#ff5f6d", "#ffb347", "#ffe66d", "#4ade80", "#38bdf8", "#818cf8", "#e879f9"];
  const conicG = (d, h) => `conic-gradient(from ${d.toFixed(1)}deg, ${(h || HUES).join(", ")}, ${(h || HUES)[0]})`;
  const exIn = (t) => (t <= 0 ? 0 : Math.pow(2, 10 * clamp(t) - 10));
  const ob21 = (t) => { t = clamp(t); const c1 = 2.1, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  // Per-letter pop: rise, overshoot scale and de-blur; out flies them up and away (Product Video)
  function pop(el, o = {}) {
    const by = o.by || "char", text = el.dataset.sfText || el.textContent.trim(); el.dataset.sfText = text; el.setAttribute("aria-label", text); el.textContent = "";
    const parts = by === "word" ? text.split(" ") : [...text], st = o.stagger ?? (by === "word" ? 0.08 : 0.04), d = o.duration ?? 0.45, lift = o.lift ?? 0.5, px = o.blur ?? 16, s0 = o.from ?? 0.6, out = !!o.out;
    const sp = parts.map((p, i) => { const s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.style.cssText = "display:inline-block;white-space:pre;"; s.textContent = by === "word" && i < parts.length - 1 ? p + " " : p; el.appendChild(s); return s; });
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    return play(parts.length * st + d + 0.4, t => sp.forEach((s, i) => {
      let op, dy, sc; if (!out) { const a = clamp((t - i * st) / d), e = ob21(a), f = oExpo(a); op = f; dy = (1 - e) * lift * fs; sc = lerp(s0, 1, e); }
      else { const q = exIn((t - i * st * 0.6) / 0.35); op = 1 - q; dy = -q * lift * fs; sc = 1 + q * 0.2; }
      s.style.opacity = op; s.style.filter = op > 0.995 ? "none" : `blur(${((1 - op) * px).toFixed(2)}px)`; s.style.transform = `translateY(${dy.toFixed(1)}px) scale(${sc.toFixed(3)})`; }));
  }
  // A diagonal glint sweeps across the element once (Product Video)
  function shine(el, o = {}) {
    rel(el); const d = o.duration ?? 0.6, wrap = document.createElement("div"), bar = document.createElement("div");
    wrap.style.cssText = "position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;z-index:5;";
    bar.style.cssText = `position:absolute;top:-40%;bottom:-40%;width:${o.size || "30%"};transform:rotate(18deg);background:linear-gradient(90deg,rgba(255,255,255,0),${o.color || "rgba(255,255,255,0.85)"},rgba(255,255,255,0));`; wrap.appendChild(bar); el.appendChild(wrap);
    return play(d, t => (bar.style.left = lerp(-30, 120, EZ.inOut(t / d)).toFixed(1) + "%")).then(() => wrap.remove());
  }
  // Three bouncing dots: the assistant is typing (Product Video)
  function typingDots(el, o = {}) {
    el.textContent = ""; el.style.display = "inline-flex"; el.style.gap = (o.gap ?? 8) + "px"; const sz = o.size ?? 10;
    const ds = [0, 1, 2].map(() => { const d = document.createElement("span"); d.style.cssText = `width:${sz}px;height:${sz}px;border-radius:50%;background:${o.color || "currentColor"};display:block;`; el.appendChild(d); return d; });
    return loopFx(t => ds.forEach((d, i) => (d.style.transform = `translateY(${(-Math.max(0, Math.sin(t * 9 - i * 0.9)) * sz * 0.8).toFixed(1)}px)`)));
  }

  const css = (c) => `rgb(${c.map(v => Math.round(v * 255)).join(",")})`;
  window.Shaderfield = { version: "2.0.0", textPanel, EFFECTS, ORDER, PALETTES, Field, mount, css, motion: { typeIn, curtain, revealWords, springFollow, rise, lineRise, countUp, tick, bars, pulseDot, iris, typeSwap, pop, shine, typingDots, ease: EZ, play, loop: loopFx, TYPE_MODES: Object.keys(TYPE_MODES) } };
})();
