/*! Shaderfield v2.0 · Live shaders and motion effects for websites and video. One file, no dependencies.
 * Made by Nchanji Faithful · https://github.com/nchanjifaithful · MIT License (see LICENSE)
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
    mint: [[0.204, 0.827, 0.6], [0.431, 0.906, 0.718], [0.82, 0.98, 0.9], [0.02, 0.1, 0.06]],
    sky: [[0.055, 0.647, 0.914], [0.49, 0.83, 0.99], [0.88, 0.95, 1.0], [0.02, 0.06, 0.1]],
    dusk: [[0.15, 0.3, 0.66], [0.36, 0.27, 0.6], [0.08, 0.44, 0.5], [0.66, 0.46, 0.4]],
    ledger: [[0.122, 0.616, 0.333], [0.086, 0.086, 0.086], [0.35, 0.8, 0.5], [0.98, 0.98, 0.973]],
    silk: [[1.0, 0.82, 0.82], [1.0, 0.541, 0.541], [0.4, 0.0, 0.0], [0.2, 0.0, 0.0]],
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
  const SANS_CLEAN = '"Geist", "Inter", "SF Pro Display", -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
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
  // ── Matrix (Living in the Matrix): green glyph rain that lights the page beneath it ──
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
    if (!ASM_DEFAULT) { ASM_DEFAULT = new Image(); ASM_DEFAULT.src = BASE_URL + "assets/assemble-default.jpg"; }
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
  function drawBlink(ctx, c, p, s, e, part) {
    const showField = part === "field", showText = part !== "field";
    const W = 1920, H = 1080, T = c.t, paper = p.paper >= 0.5, BG = paper ? "#fafaf8" : "#0a0b0a", FG = paper ? "#161616" : "#eeeeea", col = c.pal[0].map(v => Math.round(v * 255)).join(",");
    const sq = p.square, cell = sq + p.gap, off = p.gap / 2, cols = Math.ceil(W / cell), rows = Math.ceil(H / cell), BLINK = 0.7, FLASH = 0.1;
    const ph = phrases(c, e), L = p.hold, k = Math.floor(T / L), t = T - k * L, loop = (T % (L * ph.length)) / (L * ph.length);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = BG; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H);
    const [mx, my] = toDesign(c, W, H), mr = 220;
    const area = showField ? Math.min(1, (p.field ?? 0.92) * (0.55 + 0.45 * Math.sin((T * 6.2832) / (p.cycle || 8)))) * E3.sine(T / 0.6) : 0, density = showField ? p.density ?? 0.1 : lerp(0.04, 0.12, loop), top = 1 - area, mode = Math.round(p.edges || 0);
    const fade = (x, y) => mode === 1 ? ss3(0.25, 0.75, x) : mode === 2 ? ss3(0.25, 0.75, 1 - x) : mode === 3 ? 1 - ss3(0.3, 0.8, Math.hypot((x - 0.5) * 1.8, (y - 0.5) * 1.8)) : 1;
    if (showField || c.mouse[2] > 0.01) for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) / rows; const vert = area > 0 && y >= top - 0.02 ? ss3(top, top + Math.max(0.12, area * 0.7), y) : 0, crest = showField && area > 0 ? Math.max(0, 1 - Math.abs(y - top - 0.03) / 0.05) : 0;
      for (let q = 0; q < cols; q++) {
        const cx = q * cell + cell / 2, cy = r * cell + cell / 2, near = c.mouse[2] * Math.max(0, 1 - Math.hypot(cx - mx, cy - my) / mr);
        const m = Math.max(vert * fade((q + 0.5) / cols, (y - top) / Math.max(area, 0.01)), near); if (m <= 0.01) continue;
        const i = r * cols + q, pp = ihash(i, 911) * BLINK, n = Math.floor((T + pp) / BLINK); let a = showField ? 0.1 : 0.06;
        if (ihash(i, n) < density + near * 0.5 + crest * 0.25) { const sn = Math.sin(((T + pp) / BLINK - n) * Math.PI); a += ((showField ? 1 : 0.85) * (showField ? 0.7 + 0.3 * ihash(n, i) : 0.4 + 0.6 * ihash(n, i)) - a) * sn * sn; }
        ctx.fillStyle = `rgba(${col},${a * m})`; ctx.fillRect(q * cell + off, r * cell + off, sq, sq);
      }
    }
    const pn = showText ? blinkPanel(ph[k % ph.length], p.size * 1080, cell, FG) : { cells: [] }, e0 = L - 0.4;
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
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.fillStyle = "#060914"; x.fillRect(0, 0, W, H);
    x.translate(CX, CY); x.scale(zoom, zoom); x.translate(-CX, -CY); x.globalCompositeOperation = "screen";
    const [mx, my] = [c.mouse[0] / W, c.mouse[1] / H];
    DRIFT_B.forEach((b, i) => {
      const bx = (b.x + Math.sin(t * b.fx * p.flow + b.ph) * 0.08 + (mx - 0.5) * 0.12 * c.mouse[2] * (i % 2 ? -1 : 1)) * W, by = (b.y + Math.cos(t * b.fy * p.flow + b.ph) * 0.08 + (my - 0.5) * 0.12 * c.mouse[2]) * H, r = b.r * S;
      const cc = c.pal[i].map(v => Math.round(v * 255)).join(","), g = x.createRadialGradient(bx, by, 0, bx, by, r), A = 0.5 * p.glow;
      [[0, 1], [0.18, 0.86], [0.36, 0.6], [0.54, 0.34], [0.72, 0.14], [0.88, 0.04], [1, 0]].forEach(([o, f]) => g.addColorStop(o, `rgba(${cc},${(A * f).toFixed(3)})`)); x.fillStyle = g; x.fillRect(0, 0, W, H);
    });
    x.globalCompositeOperation = "source-over"; const v = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, "rgba(5,7,16,0)"); v.addColorStop(1, "rgba(5,7,16,0.55)"); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = v; x.fillRect(0, 0, W, H);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over";
  }
  const starPath = (k) => typeof Path2D !== "undefined" ? new Path2D(`M0,-1 Q${k},${-k} 1,0 Q${k},${k} 0,1 Q${-k},${k} -1,0 Q${-k},${-k} 0,-1Z`) : null;
  let STAR_P = null;
  function drawSparkle(ctx, c, p, s) {
    const W = c.w, H = c.h, L = p.cycle, t = c.t % L, sg = (a, b) => clamp((t - a) / (b - a)), ex = (v) => v >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(v));
    STAR_P = STAR_P || starPath(0.16);
    const cx = lerp(W / 2, c.mouse[0], c.mouse[2] * 0.6), cy = lerp(H / 2, c.mouse[1], c.mouse[2] * 0.6), base = Math.min(W, H) * 0.075 * p.size;
    const G = 1.2, Z0 = 2.0, ZA = 2.28, ZE = 3.12;
    const grow = E3.out(sg(0, G)), a = Math.sin(Math.PI / 2 * sg(Z0, ZA)), pz = sg(ZA, ZE), q = Math.pow(pz, 1.7), Rm = base * (1 - 0.2 * a), end = Math.hypot(W, H) * 2.6;
    const R = t < ZA ? lerp(base * 0.05, base, grow) * (1 - 0.2 * a) : Rm * Math.pow(end / Rm, q);
    const rot = 360 * E3.io(sg(0, Z0)) - 14 * a + 59 * Math.pow(pz, 1.25);
    // Outro: the colour field closes back into a shrinking star iris, then collapses into a twinkle with glints and sparks
    const O0 = Math.max(ZE + 0.3, L - 1.35), O1 = Math.max(O0 + 0.4, L - 0.5), cq = E3.io(sg(O0, O1)), Rc = end * Math.pow((base * 0.08) / end, cq), rotC = rot + 120 * cq;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.filter = "none";
    ctx.fillStyle = "#050616"; ctx.fillRect(0, 0, W, H);
    const fld = buf(s, "field", W, H), fx = fld.getContext("2d");
    if (t >= ZA - 0.05 && t < O1) {
      driftField(fx, c, c.t, lerp(1.7, 1, ex(sg(ZA, ZE + 0.35))) * (1 + 0.25 * cq), p);
      const mR = t < ZE ? R : t >= O0 ? Rc : 0, mRot = t < ZE ? rot : rotC;
      if (mR) { fx.globalCompositeOperation = "destination-in"; fx.filter = `blur(${Math.max(0.6, mR * 0.006).toFixed(2)}px)`; fx.translate(cx, cy); fx.rotate(mRot * Math.PI / 180); fx.scale(mR, mR); fx.fillStyle = "#fff"; fx.fill(STAR_P); fx.setTransform(1, 0, 0, 1, 0, 0); fx.filter = "none"; fx.globalCompositeOperation = "source-over"; }
      ctx.drawImage(fld, 0, 0);
      if (t >= O0 && cq > 0.02) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotC * Math.PI / 180); ctx.scale(Rc, Rc); ctx.shadowColor = "rgba(200,230,255,0.85)"; ctx.shadowBlur = 14 * c.k; ctx.lineWidth = (2 * c.k) / Rc; ctx.strokeStyle = `rgba(225,238,255,${(0.9 * Math.min(1, cq * 1.4)).toFixed(3)})`; ctx.stroke(STAR_P); ctx.restore(); ctx.shadowBlur = 0; }
    }
    const tw = sg(O1 - 0.06, L);
    if (tw > 0 && tw < 1) {
      const e = E3.out(tw), fa = Math.pow(1 - tw, 1.4), hi = c.pal[1];
      ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = "lighter";
      ctx.save(); ctx.rotate(((rotC + 45 * e) * Math.PI) / 180); const rs = base * 0.34 * (1 - 0.55 * e); ctx.scale(rs, rs); ctx.fillStyle = `rgba(255,255,255,${fa.toFixed(3)})`; ctx.fill(STAR_P); ctx.restore();
      const len = base * (1.1 + 3.4 * e), th = 1.3 * c.k;
      [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].forEach((a, j) => { const ln = j < 2 ? len : len * 0.45; ctx.save(); ctx.rotate(a); const g = ctx.createLinearGradient(-ln, 0, ln, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, `rgba(255,255,255,${(0.9 * fa * (j < 2 ? 1 : 0.5)).toFixed(3)})`); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(-ln, -th, ln * 2, th * 2); ctx.restore(); });
      for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.2832 + 0.3, d = base * (0.4 + 2.6 * e) * (0.75 + 0.5 * h2(i, 5)), r = Math.max(0.5, (2.4 - 1.7 * e) * c.k); ctx.fillStyle = pcss(i % 2 ? hi : [1, 1, 1], fa); ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r, 0, 6.2832); ctx.fill(); }
      const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 1.6); hg.addColorStop(0, pcss(hi, 0.35 * fa)); hg.addColorStop(1, pcss(hi, 0)); ctx.fillStyle = hg; ctx.fillRect(-base * 1.6, -base * 1.6, base * 3.2, base * 3.2);
      ctx.restore(); ctx.globalCompositeOperation = "source-over";
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
  const FZ = (ctx, Z) => { ctx.translate(960, 540); ctx.scale(Z, Z); ctx.translate(-960, -540); };
  const unZ = (pt, Z) => [960 + (pt[0] - 960) / Z, 540 + (pt[1] - 540) / Z];
  function mouseTrail(s, c, W, H) {
    const h = s.hist || (s.hist = []), [mx, my] = toDesign(c, W, H); h.push([c.t, mx, my]); while (h.length > 90) h.shift();
    return (t) => { for (let i = h.length - 1; i >= 0; i--) if (h[i][0] <= t) return [h[i][1], h[i][2]]; return h.length ? [h[0][1], h[0][2]] : [mx, my]; };
  }
  function drawFilings(ctx, c, p, s) {
    const { W, H } = FIL, paper = p.paper >= 0.5, bg = paper ? "#f4f4f3" : "#0c0c0d", ink = paper ? "#171717" : "#ececea", z = c.mouse[2], trail = mouseTrail(s, c, W, H);
    const cell = p.cell, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, ox = (W - (cols - 1) * cell) / 2, oy = (H - (rows - 1) * cell) / 2;
    const Z = p.zoom ?? 1.6, at = (t) => { const m = filPoles(t, p.cycle); if (z > 0.001) { const mp = unZ(trail(t), Z); m.p = [lerp(m.p[0], mp[0], z), lerp(m.p[1], mp[1], z)]; m.s2 *= 1 - z; } return m; };
    const now = at(c.t), cam = 1.03 - 0.03 * Math.cos(2 * Math.PI * c.t / p.cycle);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.w, c.h); const [sc, tx, ty] = cover(ctx, c, W, H); FZ(ctx, Z);
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
    const { W, H, C } = FIL, paper = p.paper >= 0.5, bg = paper ? "#f4f4f3" : "#0c0c0d", ink = paper ? "#171717" : "#ececea", L = p.cycle, k = L / 10, ST = 3.8 * k, T = ST + (c.t % (L - ST)), z = c.mouse[2], Z = p.zoom ?? 1.6;
    const U = { Pull: 0.4 * k, Orbit: 2.2 * k, Logo: 4.6 * k, Out: 7.4 * k }, sw = E3.io, cell = p.cell;
    if (!s.grid || s.cell !== cell) {
      const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, ox = (W - (cols - 1) * cell) / 2, oy = (H - (rows - 1) * cell) / 2, ci = Math.round((C[0] - ox) / cell), ri = Math.round((C[1] - oy) / cell); s.grid = []; s.cell = cell;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const dc = q - ci, dr = r - ri, mark = Math.abs(dc) <= 2 && Math.abs(dr) <= 2 && (dc || dr) ? [dc * MK.gap, dr * MK.gap] : null, gx = ox + q * cell, gy = oy + r * cell;
        s.grid.push({ gx, gy, base: h2(q, r) * 180, ph: h2(r, q + 9) * 6.283, mark, d: Math.hypot(gx - C[0], gy - C[1]) }); }
    }
    const m0 = gatherMagnet(U.Logo, U), [mx, my] = unZ(toDesign(c, W, H), Z), mag = (t) => { const g = gatherMagnet(t, U), q = sw((t - ST) / (U.Logo - ST)), m = t < U.Logo ? [lerp(C[0], m0[0], q), lerp(1300, m0[1], q)] : g; return z > 0.001 ? [lerp(m[0], mx, z), lerp(m[1], my, z)] : m; };
    const tL = T - U.Logo, tO = T - U.Out, now = mag(T), len0 = cell * 0.56, th0 = Math.max(2, cell * 0.075), loop = 2 * Math.PI * T / L, release = sw((tO - 0.6) / 1.4);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H); FZ(ctx, Z); ctx.strokeStyle = ink; ctx.lineCap = "round";
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
  const ORB_STARS = Array.from({ length: 170 }, (_, i) => [h2(i, 11) * 1920, h2(i, 12) * 1080, h2(i, 13), h2(i, 14) * 6.28]);
  function drawOrbits(ctx, c, p) {
    const W = 1920, H = 1080, TAU = Math.PI * 2, CX = W / 2, CY = H / 2, O = c.t, ink = c.pal[2].map(v => Math.round(v * 255)).join(","), acc = c.pal[0].map(v => Math.round(v * 255)).join(",");
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H);
    const [mx, my] = toDesign(c, W, H), ti = (my / H - 0.5) * c.mouse[2], ro = (mx / W - 0.5) * c.mouse[2];
    ORB_STARS.forEach(([x, y, s, ph]) => { const a = (0.08 + 0.3 * s) * (0.55 + 0.45 * Math.sin(O * (0.6 + s) + ph)); ctx.fillStyle = `rgba(${ink},${a.toFixed(3)})`; ctx.fillRect(x, y, 1 + s * 1.4, 1 + s * 1.4); });
    const R = [{ r: 165, n: 2, sp: 1.6, ph: 0 }, { r: 360, n: 3, sp: 0.9, ph: 2.1 }, { r: 560, n: 4, sp: 0.6, ph: 4.2 }];
    const ring = (g) => { const r = g.r * p.scale * (1 + 0.04 * Math.sin(O * 0.7 + g.ph)), tilt = clamp(0.55 + 0.45 * Math.sin(O * 0.31 * p.sway + g.ph) + ti * 1.2, 0, 1.45), rot = 0.35 * Math.sin(O * 0.17 * p.sway + g.ph * 1.3) + ro * 0.8; return { r, ct: Math.cos(tilt), rot }; };
    const front = [];
    R.forEach((g, i) => {
      const { r, ct, rot } = ring(g), ry = Math.max(0.5, r * ct);
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(rot);
      ctx.strokeStyle = `rgba(${ink},0.05)`; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, r, ry, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = `rgba(${ink},0.22)`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(0, 0, r, ry, 0, 0, TAU); ctx.stroke();
      const nT = 96, spin = O * 0.05 * (i % 2 ? -1 : 1);
      for (let k = 0; k < nT; k++) { const a = (k / nT) * TAU + spin, d = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a)), L = k % 8 === 0 ? 10 : 4, x = r * Math.cos(a), y = ry * Math.sin(a), nx = Math.cos(a), ny = Math.sin(a) * ct, nl = Math.hypot(nx, ny) || 1;
        ctx.strokeStyle = `rgba(${ink},${(0.2 * d).toFixed(3)})`; ctx.lineWidth = k % 8 === 0 ? 1.2 : 0.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (nx / nl) * L, y + (ny / nl) * L); ctx.stroke(); }
      ctx.restore();
      for (let k = 0; k < g.n; k++) front.push({ g, i, k, r, ry, ct, rot });
    });
    const comet = ({ g, k, r, ry, ct, rot }) => {
      const a = O * g.sp * p.rate + (k * TAU) / g.n + g.n, depth = 0.6 + 0.4 * Math.sin(a), m = 5 + r * 0.022, col = k === 0 ? acc : ink;
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(rot); ctx.lineCap = "butt";
      const N = 40, span = 0.9 / Math.max(0.6, g.sp);
      for (let j = N; j > 0; j--) { const a0 = a - (j / N) * span, a1 = a - ((j - 1) / N) * span + 0.004, f = 1 - j / N; ctx.strokeStyle = `rgba(${col},${(0.55 * f * f * depth).toFixed(3)})`; ctx.lineWidth = 0.6 + m * 0.9 * f; ctx.beginPath(); ctx.moveTo(r * Math.cos(a0), ry * Math.sin(a0)); ctx.lineTo(r * Math.cos(a1), ry * Math.sin(a1)); ctx.stroke(); }
      const x = r * Math.cos(a), y = ry * Math.sin(a), gr = ctx.createRadialGradient(x, y, 0, x, y, m * 2.6);
      gr.addColorStop(0, `rgba(${col},${0.9 * depth})`); gr.addColorStop(0.35, `rgba(${col},${0.35 * depth})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, m * 2.6, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${(0.95 * depth).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, Math.max(1.2, m * 0.32), 0, TAU); ctx.fill(); ctx.restore();
      return Math.sin(a) >= 0;
    };
    const back = front.filter(q => !(Math.sin(O * q.g.sp * p.rate + (q.k * TAU) / q.g.n + q.g.n) >= 0)); back.forEach(comet);
    const orR = 26 * p.scale, pulse = 0.5 + 0.5 * Math.sin(O * 1.4);
    const halo = ctx.createRadialGradient(CX, CY, 0, CX, CY, orR * (7 + pulse)); halo.addColorStop(0, `rgba(${acc},0.28)`); halo.addColorStop(0.4, `rgba(${acc},0.08)`); halo.addColorStop(1, `rgba(${acc},0)`); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(CX, CY, orR * (7 + pulse), 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, orR * 3.2); g.addColorStop(0, `rgba(${ink},1)`); g.addColorStop(0.3, `rgba(${ink},1)`); g.addColorStop(0.36, `rgba(${ink},0.3)`); g.addColorStop(1, `rgba(${ink},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, orR * 3.2, 0, TAU); ctx.fill();
    [[1.9, 0.32, 1, 14], [2.7, 0.18, -0.6, 40]].forEach(([k, a, sp, n]) => { ctx.save(); ctx.translate(CX, CY); ctx.rotate(O * sp * 0.4); ctx.setLineDash([(orR * k * TAU) / n * 0.55, (orR * k * TAU) / n * 0.45]); ctx.strokeStyle = `rgba(${ink},${a})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, orR * k, 0, TAU); ctx.stroke(); ctx.restore(); });
    front.filter(q => !back.includes(q)).forEach(comet);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Hearth (Document AI Teaser): a breathing bed of light along the bottom edge; columns of light surge up out of it on a cycle ──
  const q4 = (p) => 1 - Math.pow(1 - clamp(p), 4);
  const io4 = (p) => { p = clamp(p); return p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2; };
  const HEARTH_F = [[16, 1000, 620, 0, 0.28, 1, 0], [40, 1200, 740, 2, 0.24, 2, 0.3], [62, 960, 580, 0, 0.26, 1, 0.6], [86, 1040, 660, 2, 0.22, 2, 0.8], [30, 760, 360, 1, 0.1, 3, 0.2], [72, 720, 340, 1, 0.09, 2, 0.5], [50, 900, 280, 1, 0.07, 1, 0.4]];
  const HEARTH_B = Array.from({ length: 22 }, (_, i) => { const r = (k) => { const x = Math.sin(i * 91.7 + k * 47.3) * 43758.5453; return x - Math.floor(x); };
    return { x: ((i + 0.5) / 22 + (r(1) - 0.5) * 0.05) * 1920, w: 140 + r(2) * 200, d: r(3) * 0.5, c: i % 3 === 1 ? 1 : i % 2 ? 2 : 0, a: 0.8 + r(4) * 0.2, sway: r(5) * 40, ph: r(6) }; });
  let HEARTH_DOTS = null;
  const hearthDots = () => { if (HEARTH_DOTS) return HEARTH_DOTS; const cv = HEARTH_DOTS = document.createElement("canvas"); cv.width = 1920; cv.height = 1080; const x = cv.getContext("2d"); x.fillStyle = "#f0f0f4";
    for (let yy = 14; yy < 1080; yy += 28) for (let xx = 14; xx < 1920; xx += 28) { const d = Math.hypot((xx - 960) / 1152, (yy - 486) / 648), m = d < 0.6 ? lerp(0.3, 0.12, d / 0.6) : lerp(0.12, 0, clamp((d - 0.6) / 0.4)); if (m <= 0.002) continue; x.globalAlpha = Math.min(1, 0.45 * m); x.beginPath(); x.arc(xx, yy, 1.2, 0, 6.2832); x.fill(); }
    return cv; };
  const glowEllipse = (ctx, x, y, rx, ry, stops) => { if (rx < 1 || ry < 1) return; ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); stops.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore(); };
  function drawHearth(ctx, c, p, s0, e, part) {
    const bed = part !== "surge";
    const W = 1920, H = 1080, t = c.t, pal = c.pal, I = p.intensity; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.fillStyle = pcss(pal[3].map(v => v * 0.06 + 0.008)); ctx.fillRect(0, 0, c.w, c.h); cover(ctx, c, W, H);
    const [mx] = toDesign(c, W, H), pres = c.mouse[2] || 0;
    if (p.dots) ctx.drawImage(hearthDots(), 0, 0);
    ctx.globalCompositeOperation = "lighter";
    const br = 0.5 + 0.5 * Math.sin(t * 0.9), bs = 0.96 + 0.04 * br;
    if (bed) glowEllipse(ctx, W / 2 + Math.sin(t * 0.35) * 30, H - 30, 950 * bs, 550 * bs, [[0, pcss(mx3(pal[0], [1, 1, 1], 0.12), 0.55 * I * (0.8 + 0.2 * br))], [0.38, pcss(pal[1], 0.22 * I)], [0.72, pcss(pal[0], 0.04 * I)], [1, pcss(pal[0], 0)]]);
    const u = t * 0.1 * p.sway;
    if (bed) HEARTH_F.forEach(([x, w, h, ci, a, f, ph]) => {
      const w1 = Math.sin((u * f + ph) * 6.2832), w2 = Math.sin((u * f * 2 + ph * 1.7) * 6.2832), cx = (x / 100) * W, near = pres * Math.exp(-Math.pow((cx - mx) / 520, 2));
      const sy = (1 + 0.12 * w1 + 0.05 * w2) * p.height * (1 + 0.5 * near), ry = (h * sy) / 2, A = Math.min(1, a * 2.3) * (0.8 + 0.2 * w1) * I * (1 + 0.7 * near), col = mx3(pal[ci], [1, 1, 1], 0.08);
      glowEllipse(ctx, cx + w2 * 30, H + 0.45 * h - ry, (w * (1 + 0.05 * w2)) / 2, ry, [[0, pcss(col, Math.min(1, A))], [0.45, pcss(col, Math.min(1, A) * 0.62)], [1, pcss(col, 0)]]);
    });
    if (!bed) {
      const s = (t % p.cycle) - 0.6, S = p.intensity, wash = io4((s - 0.4) / 0.91) * (1 - E3.sine((s - 1.4) / 1.6));
      if (wash > 0.001) glowEllipse(ctx, W / 2, H * 0.7, W * 0.9, H * 0.8, [[0, pcss(pal[0], 0.36 * wash * S)], [0.5, pcss(pal[0], 0.14 * wash * S)], [1, pcss(pal[0], 0.04 * wash * S)]]);
      HEARTH_B.forEach(b => { const up = io4((s - b.d) / 1.12), aw = E3.sine((s - 1.3 - b.d * 1.2) / 1.9); if (up <= 0.001 || aw >= 0.999) return;
        const op = Math.min(1, up * 1.4) * b.a * Math.pow(Math.cos((aw * Math.PI) / 2), 2) * S * 0.36; if (op < 0.004) return;
        const top = H + 80 - (1400 + aw * 140) * up, hI = 1400 * (1 - 0.7 * aw) * up, x = b.x + Math.sin((t * 1.3 + b.ph) * 6.2832) * b.sway, col = pal[b.c];
        glowEllipse(ctx, x, top + 0.55 * hI, b.w / 2, hI / 2, [[0, pcss(col, op)], [0.35, pcss(col, op * 0.6)], [0.65, pcss(col, op * 0.2)], [1, pcss(col, 0)]]); });
    }
    ctx.globalCompositeOperation = "source-over"; ctx.setTransform(1, 0, 0, 1, 0, 0); filmGrain(ctx, c.w, c.h, t, p.grain);
  }

  // ── Silk Swirl (Oncheck Brand Animation): banded spiral that twists toward the centre and keeps turning ──
  const F_SWIRL = HEAD + HASH + VNOISE + `
uniform float u_bands; uniform float u_twist; uniform float u_soft; uniform float u_noise; uniform float u_scale; uniform float u_phase; uniform vec2 u_c; uniform float u_grain;
void main(){vec2 res=u_resolution;vec2 p=(gl_FragCoord.xy-u_c)/(min(res.x,res.y)*max(u_scale,0.05));
vec3 c0=u_palette[0],c1=u_palette[1],c2=u_palette[2],c3=u_palette[3];
float l=max(length(p),1e-4);float a=atan(p.y,p.x);
float s=fract(floor(u_bands+0.5)*a/6.2831853+pow(l,-3.0*clamp(u_twist,0.0,1.0))+u_phase);
s=1.0-abs(2.0*s-1.0);s+=u_noise*(vnoise(p*9.0+u_phase*3.0)-0.5);
float w=mix(0.006,0.22,u_soft);
vec3 col=c3;col=mix(col,c2,smoothstep(0.25-w,0.25+w,s));col=mix(col,c1,smoothstep(0.5-w,0.5+w,s));col=mix(col,c0,smoothstep(0.75-w,0.75+w,s));
col=mix(col,mix(c3,(c0+c1+c2+c3)*0.25,0.4),smoothstep(0.2,0.7,(3.0*clamp(u_twist,0.0,1.0)*pow(l,-3.0*clamp(u_twist,0.0,1.0)-1.0)+floor(u_bands+0.5)/(6.2831853*l))*2.0/(min(res.x,res.y)*max(u_scale,0.05))));
col+=(hash21(gl_FragCoord.xy+fract(u_time*7.3)*91.0)-0.5)*u_grain;
gl_FragColor=vec4(max(col,0.0),1.0);}`;

  const mx3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rrect = (x, X, Y, W, H, R) => { R = Math.min(R, W / 2, H / 2); x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); };

  // ── Dot Globe (Invois App Launch): a turning sphere of dots; land on the near side lights up and pings ──
  const GLOBE_PTS = (() => { const pts = [], N = 2600, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, lat = Math.asin(y), lon = (ga * i) % (Math.PI * 2);
      pts.push([lat, lon, h2(i, 7), Math.sin(lon * 2 + 1.1) * Math.cos(lat * 3) + 0.6 * Math.sin(lon * 5 + lat * 4) + 0.35 * Math.cos(lon * 9 - lat * 7)]); }
    return pts; })();
  function drawGlobe(ctx, c, p) {
    const W = c.w, H = c.h, k = Math.min(W, H) / 1080, pal = c.pal, t = c.t, mz = c.mouse[2];
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = pcss(pal[3]); ctx.fillRect(0, 0, W, H);
    const R = Math.min(W, H) * 0.5 * p.size, cx = W / 2, cy = H / 2, rot = t * p.rate + mz * (c.mouse[0] / W - 0.5) * 2.4, tl = (p.tilt + mz * (c.mouse[1] / H - 0.5) * 50) * Math.PI / 180;
    const g = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R * 1.3); g.addColorStop(0, pcss(pal[0], 0.18 * p.glow)); g.addColorStop(1, pcss(pal[0], 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const thr = 1.05 - 1.4 * p.density, ct = Math.cos(tl), st = Math.sin(tl), B = 6, front = Array.from({ length: B }, () => new Path2D()), back = [new Path2D(), new Path2D()], hot = new Path2D();
    const r0 = Math.max(0.8, 2.6 * k * p.dot), rb = Math.max(0.6, 1.6 * k * p.dot), proj = [];
    GLOBE_PTS.forEach(([lat, lon, q, land]) => { if (land <= thr) return;
      const l = lon + rot, x = Math.cos(lat) * Math.sin(l), z0 = Math.cos(lat) * Math.cos(l), y0 = Math.sin(lat), y = y0 * ct - z0 * st, z = y0 * st + z0 * ct, px = cx + x * R, py = cy - y * R;
      if (z > 0) { const r = r0 * (1 + 0.45 * q), path = q > 0.94 ? hot : front[Math.min(B - 1, Math.floor((0.35 + 0.65 * z) * B))]; path.moveTo(px + r, py); path.arc(px, py, r, 0, 6.2832); if (z > 0.35) proj.push([px, py]); }
      else { const path = back[z > -0.45 ? 0 : 1]; path.moveTo(px + rb, py); path.arc(px, py, rb, 0, 6.2832); } });
    ctx.fillStyle = pcss(mx3(pal[1], pal[3], 0.4), 0.16); ctx.fill(back[0]); ctx.fillStyle = pcss(mx3(pal[1], pal[3], 0.4), 0.06); ctx.fill(back[1]);
    front.forEach((path, b) => { ctx.fillStyle = pcss(pal[0], (b + 1) / B); ctx.fill(path); }); ctx.fillStyle = pcss(pal[2]); ctx.fill(hot);
    if (p.pings > 0 && proj.length) for (let j = 0; j < 3; j++) { const per = 1.4, i = Math.floor(t / per) * 3 + j, u = (t % per) / per - j * 0.18; if (u <= 0 || h2(i, 4) > p.pings + 0.15) continue;
      const [px, py] = proj[Math.floor(h2(i, 9) * proj.length)], rr = (4 + 34 * E3.out(u)) * k; ctx.strokeStyle = pcss(pal[2], 0.8 * (1 - u)); ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.2832); ctx.stroke();
      ctx.fillStyle = pcss(pal[2], 1 - u); ctx.beginPath(); ctx.arc(px, py, 3.2 * k, 0, 6.2832); ctx.fill(); }
  }

  // ── Wave Bands (Oncheck Brand Book): the swirl distilled into a two-colour repeat of drifting waves ──
  function drawWaves(ctx, c, p) {
    const W = c.w, H = c.h, k = c.k, pal = c.pal, t = c.t, tl = p.tilt * Math.PI / 180;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = pcss(pal[3]); ctx.fillRect(0, 0, W, H);
    const gap = Math.max(4, p.gap * k), th = gap * p.thick, lam = Math.max(10, p.length * k), step = Math.max(3, 7 * k), amp = p.amp * k * (1 + p.breathe * 0.35 * Math.sin(t * 0.8)), ph = -t * p.drift;
    const diag = Math.abs(tl) > 0.005, DX = (diag ? Math.hypot(W, H) / 2 : W / 2) + lam, DY = (diag ? Math.hypot(W, H) / 2 : H / 2) + gap * 2;
    const ca = Math.cos(-tl), sa = Math.sin(-tl), qx = c.mouse[0] - W / 2, qy = c.mouse[1] - H / 2, mxr = qx * ca - qy * sa, myr = qx * sa + qy * ca, mz = c.mouse[2], R2 = Math.pow(260 * k, 2);
    const bump = (x, y) => 1 + 2.2 * mz * Math.exp(-((x - mxr) * (x - mxr) + (y - myr) * (y - myr)) / R2);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(tl);
    for (let r = 0, y0 = -DY; y0 < DY; r++, y0 += gap) {
      ctx.beginPath(); for (let x = -DX; x <= DX; x += step) { const yy = y0 + amp * bump(x, y0) * Math.sin((6.2832 * x) / lam + ph + r * 0.9); x === -DX ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
      for (let x = DX; x >= -DX; x -= step) ctx.lineTo(x, y0 + th + amp * bump(x, y0) * Math.sin((6.2832 * x) / lam + ph + r * 0.9 + 0.5));
      ctx.closePath(); ctx.fillStyle = pcss(p.duo >= 0.5 && r % 2 ? pal[1] : pal[0]); ctx.fill(); }
    ctx.restore();
  }

  // ── Stage Light (Vaulton Launch): light pours up from a glowing base, with soft shafts, a mirrored floor and drifting motes ──
  function drawStage(ctx, c, p) {
    const pal = c.pal, t = c.t, A = pal[0], B = pal[1], hot = mx3(pal[2], [1, 1, 1], 0.65), m = c.mouse[2], mx = m * (c.mouse[0] / c.w - 0.5), my = m * (c.mouse[1] / c.h - 0.5);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; cover(ctx, c, 1920, 1080); const x = ctx;
    const by = 1080 * p.base, cx = 960 + mx * 220, W = 1920 * p.width, R = 1080 * p.reach * (1 - my * 0.25), I = p.intensity * (1 + p.breathe * 0.08 * Math.sin(t * 1.3) + p.breathe * 0.04 * Math.sin(t * 3.1 + 1));
    const bg = x.createLinearGradient(0, 0, 0, 1080); const ink = mx3(A, [0, 0, 0], 0.93); bg.addColorStop(0, pcss(mx3(ink, [0, 0, 0], 0.6))); bg.addColorStop(p.base, pcss(ink)); bg.addColorStop(1, pcss(mx3(ink, [0, 0, 0], 0.7))); x.fillStyle = bg; x.fillRect(-20, -20, 1960, 1120);
    const blob = (gx, gy, rx, ry, col, a) => { if (a <= 0) return; x.save(); x.translate(gx, gy); x.scale(rx, ry); const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, pcss(col, a)); g.addColorStop(0.45, pcss(col, a * 0.35)); g.addColorStop(1, pcss(col, 0)); x.fillStyle = g; x.fillRect(-1, -1, 2, 2); x.restore(); };
    x.globalCompositeOperation = "lighter";
    x.save(); x.beginPath(); x.rect(-20, -20, 1960, by + 20); x.clip();
    blob(cx + 260 * Math.sin(t * 0.13), by - R * 0.9, W * 1.1, R * 0.7, B, 0.07 * I); blob(cx, by - R * 0.35, W * 0.28, R * 0.9, mx3(A, hot, 0.2), 0.12 * I);
    for (let k = 0; k < 5; k++) blob(cx, by, W * (0.55 + k * 0.32), R * (0.22 + k * 0.2), mx3(A, B, k / 5), (0.42 - k * 0.07) * I);
    const n = Math.round(4 + 8 * p.shafts);
    for (let i = 0; i < n && p.shafts > 0; i++) { const u = (i + 0.5) / n - 0.5, sx = cx + u * W * 1.05 + 18 * Math.sin(t * 0.4 + i * 1.7), sw = W / n * (0.6 + 0.8 * h2(i, 3)), sh = R * (0.55 + 0.5 * h2(i, 5)) * (0.85 + 0.15 * Math.sin(t * 0.7 + i)), al = p.shafts * I * 0.3 * (0.5 + 0.5 * Math.sin(t * (0.35 + 0.2 * h2(i, 7)) + i * 2.1)) * (1 - Math.abs(u) * 1.2);
      if (al <= 0) continue; const g = x.createLinearGradient(0, by, 0, by - sh); g.addColorStop(0, pcss(mx3(A, hot, 0.3), al)); g.addColorStop(0.35, pcss(A, al * 0.5)); g.addColorStop(1, pcss(B, 0));
      const hg = x.createLinearGradient(sx - sw, 0, sx + sw, 0); x.save(); x.fillStyle = g; x.beginPath(); x.moveTo(sx - sw * 0.5, by); x.lineTo(sx + sw * 0.5, by); x.lineTo(sx + sw * 0.95, by - sh); x.lineTo(sx - sw * 0.95, by - sh); x.closePath(); x.filter = "blur(18px)"; x.fill(); x.restore(); }
    x.restore();
    x.save(); x.beginPath(); x.rect(-20, by, 1960, 1120 - by); x.clip(); x.translate(0, by); x.scale(1, -0.32); x.translate(0, -by);
    for (let k = 0; k < 3; k++) blob(cx, by, W * (0.6 + k * 0.4), R * (0.25 + k * 0.25), mx3(A, B, k / 3), (0.2 - k * 0.05) * I); x.restore();
    blob(cx, by, W * 0.62, 26, hot, 0.55 * I); blob(cx, by, W * 0.42, 9, [1, 1, 1], 0.7 * I);
    const lg = x.createLinearGradient(cx - W * 0.6, 0, cx + W * 0.6, 0); lg.addColorStop(0, pcss(hot, 0)); lg.addColorStop(0.5, pcss([1, 1, 1], Math.min(1, 0.95 * I))); lg.addColorStop(1, pcss(hot, 0)); x.fillStyle = lg; x.fillRect(cx - W * 0.6, by - 1.5, W * 1.2, 3);
    if (p.motes > 0) for (let i = 0; i < 28; i++) { const life = (t * (0.035 + 0.03 * h2(i, 3)) + h2(i, 2)) % 1, my2 = by - 8 - life * R * 0.95, mxp = cx + (h2(i, 1) - 0.5) * W * (0.9 + life * 0.5) + 16 * Math.sin(t * 0.6 + i), al = p.motes * Math.sin(Math.PI * life) * 0.55 * Math.min(1, I);
      blob(mxp, my2, 4 + 3 * h2(i, 8), 4 + 3 * h2(i, 8), hot, al); }
    x.globalCompositeOperation = "source-over";
    const vg = x.createRadialGradient(960, by * 0.75, 380, 960, by * 0.75, 1250); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.6)"); x.fillStyle = vg; x.fillRect(-20, -20, 1960, 1120);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  const P = (key, label, min, max, step, def, unit) => ({ key, label, min, max, step, def, unit: unit || "" });
  const lerp = (a, b, t) => a + (b - a) * t;

  const EFFECTS = {
    current: {
      name: "Flow Streaks", from: "Blastlabs Flow", kind: "GLSL", res: 0.5, rawPr: true, palette: "plasma",
      desc: "Flow streaks that speed up, heat up and bend around the cursor.",
      hint: "Move to bend the current",
      params: [P("scale", "Scale", 0.4, 3, 0.05, 1.2), P("current", "Current", 0, 2, 0.05, 0.7), P("length", "Trail", 6, 80, 1, 32), P("density", "Density", 0, 1, 0.01, 0.55)],
      frag: F_CURRENT,
      uniforms: (c, p) => ({ u_scale: p.scale, u_current: p.current, u_length: p.length, u_density: p.density, u_mouseInfluence: 1 }),
    },
    fret: {
      name: "Circuit Arcs", from: "Nodepath Launch", kind: "GLSL", res: 0.75, palette: "ion",
      desc: "Arcs join into endless circuits with light pulses running along them.",
      hint: "Move to swirl · Click for a shockwave",
      params: [P("cell", "Cell", 10, 60, 1, 24), P("line", "Line", 0.5, 4, 0.05, 1.3), P("glow", "Glow", 0, 1, 0.01, 0.6), P("pulse", "Pulse", 0, 1.5, 0.01, 1), P("weld", "Weld", 0, 1, 0.01, 0.2), P("warp", "Swirl", 0, 1, 0.01, 0.15), P("split", "Chroma split", 0, 4, 0.05, 0.6)],
      frag: F_FRET,
      uniforms: (c, p) => ({ u_scale: p.cell, u_line: p.line, u_glow: p.glow, u_pulse: p.pulse, u_weld: p.weld, u_phase: c.t * 0.45, u_seed: 4, u_pan: [c.t * 0.05, c.t * 0.025], u_rot: c.t * 0.01, u_warp: p.warp + c.mouse[2] * 0.35, u_ca: p.split + c.shockA * 3 }),
    },
    skein: {
      name: "Woven Lines", from: "Weftline Launch", kind: "GLSL", res: 0.75, palette: "aurora",
      desc: "Woven filaments ripple, drift sideways and draw in from the left.",
      hint: "Click for a shockwave",
      params: [P("cell", "Spacing", 10, 60, 1, 22), P("line", "Line", 0.5, 4, 0.05, 1.3), P("wave", "Wave", 0, 1.5, 0.01, 0.55), P("vary", "Variety", 0, 1, 0.01, 0.7), P("tilt", "Tilt", -45, 45, 1, -8, "°"), P("scatter", "Scatter", 0, 1, 0.01, 0.5), P("depth", "Depth", 0, 1, 0.01, 0.6), P("glow", "Glow", 0, 1, 0.01, 0.6), P("draw", "Draw-in", 0, 1, 0.01, 1), P("split", "Chroma split", 0, 4, 0.05, 0.4)],
      frag: F_SKEIN,
      uniforms: (c, p) => ({ u_scale: p.cell, u_line: p.line, u_wave: p.wave, u_vary: p.vary, u_rotate: p.tilt, u_scatter: p.scatter, u_depth: p.depth, u_glow: p.glow, u_draw: p.draw, u_phase: c.t * 0.4, u_wphase: c.t * 0.8, u_panx: c.t * 0.25, u_seed: 2, u_pulse: 0.9, u_ca: p.split + c.shockA * 3 }),
    },
    harmonia: {
      name: "Chord Circle", from: "Harmonia Launch", kind: "GLSL", res: 0.75, palette: "solar",
      desc: "Times-table chords on a circle morph into cardioids and roses.",
      hint: "Move left and right to shift the multiplier",
      params: [P("points", "Points", 20, 150, 1, 120), P("offset", "Offset", -0.4, 0.4, 0.01, 0), P("mult", "Multiplier", 2, 40, 0.01, 2), P("drift", "Drift", 0, 0.5, 0.005, 0.06), P("radius", "Radius", 0.2, 0.48, 0.005, 0.38), P("line", "Line", 0.3, 2, 0.05, 0.7), P("glow", "Glow", 0, 1.5, 0.01, 0.8), P("dots", "Dots", 0, 1, 0.01, 0.5), P("field", "Field", 0, 1, 0.01, 0.35), P("ring", "Ring", 0, 1, 0.01, 0.5)],
      frag: F_HARMONIA,
      uniforms: (c, p) => ({ u_points: p.points, u_mult: p.mult + c.t * p.drift + c.mouse[2] * (c.mouse[0] / c.w - 0.5) * 6, u_R: Math.min(c.w, c.h) * p.radius, u_ctr: [c.w * (0.5 + (p.offset || 0)), c.h / 2], u_line: p.line, u_glow: p.glow, u_dots: p.dots, u_bg: p.field, u_ring: p.ring, u_spin: c.t * 0.05, u_mult2: 3 + c.t * 0.01 }),
    },
    halo: {
      name: "Radial Bloom", from: "Gloww Announcement · Coming Soon", kind: "GLSL", res: 0.75, palette: "aqua",
      desc: "A soft radial bloom with a slowly orbiting focal point.",
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
      name: "Heat Map", from: "Shader Trials Announcement", kind: "GLSL", res: 0.75, palette: "heat",
      desc: "Drifting heat sources merge into a banded thermal map.",
      hint: "Move to add heat",
      params: [P("blobs", "Sources", 1, 6, 1, 5), P("size", "Size", 0.4, 2.5, 0.01, 1.45), P("bands", "Bands", 2, 24, 1, 9), P("contour", "Contour", 0, 1, 0.01, 0.5), P("glow", "Glow", 0, 1, 0.01, 0.6), P("grain", "Grain", 0, 0.15, 0.005, 0.03)],
      frag: F_THERMAL,
      uniforms: (c, p) => ({ u_blobs: p.blobs, u_size: p.size, u_bands: p.bands, u_contour: p.contour, u_glow: p.glow, u_grain: p.grain }),
    },
    mesh: {
      name: "Spring Net", from: "Kinetic Opening", kind: "Canvas 2D", res: 1, palette: "ember", palettes: ["ember", "ion", "aurora", "mono"],
      desc: "A spring net that glows by tension. Every kick ripples across it.",
      hint: "Move to push · Click to strike",
      params: [P("energy", "Energy", 0, 2, 0.01, 1), P("stiffness", "Stiffness", 0.04, 0.3, 0.005, 0.12), P("damping", "Damping", 0.95, 0.995, 0.001, 0.978), P("kicks", "Kicks / s", 0, 3, 0.05, 0.8)],
    },
    decrypt: {
      name: "Decode Lens", from: "Meridian Launch", kind: "GLSL", gl2: true, res: 1, palette: "aqua", palettes: ["aqua", "ion", "phosphor", "ember"],
      desc: "Text stays scrambled until a glowing lens decodes it.",
      hint: "Move to decode", text: "Something is thinking.",
      params: [P("radius", "Lens", 0.05, 1, 0.01, 0.34), P("softness", "Softness", 0.02, 1, 0.01, 0.5), P("cell", "Cell", 8, 32, 0.5, 15), P("scramble", "Scramble", 0, 1, 0.01, 0.1), P("edge", "Edge glow", 0, 4, 0.05, 2), P("split", "Chroma split", 0, 30, 0.5, 10), P("pass", "Pass-through", 0, 1, 0.01, 0.15), P("size", "Text size", 0.04, 0.25, 0.002, 0.12)],
      frag: F_DECRYPT,
      uniforms: (c, p, e) => decryptU(c, p, textPanel(c.w, c.h, phrases(c, e)[0], { size: p.size, weight: 600, fg: "#f4f5f2", bg: "#000", ls: "-0.04em" }), false),
    },
    datawall: {
      name: "Cipher Wall", from: "Meridian Launch", kind: "GLSL", gl2: true, res: 1, palette: "aqua", palettes: ["aqua", "ion", "phosphor", "ember"],
      desc: "A wall of ciphered text with two lenses decoding as they pass.",
      hint: "Move to steer the first lens", text: "",
      params: [P("radius", "Lens", 0.05, 0.6, 0.01, 0.22), P("softness", "Softness", 0.02, 1, 0.01, 0.5), P("cell", "Cell", 8, 32, 0.5, 15), P("scramble", "Scramble", 0, 1, 0.01, 0.1), P("edge", "Edge glow", 0, 4, 0.05, 2), P("split", "Chroma split", 0, 30, 0.5, 10), P("pass", "Pass-through", 0, 1, 0.01, 0.15)],
      frag: F_DECRYPT,
      uniforms: (c, p, e) => decryptU(c, p, dataWall(c.w, c.h, phrases(c, e)[0], c.k), true),
    },
    sand: {
      name: "Sand Text", from: "Launch Film", kind: "GLSL", gl2: true, res: 1, palette: "mono", palettes: ["mono"],
      desc: "Lines gather from fine drifting grains into crisp text, hold, then blow back to dust.",
      hint: "Move up and down to gather and scatter", text: "Money still moves slowly.|Forms. Fees. Waiting.|Transactions, made effortless.",
      params: [P("grain", "Grain", 1.5, 8, 0.1, 2.2), P("spread", "Spread", 20, 600, 5, 200), P("band", "Band", 60, 600, 5, 180), P("swirl", "Swirl", 0, 200, 1, 36), P("drift", "Drift", 0, 2, 0.01, 0.45), P("gravity", "Gravity", -1, 1, 0.01, 0.35), P("cycle", "Cycle", 2, 12, 0.1, 3.4, "s"), P("size", "Text size", 0.03, 0.2, 0.002, 0.07)],
      frag: F_SAND,
      uniforms: (c, p, e) => {
        const ph = phrases(c, e), pn = textPanel(c.w, c.h, ph[Math.floor(c.t / p.cycle) % ph.length], { size: p.size, fg: "#ffffff", bg: "transparent", weight: 500, ls: "-0.035em", font: SANS_CLEAN });
        const box = [pn._rect[1] * c.h, pn._rect[3] * c.h], d = Math.max(1, p.grain * c.k);
        c._sand = { pn, box, d, line: sandLine(c, p, box) };
        return { uContent: pn, uRes: [c.w, c.h], uDensity: d, uStagger: 0.7, uLine: c._sand.line, uBand: p.band * c.k, uBg: hex3("#0b0c0e") };
      },
      points: {
        vert: V_SAND_PTS, frag: F_SAND_PTS,
        uniforms: (c, p) => {
          const s = c._sand, r0 = Math.max(0, Math.floor((s.box[0] - 4) / s.d)), r1 = Math.min(Math.ceil(c.h / s.d), Math.ceil((s.box[1] + 4) / s.d)), gx = Math.ceil(c.w / s.d), gy = r1 - r0;
          return { count: gx * gy, uContent: s.pn, uRes: [c.w, c.h], uGrid: [gx, gy], uOrigin: [0, r0], uDensity: s.d, uStagger: 0.7, uSpread: p.spread * c.k, uGravity: p.gravity, uDrift: p.drift,
            uSwirl: p.swirl * c.k, uTime: c.t, uFade: 1, uSize: Math.max(1.2, 1.9 * c.k), uLine: s.line, uBand: p.band * c.k };
        },
      },
    },
    assemble: {
      name: "Particle Portrait", from: "No Peace", kind: "GLSL", res: 1, palette: "solar", palettes: ["solar", "mono", "ember"],
      desc: "Particles orbit in a ring, then swirl in to rebuild an image.",
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
      desc: "Aurora curtains sweep over a ridge and a rippling lake.",
      hint: "Move to lead the sweep",
      params: [P("intensity", "Intensity", 0.2, 2, 0.01, 1), P("cycle", "Cycle", 5, 20, 0.5, 9, "s"), P("reflection", "Reflection", 0, 1, 0.01, 1), P("stars", "Stars", 0, 1, 0.01, 1), P("grain", "Grain", 0, 0.2, 0.005, 0.07)],
      draw: (ctx, c, p, s) => drawAurora(ctx, c, p, s),
    },
    horizon: {
      name: "Synth Valley", from: "Anticipating the Future", kind: "Canvas 2D", res: 1, palette: "synth", palettes: ["synth", "aqua", "aurora", "ember"],
      desc: "A striped sun rises behind a wireframe valley flying toward you.",
      hint: "Move to steer",
      params: [P("rate", "Flight", 0, 6, 0.05, 2), P("peaks", "Peaks", 0, 2.5, 0.01, 1), P("sun", "Sun", 0.4, 1.6, 0.01, 1)],
      draw: (ctx, c, p) => drawHorizon(ctx, c, p),
    },
    blink: {
      name: "Square Text", from: "Supreme Effort Squares", kind: "Canvas 2D", res: 1, palette: "mint", palettes: ["mint", "ledger", "phosphor", "cobalt", "ember"],
      desc: "Each line dissolves in square by square, holds, then blinks out.",
      hint: "Move to stir the squares", text: "A supreme goal needs supreme effort.|Good enough never wins.|Supreme effort. Supreme results.",
      params: [P("square", "Square", 4, 40, 1, 12), P("gap", "Gap", 0, 16, 1, 4), P("hold", "Hold", 1.2, 6, 0.1, 1.9, "s"), P("paper", "Paper", 0, 1, 1, 1), P("size", "Text size", 0.02, 0.12, 0.002, 0.06)],
      draw: (ctx, c, p, s, e) => drawBlink(ctx, c, p, s, e, "text"),
    },
    blinkfield: {
      name: "Square Field", from: "Supreme Effort Squares", kind: "Canvas 2D", res: 1, palette: "sky", palettes: ["sky", "mint", "ledger", "phosphor", "cobalt", "ember"],
      desc: "A floor of blinking squares rises and falls on a slow tide with a bright crest.",
      hint: "Move to stir the squares",
      params: [P("square", "Square", 4, 80, 1, 44), P("gap", "Gap", 0, 24, 1, 10), P("field", "Height", 0.1, 1, 0.01, 0.92), P("cycle", "Tide", 3, 20, 0.1, 8, "s"), P("density", "Density", 0.02, 0.4, 0.01, 0.16), P("edges", "Edge fade", 0, 3, 1, 0), P("paper", "Paper", 0, 1, 1, 1)],
      draw: (ctx, c, p, s, e) => drawBlink(ctx, c, p, s, e, "field"),
    },
    sparkle: {
      name: "Sparkle", from: "Idea Reveal", kind: "Canvas 2D", res: 1, palette: "idea", palettes: ["idea", "ion", "aurora", "ember"],
      desc: "A sparkle spins in and punches through to colour, then closes back and bursts into a twinkle.",
      hint: "Move to place the sparkle",
      params: [P("size", "Size", 0.4, 3, 0.01, 1.4), P("cycle", "Cycle", 4, 14, 0.1, 5, "s"), P("flow", "Flow", 0, 4, 0.01, 1), P("glow", "Glow", 0.2, 1.6, 0.01, 1)],
      draw: drawSparkle,
    },
    filings: {
      name: "Iron Filings", from: "Magnetic Filings", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono"],
      desc: "A grid of iron filings turns to follow a moving magnet.",
      hint: "Move to become the magnet",
      params: [P("cell", "Cell", 24, 120, 1, 60), P("zoom", "Zoom", 1, 2.5, 0.05, 1.6), P("lag", "Lag", 0, 3, 0.01, 1), P("cycle", "Cycle", 6, 30, 0.5, 12, "s"), P("magnet", "Show magnet", 0, 1, 1, 1), P("paper", "Paper", 0, 1, 1, 1)],
      draw: drawFilings,
    },
    gather: {
      name: "Magnet Snap", from: "Magnett Promo", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono"],
      desc: "Filings catch a passing magnet and snap into a 5×5 mark.",
      hint: "Move to pull the filings",
      params: [P("cell", "Cell", 24, 120, 1, 60), P("zoom", "Zoom", 1, 2.5, 0.05, 1.6), P("cycle", "Cycle", 6, 24, 0.5, 10, "s"), P("paper", "Paper", 0, 1, 1, 1)],
      draw: drawGather,
    },
    lattice: {
      name: "Cube Tunnel", from: "Ideas to Reality Promo", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono", "aqua", "ember", "aurora"],
      desc: "A lattice of turning wireframe cubes flows toward the camera.",
      hint: "Move to steer the camera",
      params: [P("rate", "Flight", 0, 4, 0.01, 0.8), P("spin", "Spin", 0, 3, 0.01, 1), P("size", "Cube", 0.3, 2, 0.01, 1)],
      draw: drawLattice,
    },
    orbits: {
      name: "Orbit Rings", from: "Ideas to Reality Promo", kind: "Canvas 2D", res: 1, palette: "mono", palettes: ["mono", "aqua", "ember", "aurora"],
      desc: "Tilted rings with tick marks sway round a glowing core. Comets with fading tails pass behind and in front.",
      hint: "Move to tilt the rings",
      params: [P("scale", "Scale", 0.3, 1.6, 0.01, 0.9), P("rate", "Orbit", 0, 3, 0.01, 1), P("sway", "Sway", 0, 3, 0.01, 1)],
      draw: drawOrbits,
    },
    hearth: {
      name: "Glow Bed", from: "Document AI Teaser", kind: "Canvas 2D", res: 0.5, palette: "aurora", palettes: ["aurora", "ion", "ember", "synth"],
      desc: "A bed of soft light breathes and sways along the bottom edge.",
      hint: "Move to stoke the glow",
      params: [P("intensity", "Intensity", 0.2, 2, 0.01, 1), P("height", "Height", 0.4, 1.8, 0.01, 1), P("sway", "Sway", 0, 3, 0.01, 1), P("dots", "Dot grid", 0, 1, 1, 1), P("grain", "Grain", 0, 0.2, 0.005, 0.06)],
      draw: (ctx, c, p, s, e) => drawHearth(ctx, c, p, s, e, "bed"),
    },
    lightsurge: {
      name: "Light Surge", from: "Document AI Teaser", kind: "Canvas 2D", res: 0.5, palette: "aurora", palettes: ["aurora", "ion", "ember", "synth"],
      desc: "Columns of light rise from the floor over a wash, sway, then lift away. Good as a cut.",
      hint: "",
      params: [P("intensity", "Intensity", 0.2, 2, 0.01, 1), P("cycle", "Cycle", 4, 16, 0.1, 6, "s"), P("dots", "Dot grid", 0, 1, 1, 0), P("grain", "Grain", 0, 0.2, 0.005, 0.05)],
      draw: (ctx, c, p, s, e) => drawHearth(ctx, c, p, s, e, "surge"),
    },
    sweep: {
      name: "Glyph Sweep", from: "AI Revolution Sweep", kind: "GLSL", gl2: true, res: 1, palette: "phosphor", palettes: ["phosphor", "cobalt", "ledger", "ember"],
      desc: "A band of glyphs sweeps across and swaps one line for the next.",
      hint: "Move across to scrub the sweep", text: "Every few centuries, the ground shifts.|AI is turning thought into infrastructure.|This is our industrial revolution.",
      params: [P("glyph", "Glyph", 0.5, 4, 0.05, 2), P("band", "Band", 0.05, 0.6, 0.01, 0.28), P("trail", "Trail", 0, 2, 0.01, 0.75), P("turbulence", "Turbulence", 0, 1, 0.01, 0.5), P("glow", "Glow", 0, 2, 0.01, 2), P("split", "Chroma split", 0, 12, 0.1, 5), P("tear", "Tear", 0, 40, 0.5, 14), P("flicker", "Flicker", 0, 1, 0.01, 0.35), P("hold", "Hold", 0.4, 6, 0.1, 1.1, "s"), P("charset", "Charset", 0, 2, 1, 0), P("size", "Text size", 0.02, 0.12, 0.002, 0.045)],
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
    matrix: {
      name: "Matrix", from: "Living in the Matrix", kind: "GLSL", gl2: true, res: 1, palette: "phosphor", palettes: ["phosphor", "cobalt", "ember", "mono"],
      desc: "Green glyph rain falls over a line of text and lights it up.",
      hint: "", text: "Are we living in the matrix?",
      params: [P("cell", "Cell", 8, 40, 1, 15), P("rate", "Fall", 0.05, 1, 0.01, 0.2), P("density", "Density", 0.02, 0.8, 0.01, 0.32), P("trail", "Trail", 0.2, 3, 0.05, 1.4), P("glow", "Glow", 0, 3, 0.01, 1.75), P("light", "Light", 0, 3, 0.01, 1.2), P("layers", "Layers", 1, 3, 1, 2), P("mutate", "Mutate", 0, 3, 0.01, 0), P("show", "Text", 0, 1, 0.01, 1), P("size", "Text size", 0.02, 0.14, 0.002, 0.056)],
      frag: F_RAIN,
      uniforms: (c, p, e) => {
        const a = glyphAtlas(KATAKANA), bg = hex3("#020805");
        return { uContent: textPanel(c.w, c.h, phrases(c, e)[0], { size: p.size, fg: "#e4f7ea", bg: "#020805", ls: "-0.02em" }), uAtlas: a.canvas, uResolution: [c.w, c.h], uTime: c.t + 7.3, uCell: p.cell * c.k,
          uGlyphCount: a.count, uAtlasGrid: a.grid, uColor: c.pal[0], uHeadColor: c.pal[1], uSpeed: p.rate, uSpeedVar: 0.5, uDensity: p.density, uTrail: p.trail, uGlow: p.glow, uMutate: p.mutate,
          uLayers: p.layers, uDim: 0.08, uLight: p.light, uLightRadius: 160 * c.k, uLightHeight: 172 * c.k, uRelief: 0, uBg: bg, uShow: p.show };
      },
    },
    asciify: {
      name: "ASCII Text", from: "It Pays Off", kind: "Canvas 2D", res: 1, palette: "mint", palettes: ["mint", "ledger", "phosphor", "cobalt"],
      desc: "Crisp text wipes into ASCII glyphs, a scan band lights the characters, then it wipes back.",
      hint: "Move to hold the ASCII and steer the scan", text: "Quietly.",
      params: [P("cycle", "Cycle", 3, 12, 0.1, 5.5, "s"), P("radius", "Scan width", 0.03, 0.4, 0.005, 0.12), P("softness", "Softness", 0, 1, 0.01, 0.5), P("glyph", "Glyph", 0.5, 4, 0.05, 2), P("dots", "Dots", 0, 1, 1, 0), P("charset", "Charset", 0, 2, 1, 0), P("glow", "Glow", 0, 1, 0.01, 0.6), P("split", "Chroma split", 0, 1, 0.01, 0.3), P("invert", "Invert", 0, 1, 1, 0), P("paper", "Paper", 0, 1, 1, 0), P("size", "Text size", 0.05, 0.5, 0.005, 0.34)],
      draw: (ctx, c, p, s, e) => drawAsciiLens(ctx, c, p, e),
    },
    graph: {
      name: "Glyph Graph", from: "It Pays Off", kind: "GLSL", gl2: true, res: 1, palette: "sky", palettes: ["sky", "ledger", "mint", "phosphor", "cobalt"],
      desc: "Columns of glyphs rise like a chart, then climb to fill the frame.",
      hint: "", text: "",
      params: [P("height", "Height", 0.1, 0.9, 0.01, 0.4), P("cycle", "Cycle", 4, 30, 0.5, 8, "s"), P("glyph", "Glyph", 0.5, 10, 0.05, 6), P("charset", "Charset", 0, 2, 1, 0), P("paper", "Paper", 0, 1, 1, 1), P("size", "Text size", 0.03, 0.2, 0.002, 0.07)],
      frag: F_ASCII,
      uniforms: (c, p, e) => asciiU(c, p, e, true),
    },
    swirl: {
      name: "Silk Swirl", from: "Oncheck Brand Animation", kind: "GLSL", res: 0.75, palette: "silk", palettes: ["silk", "ember", "dusk", "aurora", "mono"],
      desc: "Silk bands spiral in toward the centre and keep turning.",
      hint: "Move to shift the centre",
      params: [P("bands", "Bands", 1, 8, 1, 4), P("twist", "Twist", 0, 1, 0.01, 0.42), P("spin", "Spin", 0, 4, 0.01, 1.4), P("soft", "Softness", 0, 1, 0.01, 0), P("noise", "Noise", 0, 0.6, 0.01, 0.2), P("scale", "Scale", 0.4, 2, 0.01, 1), P("grain", "Grain", 0, 0.15, 0.005, 0.02)],
      frag: F_SWIRL,
      uniforms: (c, p) => ({ u_bands: p.bands, u_twist: p.twist, u_soft: p.soft, u_noise: p.noise, u_scale: p.scale, u_grain: p.grain, u_phase: (c.t * p.spin / 6.2832) % 1,
        u_c: [lerp(c.w / 2, c.mouse[0], 0.35 * c.mouse[2]), lerp(c.h / 2, c.h - c.mouse[1], 0.35 * c.mouse[2])] }),
    },
    waves: {
      name: "Wave Bands", from: "Oncheck Brand Book", kind: "Canvas 2D", res: 1, palette: "silk", palettes: ["silk", "ember", "mint", "cobalt", "mono"],
      desc: "Rows of soft waves drift across a second colour and breathe.",
      hint: "Move to swell the waves",
      params: [P("gap", "Spacing", 16, 200, 1, 96), P("thick", "Thickness", 0.1, 0.9, 0.01, 0.46), P("amp", "Wave", 0, 80, 0.5, 26), P("length", "Length", 80, 1400, 5, 640), P("drift", "Drift", 0, 6, 0.01, 2.6), P("breathe", "Breathe", 0, 1, 0.01, 0.35), P("tilt", "Tilt", -30, 30, 1, 0, "°"), P("duo", "Two colours", 0, 1, 1, 0)],
      draw: drawWaves,
    },
    stage: {
      name: "Stage Light", from: "Vaulton Launch", kind: "Canvas 2D", res: 0.5, palette: "cobalt", palettes: ["cobalt", "aqua", "synth", "aurora", "ember"],
      desc: "Light pours up from a glowing base, with soft shafts, a mirrored floor and drifting motes.",
      hint: "Move to steer the light",
      params: [P("intensity", "Intensity", 0.3, 2, 0.01, 1), P("reach", "Reach", 0.2, 1, 0.01, 0.62), P("width", "Base width", 0.1, 0.9, 0.01, 0.42), P("base", "Base height", 0.5, 0.95, 0.01, 0.8), P("shafts", "Shafts", 0, 1, 0.01, 0.6), P("motes", "Motes", 0, 1, 0.01, 0.5), P("breathe", "Breathe", 0, 1, 0.01, 0.5)],
      draw: drawStage,
    },
    globe: {
      name: "Dot Globe", from: "Invois App Launch", kind: "Canvas 2D", res: 1, palette: "cobalt", palettes: ["cobalt", "aqua", "mint", "ember", "mono"],
      desc: "A globe of dots turns slowly. Land on the near side lights up and pings.",
      hint: "Move to turn the globe",
      params: [P("size", "Size", 0.3, 1.4, 0.01, 0.62), P("rate", "Spin", 0, 2, 0.01, 0.45), P("tilt", "Tilt", -40, 40, 1, 16, "°"), P("density", "Land", 0.1, 1, 0.01, 0.5), P("dot", "Dot", 0.4, 3, 0.05, 1), P("glow", "Glow", 0, 1.5, 0.01, 0.7), P("pings", "Pings", 0, 1, 0.01, 0.6)],
      draw: drawGlobe,
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
  // ── ASCII Lens (It Pays Off): crisp headline; inside a sweeping lens the same letters are rebuilt from big glyphs or dots ──
  const ASC_RAMPS = [" .:-=+*#%@", " ░▒▓█", " 0011"];
  const ASC_G = new WeakMap();
  function ascGrid(pn, cs, bgL) {
    let m = ASC_G.get(pn); if (!m) ASC_G.set(pn, (m = new Map()));
    const key = cs.toFixed(2); if (m.has(key)) return m.get(key);
    const cols = Math.ceil(pn.width / cs), rows = Math.ceil(pn.height / cs), cv = document.createElement("canvas"); cv.width = cols; cv.height = rows;
    const x = cv.getContext("2d", { willReadFrequently: true }); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; x.drawImage(pn, 0, 0, cols, rows);
    const d = x.getImageData(0, 0, cols, rows).data, v = new Float32Array(cols * rows);
    for (let i = 0; i < v.length; i++) v[i] = Math.min(1, Math.pow(Math.abs((0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255 - bgL) * 1.15, 0.6));
    const g = { cols, rows, v }; if (m.size > 6) m.clear(); m.set(key, g); return g;
  }
  // ASCII text: the headline is drawn entirely in glyphs; a scan band sweeps across, lighting and densifying the characters it crosses
  const ASC_LONG = [" .,:;-~=+*cxoO0#%@", " ░░▒▒▓▓█", " 0101"];
  function drawAsciiLens(ctx, c, p, e) {
    const W = c.w, H = c.h, k = H / 1080, paper = p.paper >= 0.5, BGc = paper ? "#fafaf8" : "#0a0b0a", FG = paper ? "#161616" : "#e6e8e3", t = c.t;
    const pn = textPanel(W, H, phrases(c, e)[0], { size: p.size, fg: "#000", bg: "#fff", weight: 800, ls: "-0.03em", fit: 0.9 }), r = pn._rect;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.fillStyle = BGc; ctx.fillRect(0, 0, W, H);
    // Cycle: crisp text → wipe into ASCII → hold with the scan → wipe back to text
    const L = p.cycle ?? 5.5, u = t % L, sg = (a, b) => clamp((u - a) / (b - a)), live = c.mouse[2] > 0.3;
    const fwd = live ? 1 : E3.io(sg(0.16 * L, 0.36 * L)), back = live ? 0 : E3.io(sg(0.8 * L, 0.97 * L)), fF = fwd * 1.25 - 0.12, fB = back * 1.25 - 0.12;
    const pnT = textPanel(W, H, phrases(c, e)[0], { size: p.size, fg: FG, bg: BGc, weight: 800, ls: "-0.03em", fit: 0.9 }); ctx.drawImage(pnT, 0, 0);
    const cs = Math.max(5, (pn._size || p.size * H) * 0.03 * p.glyph), G = ascGrid(pn, cs, 1), ramp = ASC_LONG[Math.round(p.charset)] || ASC_LONG[0], inv = p.invert >= 0.5, dots = p.dots >= 0.5;
    const band = Math.max(cs * 2, p.radius * W), sx = lerp(lerp(r[0] * W - band, r[2] * W + band, 0.5 + 0.5 * Math.sin(t * 0.8 - 1.4)), c.mouse[0], c.mouse[2]), soft = Math.max(0.15, p.softness);
    const ink = c.pal[0], fgc = hex3(FG), sp = p.split * 2.5 * k;
    const r0 = Math.max(0, Math.floor((r[1] * H) / cs) - 2), r1 = Math.min(G.rows - 1, Math.ceil((r[3] * H) / cs) + 2), rx0 = r[0] * W, rw = Math.max(1, (r[2] - r[0]) * W);
    ctx.font = `700 ${(cs * 1.12).toFixed(1)}px ${MONO_F}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let yy = r0; yy <= r1; yy++) for (let xx = 0; xx < G.cols; xx++) {
      const cx = (xx + 0.5) * cs, cy = (yy + 0.5) * cs; let v = G.v[yy * G.cols + xx]; if (inv) v = 1 - v;
      const nx = (cx - rx0) / rw + (h2(xx, yy + 31) - 0.5) * 0.08, asc = nx < fF && !(nx < fB), edge = Math.max(fwd > 0 && fwd < 1 ? Math.exp(-Math.pow((nx - fF) / 0.035, 2)) : 0, back > 0 && back < 1 ? Math.exp(-Math.pow((nx - fB) / 0.035, 2)) : 0);
      if (!asc) { if (edge > 0.05 && v > 0.05) { ctx.fillStyle = pcss(c.pal[0], 0.55 * edge); ctx.fillRect(cx - cs / 2, cy - cs / 2, cs, cs); } continue; }
      ctx.fillStyle = BGc; ctx.fillRect(cx - cs / 2 - 0.5, cy - cs / 2 - 0.5, cs + 1, cs + 1);
      const lit = Math.max(edge, Math.exp(-Math.pow((cx - sx) / (band * soft + band * 0.25), 2)) * fwd * (1 - back)), fr = Math.floor(t * 12 + h2(xx, yy) * 7);
      if (v < 0.05) { const a = 0.07 + 0.18 * lit; if (h2(xx * 3 + fr, yy) < 0.5) { ctx.fillStyle = pcss(lit > 0.3 ? ink : fgc, a); ctx.fillRect(cx - 0.9 * k, cy - 0.9 * k, 1.8 * k, 1.8 * k); } continue; }
      const vv = clamp(v + 0.35 * lit), jit = lit > 0.15 && h2(xx + fr * 13, yy) < 0.25 * lit ? 1 : 0, li = Math.max(1, Math.min(ramp.length - 1, Math.round(vv * (ramp.length - 1)) - jit));
      const col = lit > 0.02 ? fgc.map((q, m) => lerp(q, ink[m], Math.min(1, lit * 1.4))) : fgc, a = Math.min(1, 0.45 + 0.55 * vv);
      if (dots) { const rr = cs * 0.5 * Math.sqrt(vv); ctx.fillStyle = pcss(col, a); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.fill(); continue; }
      const ch = ramp[li];
      if (sp > 0.3 && lit > 0.05) { ctx.fillStyle = `rgba(255,70,90,${(0.35 * lit).toFixed(3)})`; ctx.fillText(ch, cx - sp, cy); ctx.fillStyle = `rgba(60,140,255,${(0.35 * lit).toFixed(3)})`; ctx.fillText(ch, cx + sp, cy); }
      ctx.fillStyle = pcss(col, a); ctx.fillText(ch, cx, cy);
    }
    if (p.glow > 0 && fwd > 0.5 && back < 0.5) { const g = ctx.createLinearGradient(sx - band, 0, sx + band, 0); g.addColorStop(0, pcss(ink, 0)); g.addColorStop(0.5, pcss(ink, 0.08 * p.glow)); g.addColorStop(1, pcss(ink, 0)); ctx.fillStyle = g; ctx.fillRect(sx - band, r0 * cs, band * 2, (r1 - r0 + 1) * cs); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  // Display order groups related shaders together; anything not listed is appended
  const ORDER = ["current", "fret", "skein", "harmonia", "halo", "thermal", "swirl", "waves", "hearth", "lightsurge", "stage", "aurora", "sparkle", "decrypt", "datawall", "asciify", "sweep", "matrix", "graph", "sand", "blink", "blinkfield", "assemble", "mesh", "filings", "gather", "lattice", "orbits", "globe", "horizon"].filter(id => EFFECTS[id]);
  Object.keys(EFFECTS).forEach(id => { if (!ORDER.includes(id)) ORDER.push(id); });

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
  // Words swapping in one slot (Blastlabs Flow)
  function cycleWords(el, words, o = {}) {
    const hold = o.hold ?? 0.9, per = 0.55 + hold + 0.45; el.textContent = ""; el.style.overflow = "hidden"; el.style.paddingBottom = "0.12em";
    const inner = document.createElement("div"); inner.style.cssText = "white-space:nowrap;"; el.appendChild(inner); let last = -1;
    return loopFx(t => { const i = Math.floor(t / per) % words.length, u = t % per; if (i !== last) { inner.textContent = words[i]; last = i; }
      inner.style.transform = `translateY(${u < 0.55 ? (1 - oExpo(u / 0.55)) * 110 : u < 0.55 + hold ? 0 : -Math.pow((u - 0.55 - hold) / 0.45, 3) * 110}%)`; });
  }
  // Solid block wipes open, then its words roll up (Dev Agency Services)
  function cut(el, o = {}) {
    const parts = masked(el, "word"), d = o.duration ?? 0.45, dl = o.delay || 0; el.style.display = "inline-flex"; el.style.background = o.color || "#09090b"; el.style.clipPath = "inset(-2px 100% -2px 0)";
    return play(dl + d + 0.18 + parts.length * 0.06 + 0.55, t => { t -= dl; const w = EZ.inOut(clamp(t / d)); el.style.clipPath = `inset(-2px ${(1 - w) * 100}% -2px 0)`;
      parts.forEach((p, i) => { const k = oCubic(clamp((t - 0.18 - i * 0.06) / 0.55)); p.style.transform = `translateY(${(1 - k) * 115}%)`; }); });
  }
  // Terminal lines that type out and check off (Orfa Agents Launch)
  function typeLines(el, lines, o = {}) {
    const per = o.perLine ?? 0.45, gap = o.gap ?? 0.55, acc = o.accent || "#34d399"; el.textContent = ""; el.style.display = "flex"; el.style.flexDirection = "column"; el.style.gap = "0.55em";
    const rows = lines.map(() => { const r = document.createElement("div"); r.style.cssText = "display:flex;gap:0.6em;white-space:pre;opacity:0;"; r.innerHTML = `<span style="color:${acc}">${o.prompt ?? "›"}</span><span></span><span style="margin-left:auto;color:${acc};opacity:0">✓</span>`; el.appendChild(r); return r; });
    return play(lines.length * gap + per, t => rows.forEach((r, j) => { const p = clamp((t - j * gap) / per); r.style.opacity = p > 0 ? 1 : 0; r.children[1].textContent = lines[j].slice(0, Math.floor(p * lines[j].length)); r.children[2].style.opacity = p >= 1 ? 1 : 0; r.style.color = p < 1 ? (o.dim || "#7d7f89") : ""; }));
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
  // Hover focus: back-eased corner brackets, masked dot grid, cursor spotlight (Orfa Agents)
  function focusCard(el, o = {}) {
    rel(el); const acc = o.color || "#34d399", layer = document.createElement("div");
    layer.style.cssText = "position:absolute;inset:0;pointer-events:none;opacity:0;";
    layer.innerHTML = `<div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.12) 1px,transparent 1px);background-size:14px 14px;-webkit-mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%);mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%)"></div><div style="position:absolute;inset:0"></div>`;
    el.appendChild(layer); const spot = layer.lastChild;
    const corners = [["left", "top", 0], ["right", "top", 90], ["right", "bottom", 180], ["left", "bottom", 270]].map(([a, b, r]) => { const c = document.createElement("span"); c.style.cssText = `position:absolute;${a}:10px;${b}:10px;width:14px;height:14px;border-left:1.5px solid ${acc};border-top:1.5px solid ${acc};pointer-events:none;opacity:0`; c._r = r; el.appendChild(c); return c; });
    let target = 0, h = 0, mx = el.clientWidth / 2, my = el.clientHeight / 2;
    const enter = () => (target = 1), leave = () => (target = 0), move = e => { const r = el.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); el.addEventListener("pointermove", move);
    const stopL = loopFx(() => { h += (target - h) * 0.14; layer.style.opacity = h; spot.style.background = `radial-gradient(260px circle at ${mx}px ${my}px, rgba(255,255,255,0.09), transparent 70%)`; const e = oBack(clamp(h)); corners.forEach(c => { c.style.opacity = clamp(h * 1.5); c.style.transform = `rotate(${c._r}deg) scale(${0.6 + 0.4 * e})`; }); });
    const stop = () => { stopL(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.removeEventListener("pointermove", move); layer.remove(); corners.forEach(c => c.remove()); };
    stop.set = v => (target = v); return stop;
  }
  // Layered press: squeeze with a springy release, an ink wave, staggered rings, a core flash and an outer halo (Desktop Features, Closebook, Orfa Agents)
  function pressable(el, o = {}) {
    rel(el); el.style.overflow = el.style.overflow || "hidden";
    const col = o.color || "rgba(255,255,255,0.6)", n = o.rings ?? 3, spread = o.spread || 2.6, depth = o.depth ?? 0.06, bs0 = el.style.boxShadow;
    const mk = (css) => { const s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.style.cssText = "position:absolute;border-radius:50%;pointer-events:none;box-sizing:border-box;" + css; el.appendChild(s); return s; };
    const down = e => { const r = el.getBoundingClientRect(), x = o.center ? r.width / 2 : e.clientX - r.left, y = o.center ? r.height / 2 : e.clientY - r.top, far = Math.max(Math.hypot(x, y), Math.hypot(r.width - x, y), Math.hypot(x, r.height - y), Math.hypot(r.width - x, r.height - y));
      if (o.fill !== false) { const fc = o.fillColor || col, w = mk(`left:${x - far}px;top:${y - far}px;width:${far * 2}px;height:${far * 2}px;background:radial-gradient(closest-side, ${withA(fc, 0.35)}, ${withA(fc, 0.12)} 70%, transparent);transform:scale(0)`);
        play(0.65, t => { const p = t / 0.65; w.style.transform = `scale(${oCubic(Math.min(1, p / 0.7)).toFixed(4)})`; w.style.opacity = (1 - EZ.inOut(clamp((p - 0.35) / 0.65))).toFixed(3); }).then(() => w.remove()); }
      for (let i = 0; i < n; i++) { const dl = i * 0.09, d = 0.5 + i * 0.12, s1 = spread * (1 + i * 0.45), rp = mk(`left:${x - 14}px;top:${y - 14}px;width:28px;height:28px;border:${Math.max(0.6, 1.5 - i * 0.35).toFixed(2)}px solid ${col};opacity:0`);
        play(dl + d, t => { const p = clamp((t - dl) / d); rp.style.transform = `scale(${(0.3 + oCubic(p) * s1).toFixed(3)})`; rp.style.opacity = t < dl ? 0 : ((1 - p) * (1 - i * 0.25)).toFixed(3); }).then(() => rp.remove()); }
      const core = mk(`left:${x - 6}px;top:${y - 6}px;width:12px;height:12px;background:${col};filter:blur(2px)`);
      play(0.35, t => { const p = t / 0.35; core.style.transform = `scale(${(0.6 + p * 1.6).toFixed(3)})`; core.style.opacity = (1 - p).toFixed(3); }).then(() => core.remove());
      play(0.55, t => { const k = t < 0.08 ? t / 0.08 : Math.exp(-(t - 0.08) * 11) * Math.cos((t - 0.08) * 18); el.style.transform = `scale(${(1 - depth * k).toFixed(4)})`;
        if (o.halo !== false) { const h = clamp((t - 0.06) / 0.45), ring = h > 0 && h < 1 ? `0 0 0 ${(h * 10).toFixed(1)}px ${withA(o.haloColor || col, 0.35 * (1 - h))}` : ""; el.style.boxShadow = [ring, bs0].filter(Boolean).join(", "); } })
        .then(() => { el.style.transform = ""; el.style.boxShadow = bs0; }); };
    el.addEventListener("pointerdown", down); const stop = () => el.removeEventListener("pointerdown", down);
    stop.press = (x, y) => { const r = el.getBoundingClientRect(); down({ clientX: r.left + (x ?? r.width / 2), clientY: r.top + (y ?? r.height / 2) }); }; return stop;
  }
  // Status bars that build in a staggered sweep (Desktop Features)
  function signalBars(el, o = {}) {
    const rows = o.rows || [{ label: "API", state: "Operational", color: "#34d399", filled: 24 }], n = o.count || 24, dur = o.duration || 1.8, off = o.track || "rgba(242,242,244,0.12)";
    el.innerHTML = ""; el.style.display = "flex"; el.style.flexDirection = "column"; el.style.gap = "14px";
    const all = rows.flatMap((r, si) => { const w = document.createElement("div"); w.innerHTML = `<div style="display:flex;justify-content:space-between;font-size:0.8em;margin-bottom:8px;color:${o.muted || "#a4a6b0"}"><span>${r.label}</span><span style="color:${r.color}">${r.state || ""}</span></div><div style="display:flex;height:${o.height || 40}px;justify-content:space-between;align-items:flex-end;gap:3px"></div>`; el.appendChild(w);
      return Array.from({ length: n }, (_, b) => { const d = document.createElement("div"); d.style.cssText = `width:2px;border-radius:999px;background:${off}`; w.lastChild.appendChild(d); return { d, b, si, r }; }); });
    const H = o.height || 40;
    return play(dur, t => all.forEach(({ d, b, si, r }) => { const g = oCubic(clamp((t / dur) * 2.2 - (b + si * 6) / n)); d.style.height = H * (0.35 + 0.65 * g) + "px"; d.style.background = b + 1 <= r.filled && g > 0.5 ? r.color : off; }));
  }
  // Icon tabs where the active one springs open to show its label (App Features)
  function tabMorph(el, o = {}) {
    const tabs = o.tabs || ["Home", "Inbox", "Settings"], ink = o.ink || "#f2f2f4", mute = o.muted || "#8e909a";
    el.innerHTML = ""; Object.assign(el.style, { display: "inline-flex", gap: "4px", padding: "6px", borderRadius: "999px", background: o.background || "#1b1b20" });
    const items = tabs.map((t, i) => { const b = document.createElement("button"); b.type = "button"; b.style.cssText = "all:unset;cursor:pointer;display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;border-radius:999px;overflow:hidden;white-space:nowrap;box-sizing:border-box;"; b.innerHTML = `<span style="flex-shrink:0;width:12px;height:12px;border-radius:50%;border:1.5px solid currentColor;box-sizing:border-box"></span><span>${t}</span>`; b.addEventListener("click", () => { stop.user = true; set(i); }); el.appendChild(b); return b; });
    const lw = items.map(b => b.lastChild.scrollWidth); let cur = o.active || 0, prev = cur, t0 = -9;
    const W = (k, j) => (k === j ? 40 + lw[k] : 32);
    const set = k => { if (k === cur) return; prev = cur; cur = k; t0 = now(); };
    const stopL = loopFx(() => { const p = EZ.spring(now() - t0); items.forEach((b, k) => { b.style.width = W(k, prev) + (W(k, cur) - W(k, prev)) * p + "px"; const on = prev === cur ? (k === cur ? 1 : 0) : k === cur ? p : k === prev ? 1 - p : 0; b.style.background = `rgba(255,255,255,${0.09 * on})`; b.style.color = on > 0.5 ? ink : mute; b.lastChild.style.opacity = on; }); });
    const stop = () => stopL(); stop.set = set; stop.next = () => set((cur + 1) % tabs.length); return stop;
  }
  // List that glides up and back under a bottom fade mask (Desktop Features)
  function maskedScroll(el, o = {}) {
    el.style.overflow = "hidden"; el.style.webkitMaskImage = el.style.maskImage = "linear-gradient(#000 calc(100% - 40px), transparent)";
    const inner = el.firstElementChild, d = o.duration || 2, h = o.hold || 1.2, per = 2 * (d + h);
    return loopFx(t => { const dist = o.distance ?? Math.max(0, inner.scrollHeight - el.clientHeight + 40), u = t % per; const p = u < h ? 0 : u < h + d ? EZ.inOut((u - h) / d) : u < 2 * h + d ? 1 : 1 - EZ.inOut((u - 2 * h - d) / d); inner.style.transform = `translateY(${-p * dist}px)`; });
  }
  // Iris close to a hairline, or a vertical shutter (Orfa Agents, Dev Agency)
  function iris(el, o = {}) {
    rel(el); const c = o.content || el.firstElementChild, acc = o.color || "#34d399", rev = !!o.open, sh = !!o.shutter, D = sh ? 0.7 : 1.05;
    const ln = document.createElement("div"); ln.style.cssText = `position:absolute;top:50%;height:1px;background:${acc};pointer-events:none;z-index:5;opacity:0`; if (!sh) el.appendChild(ln);
    return play(D, t => { const tt = rev ? D - t : t; const y = sh ? EZ.in(clamp(tt / D)) : EZ.inOut(clamp(tt / 0.55)), x = sh ? 0 : EZ.inOut(clamp((tt - 0.5) / 0.5));
      c.style.clipPath = `inset(${y * 50}% ${x * 50}% ${y * 50}% ${x * 50}%)`; ln.style.left = ln.style.right = x * 50 + "%"; ln.style.opacity = EZ.smooth(clamp((y - 0.7) / 0.3)) * (x < 0.98 ? 1 : 0); }).then(() => ln.remove());
  }
  // Hairline frame and underline that draw themselves (Dev Agency, Gloww, Shader Trials)
  function drawFrame(el, o = {}) {
    rel(el); const col = o.color || "rgba(242,242,244,0.45)"; el.querySelectorAll("[data-sf-edge]").forEach(n => n.remove());
    const edges = [["left:0;top:0;right:0;height:1px", "scaleX", "0 0"], ["left:0;bottom:0;right:0;height:1px", "scaleX", "100% 0"], ["left:0;top:0;bottom:0;width:1px", "scaleY", "0 100%"], ["right:0;top:0;bottom:0;width:1px", "scaleY", "0 0"]].map(([p, ax, org]) => { const d = document.createElement("div"); d.dataset.sfEdge = ""; d.style.cssText = `position:absolute;${p};background:${col};transform-origin:${org};transform:${ax}(0);pointer-events:none`; d._ax = ax; el.appendChild(d); return d; });
    const dur = o.duration || 1; return play(dur, t => { const e = EZ.inOut(t / dur); edges.forEach(d => (d.style.transform = `${d._ax}(${e})`)); });
  }
  function drawLine(el, o = {}) { el.style.transformOrigin = o.origin || "left center"; const d = o.duration || 1; return play((o.delay || 0) + d, t => { el.style.transform = `scaleX(${EZ.inOut(clamp((t - (o.delay || 0)) / d))})`; }); }
  // Drifting diagonal stripes revealed by a wipe (Dev Agency Services)
  function stripes(el, o = {}) {
    rel(el); const ang = o.angle ?? -60, gap = o.gap || 13, px = gap / Math.max(0.05, Math.abs(Math.sin((ang * Math.PI) / 180))), wrap = document.createElement("div"), s = document.createElement("div");
    // Drift by translating an oversized layer modulo one horizontal stripe period, so the pattern never wraps at a tile seam
    wrap.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;clip-path:inset(0 100% 0 0)";
    s.style.cssText = `position:absolute;top:0;bottom:0;left:${-Math.ceil(px) - 1}px;right:0;background-image:repeating-linear-gradient(${ang}deg, ${o.color || "rgba(148,163,184,0.22)"} 0 1.5px, transparent 1.5px ${gap}px);background-repeat:no-repeat;will-change:transform`;
    wrap.appendChild(s); el.insertBefore(wrap, el.firstChild);
    const stopL = loopFx(t => { wrap.style.clipPath = `inset(0 ${(1 - EZ.inOut(clamp(t / (o.duration || 1.1)))) * 100}% 0 0)`; s.style.transform = `translateX(${((t * (o.drift ?? 10)) % px).toFixed(2)}px)`; });
    return () => { stopL(); wrap.remove(); };
  }
  // Camera push into a target element and back (Orfa Agents, Closebook, Desktop Features)
  function cameraPush(world, target, o = {}) {
    const k1 = o.scale || 2.4, d = o.duration || 1.3; world.style.transform = ""; world.style.transformOrigin = "0 0";
    const vp = world.parentElement.getBoundingClientRect(), wr = world.getBoundingClientRect(), r = target.getBoundingClientRect();
    const cx = r.left + r.width / 2 - wr.left, cy = r.top + r.height / 2 - wr.top, sw = vp.width / 2 - (wr.left - vp.left), sh = vp.height / 2 - (wr.top - vp.top);
    const apply = k => { const zp = (k - 1) / (k1 - 1), fx = sw + (cx - sw) * zp, fy = sh + (cy - sh) * zp; world.style.transform = `translate(${sw - fx * k}px,${sh - fy * k}px) scale(${k})`; };
    return play(d, t => apply(1 + (k1 - 1) * EZ.inOut(t / d))).then(() => o.back ? new Promise(r2 => setTimeout(r2, (o.hold ?? 0.8) * 1000)).then(() => play(d, t => apply(k1 - (k1 - 1) * EZ.inOut(t / d)))) : null);
  }
  // Light flash: the whole frame snaps to light on the hit, then falls off fast (Blastlabs Flow)
  function flash(el, o = {}) {
    rel(el); const f = document.createElement("div"), pk = o.peak ?? 0.8, col = o.color || "#fff", d = o.duration ?? 0.9, atk = o.attack ?? 0.05;
    f.style.cssText = `position:absolute;inset:0;pointer-events:none;background:${col};mix-blend-mode:${o.blend || "screen"};opacity:0;z-index:30`;
    el.appendChild(f);
    return play(d, t => { const k = t < atk ? t / atk : Math.exp(-((t - atk) / (d - atk)) * 4.6); f.style.opacity = (pk * k).toFixed(3); }).then(() => f.remove());
  }
  // Children appear by distance from the centre (Kinetic Opening)
  function radialReveal(el, o = {}) {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, maxD = Math.hypot(r.width / 2, r.height / 2);
    const kids = [...el.children].map(k => { const b = k.getBoundingClientRect(); return [k, Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy) / maxD]; });
    const dur = o.duration || 1.4, sp = o.spread ?? 0.25, sq = o.shape === "square", jt = o.jitter ?? 0, out = !!o.out;
    kids.forEach((kd, i) => { const k = kd[0], b = k.getBoundingClientRect(), dx = b.left + b.width / 2 - cx, dy = b.top + b.height / 2 - cy; let d = sq ? Math.max(Math.abs(dx) / (r.width / 2 || 1), Math.abs(dy) / (r.height / 2 || 1)) : kd[1]; kd[1] = out ? rnd(i, 21) : d * (1 - jt) + rnd(i, 21) * jt; });
    return play(dur, t => { const rv = oCubic(t / dur) * (1 + sp); kids.forEach(([k, d]) => { const v = clamp((rv - d) / sp), w = out ? 1 - v : v; k.style.opacity = w; k.style.transform = `scale(${0.6 + 0.4 * w})`; }); });
  }
  // Fading pen trail that follows the pointer and reveals text behind it (Drawing Cursor Film)
  function penTrail(el, o = {}) {
    rel(el); const cv = document.createElement("canvas"); cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"; el.appendChild(cv);
    const ctx = cv.getContext("2d"), pts = [], ink = o.color || "#34d399", lw = o.width || 6, fade = o.fade || 0.9; let inside = false, px = 0, py = 0, maxX = 0;
    const move = e => { const r = el.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; inside = true; }, leave = () => (inside = false);
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    const stopL = loopFx(t => {
      const dpr = Math.min(2, window.devicePixelRatio || 1), w = el.clientWidth, h = el.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      let x = px, y = py;
      if (!inside) { const u = t * 0.62 + 0.4; x = w / 2 + Math.sin(u * 0.9) * w * 0.29 + Math.sin(u * 2.3 + 1.1) * w * 0.08 + Math.cos(u * 5.1) * w * 0.016; y = h / 2 + Math.sin(u * 1.3 + 0.6) * h * 0.28 + Math.cos(u * 3.1) * h * 0.08; }
      if (inside || o.auto !== false) pts.push({ x, y, t }); while (pts.length && t - pts[0].t > fade) pts.shift();
      if (o.reveal) { maxX = Math.max(maxX, x); const m = `linear-gradient(90deg,#000 ${maxX - 140}px,transparent ${maxX}px)`; o.reveal.style.webkitMaskImage = o.reveal.style.maskImage = m; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = ctx.fillStyle = ink;
      for (let i = 1; i < pts.length; i++) { const a = clamp(1 - (t - pts[i].t) / fade); ctx.globalAlpha = a; ctx.lineWidth = lw * (0.2 + 0.8 * a); ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
      if (pts.length) { const c = pts[pts.length - 1]; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(c.x, c.y, lw * 2.4, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 0.35; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c.x, c.y, lw * 2.4 + 10, 0, 6.2832); ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
    const stop = () => { stopL(); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); cv.remove(); };
    stop.reset = () => (maxX = 0); return stop;
  }
  // Page lifts away to reveal the footer underneath (Dev Agency Services)
  function underlayReveal(page, under, o = {}) {
    const d = o.duration || 1.5, dist = o.distance ?? under.offsetHeight, rv = !!o.reverse;
    return play(d, t => { const p = rv ? 1 - EZ.inOut(t / d) : EZ.inOut(t / d); page.style.transform = `translateY(${-p * dist}px)`; page.style.boxShadow = `0 30px 60px rgba(0,0,0,${0.5 * (1 - p)})`; under.style.transform = `translateY(${-40 * (1 - p)}px) scale(${0.92 + 0.08 * p})`; under.style.opacity = p; });
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
  // Each word replaces the last with a per-letter roll (Keep Marching)
  function rollWords(el, words, o = {}) {
    const d = o.duration ?? 0.5, st = o.stagger ?? 0.025, hold = o.hold ?? 0.75, per = d + hold; rel(el); el.textContent = "";
    el.style.overflow = "hidden"; el.style.height = el.style.height || "0.86em"; el.style.lineHeight = "0.86em";
    const mk = () => { const w = document.createElement("div"); w.style.cssText = "position:absolute;left:0;right:0;top:0;display:flex;justify-content:" + (o.align || "center") + ";"; el.appendChild(w); return w; };
    const A = mk(), B = mk(); let last = -1;
    const fill = (w, s) => { w.textContent = ""; [...s].forEach(ch => { const sp = document.createElement("span"); sp.style.cssText = "display:inline-block;white-space:pre;"; sp.textContent = ch; w.appendChild(sp); }); };
    return loopFx(t => {
      const i = Math.floor(t / per), u = t - i * per, cur = words[i % words.length], prev = i > 0 ? words[(i - 1) % words.length] : "";
      if (i !== last) { fill(A, prev); fill(B, cur); last = i; }
      [...A.children].forEach((s, j) => (s.style.transform = `translateY(${-ROLL((u - j * st) / d) * 100}%)`));
      [...B.children].forEach((s, j) => (s.style.transform = `translateY(${(1 - ROLL((u - j * st) / d)) * 100}%)`));
    });
  }
  // Words roll in one by one as scrambled glyphs, then resolve letter by letter (Keep Marching)
  function solve(el, o = {}) {
    const text = el.dataset.sfText || el.textContent.trim(); el.dataset.sfText = text; el.setAttribute("aria-label", text); el.textContent = "";
    const G = o.glyphs || "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@", d = o.duration ?? 0.5, st = o.stagger ?? 0.025, per = o.perWord ?? 0.55, sv = o.solveAfter ?? 0.3;
    el.style.display = "flex"; el.style.flexWrap = "wrap"; el.style.columnGap = "0.28em"; el.style.overflow = "hidden";
    const cells = []; text.split(/\s+/).forEach((w, wi) => { const box = document.createElement("span"); box.style.cssText = "display:inline-flex;overflow:hidden;"; box.setAttribute("aria-hidden", "true");
      [...w].forEach((ch, j) => { const s = document.createElement("span"); s.style.cssText = "position:relative;display:inline-block;"; const ghost = document.createElement("span"); ghost.style.visibility = "hidden"; ghost.textContent = ch;
        const vis = document.createElement("span"); vis.style.cssText = "position:absolute;left:0;right:0;top:0;text-align:center;"; s.append(ghost, vis); box.appendChild(s); cells.push({ s, vis, ch, at: wi * per, j }); }); el.appendChild(box); });
    const end = (text.split(/\s+/).length - 1) * per + sv + 0.045 * 12 + d;
    return play(end, t => cells.forEach((c, g) => { const pin = ROLL((t - c.at - c.j * st) / d), solved = t >= c.at + sv + c.j * 0.045;
      c.s.style.transform = `translateY(${(1 - pin) * 100}%)`; c.vis.style.opacity = solved ? 1 : 0.35;
      c.vis.textContent = solved || /[^a-z]/i.test(c.ch) ? c.ch : G[Math.floor(rnd(Math.floor(t * 18) + g * 13.7, 1) * G.length)]; }));
  }
  // Lyric view: the current line lights up (whole line or word by word), the list glides to keep it in focus (Lyrics That Flow · Lyric Scroll)
  function lyricFlow(el, lines, o = {}) {
    rel(el); el.style.overflow = "hidden"; el.textContent = ""; const byWord = o.mode === "word", acc = o.accent || "#1ed760", dim = o.dim ?? 0.5, focus = o.focus ?? 0.38, gap = o.gap ?? "0.3em";
    const mask = "linear-gradient(to bottom, transparent 0, #000 22%, #000 78%, transparent 100%)"; el.style.webkitMaskImage = el.style.maskImage = o.mask === false ? "" : mask;
    const list = document.createElement("div"); list.style.cssText = `position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;gap:${gap};`; el.appendChild(list);
    const per = o.perLine, rows = lines.map(text => { const r = document.createElement("div"); r.style.cssText = "transform-origin:0 50%;text-wrap:pretty;display:flex;flex-wrap:wrap;column-gap:0.26em;";
      const ws = text.split(" ").map(w => { const s = document.createElement("span"); s.style.cssText = "position:relative;display:inline-block;"; const b = document.createElement("span"); b.textContent = w; b.style.opacity = dim; const f = document.createElement("span"); f.textContent = w; f.style.cssText = "position:absolute;left:0;top:0;opacity:0;"; s.append(b, f); r.appendChild(s); return { b, f, s }; });
      list.appendChild(r); return { r, ws, d: per || 0.9 + text.length * 0.055 }; });
    let t0 = 0; rows.forEach(r => { r.start = t0; t0 += r.d; r.end = t0; }); const total = t0;
    return loopFx(t => {
      const u = t % total; let idx = 0; rows.forEach((r, k) => { if (u >= r.start) idx = k; });
      let y = rows[0].r.offsetTop; for (let k = 1; k < rows.length; k++) y += (rows[k].r.offsetTop - rows[k - 1].r.offsetTop) * EZ.inOut(clamp((u - rows[k].start + 0.25) / 0.55));
      list.style.transform = `translateY(${el.clientHeight * focus - y}px)`;
      rows.forEach((r, k) => { const on = k === idx, sung = k < idx, fin = EZ.inOut(clamp((u - r.start + 0.25) / 0.4)); r.r.style.transform = `scale(${on ? 1 + 0.02 * fin : 1})`;
        const dist = Math.abs(k - idx); r.r.style.opacity = clamp(1 - Math.max(0, dist - 0.4) * 0.28);
        const span = (r.end - r.start) * 0.72, wd = span / r.ws.length;
        r.ws.forEach((w, i) => { let fill, hot = 0;
          if (!byWord) fill = on ? (k === 0 ? 1 : fin) : 0;
          else { const a = r.start + i * wd, b = a + wd; fill = sung ? 1 : on ? oCubic(clamp((u - a) / Math.max(0.12, b - a))) : 0; hot = on ? fill * (1 - oCubic(clamp((u - b - 0.15) / 0.5))) : 0; }
          w.f.style.opacity = sung && !byWord ? 0 : fill; w.f.style.color = hot > 0.02 ? acc : ""; w.b.style.opacity = sung && !byWord ? dim - 0.2 * clamp(idx - k - 1) : dim;
          w.s.style.transform = byWord ? `translateY(${(1 - fill) * 0.06}em)` : ""; }); });
    });
  }

  // Corner brackets hop between targets: they shrink to a spinning reticle in between, then snap open around the next one (Clause Film)
  function bracketHop(stage, targets, o = {}) {
    rel(stage); const ink = o.color || "currentColor", TR = o.travel ?? 0.5, hold = o.hold ?? 1.1, IDLE = o.idle ?? 44, PAD = o.pad ?? 10, lw = o.width ?? 3, arm = o.arm ?? 14;
    const box = document.createElement("div"); box.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;transform-origin:0 0;z-index:20;";
    const bd = `${lw}px solid ${ink}`;
    [["left", "top"], ["right", "top"], ["left", "bottom"], ["right", "bottom"]].forEach(([h, v]) => { const s = document.createElement("span"); s.style.cssText = `position:absolute;${h}:0;${v}:0;width:${arm}px;height:${arm}px;border-${v}:${bd};border-${h}:${bd};`; box.appendChild(s); });
    const dot = document.createElement("div"); dot.style.cssText = `position:absolute;left:0;top:0;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:${ink};pointer-events:none;z-index:20;`; stage.append(box, dot);
    const snap = (t) => { t = clamp(t); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2; };
    const rect = (el) => { const a = el.getBoundingClientRect(), b = stage.getBoundingClientRect(); return { x: a.left - b.left - PAD, y: a.top - b.top - PAD, w: a.width + PAD * 2, h: a.height + PAD * 2 }; };
    const idleAt = () => ({ x: stage.clientWidth / 2 - IDLE / 2, y: stage.clientHeight / 2 - IDLE / 2, w: IDLE, h: IDLE });
    const per = TR + hold, n = targets.length, lerpR = (a, b, e) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), w: lerp(a.w, b.w, e), h: lerp(a.h, b.h, e) });
    return loopFx(t => {
      const i = Math.floor(t / per), u = t - i * per, cur = rect(targets[i % n]), prev = i > 0 ? rect(targets[(i - 1) % n]) : idleAt(), k = u / TR;
      let r, rot;
      if (k < 1) { const e = snap(k), m = Math.sin(Math.PI * clamp(k)) * 0.55, mid = lerpR(prev, cur, e), w = lerp(mid.w, IDLE, m), h = lerp(mid.h, IDLE, m);
        r = { x: lerp(prev.x + prev.w / 2, cur.x + cur.w / 2, e) - w / 2, y: lerp(prev.y + prev.h / 2, cur.y + cur.h / 2, e) - h / 2, w, h }; rot = (i * 180) + 180 * oCubic(k); }
      else { r = { x: cur.x + 3 * Math.sin(t * 1.7), y: cur.y + 2 * Math.cos(t * 1.3), w: cur.w, h: cur.h }; rot = (i + 1) * 180; }
      const q = (u - TR - 0.1) / 0.4, sc = o.press && q > 0 && q < 1 ? 1 - 0.1 * Math.sin(Math.PI * q) : 1;
      box.style.width = r.w + "px"; box.style.height = r.h + "px";
      box.style.transform = `translate(${r.x + r.w / 2}px,${r.y + r.h / 2}px) rotate(${rot}deg) scale(${sc}) translate(${-r.w / 2}px,${-r.h / 2}px)`;
      dot.style.transform = `translate(${r.x + r.w / 2}px,${r.y + r.h / 2}px) scale(${sc < 1 ? 0.6 : 1})`;
    });
  }
  // A big index list steps one row at a time; the background melts between each row's colour (Color List)
  function colorIndex(el, items, o = {}) {
    rel(el); el.style.overflow = "hidden"; el.textContent = ""; const pitch = o.pitch ?? 1.33, step = o.step ?? 0.75, mv = o.move ?? 0.42, N = items.length, act = o.active ?? 0.43;
    const mod = (n) => ((n % N) + N) % N, rgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const move = (t) => { t = clamp(t); return t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2; };
    const rows = []; for (let r = 0; r < 12; r++) { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:0;right:0;display:flex;align-items:center;gap:0.3em;white-space:nowrap;padding:0 0.55em;";
      const nm = document.createElement("span"), bd = document.createElement("span"); bd.style.cssText = "border-radius:9999px;background:rgba(255,255,255,0.18);padding:0.12em 0.25em;font-size:0.2em;font-weight:500;"; d.append(nm, bd); el.appendChild(d); rows.push({ d, nm, bd }); }
    return loopFx(t => {
      const k = Math.floor(t / step), pos = k + move((t - k * step - (step - mv)) / mv), base = Math.floor(pos), frac = pos - base, A = rgb(items[mod(base)].bg), B = rgb(items[mod(base + 1)].bg);
      el.style.background = `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * frac)).join(",")})`;
      const lh = parseFloat(getComputedStyle(el).fontSize) * pitch, ay = el.clientHeight * act;
      rows.forEach((r, j) => { const i = base - 4 + j, it = items[mod(i)], w = clamp(1 - Math.abs(i - pos) * 1.8);
        if (r.nm.textContent !== it.name) { r.nm.textContent = it.name; r.bd.textContent = it.badge || ""; r.bd.style.display = it.badge ? "" : "none"; }
        r.d.style.top = (ay + (i - pos) * lh - lh / 2) + "px"; r.d.style.height = lh + "px"; r.d.style.opacity = 0.2 + 0.8 * w; });
    });
  }

  // A stack of tilted discs: on each step the top disc lifts away and returns at the bottom while the rest glide up (Cryptar Launch)
  function discStack(el, faces, o = {}) {
    rel(el); el.textContent = ""; const N = faces.length, S = o.size ?? Math.min(el.clientWidth, el.clientHeight) * 0.55, GAP = S * 0.11, LIFT = GAP * 0.5, TD = o.duration ?? 0.55, hold = o.hold ?? 1.6, TH = Math.max(4, S * 0.018), ring = o.ring || "#000", surf = o.surface || "#fff";
    const mod = (a) => ((a % N) + N) % N, slotY = (k) => (k - (N - 1) / 2) * GAP + LIFT / 2, restY = (k) => slotY(k) - (k === 0 ? LIFT : 0);
    const glide = (t) => { t = clamp(t); return t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2; };
    const host = document.createElement("div"); host.style.cssText = "position:absolute;left:50%;top:50%;width:0;height:0;"; el.appendChild(host);
    const discs = faces.map(f => { const d = document.createElement("div"); d.style.cssText = `position:absolute;left:${-S / 2}px;top:${-S / 2}px;width:${S}px;height:${S}px;transform-style:preserve-3d;`;
      const c = (x) => `position:absolute;inset:0;border-radius:50%;background:${surf};border:1px solid ${ring};box-sizing:border-box;${x}`;
      const back = document.createElement("div"); back.style.cssText = c(`transform:translateZ(-${TH}px);`); const top = document.createElement("div"); top.style.cssText = c("overflow:hidden;");
      const ins = S * 0.035, face = document.createElement("div"); face.style.cssText = `position:absolute;left:${ins}px;top:${ins}px;right:${ins}px;bottom:${ins}px;border-radius:50%;border:1px solid ${ring};box-sizing:border-box;background:${/^(#|rgb|hsl|oklch|linear-gradient|radial-gradient|conic-gradient)/.test(f) ? f : `center/cover url("${f}")`};`;
      top.appendChild(face); d.append(back, top); host.appendChild(d); return d; });
    const per = TD + hold;
    return loopFx(t => {
      const k = Math.floor(t / per), p = (t - k * per) / TD; host.style.transform = `scale(${1 + 0.02 * Math.sin(t * 1.2)})`;
      discs.forEach((d, i) => { const to = mod(i - k), from = mod(i - (k - 1)); let y = restY(to), op = 1, z = N - to;
        if (k === 0) { const q = (t - 0.1 - (N - 1 - to) * 0.18) / 0.55; y = lerp(restY(to) - S * 1.2, restY(to), EZ.back(clamp(q))); op = oCubic(clamp(q / 0.35)); }
        else if (p < 1) { if (from === 0) { if (p < 0.5) { const q = EZ.in(p / 0.5); y = lerp(restY(0), restY(0) - GAP * 2.2, q); op = 1 - q; z = N * 2; } else { const q = oCubic((p - 0.5) / 0.5); y = lerp(slotY(N - 1) + GAP, slotY(N - 1), q); op = q; } }
          else y = lerp(restY(from), restY(to), glide(p)); }
        d.style.zIndex = z; d.style.opacity = op; d.style.transform = `perspective(${S * 3}px) translateY(${y}px) rotateX(${o.tilt ?? 60}deg)`; });
    });
  }

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
  // Expanding shock ring from a point (Product Video)
  function shock(stage, x, y, o = {}) {
    rel(stage); const r0 = o.from ?? 10, r1 = o.to ?? 300, d = o.duration ?? 0.7, w = o.width ?? 3, col = o.color || "#fff", ring = document.createElement("div");
    ring.style.cssText = "position:absolute;border-radius:50%;pointer-events:none;z-index:25;"; stage.appendChild(ring);
    return play(d, t => { const a = t / d, r = lerp(r0, r1, oExpo(a)); Object.assign(ring.style, { left: x - r + "px", top: y - r + "px", width: r * 2 + "px", height: r * 2 + "px", border: `${(w * (1 - a) + 0.5).toFixed(2)}px solid ${col}`, opacity: 1 - a, boxShadow: `0 0 24px rgba(255,255,255,${(0.5 * (1 - a)).toFixed(2)})` }); }).then(() => ring.remove());
  }
  // Spectrum ring: a soft arc of colour travels around the border over a faint base line, with a restrained glow (Product Video)
  const arcG = (d, h, arc) => { const span = 360 * arc, n = h.length, st = h.map((c, i) => `${c} ${((span * (i + 1)) / (n + 1)).toFixed(1)}deg`).join(", "); return `conic-gradient(from ${d.toFixed(1)}deg, transparent 0deg, ${st}, transparent ${span.toFixed(1)}deg, transparent 360deg)`; };
  function spectrumRing(el, o = {}) {
    rel(el); const r = o.radius ?? (parseFloat(getComputedStyle(el).borderRadius) || 24), pad = o.width ?? 1.5, glow = o.glow ?? 0.45, spd = o.speed ?? 45, hues = o.hues || ["#a78bfa", "#60a5fa", "#34d399"], arc = o.arc ?? 0.55, base = o.base || "rgba(242,242,244,0.14)";
    const g = document.createElement("div"), b = document.createElement("div");
    g.style.cssText = `position:absolute;inset:-4px;border-radius:${r + 4}px;filter:blur(18px);opacity:${glow};pointer-events:none;z-index:-1;`;
    b.style.cssText = `position:absolute;inset:${-pad}px;border-radius:${r + pad}px;pointer-events:none;z-index:-1;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:${pad}px;`;
    if (getComputedStyle(el).zIndex === "auto") el.style.zIndex = 0; el.style.isolation = "isolate"; el.prepend(g, b);
    const stop = loopFx(t => { const c = arcG(t * spd, hues, arc); g.style.background = c; b.style.background = `${c}, linear-gradient(${base}, ${base})`; });
    return () => { stop(); g.remove(); b.remove(); };
  }
  // A crisp diagonal glint sweeps across the element once: a soft band with a bright core (Product Video)
  function shine(el, o = {}) {
    rel(el); const d = o.duration ?? 0.75, col = o.color || "rgba(255,255,255,0.95)", wrap = document.createElement("div"), bar = document.createElement("div");
    wrap.style.cssText = "position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;z-index:5;";
    bar.style.cssText = `position:absolute;top:-50%;bottom:-50%;width:${o.size || "34%"};transform:skewX(-20deg);background:linear-gradient(90deg, transparent 0%, ${withA(col, 0.28)} 32%, ${col} 50%, ${withA(col, 0.28)} 68%, transparent 100%);`; wrap.appendChild(bar); el.appendChild(wrap);
    return play(d, t => (bar.style.left = lerp(-45, 125, EZ.inOut(t / d)).toFixed(1) + "%")).then(() => wrap.remove());
  }
  // Three bouncing dots: the assistant is typing (Product Video)
  function typingDots(el, o = {}) {
    el.textContent = ""; el.style.display = "inline-flex"; el.style.gap = (o.gap ?? 8) + "px"; const sz = o.size ?? 10;
    const ds = [0, 1, 2].map(() => { const d = document.createElement("span"); d.style.cssText = `width:${sz}px;height:${sz}px;border-radius:50%;background:${o.color || "currentColor"};display:block;`; el.appendChild(d); return d; });
    return loopFx(t => ds.forEach((d, i) => (d.style.transform = `translateY(${(-Math.max(0, Math.sin(t * 9 - i * 0.9)) * sz * 0.8).toFixed(1)}px)`)));
  }

  // Bracket cursor: a spinning reticle that springs open around any [data-magnetic] element under the pointer (Clause Legal)
  function bracketCursor(root, o = {}) {
    root = root || document.body; rel(root); const IDLE = o.idle ?? 44, PAD = o.pad ?? 5, PRESS = o.press ?? 0.9, PULL = o.pull ?? 0.08, SPIN = o.spin ?? 90, col = o.color || "#fff", sel = o.selector || "[data-magnetic]";
    const sp = (v, k = 500, c = 40) => ({ v, t: v, vel: 0, k, c }), s = { x: sp(0), y: sp(0), w: sp(IDLE), h: sp(IDLE), scale: sp(1, 600, 30), rot: sp(0, 300, 30) };
    const step = (q, dt) => { const f = -q.k * (q.v - q.t) - q.c * q.vel; q.vel += f * dt; q.v += q.vel * dt; };
    const f = document.createElement("div"), d = document.createElement("div"); f.setAttribute("aria-hidden", "true"); d.setAttribute("aria-hidden", "true");
    f.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;z-index:9999;opacity:0;transition:opacity .2s;transform-origin:0 0;";
    [["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].forEach(([v, h]) => { const c = document.createElement("span"); c.style.cssText = `position:absolute;${v}:0;${h}:0;width:8px;height:8px;border-${v}:2px solid ${col};border-${h}:2px solid ${col};`; f.appendChild(c); });
    d.style.cssText = `position:absolute;top:0;left:0;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:${col};pointer-events:none;z-index:9999;opacity:0;transition:opacity .2s;`; root.append(f, d);
    let px = 0, py = 0, target = null, pressed = false, seen = false, angle = 0, last = now();
    const show = (on) => { f.style.opacity = d.style.opacity = on ? 1 : 0; }, local = (e) => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const mv = (e) => { [px, py] = local(e); if (!seen) { seen = true; s.x.v = px - IDLE / 2; s.y.v = py - IDLE / 2; show(true); } const el = e.target.closest && e.target.closest(sel); if (el !== target) { if (!el && target) angle = s.rot.v; target = el; } };
    const lv = () => { show(false); seen = false; target = null; }, dn = () => (pressed = true), up = () => (pressed = false);
    root.addEventListener("pointermove", mv); root.addEventListener("pointerleave", lv); root.addEventListener("pointerdown", dn); addEventListener("pointerup", up);
    if (o.hideCursor !== false) root.style.cursor = "none";
    const stop = loopFx(() => {
      const tn = now(), dt = Math.min(tn - last, 1 / 30); last = tn;
      if (target && target.isConnected) { const a = target.getBoundingClientRect(), b = root.getBoundingClientRect(), l = a.left - b.left, tp = a.top - b.top;
        s.x.t = l - PAD + (px - (l + a.width / 2)) * PULL; s.y.t = tp - PAD + (py - (tp + a.height / 2)) * PULL; s.w.t = a.width + PAD * 2; s.h.t = a.height + PAD * 2; s.rot.t = Math.round(s.rot.v / 180) * 180; }
      else { s.x.t = px - IDLE / 2; s.y.t = py - IDLE / 2; s.w.t = IDLE; s.h.t = IDLE; if (!reduced) angle += SPIN * dt; s.rot.t = s.rot.v = angle; s.rot.vel = 0; }
      s.scale.t = pressed ? PRESS : 1; for (const k in s) if (k !== "rot" || target) step(s[k], dt);
      const w = s.w.v, h = s.h.v; f.style.width = w + "px"; f.style.height = h + "px";
      f.style.transform = `translate(${s.x.v + w / 2}px,${s.y.v + h / 2}px) rotate(${s.rot.v}deg) scale(${s.scale.v}) translate(${-w / 2}px,${-h / 2}px)`; d.style.transform = `translate(${px}px,${py}px) scale(${pressed ? 0.6 : 1})`;
    });
    return () => { stop(); root.removeEventListener("pointermove", mv); root.removeEventListener("pointerleave", lv); root.removeEventListener("pointerdown", dn); removeEventListener("pointerup", up); f.remove(); d.remove(); root.style.cursor = ""; };
  }

  // ── Document AI Teaser: glows, cursors, scans and light ──
  const withA = (col, a) => { a = +clamp(a).toFixed(3); const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(col || ""); if (!m) return `color-mix(in srgb, ${col} ${Math.round(a * 100)}%, transparent)`;
    let h = m[1]; if (h.length === 3) h = h.split("").map(x => x + x).join(""); const n = parseInt(h, 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const sm3 = (p) => { p = clamp(p); return p * p * (3 - 2 * p); };
  const svgEl = (tag, at) => { const n = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in at) n.setAttribute(k, at[k]); return n; };
  const splitChars = (el, block) => {
    const text = el.dataset.sfText || el.textContent.trim(); el.dataset.sfText = text; el.setAttribute("aria-label", text); el.textContent = ""; const out = [];
    text.split(" ").forEach((w, i, a) => { const ws = document.createElement("span"); ws.setAttribute("aria-hidden", "true"); ws.style.cssText = "display:inline-block;white-space:nowrap;";
      [...w].forEach(ch => { const s = document.createElement("span"); if (block) s.style.display = "inline-block"; s.textContent = ch; ws.appendChild(s); out.push(s); }); el.appendChild(ws); if (i < a.length - 1) el.appendChild(document.createTextNode(" ")); });
    return out;
  };
  // Glow sheen: a highlight band drifts through gradient-filled text under a soft bloom
  function glowText(el, o = {}) {
    const [a, b] = o.colors || [o.color || "#34d399", o.highlight || "#d1fae5"], per = o.period ?? 3.6, band = o.band ?? 9, g = o.glow ?? 16, st = el.style, prev = st.cssText;
    st.backgroundImage = `linear-gradient(100deg, ${a} 0%, ${b} 50%, ${a} 100%)`; st.backgroundSize = band + "em 100%"; st.backgroundRepeat = "repeat";
    st.setProperty("-webkit-background-clip", "text"); st.backgroundClip = "text"; st.color = "transparent"; st.setProperty("-webkit-text-fill-color", "transparent");
    if (g) st.filter = `drop-shadow(0 0 ${g}px ${withA(o.glowColor || b, o.bloom ?? 0.35)})`;
    const stop = loopFx(t => (st.backgroundPosition = `${(-(t / per) * band / 2).toFixed(3)}em 0`));
    return () => { stop(); st.cssText = prev; };
  }
  // Neon type: letters type on behind a caret and flicker like a tube catching before they hold
  function neonType(el, o = {}) {
    const ch = splitChars(el, false), N = ch.length, cps = o.cps ?? 26, gl = o.glow ?? 18, gc = o.glowColor || "#34d399", hold = o.hold ?? 1.2, dl = o.delay || 0, T = N / cps, useCaret = o.caret !== false && N > 0;
    ch.forEach(s => (s.style.opacity = 0));
    const caret = document.createElement("span"); caret.setAttribute("aria-hidden", "true");
    caret.style.cssText = `display:inline-block;width:0.06em;height:0.9em;margin-left:0.04em;vertical-align:-0.08em;background:${o.caretColor || gc};`;
    return play(dl + T + hold + 0.3, t => {
      const u = t - dl, n = Math.floor(clamp(u * cps, 0, N)), fr = Math.floor(t * 20);
      ch.forEach((s, i) => { if (i >= n) { s.style.opacity = 0; return; } const k = u - i / cps < 0.35 ? (rnd(i, fr) < 0.5 ? 0.25 : 1) : 1;
        s.style.opacity = k; s.style.textShadow = gl ? `0 0 ${(gl * k).toFixed(1)}px ${withA(gc, 0.45 * k)}` : ""; });
      if (!useCaret) return;
      if (n < N) { if (caret.nextSibling !== ch[n]) ch[n].parentNode.insertBefore(caret, ch[n]); caret.style.opacity = 1; }
      else { const last = ch[N - 1], a = u - T; if (last.nextSibling !== caret) last.parentNode.appendChild(caret); caret.style.opacity = a > hold ? clamp(1 - (a - hold) / 0.3) : Math.floor(a * 2.4) % 2 === 0 ? 1 : 0; }
    }).then(() => caret.remove());
  }
  // Focus pull: a line racks into focus out of a blur, or its letters drift in one by one
  function focusPull(el, o = {}) {
    const out = !!o.out, dl = o.delay || 0;
    if (o.by === "char") {
      const sp = el._sfChars && el._sfChars[0] && el.contains(el._sfChars[0]) ? el._sfChars : (el._sfChars = splitChars(el, true)), n = sp.length, spread = o.spread ?? 0.3, d = o.duration ?? 0.5, px = o.blur ?? 12;
      el.style.opacity = 1; el.style.filter = "none"; el.style.transform = "";
      return play(dl + spread + d, t => sp.forEach((s, j) => { const k = E3.sine((t - dl - (j / Math.max(1, n - 1)) * spread) / d), f = out ? 1 - k : k;
        s.style.opacity = f.toFixed(3); s.style.filter = f > 0.995 ? "none" : `blur(${((1 - f) * px).toFixed(2)}px)`; }));
    }
    if (el._sfChars) el._sfChars.forEach(s => { s.style.opacity = 1; s.style.filter = "none"; });
    const d = o.duration ?? (out ? 0.55 : 0.7), px = o.blur ?? (out ? 18 : 24), s0 = o.scale ?? 1.06;
    return play(dl + d, t => { const p = clamp((t - dl) / d), k = out ? EZ.inOut(p) : oCubic(p), f = out ? 1 - k : k;
      el.style.opacity = f.toFixed(3); el.style.filter = f > 0.995 ? "none" : `blur(${((out ? k : 1 - k) * px).toFixed(2)}px)`; el.style.transform = `scale(${(out ? 1 - 0.03 * k : lerp(s0, 1, k)).toFixed(4)})`; });
  }
  // Track in: a tagline arrives wide and soft, then tightens its letter spacing as it sharpens
  function trackIn(el, o = {}) {
    const from = o.from ?? 0.32, to = o.to ?? 0.02, d = o.duration ?? 0.8, dl = o.delay || 0, px = o.blur ?? 4;
    if (o.by === "char") { const ch = el._sfChars && el._sfChars[0] && el.contains(el._sfChars[0]) ? el._sfChars : (el._sfChars = splitChars(el, true)), st = o.stagger ?? 0.11, dd = o.duration ?? 1.1, rs = o.rise ?? 0.22, bl = o.blur ?? 14, span = dd + ch.length * st;
      el.style.opacity = 1; el.style.filter = "none";
      return play(dl + span, t => { el.style.letterSpacing = lerp(from, to, q4((t - dl) / (span * 1.6))).toFixed(4) + "em"; ch.forEach((s, i) => { const k = EZ.inOut(clamp((t - dl - i * st) / dd));
        s.style.opacity = k.toFixed(3); s.style.filter = k > 0.995 ? "none" : `blur(${((1 - k) * bl).toFixed(2)}px)`; s.style.transform = `translateY(${((1 - k) * rs).toFixed(3)}em)`; }); }); }
    return play(dl + d, t => { const k = q4((t - dl) / d); el.style.letterSpacing = lerp(from, to, k).toFixed(4) + "em"; el.style.opacity = k.toFixed(3); el.style.filter = k > 0.995 ? "none" : `blur(${((1 - k) * px).toFixed(2)}px)`; });
  }
  // Click cursor: a pointer arcs onto a target, squashes on the press and throws three sparks, a ripple and a flash
  function clickCursor(stage, target, o = {}) {
    rel(stage); const sr = stage.getBoundingClientRect(), col = o.color || "#34d399", ink = o.ink || "#f6f4ef", sz = o.size ?? 28, s = sz / 50, d = o.duration ?? 0.7, isEl = !!(target && target.getBoundingClientRect);
    let x1 = target.x, y1 = target.y; if (isEl) { const r = target.getBoundingClientRect(), at = o.at || [0.55, 0.56]; x1 = r.left - sr.left + r.width * at[0]; y1 = r.top - sr.top + r.height * at[1]; }
    const x0 = o.from ? o.from.x : x1 + sz * 5.4, y0 = o.from ? o.from.y : y1 + sz * 4.3;
    const svg = svgEl("svg", { viewBox: "-40 -40 120 120", "aria-hidden": "true" }); svg.style.cssText = `position:absolute;left:0;top:0;width:${120 * s}px;height:${120 * s}px;overflow:visible;pointer-events:none;z-index:30;opacity:0;`;
    const lines = [0, 1, 2].map(() => svg.appendChild(svgEl("line", { stroke: col, "stroke-width": 4.5, "stroke-linecap": "round", opacity: 0 })));
    const ring = svg.appendChild(svgEl("circle", { fill: "none", stroke: col, opacity: 0 })), dot = svg.appendChild(svgEl("circle", { fill: col, opacity: 0 }));
    const g = svg.appendChild(svgEl("g", {})), path = g.appendChild(svgEl("path", { d: "M0,0 L50,24 L27,31 L15,54 Z", "stroke-width": 7, "stroke-linejoin": "round" }));
    stage.appendChild(svg);
    if (o.label) { const tg = svg.appendChild(svgEl("g", { transform: "translate(40 52)" })), rc = tg.appendChild(svgEl("rect", { rx: 13, height: 30, fill: o.labelColor || col })), tx = tg.appendChild(svgEl("text", { x: 12, y: 21, fill: o.labelInk || "#fff", "font-size": 18, "font-weight": 700 })); tx.style.fontFamily = "inherit"; tx.textContent = o.label; rc.setAttribute("width", (tx.getComputedTextLength() || o.label.length * 10) + 24); }
    const tc = d + 0.08, stay = !!o.stay, linger = o.linger ?? 0.5, pressT = isEl && o.press !== false, tf0 = pressT ? target.style.transform : ""; let fired = false;
    return play(tc + 0.6 + (stay ? 0 : linger + 0.4), t => {
      const mv = EZ.inOut(clamp(t / d)), arc = Math.sin(mv * Math.PI), cx = lerp(x0, x1, mv) + arc * 40 * s, cy = lerp(y0, y1, mv) + arc * 30 * s, dt = t - tc;
      const press = oCubic(clamp((dt + 0.12) / 0.12)) * (dt > 0 ? Math.exp(-dt * 9) * Math.cos(dt * 22) : 1);
      if (dt >= 0 && !fired) { fired = true; o.onClick && o.onClick(); }
      svg.style.opacity = (oCubic(clamp(t / (d * 0.75))) * (stay ? 1 : 1 - EZ.in(clamp((dt - 0.6 - linger) / 0.4)))).toFixed(3);
      svg.style.transform = `translate(${(cx - 40 * s).toFixed(1)}px,${(cy - 40 * s).toFixed(1)}px)`;
      g.setAttribute("transform", `translate(${(3 * press).toFixed(2)} ${(3 * press).toFixed(2)}) rotate(${(-6 * press).toFixed(2)}) scale(${(1 - 0.18 * press).toFixed(4)})`);
      g.style.filter = `drop-shadow(0 ${(6 - 4 * press).toFixed(1)}px ${(14 - 8 * press).toFixed(1)}px rgba(0,0,0,0.55))`;
      const fl = dt > 0 ? Math.exp(-dt * 6) * 0.6 : 0, fc = fl > 0.02 ? `color-mix(in srgb, ${col} ${Math.round(fl * 100)}%, ${ink})` : ink; path.style.fill = fc; path.style.stroke = fc;
      const b = clamp(dt / 0.45), bE = oCubic(b), r0 = lerp(12, 20, bE), r1 = lerp(16, 34, bE);
      lines.forEach((l, i) => { const a = ([-78, -128, -176][i] * Math.PI) / 180; l.setAttribute("x1", (Math.cos(a) * r0).toFixed(2)); l.setAttribute("y1", (Math.sin(a) * r0).toFixed(2)); l.setAttribute("x2", (Math.cos(a) * r1).toFixed(2)); l.setAttribute("y2", (Math.sin(a) * r1).toFixed(2)); l.setAttribute("opacity", b > 0 && b < 1 ? (1 - EZ.in(b)).toFixed(3) : 0); });
      const rp = clamp(dt / 0.6), rE = oCubic(rp), on = rp > 0 && rp < 1;
      ring.setAttribute("r", lerp(4, 44, rE).toFixed(2)); ring.setAttribute("stroke-width", lerp(3, 0.8, rE).toFixed(2)); ring.setAttribute("opacity", on ? (0.9 * (1 - rp)).toFixed(3) : 0);
      dot.setAttribute("r", lerp(2, 16, rE).toFixed(2)); dot.setAttribute("opacity", on ? (0.35 * (1 - rp)).toFixed(3) : 0);
      if (pressT) target.style.transform = (tf0 ? tf0 + " " : "") + `scale(${(1 - 0.03 * Math.exp(-Math.pow(dt / 0.08, 2))).toFixed(4)})`;
    }).then(() => { if (pressT) target.style.transform = tf0; if (!stay) svg.remove(); return svg; });
  }
  // Scan beam: a glowing scanline sweeps the element and lights each [data-scan] item as it crosses
  function scanBeam(el, o = {}) {
    rel(el); const col = o.color || "#34d399", d = o.duration ?? 0.9, dl = o.delay || 0, hold = o.hold ?? 0.5, keep = !!o.keep, trail = o.trail ?? 36, up = o.direction === "up", H = el.clientHeight, er = el.getBoundingClientRect(), bx = el.clientLeft, by = el.clientTop, pad = o.pad ?? 4;
    const ov = document.createElement("div"); ov.setAttribute("aria-hidden", "true"); ov.style.cssText = "position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;z-index:6;";
    const hits = [...el.querySelectorAll(o.targets || "[data-scan]")].map(n => { const r = n.getBoundingClientRect(), b = document.createElement("div"), c = (r.top - er.top - by + r.height / 2) / H;
      b.style.cssText = `position:absolute;left:${r.left - er.left - bx - pad}px;top:${r.top - er.top - by - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px;border-radius:${o.radius ?? 6}px;opacity:0;background:${withA(col, 0.16)};box-shadow:inset 0 0 0 1px ${withA(col, 0.75)},0 0 16px ${withA(col, 0.22)};`;
      ov.appendChild(b); return { n, b, at: up ? 1 - c : c, tf: -1 }; });
    const beam = document.createElement("div"); beam.style.cssText = `position:absolute;left:0;right:0;top:0;height:${trail}px;opacity:0;background:linear-gradient(${up ? "to top" : "to bottom"}, ${withA(col, 0)}, ${withA(col, 0.12)} 60%, ${withA(col, 0.24)});`;
    beam.innerHTML = `<div style="position:absolute;left:0;right:0;${up ? "top" : "bottom"}:-1px;height:2px;background:${col};box-shadow:0 0 12px 1px ${withA(col, 0.9)}"></div>`;
    ov.appendChild(beam); el.appendChild(ov);
    return play(dl + d + hold + 0.5, t => {
      const u = clamp((t - dl) / d), pos = E3.sine(u), y = (up ? 1 - pos : pos) * H;
      beam.style.opacity = t < dl ? 0 : Math.min(1, u * 8, (1 - u) * 8).toFixed(3); beam.style.transform = `translateY(${(up ? y : y - trail).toFixed(1)}px)`;
      hits.forEach((h, i) => { if (h.tf < 0 && t >= dl && pos >= h.at) { h.tf = t; o.onHit && o.onHit(h.n, i); }
        const a = t - h.tf, lit = h.tf < 0 ? 0 : q4(a / 0.13) - 0.6 * q4((a - 0.3) / 0.35), end = keep ? 1 : 1 - EZ.inOut(clamp((t - dl - d - hold) / 0.5)); h.b.style.opacity = (lit * end).toFixed(3); });
    }).then(() => { if (!keep) ov.remove(); return ov; });
  }
  // Wire draw: a cubic connector draws between two elements with a bright head riding its tip
  const SIDE_OPP = { left: "right", right: "left", top: "bottom", bottom: "top" };
  const anchorOf = (n, sr, side) => { if (!n.getBoundingClientRect) return [n.x, n.y]; const r = n.getBoundingClientRect(), x = r.left - sr.left, y = r.top - sr.top;
    return side === "left" ? [x, y + r.height / 2] : side === "right" ? [x + r.width, y + r.height / 2] : side === "top" ? [x + r.width / 2, y] : side === "bottom" ? [x + r.width / 2, y + r.height] : [x + r.width / 2, y + r.height / 2]; };
  function wire(stage, from, to, o = {}) {
    rel(stage); const sr = stage.getBoundingClientRect(), col = o.color || "#34d399", d = o.duration ?? 0.6, dl = o.delay || 0, w = o.width ?? 2, bend = o.bend ?? 0.55;
    let svg = stage._sfWire; if (!svg || !svg.isConnected) { svg = stage._sfWire = svgEl("svg", { "aria-hidden": "true" }); svg.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:4;"; stage.appendChild(svg); }
    const a = anchorOf(from, sr), b = anchorOf(to, sr), hz = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
    const fs = o.fromSide || (hz ? (b[0] > a[0] ? "right" : "left") : b[1] > a[1] ? "bottom" : "top"), [x0, y0] = anchorOf(from, sr, fs), [x1, y1] = anchorOf(to, sr, o.toSide || SIDE_OPP[fs]);
    const dd = hz ? `M${x0},${y0} C${x0 + (x1 - x0) * bend},${y0} ${x1 - (x1 - x0) * bend},${y1} ${x1},${y1}` : `M${x0},${y0} C${x0},${y0 + (y1 - y0) * bend} ${x1},${y1 - (y1 - y0) * bend} ${x1},${y1}`;
    const p = svg.appendChild(svgEl("path", { d: dd, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1, opacity: 0 }));
    if (o.glow !== false) p.style.filter = `drop-shadow(0 0 ${w * 2}px ${withA(col, 0.7)})`;
    const head = o.head === false ? null : svg.appendChild(svgEl("circle", { r: w * 2, fill: o.headColor || "#fff", opacity: 0 })); if (head) head.style.filter = `drop-shadow(0 0 ${w * 3}px ${col})`;
    const L = p.getTotalLength();
    return play(dl + d + 0.35, t => { const e = EZ.inOut(clamp((t - dl) / d)); p.setAttribute("opacity", t < dl ? 0 : 1); p.setAttribute("stroke-dashoffset", (1 - e).toFixed(4));
      if (head) { const pt = p.getPointAtLength(L * e); head.setAttribute("cx", pt.x.toFixed(1)); head.setAttribute("cy", pt.y.toFixed(1)); head.setAttribute("opacity", t < dl ? 0 : e < 1 ? 1 : clamp(1 - (t - dl - d) / 0.35).toFixed(3)); } })
      .then(() => { if (head) head.remove(); return p; });
  }
  // Impact glow: a halo behind an element breathes, and swells and flares each time hit() is called
  function glowHub(el, o = {}) {
    const par = el.parentNode; rel(par); rel(el); const col = o.color || "#34d399", sz = o.size ?? 2.3, base = o.base ?? 0.6, brA = o.breathe ?? 0.5, t0 = now();
    const h = document.createElement("div"); h.setAttribute("aria-hidden", "true");
    h.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side, ${withA(col, 0.75)} 0%, ${withA(col, 0.3)} 40%, ${withA(col, 0.08)} 62%, ${withA(col, 0)} 78%);`;
    par.insertBefore(h, el); const bs = el.style.boxShadow, tf = el.style.transform; let hits = [];
    const stopL = loopFx(() => { const t = now() - t0, w = el.offsetWidth, hh = el.offsetHeight, D = Math.max(w, hh) * sz;
      const k = hits.reduce((m, [ht, s]) => (t >= ht ? Math.max(m, s * Math.exp(-(t - ht) * 6)) : m), 0), br = brA * (0.5 + 0.5 * Math.sin(t * 1.6));
      h.style.width = h.style.height = D + "px"; h.style.left = el.offsetLeft + w / 2 - D / 2 + "px"; h.style.top = el.offsetTop + hh / 2 - D / 2 + "px";
      h.style.opacity = Math.min(1, base + 0.15 * br + 0.6 * k).toFixed(3); h.style.transform = `scale(${(1 + 0.05 * br + 0.26 * k).toFixed(4)})`;
      if (o.ring !== false) el.style.boxShadow = `inset 0 0 0 ${(1.5 + 1.5 * k).toFixed(2)}px ${withA(col, 0.55 + 0.45 * k)}, 0 0 ${(18 + 46 * k).toFixed(1)}px ${withA(col, 0.25 + 0.5 * k)}` + (bs ? ", " + bs : "");
      if (o.pulse !== false) el.style.transform = (tf ? tf + " " : "") + `scale(${(1 + 0.08 * k).toFixed(4)})`; });
    const stop = () => { stopL(); h.remove(); el.style.boxShadow = bs; el.style.transform = tf; };
    stop.hit = (s = 1) => { hits.push([now() - t0, s]); if (hits.length > 8) hits = hits.slice(-8); }; return stop;
  }
  // Border comet: a glowing head with a fading tail races around a rounded border
  function traceBorder(el, o = {}) {
    rel(el); const col = o.color || "#34d399", len = o.length ?? 0.3, spd = o.speed ?? 0.3, w = o.width ?? 2, r = o.radius ?? (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0);
    const svg = svgEl("svg", { "aria-hidden": "true" }); svg.style.cssText = `position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:3;opacity:0;filter:drop-shadow(0 0 ${o.glow ?? 6}px ${withA(col, 0.75)});`;
    // A smooth tail: N short butt-capped segments end to end, fading from the round-capped head
    const N = o.tail === false ? 1 : 20, L = len / N, ov = 0.0015, hues = o.hues, segCol = (i) => (hues && hues.length ? hues[Math.min(hues.length - 1, Math.floor((i / N) * hues.length))] : col);
    const segs = Array.from({ length: N }, (_, i) => svg.appendChild(svgEl("rect", { x: 0, y: 0, width: "100%", height: "100%", rx: r, fill: "none", stroke: segCol(i), "stroke-width": w, "stroke-linecap": i === 0 ? "round" : "butt", pathLength: 1, "stroke-dasharray": `${L + ov} ${1 - L - ov}`, opacity: (N === 1 ? 1 : Math.pow(1 - i / N, 1.8)).toFixed(3) })));
    el.appendChild(svg);
    const stop = loopFx(t => { const hd = (t * spd) % 1; segs.forEach((q, i) => q.setAttribute("stroke-dashoffset", (L + ov - (hd - i * L)).toFixed(4))); svg.style.opacity = clamp(t / 0.5).toFixed(3); });
    return () => { stop(); svg.remove(); };
  }
  // Pick focus: every option pulses once, then the chosen one lights up while the rest dim back
  function pickFocus(items, index, o = {}) {
    items = [...items]; const col = o.color || "#34d399", dim = o.dim ?? 0.72, d = o.duration ?? 0.5, pulse = o.pulse !== false && index >= 0, T0 = pulse ? 0.5 : 0;
    items.forEach(n => { if (!n._sfPick) n._sfPick = { bs: n.style.boxShadow, bi: n.style.backgroundImage, f: 0 }; });
    const from = items.map(n => n._sfPick.f), to = items.map((_, i) => (index < 0 ? 0 : i === index ? 1 : -1));
    return play(T0 + d, t => { const pu = pulse ? Math.exp(-Math.pow((t - 0.2) / 0.11, 2)) : 0, k = EZ.inOut(clamp((t - T0) / d));
      items.forEach((n, i) => { const S = n._sfPick, f = lerp(from[i], to[i], k), on = Math.max(0, f), off = Math.max(0, -f), ring = Math.max(pu, on), gw = Math.max(on, pu * 0.6); S.f = f;
        n.style.boxShadow = `inset 0 0 0 1.5px ${withA(col, 0.9 * ring)}, 0 0 ${(40 * gw).toFixed(1)}px ${withA(col, 0.35 * gw)}` + (S.bs ? ", " + S.bs : "");
        n.style.opacity = (1 - dim * off).toFixed(3);
        n.style.backgroundImage = on > 0.002 ? `linear-gradient(${withA(col, 0.14 * on)}, ${withA(col, 0.14 * on)})` + (S.bi ? ", " + S.bi : "") : S.bi; }); });
  }
  // Lock click: a ring draws, a padlock drops in and its shackle snaps shut; with tick, it then folds into a check
  function lockClick(el, o = {}) {
    const S = o.size ?? 120, col = o.color || "#34d399", ink = o.ink || "#f6f4ef", bg = o.background || "#0b0b0e", tick = !!o.tick, dl = o.delay || 0;
    el.innerHTML = `<svg viewBox="0 0 200 200" width="${S}" height="${S}" style="display:block;overflow:visible" aria-hidden="true"><circle cx="100" cy="100" r="88" fill="none" stroke-width="4" stroke-linecap="round" pathLength="1" transform="rotate(-90 100 100)"/><circle cx="100" cy="100" r="62" fill="${col}" opacity="0"/><g opacity="0"><path fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round"/><path fill="${ink}" fill-rule="evenodd" d="M76,92H124A12,12 0 0 1 136,104V136A12,12 0 0 1 124,148H76A12,12 0 0 1 64,136V104A12,12 0 0 1 76,92ZM92,116a8,8 0 1 0 16,0a8,8 0 1 0 -16,0Z"/></g><path d="M73,101 L92,120 L128,83" fill="none" stroke="${bg}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity="0"/></svg>`;
    el.setAttribute("role", "img"); el.setAttribute("aria-label", o.label || (tick ? "Secured" : "Locked"));
    const [ring, disc, g, tk] = el.firstChild.children, shackle = g.firstChild;
    return play(dl + (tick ? 2.6 : 1.45), t => { const u = t - dl;
      const rd = io4((u - 0.1) / 0.77), lin = q4((u - 0.25) / 0.42), cl = io4((u - 0.7) / 0.28), pr = q4((u - 0.97) / 0.13) - q4((u - 1.1) / 0.21);
      const k = tick ? u - 1.6 : -1, gone = EZ.in(clamp(k / 0.3)), dsc = tick && k > 0.08 ? oBack(clamp((k - 0.08) / 0.42)) : 0, dr = tick ? oCubic(clamp((k - 0.3) / 0.35)) : 0;
      ring.setAttribute("stroke-dasharray", `${rd.toFixed(4)} 2`); ring.setAttribute("opacity", rd > 0 ? 1 : 0); ring.style.stroke = gone > 0 ? `color-mix(in srgb, ${col} ${Math.round(gone * 100)}%, ${ink})` : ink;
      disc.setAttribute("opacity", dsc > 0 ? 1 : 0); disc.setAttribute("transform", `translate(100 100) scale(${Math.max(0, dsc).toFixed(4)}) translate(-100 -100)`);
      g.setAttribute("opacity", (lin * (1 - gone)).toFixed(3));
      g.setAttribute("transform", `translate(0 ${lerp(-40, 0, lin).toFixed(2)}) translate(100 100) scale(${(1 - 0.5 * gone).toFixed(4)}) translate(-100 -100) translate(100 148) scale(${(1 - 0.04 * pr).toFixed(4)} ${(1 - 0.07 * pr).toFixed(4)}) translate(-100 -148)`);
      shackle.setAttribute("d", `M80,92 V72 A20,20 0 0 1 120,72 V${lerp(80, 92, cl).toFixed(2)}`); shackle.setAttribute("transform", `translate(0 ${lerp(-16, 0, cl).toFixed(2)})`);
      tk.setAttribute("stroke-dashoffset", (1 - dr).toFixed(4)); tk.setAttribute("opacity", dr > 0 ? 1 : 0); });
  }
  // Push through: the scene accelerates toward one point while it blurs and fades; reverse arrives from it
  function pushThrough(el, o = {}) {
    const d = o.duration ?? 0.85, s1 = o.scale ?? 2.4, px = o.blur ?? 16, rv = !!o.reverse, dl = o.delay || 0;
    if (o.origin && o.origin.getBoundingClientRect) { const a = el.getBoundingClientRect(), b = o.origin.getBoundingClientRect(), sx = a.width / el.offsetWidth || 1; el.style.transformOrigin = `${(b.left - a.left + b.width / 2) / sx}px ${(b.top - a.top + b.height / 2) / sx}px`; }
    else if (o.origin) el.style.transformOrigin = `${o.origin[0] * 100}% ${o.origin[1] * 100}%`;
    return play(dl + d, t => { const p = clamp((t - dl) / d), k = rv ? 1 - oCubic(p) : EZ.in(p);
      el.style.transform = `scale(${(1 + (s1 - 1) * k).toFixed(4)})`; el.style.filter = k < 0.005 ? "none" : `blur(${(px * k).toFixed(2)}px)`; el.style.opacity = (1 - k).toFixed(3); });
  }

  // ── Motion Tryouts: text ──
  const splitWords = (el) => { const text = el.dataset.sfText || el.textContent.trim(); el.dataset.sfText = text; el.setAttribute("aria-label", text); el.textContent = "";
    el.style.display = "flex"; el.style.flexWrap = "wrap"; el.style.columnGap = el.style.columnGap || "0.26em";
    return text.split(/\s+/).map(w => { const s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.style.cssText = "display:inline-block;white-space:pre;"; s.textContent = w; el.appendChild(s); return s; }); };
  const fsOf = (el) => parseFloat(getComputedStyle(el).fontSize) || 16;
  const wrapIn = (el, key) => { if (el[key] && el.contains(el[key])) return el[key]; const s = document.createElement("span"); s.style.cssText = "display:inline-block;position:relative;"; while (el.firstChild) s.appendChild(el.firstChild); el.appendChild(s); return (el[key] = s); };
  const blurPx = (p, b) => (p > 0.995 ? "none" : `blur(${((1 - p) * b).toFixed(2)}px)`);
  // Glyph write: characters resolve left to right behind a short front of scrambled glyphs (Bllind)
  function glyphWrite(el, o = {}) {
    const text = el.dataset.sfText || el.textContent; el.dataset.sfText = text; el.setAttribute("aria-label", text); el.style.whiteSpace = "pre";
    const G = o.glyphs || "!?_]^[#%&*/<>+=", n = text.length, fr = o.front ?? 3, d = o.duration ?? Math.max(0.4, n * 0.04), dl = o.delay || 0;
    return play(dl + d, t => { const p = clamp((t - dl) / d), done = Math.floor(p * (n + fr)); let s = "";
      for (let k = 0; k < n; k++) { const ch = text[k]; s += ch === " " || k < done - fr ? ch : k < done ? G[(Math.floor(t * 24) * 7 + k * 13) % G.length] : "\u00a0"; }
      el.textContent = p >= 1 ? text : s; });
  }
  // Slam in: a line flies in from off-frame (or down from a giant zoom) out of a blur, then keeps drifting (Echoform, Kinetik, Bllind, Gridd)
  function slamIn(el, o = {}) {
    const from = o.from || "left", d = o.duration ?? 0.55, dl = o.delay || 0, dist = o.distance ?? 1100, dr = o.drift ?? (from === "up" || from === "down" || from === "zoom" ? 0 : 30), bl = o.blur ?? 10, z0 = o.scale ?? 15, sg = from === "right" ? -1 : 1;
    el.style.willChange = "transform, filter";
    return loopFx(t => { const p = oExpo(clamp((t - dl) / d)), q = 1 - p, dv = Math.max(0, t - dl) * dr * sg;
      el.style.transform = from === "zoom" ? `scale(${lerp(z0, 1, p).toFixed(4)})` : `translate(${((from === "left" ? -q : from === "right" ? q : 0) * dist + dv).toFixed(1)}px, ${((from === "up" ? q : from === "down" ? -q : 0) * dist).toFixed(1)}px)`;
      el.style.opacity = t < dl ? 0 : 1; el.style.filter = blurPx(p, bl); });
  }
  // Kinetic letters (Gridd Launch): orbit · arch · jumble · spread
  function kinetic(el, o = {}) {
    const mode = o.mode || "orbit", dl = o.delay || 0;
    if (mode === "spread") { const ws = splitWords(el), n = ws.length, st = o.stagger ?? 0.25, at = dl + n * st + 0.3, sp = o.spread ?? 1;
      return play(at + 0.6, t => ws.forEach((s, i) => { const p = oExpo(clamp((t - dl - i * st) / 0.4)), k = EZ.inOut(clamp((t - at) / 0.55)) * sp;
        s.style.opacity = p.toFixed(3); s.style.filter = blurPx(p, 6); s.style.transform = `translate(${(i === n - 1 ? k * 4 : -k * 0.95).toFixed(3)}em, ${((1 - p) * 0.4).toFixed(3)}em)`; })); }
    const ch = splitChars(el, true), n = ch.length, fs = fsOf(el); ch.forEach(s => (s.style.transform = ""));
    const er = el.getBoundingClientRect(), sc = er.width / (el.offsetWidth || 1) || 1, mid = er.left + er.width / 2, off = ch.map(s => { const r = s.getBoundingClientRect(); return (r.left + r.width / 2 - mid) / sc; });
    if (mode === "arch") { const D = o.duration ?? 0.5, Hh = (o.height ?? 1.35) * fs, tilt = o.tilt ?? 11;
      return play(dl + 0.6 + D, t => { const u = t - dl, a = 1 - EZ.inOut(clamp((u - 0.6) / D)); ch.forEach((s, k) => { s.style.opacity = clamp((u - k * 0.03) / 0.22).toFixed(3);
        s.style.transform = a < 0.001 ? "" : `translateY(${(-Math.sin((Math.PI * (k + 0.5)) / n) * Hh * a).toFixed(1)}px) rotate(${((k - (n - 1) / 2) * tilt * a).toFixed(1)}deg)`; }); }); }
    if (mode === "jumble") { const D = o.duration ?? 1.6, spin = o.spin ?? 70, base = [-90, 180, 90, 0, 180, -90, 0, 180];
      return play(dl + D + 0.5, t => { const u = Math.max(0, t - dl), k = 1 - EZ.inOut(clamp((u - D) / 0.5)); ch.forEach((s, i) => {
        s.style.transform = k < 0.001 ? "" : `translateX(${(off[i] * 0.4 * Math.min(u, D) * k).toFixed(1)}px) rotate(${((base[i % 8] + (i % 2 ? 1 : -1) * u * spin) * k).toFixed(1)}deg) scaleX(${i % 3 === 0 && k > 0.5 ? -1 : 1})`; }); }); }
    const R = (o.radius ?? 5.5) * fs, D = o.duration ?? 0.6;
    return play(dl + 0.3 + D, t => ch.forEach((s, i) => { const u = t - dl, q = 1 - EZ.inOut(clamp((u - 0.28) / D)), a = (i / n) * 6.2832 + 0.5 + u * 0.9 + rnd(i, 1) * 0.4, r = R * (1 + 0.25 * rnd(i, 3));
      s.style.opacity = clamp((u - i * 0.02) / 0.2).toFixed(3); s.style.transform = q < 0.001 ? "" : `translate(${((Math.cos(a) * r - off[i]) * q).toFixed(1)}px,${(Math.sin(a) * r * q).toFixed(1)}px) rotate(${(q * (rnd(i, 9) - 0.5) * 60).toFixed(1)}deg)`; }));
  }
  // Split tone: letters light from the edges in, then a two-colour split travels leftward through the line (Invois Reveal)
  function splitTone(el, o = {}) {
    const ch = splitChars(el, false), n = ch.length, [A, B] = o.colors || ["#01ffff", "#e3e8ff"], s0 = o.from ?? 1.05, s1 = o.to ?? 0.64, soft = o.soft ?? 0.03, d = o.duration ?? 0.75, dl = o.delay || 0, ig = o.ignite !== false;
    return play(dl + 0.45 + d, t => { const u = t - dl, sp = lerp(s0, s1, oCubic(clamp((u - 0.45) / d)));
      ch.forEach((s, i) => { const x = (i + 0.5) / n, k = clamp((x - sp) / soft + 0.5), at = (1 - Math.abs(x - 0.5) * 2) * 0.27 + rnd(i, 5) * 0.1;
        s.style.color = `color-mix(in srgb, ${B} ${Math.round(k * 100)}%, ${A})`; s.style.opacity = ig ? q4((u - at) / 0.2).toFixed(3) : 1; }); });
  }
  // Colour wave: letters (or words) rise out of a blur in an accent colour, then settle into the text colour (Vaulton, Invois App)
  function colorWave(el, o = {}) {
    const by = o.by || "char", B = o.to || getComputedStyle(el).color, parts = by === "word" ? splitWords(el) : splitChars(el, true), st = o.stagger ?? (by === "word" ? 0.075 : 0.03), d = o.duration ?? (by === "word" ? 0.3 : 0.55);
    const A = o.from || "#6e9bff", dl = o.delay || 0, fs = fsOf(el), rs = o.rise ?? (by === "word" ? 0.32 : 0.28), bl = o.blur ?? (by === "word" ? 0 : 12);
    return play(dl + parts.length * st + d * 2.2, t => parts.forEach((s, i) => { const a = dl + i * st, p = oExpo(clamp((t - a) / d)), k = clamp((t - a - d * 0.4) / (d * 1.6));
      s.style.opacity = p.toFixed(3); s.style.color = k >= 1 ? "" : `color-mix(in srgb, ${B} ${Math.round(k * 100)}%, ${A})`; s.style.filter = bl ? blurPx(p, bl) : "none";
      s.style.transform = `translateY(${((1 - p) * rs * fs).toFixed(1)}px)` + (by === "word" ? ` scale(${(0.92 + 0.08 * p).toFixed(3)})` : ""); }));
  }
  // Echo converge: two faint copies above and below slide into the word as it sharpens (Vaulton)
  function converge(el, o = {}) {
    rel(el); const box = wrapIn(el, "_sfCv"); box.querySelectorAll("[data-sf-ghost]").forEach(n => n.remove()); const text = box.textContent, g = o.gap ?? 0.92, d = o.duration ?? 0.6, dl = o.delay || 0, op = o.ghost ?? 0.16, fs = fsOf(el);
    const main = box.firstElementChild && box.firstElementChild.dataset.sfMain != null ? box.firstElementChild : (() => { const s = document.createElement("span"); s.dataset.sfMain = ""; s.style.display = "inline-block"; while (box.firstChild) s.appendChild(box.firstChild); box.appendChild(s); return s; })();
    const gh = [-1, 1].map(sg => { const c = document.createElement("span"); c.dataset.sfGhost = ""; c.setAttribute("aria-hidden", "true"); c.textContent = text; c.style.cssText = "position:absolute;left:0;top:0;white-space:nowrap;pointer-events:none;filter:blur(5px);"; if (o.ghostColor) c.style.color = o.ghostColor; box.appendChild(c); return [c, sg]; });
    return play(dl + 0.35 + d, t => { const u = t - dl, inP = oExpo(clamp(u / 0.7)), cv = EZ.inOut(clamp((u - 0.1) / d));
      main.style.opacity = inP.toFixed(3); main.style.filter = blurPx(inP, 14); main.style.transform = `scale(${(0.9 + 0.1 * inP).toFixed(4)})`;
      gh.forEach(([c, sg]) => { c.style.opacity = (op * (1 - cv) * inP).toFixed(3); c.style.transform = `translateY(${(sg * g * fs * (1 - cv)).toFixed(1)}px)`; }); }).then(() => gh.forEach(([c]) => c.remove()));
  }
  // Slot roll: words roll through a slot that resizes to fit each one, with faint echoes above and below as it lands (Vaulton)
  function slotRoll(el, words, o = {}) {
    rel(el); el.textContent = ""; el.setAttribute("aria-label", words.join(", ")); Object.assign(el.style, { display: "inline-block", verticalAlign: "bottom", whiteSpace: "nowrap", height: "1.15em", lineHeight: "1.15em" });
    const hold = o.hold ?? 0.8, R = o.roll ?? 0.4, per = hold + R, N = words.length, gp = o.ghosts ?? 0.16, bl = o.blur ?? 12;
    const mk = (w, ghost) => { const s = document.createElement("span"); s.textContent = w; s.setAttribute("aria-hidden", "true"); s.style.cssText = `position:absolute;left:0;top:0;white-space:pre;${ghost ? "filter:blur(3px);opacity:0;" : ""}`; el.appendChild(s); return s; };
    const items = words.map(w => ({ m: mk(w), g: [mk(w, 1), mk(w, 1)] })); let W = [];
    return loopFx(t => { const i = Math.floor(t / per), u = t - i * per, cur = i + (u < hold ? 0 : EZ.inOut((u - hold) / R)), a = ((Math.floor(cur) % N) + N) % N, b = (a + 1) % N, fr = cur - Math.floor(cur);
      if (!W[0]) W = items.map(it => it.m.offsetWidth); el.style.width = (W[a] * (1 - fr) + W[b] * fr + 4).toFixed(1) + "px";
      items.forEach((it, k) => { let d = (((k - cur) % N) + N) % N; if (d > N / 2) d -= N; const ad = Math.abs(d);
        it.m.style.opacity = Math.max(0, 1 - ad * 1.3).toFixed(3); it.m.style.transform = `translateY(${(d * 0.9).toFixed(3)}em)`; it.m.style.filter = ad > 0.01 ? `blur(${(ad * bl).toFixed(1)}px)` : "none";
        const go = k === i % N && u < hold ? gp * clamp(u / 0.15) * (1 - clamp((u - 0.35) / 0.4)) : 0; it.g.forEach((g, j) => { g.style.opacity = go.toFixed(3); g.style.transform = `translateY(${j ? 0.62 : -0.62}em)`; }); }); });
  }
  // Word trail: words land one by one and the earlier ones dim back, so the eye follows the newest (Gridd)
  function wordTrail(el, o = {}) {
    const ws = splitWords(el), n = ws.length, st = o.stagger ?? 0.24, d = o.duration ?? 0.4, dim = o.dim ?? 0.4, keep = o.keep ?? 2, dl = o.delay || 0, fs = fsOf(el);
    return play(dl + n * st + 1, t => ws.forEach((s, i) => { const a = dl + i * st, p = oExpo(clamp((t - a) / d)), f = i >= n - keep ? 1 : lerp(1, dim, EZ.inOut(clamp((t - a - 0.5) / 0.4)));
      s.style.opacity = (p * f).toFixed(3); s.style.filter = blurPx(p, 6); s.style.transform = `translateY(${((1 - p) * 0.4 * fs).toFixed(1)}px)`; }));
  }
  // Marquee light: an oversized line drifts sideways while its letters brighten one after another (Gridd, Vaulton)
  function marquee(el, o = {}) {
    const ch = splitChars(el, true), d = o.duration ?? 1.6, dist = o.distance ?? -0.4, dim = o.dim ?? 0.18, st = o.stagger ?? 0.07, dl = o.delay || 0, W = el.offsetWidth;
    return play(dl + Math.max(d, ch.length * st + 0.25), t => { const u = t - dl; el.style.transform = `translateX(${(clamp(u / d) * dist * W).toFixed(1)}px)`;
      ch.forEach((s, k) => (s.style.opacity = (dim + (1 - dim) * clamp((u - 0.05 - k * st) / 0.2)).toFixed(3))); });
  }
  // Underline cycle: value words take turns; each one's underline draws in, then retracts to the right as it leaves (Oncheck)
  function underlineCycle(el, words, o = {}) {
    rel(el); el.textContent = ""; el.setAttribute("aria-label", words.join(" ")); Object.assign(el.style, { display: "inline-flex", flexDirection: "column", alignItems: "center", gap: o.gap || "0.26em" });
    const w = document.createElement("div"), track = document.createElement("div"), line = document.createElement("div"); w.setAttribute("aria-hidden", "true"); w.style.whiteSpace = "nowrap";
    track.style.cssText = `width:${o.width || "1.75em"};height:${o.thickness || "1.5px"};display:flex;`; line.style.cssText = `height:100%;background:${o.color || "#ff8a8a"};`; track.appendChild(line); el.append(w, track);
    const step = o.hold ?? 1.3, N = words.length; let last = -1;
    return loopFx(t => { const i = Math.floor(t / step), u = t - i * step; if (i !== last) { last = i; w.textContent = words[i % N]; }
      const iP = EZ.inOut(clamp(u / 0.55)), oP = EZ.inOut(clamp((u - step + 0.45) / 0.45)), draw = EZ.inOut(clamp((u - 0.3) / 0.7)), ret = EZ.inOut(clamp((u - step + 0.5) / 0.45));
      w.style.opacity = (iP * (1 - oP)).toFixed(3); w.style.filter = `blur(${((1 - iP) * 10 + oP * 7).toFixed(1)}px)`; w.style.transform = `translateY(${((1 - iP) * 0.2 - oP * 0.12).toFixed(3)}em)`;
      track.style.justifyContent = ret > 0 ? "flex-end" : "flex-start"; line.style.width = ((ret > 0 ? 1 - ret : draw) * 100).toFixed(2) + "%"; });
  }
  // Pill words: an outlined pill opens and the words grow into it one at a time (Gridd)
  function pillWords(el, o = {}) {
    const text = el.dataset.sfText || el.textContent.trim(); el.dataset.sfText = text; el.setAttribute("aria-label", text); el.textContent = "";
    Object.assign(el.style, { display: "inline-flex", alignItems: "baseline", whiteSpace: "nowrap", borderRadius: "999px", padding: el.style.padding || "0.35em 0.8em", border: el.style.border || `2px solid ${o.color || "currentColor"}` });
    const st = o.stagger ?? 0.35, dl = o.delay || 0, ws = text.split(/\s+/).map((w, i, a) => { const m = document.createElement("span"), s = document.createElement("span"); m.setAttribute("aria-hidden", "true"); m.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;"; s.style.cssText = "display:inline-block;white-space:pre;"; s.textContent = w + (i < a.length - 1 ? " " : ""); m.appendChild(s); el.appendChild(m); return [m, s]; });
    const W = ws.map(([, s]) => s.offsetWidth + 1);
    return play(dl + 0.3 + ws.length * st + 0.3, t => { const u = t - dl, pp = oExpo(clamp(u / 0.25)); el.style.opacity = pp.toFixed(3); el.style.transform = `scale(${lerp(0.8, 1, pp).toFixed(3)})`;
      ws.forEach(([m, s], i) => { const p = oExpo(clamp((u - 0.05 - i * st) / 0.3)); m.style.maxWidth = (p * W[i]).toFixed(1) + "px"; s.style.opacity = p.toFixed(3); s.style.filter = blurPx(p, 6); s.style.transform = `translateY(${((1 - p) * 0.3).toFixed(3)}em)`; }); });
  }
  // ── Motion Tryouts: interface ──
  const bgOf = (f) => (/^(#|rgb|hsl|oklch|color-mix|linear-gradient|radial-gradient|conic-gradient|repeating-)/.test(f || "") ? f : `center/cover url("${f}")`);
  const stageXY = (stage, n) => { const sr = stage.getBoundingClientRect(), sc = sr.width / (stage.offsetWidth || 1) || 1, r = n.getBoundingClientRect(); return [(r.left - sr.left + r.width / 2) / sc, (r.top - sr.top + r.height / 2) / sc, r.width / sc, r.height / sc]; };
  // Odometer: a number rolls to its next value, the old one blurring out as the new one rises in (Echoform, Kinetik)
  function odometer(el, o = {}) {
    rel(el); el.textContent = ""; Object.assign(el.style, { display: "inline-block", overflow: "hidden", verticalAlign: "bottom", fontVariantNumeric: "tabular-nums", height: "1.2em", lineHeight: "1.2em" });
    const fmt = o.format || ((v) => String(v)), d = o.duration ?? 0.35, bl = o.blur ?? 6; let cur = o.value ?? 0, tok = 0;
    const mk = () => { const s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.style.cssText = "display:block;white-space:pre;text-align:center;"; el.appendChild(s); return s; };
    const A = mk(), B = mk(); Object.assign(B.style, { position: "absolute", left: "0", right: "0", top: "0", opacity: 0 }); A.textContent = fmt(cur); el.setAttribute("aria-label", fmt(cur));
    const set = (v) => { if (v === cur) return Promise.resolve(); const sg = v > cur || o.direction === "up" ? 1 : -1, k = ++tok; B.textContent = fmt(v); el.setAttribute("aria-label", fmt(v));
      return play(d, t => { if (k !== tok) return; const r = oExpo(clamp(t / d)); A.style.transform = `translateY(${(-sg * r * 100).toFixed(2)}%)`; A.style.opacity = (1 - r).toFixed(3); A.style.filter = `blur(${(r * bl).toFixed(2)}px)`;
        B.style.transform = `translateY(${(sg * (1 - r) * 100).toFixed(2)}%)`; B.style.opacity = r.toFixed(3); B.style.filter = blurPx(r, bl); })
        .then(() => { if (k !== tok) return; cur = v; A.textContent = fmt(v); A.style.transform = ""; A.style.opacity = 1; A.style.filter = "none"; B.style.opacity = 0; }); };
    const stop = () => { tok++; }; stop.set = set; stop.value = () => cur; return stop;
  }
  // Toast stack: notifications land stacked behind each other, then fan out into a list (Echoform, Kinetik)
  function toastStack(el, o = {}) {
    rel(el); const ks = [...el.children], n = ks.length, st = o.stagger ?? 0.18, gap = o.gap ?? 16, dl = o.delay || 0, ex = o.expand !== false, peek = o.peek ?? 16;
    ks.forEach(k => Object.assign(k.style, { position: "absolute", left: "0", right: "0", top: "0", transformOrigin: "50% 0", opacity: 0 }));
    const h = Math.max(...ks.map(k => k.offsetHeight)), pitch = h + gap, H = el.clientHeight, at = dl + n * st + 0.15;
    return play(at + (ex ? 0.45 : 0), t => { const ap = ks.map((_, j) => oExpo(clamp((t - dl - j * st) / 0.4))), e = ex ? oExpo(clamp((t - at) / 0.35)) : 0, top = lerp((H - h) / 2, (H - (n * h + (n - 1) * gap)) / 2, e);
      ks.forEach((k, j) => { const d = ap.slice(j + 1).reduce((s, v) => s + v, 0); k.style.zIndex = 10 - Math.round(d); k.style.opacity = Math.max(0, lerp(1 - 0.28 * d, 1, e) * ap[j]).toFixed(3);
        k.style.transform = `translateY(${(top + lerp(d * peek, d * pitch, e) - (1 - ap[j]) * 40).toFixed(1)}px) scale(${lerp(1 - 0.05 * d, 1, e).toFixed(4)})`; }); });
  }
  // Dot morph: a small dot of colour stretches into the pill behind a label, and the label flips to ink (Echoform, Kinetik)
  function dotMorph(el, o = {}) {
    rel(el); el.querySelectorAll("[data-sf-dot]").forEach(n => n.remove()); const W = el.offsetWidth, H = el.offsetHeight, s = o.size ?? Math.min(24, H * 0.3), col = o.color || "#ff6b3d", ink = o.ink || "#0b0b0b", d = o.duration ?? 0.45, dl = o.delay || 0, R = o.radius ?? H / 2;
    const bg = document.createElement("div"); bg.dataset.sfDot = ""; bg.setAttribute("aria-hidden", "true"); bg.style.cssText = `position:absolute;background:${col};z-index:-1;pointer-events:none;`; el.style.isolation = "isolate"; el.prepend(bg);
    const sx = -s - (o.offset ?? 50), sy = (H - s) / 2;
    return play(dl + d, t => { const m = oExpo(clamp((t - dl) / d)); Object.assign(bg.style, { left: lerp(sx, 0, m) + "px", top: lerp(sy, 0, m) + "px", width: lerp(s, W, m) + "px", height: lerp(s, H, m) + "px", borderRadius: lerp(s / 2, R, m) + "px" }); el.style.color = m > 0.5 ? ink : col; });
  }
  // Coverflow: cards fan out in 3D around the one in focus and glide when it changes (Kinetik)
  function coverflow(el, faces, o = {}) {
    rel(el); el.textContent = ""; el.style.perspective = o.perspective || "1600px"; const N = faces.length, W = o.width ?? 300, Hh = o.height ?? 380, sp = o.spread ?? 250, tail = o.tail ?? 110, rot = o.rotate ?? 55, hold = o.hold ?? 1.4, D = o.duration ?? 0.9;
    const cards = faces.map(f => { const c = document.createElement("div"); c.style.cssText = `position:absolute;left:50%;top:50%;width:${W}px;height:${Hh}px;margin:${-Hh / 2}px 0 0 ${-W / 2}px;border-radius:${o.radius ?? 12}px;box-shadow:0 30px 50px rgba(0,0,0,0.25);background:${bgOf(f)};`; el.appendChild(c); return c; });
    let target = o.active ?? Math.floor(N / 2), from = target, t0 = -9, user = false;
    const pos = () => lerp(from, target, EZ.inOut(clamp((now() - t0) / D))), set = (i) => { from = pos(); target = Math.max(0, Math.min(N - 1, i)); t0 = now(); };
    const stopL = loopFx(t => { if (o.auto !== false && !user && N > 1) { const k = Math.floor(t / hold) % (2 * (N - 1)), i = k < N ? k : 2 * (N - 1) - k; if (i !== target) set(i); }
      const c0 = pos(); cards.forEach((c, i) => { const p = i - c0, a = Math.min(Math.abs(p), 1), sg = Math.sign(p);
        c.style.zIndex = Math.round(100 - Math.abs(p) * 10); c.style.opacity = clamp(4.2 - Math.abs(p)).toFixed(3);
        c.style.transform = `translate3d(${(sg * (a * sp + Math.max(Math.abs(p) - 1, 0) * tail)).toFixed(1)}px,0,${(-a * 220).toFixed(1)}px) rotateY(${(-clamp(p, -1, 1) * rot).toFixed(2)}deg)`; }); });
    const stop = () => stopL(); stop.set = (i) => { user = true; set(i); }; stop.next = () => stop.set(Math.round(target) + 1); stop.prev = () => stop.set(Math.round(target) - 1); return stop;
  }
  // Card drift: a deck of cards turned in 3D drifts along a diagonal, endlessly (Kinetik)
  function cardDrift(el, faces, o = {}) {
    rel(el); el.textContent = ""; el.style.perspective = o.perspective || "1400px"; const N = o.count ?? 11, W = o.width ?? 300, Hh = o.height ?? 400, rate = o.rate ?? 1.8, dx = o.dx ?? 120, dy = o.dy ?? -80, dz = o.dz ?? -160, ry = o.rotate ?? -48;
    const cards = Array.from({ length: N }, (_, i) => { const c = document.createElement("div"); c.style.cssText = `position:absolute;left:50%;top:50%;width:${W}px;height:${Hh}px;margin:${-Hh / 2}px 0 0 ${-W / 2}px;border-radius:${o.radius ?? 16}px;box-shadow:0 30px 60px rgba(0,0,0,0.6);background:${bgOf(faces[i % faces.length])};`; el.appendChild(c); return c; });
    return loopFx(t => cards.forEach((c, i) => { const p = ((((i - t * rate) % N) + N) % N) - N / 2; c.style.opacity = (clamp(1 - (Math.abs(p) - 3.5)) * clamp(t / 0.3)).toFixed(3); c.style.zIndex = Math.round(100 - p * 10);
      c.style.transform = `translate3d(${(p * dx).toFixed(1)}px,${(p * dy).toFixed(1)}px,${(p * dz).toFixed(1)}px) rotateY(${ry}deg) rotateX(6deg)`; }));
  }
  // Shared morph: an element glides and resizes into another element's box, radius and all (Kinetik, Vindora, Gridd)
  function morph(el, target, o = {}) {
    const par = el.offsetParent || el.parentElement, pr = par.getBoundingClientRect(), sc = pr.width / (par.offsetWidth || 1) || 1, a = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }, tr = target.getBoundingClientRect ? target.getBoundingClientRect() : null;
    const b = tr ? { x: (tr.left - pr.left) / sc - par.clientLeft, y: (tr.top - pr.top) / sc - par.clientTop, w: tr.width / sc, h: tr.height / sc } : target;
    const r0 = parseFloat(getComputedStyle(el).borderRadius) || 0, r1 = o.radius ?? (tr ? parseFloat(getComputedStyle(target).borderRadius) || r0 : r0), d = o.duration ?? 0.6, dl = o.delay || 0;
    Object.assign(el.style, { position: "absolute", boxSizing: "border-box", margin: "0" });
    return play(dl + d, t => { const k = EZ.inOut(clamp((t - dl) / d)); Object.assign(el.style, { left: lerp(a.x, b.x, k) + "px", top: lerp(a.y, b.y, k) + "px", width: lerp(a.w, b.w, k) + "px", height: lerp(a.h, b.h, k) + "px", borderRadius: lerp(r0, r1, k) + "px" }); });
  }
  // Card flip: the card turns edge-on and comes back showing its other face (Vaulton)
  function flipCard(el, o = {}) {
    const [f, b] = el.children, d = o.duration ?? 0.55, dl = o.delay || 0, toBack = o.back !== false; if (!b) return Promise.resolve();
    const show = (back) => { f.style.display = back ? "none" : ""; b.style.display = back ? "" : "none"; }; show(!toBack);
    return play(dl + d, t => { const k = EZ.inOut(clamp((t - dl) / d)); el.style.transform = `scaleX(${Math.max(0.001, Math.abs(Math.cos(k * Math.PI))).toFixed(4)})`; show(k > 0.5 ? toBack : !toBack); }).then(() => (el.style.transform = ""));
  }
  // Progress button: the button squeezes, fills with progress under a busy label, then pops into a clean completed state with a check that draws in (Vaulton)
  function progressButton(btn, o = {}) {
    rel(btn); btn.style.overflow = "hidden"; const lab = btn._sfLab || (btn._sfLab = (() => { const s = document.createElement("span"); s.style.cssText = "position:relative;display:inline-flex;align-items:center;gap:0.45em;"; while (btn.firstChild) s.appendChild(btn.firstChild); btn.appendChild(s); return s; })());
    const idle = btn._sfIdle ?? (btn._sfIdle = lab.textContent), bg0 = btn._sfBg ?? (btn._sfBg = btn.style.background), c0 = btn._sfCol ?? (btn._sfCol = btn.style.color), d = o.duration ?? 0.8; btn.querySelectorAll("[data-sf-fill]").forEach(n => n.remove()); lab._done = 0;
    if (o.reset) { lab.textContent = idle; btn.style.background = bg0; btn.style.color = c0; btn.style.transform = ""; btn.setAttribute("aria-busy", "false"); return Promise.resolve(); }
    const f = document.createElement("span"); f.dataset.sfFill = ""; f.setAttribute("aria-hidden", "true"); f.style.cssText = `position:absolute;left:0;top:0;bottom:0;width:0;background:${o.fill || "rgba(9,9,11,0.12)"};pointer-events:none;`; btn.prepend(f); btn.setAttribute("aria-busy", "true");
    return play(0.15 + d + 0.5, t => { const k = clamp((t - 0.15) / d);
      if (t < 0.15) { btn.style.transform = `scale(${(1 - 0.05 * Math.sin((Math.PI * t) / 0.15)).toFixed(4)})`; return; }
      if (k < 1) { btn.style.transform = ""; if (lab.textContent !== (o.busy ?? "Working…")) lab.textContent = o.busy ?? "Working…"; f.style.width = (k * 100).toFixed(1) + "%"; return; }
      const u = t - 0.15 - d; if (!lab._done) { lab._done = 1; f.remove(); btn.setAttribute("aria-busy", "false"); btn.style.background = o.doneColor || "#22c58b"; btn.style.color = o.doneInk || "#06140d";
        lab.innerHTML = `<svg width="0.95em" height="0.95em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg><span>${o.done ?? "Done"}</span>`; }
      const pl = lab.querySelector("polyline"); if (pl) pl.setAttribute("stroke-dashoffset", (1 - oCubic(clamp((u - 0.05) / 0.3))).toFixed(3)); btn.style.transform = `scale(${(1 + 0.05 * Math.sin(Math.PI * clamp(u / 0.32))).toFixed(4)})`; })
      .then(() => { btn.style.transform = ""; });
  }
  // Live feed: new rows push in at the top while older ones slide down and dim (Vaulton)
  function liveFeed(el, rows, o = {}) {
    rel(el); el.style.overflow = "hidden"; el.textContent = ""; const iv = o.interval ?? 0.66, max = o.max ?? 5, h = o.rowHeight ?? 58, N = rows.length, shown = []; let last = -1;
    const mk = o.row || ((r) => { const d = document.createElement("div"); d.style.cssText = "display:flex;align-items:center;gap:0.8em;height:100%;border-bottom:1px solid rgba(242,242,244,0.1);"; d.innerHTML = r; return d; });
    return loopFx(t => { const k = Math.floor(t / iv); while (last < k) { last++; const w = document.createElement("div"); w.style.cssText = `position:absolute;left:0;right:0;top:0;height:${h}px;`; w.appendChild(mk(rows[last % N], last)); w._at = last * iv; el.appendChild(w); shown.unshift(w); if (shown.length > max + 1) shown.pop().remove(); }
      const p0 = oExpo(clamp((t - shown[0]._at) / 0.35)); shown.forEach((w, i) => { w.style.transform = `translateY(${((i - (1 - p0)) * h).toFixed(1)}px)`; w.style.opacity = (i === 0 ? p0 : Math.max(0, 1 - i * 0.12 - (i === max ? p0 : 0))).toFixed(3); }); });
  }
  // Face scan: a tick ring fills while a scanline sweeps a face glyph, then it folds into a filled check (Invois App)
  function faceScan(el, o = {}) {
    const S = o.size ?? 200, col = o.color || "#1e8bff", ink = o.ink || "#ffffff", off = o.track || "#262b33", C = 260, st = `fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"`, corner = "M140 196 V180 A40 40 0 0 1 180 140 H196";
    el.innerHTML = `<svg viewBox="0 0 520 520" width="${S}" height="${S}" style="display:block;overflow:visible" aria-hidden="true"><g>${Array.from({ length: 60 }, (_, i) => `<line x1="${C}" y1="${C - 192}" x2="${C}" y2="${C - 214}" stroke-width="6" stroke-linecap="round" transform="rotate(${i * 6} ${C} ${C})"/>`).join("")}</g><g>${[0, 90, 180, 270].map(r => `<path d="${corner}" ${st} transform="rotate(${r} ${C} ${C})"/>`).join("")}<path d="M222 222 V240 M298 222 V240" ${st}/><path d="M262 226 V272 H250" ${st}/><path d="M226 304 Q260 330 294 304" ${st}/><rect x="150" width="220" height="40" fill="${col}" opacity="0"/><line x1="150" x2="370" stroke="${col}" stroke-width="4" stroke-linecap="round" opacity="0"/></g><circle cx="${C}" cy="${C}" r="0" fill="${col}"/><path d="M212 262 L246 294 L310 226" fill="none" stroke="${ink}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity="0"/></svg>`;
    el.setAttribute("role", "img"); el.setAttribute("aria-label", o.label || "Verified"); const svg = el.firstChild, [tg, face, disc, chk] = svg.children, lines = [...tg.children], rect = face.children[7], scan = face.children[8], at = (g, k) => g.setAttribute("transform", `translate(${C} ${C}) scale(${k}) translate(${-C} ${-C})`);
    return play((o.delay || 0) + 1.6, T => { const s = T - (o.delay || 0), inn = oCubic(clamp(s / 0.35)), prog = EZ.inOut(clamp((s - 0.2) / 0.8)), m = EZ.inOut(clamp((s - 1.0) / 0.25)), ck = oCubic(clamp((s - 1.12) / 0.28));
      const sy = 150 + 220 * (0.5 - 0.5 * Math.cos(clamp((s - 0.2) / 0.8) * Math.PI * 2)), so = clamp((s - 0.2) / 0.15) * (1 - clamp((s - 0.9) / 0.1));
      svg.style.opacity = inn.toFixed(3); svg.style.transform = `scale(${(0.9 + 0.1 * inn).toFixed(4)})`; lines.forEach((l, i) => l.setAttribute("stroke", i / 60 < prog ? col : off));
      tg.setAttribute("opacity", 1 - m); at(tg, 1 + 0.1 * m); face.setAttribute("opacity", 1 - m); at(face, 1 - 0.25 * m);
      rect.setAttribute("y", sy - 40); rect.setAttribute("opacity", (0.3 * so).toFixed(3)); scan.setAttribute("y1", sy); scan.setAttribute("y2", sy); scan.setAttribute("opacity", so.toFixed(3));
      disc.setAttribute("r", (120 * m).toFixed(2)); chk.setAttribute("stroke-dashoffset", (1 - ck).toFixed(4)); chk.setAttribute("opacity", ck > 0 ? 1 : 0); });
  }
  // Coin pill: a currency coin pops in, a pill slides out of it and the name types into place (Invois App)
  function coinPill(el, o = {}) {
    const sym = o.symbol ?? "₦", code = o.code ?? "NGN", label = o.label ?? "Nigeria", col = o.color || "#18a558", ink = o.ink || "#0b1623", dl = o.delay || 0;
    el.textContent = ""; el.setAttribute("aria-label", `${label}, ${code}`); Object.assign(el.style, { display: "inline-flex", alignItems: "center", gap: "0.25em" });
    const coin = document.createElement("div"), pill = document.createElement("div"), cc = document.createElement("div"), lab = document.createElement("div"); coin.setAttribute("aria-hidden", "true"); pill.setAttribute("aria-hidden", "true");
    coin.style.cssText = `flex:none;width:1.82em;height:1.82em;border-radius:50%;background:${col};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;transform:scale(0);`; coin.innerHTML = `<span style="font-size:${sym.length > 1 ? 0.62 : 0.9}em;letter-spacing:-0.03em">${sym}</span>`;
    pill.style.cssText = `flex:none;height:1.82em;border-radius:0.91em;background:${o.pill || "#ffffff"};overflow:hidden;display:flex;align-items:center;gap:0.3em;padding:0 0.64em 0 0.23em;box-sizing:border-box;transform-origin:0 50%;opacity:0;`;
    cc.style.cssText = `flex:none;width:1.36em;height:1.36em;border-radius:50%;background:${ink};color:#fff;display:flex;align-items:center;justify-content:center;`; cc.innerHTML = `<span style="font-size:0.39em;font-weight:700;letter-spacing:0.02em">${code}</span>`;
    lab.style.cssText = `font-weight:600;color:${ink};letter-spacing:-0.03em;white-space:pre;`; pill.append(cc, lab); el.append(coin, pill); lab.textContent = label; const PW = pill.scrollWidth, fs = fsOf(el), m0 = 1.82 * fs; lab.textContent = " ";
    return play(dl + 1.1, t => { const u = t - dl, pop = oBack(clamp(u / 0.25)), pl = oCubic(clamp((u - 0.2) / 0.3)), n = Math.floor(clamp((u - 0.4) / 0.35) * label.length);
      coin.style.transform = `scale(${Math.max(0, pop).toFixed(3)})`; pill.style.maxWidth = (m0 + (PW - m0) * pl).toFixed(1) + "px"; pill.style.opacity = pl > 0 ? 1 : 0; pill.style.transform = `scale(${(0.6 + 0.4 * Math.min(1, pop)).toFixed(3)})`; lab.textContent = label.slice(0, n) || " "; });
  }
  // Streak dots: a row of day dots fills with colour one by one, each with a small pop (Onne)
  function streak(el, o = {}) {
    const L = o.labels || ["M", "T", "W", "T", "F"], col = o.color || "#2e5bff", off = o.track || "rgba(242,242,244,0.18)", mute = o.muted || "#8e909a", st = o.stagger ?? 0.14, dl = o.delay || 0, fill = o.fill ?? L.length;
    el.textContent = ""; Object.assign(el.style, { display: "flex", gap: o.gap || "0.26em" }); el.setAttribute("aria-label", `${fill} of ${L.length} days`);
    const ds = L.map(l => { const d = document.createElement("div"); d.setAttribute("aria-hidden", "true"); d.textContent = l; d.style.cssText = `width:2.6em;height:2.6em;border-radius:50%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-weight:600;border:3px solid ${off};color:${mute};opacity:0;`; el.appendChild(d); return d; });
    return play(dl + 0.3 + L.length * st + 0.4, t => ds.forEach((d, i) => { const p = i < fill ? oExpo(clamp((t - dl - 0.3 - i * st) / 0.4)) : 0, on = p > 0.5; d.style.opacity = clamp((t - dl) / 0.3).toFixed(3);
      d.style.borderColor = on ? col : off; d.style.background = on ? col : "transparent"; d.style.color = on ? "#fff" : mute; d.style.transform = `scale(${(0.8 + 0.2 * (i < fill ? p : 1) + 0.08 * Math.sin(p * Math.PI)).toFixed(3)})`; }));
  }
  // Node map: items pop onto a board, the chosen ones ring up, dotted links draw between them with labels, the rest dim and strike through (Vindora)
  function nodeMap(stage, nodes, o = {}) {
    rel(stage); (stage._sfMap || []).forEach(n => n.remove()); nodes = [...nodes]; const col = o.color || "#ff5a36", links = o.links || [], pick = new Set(o.pick || links.flatMap(l => [l[0], l[1]])), st = o.stagger ?? 0.07, dl = o.delay || 0;
    nodes.forEach(n => { rel(n); n.style.zIndex = 2; n.style.transform = ""; if (n._sfBs == null) n._sfBs = n.style.boxShadow; });
    const svg = svgEl("svg", { "aria-hidden": "true" }); svg.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:1;"; stage.insertBefore(svg, stage.firstChild); const made = [svg];
    const ls = links.map(([a, b, lab]) => { const [x1, y1] = stageXY(stage, nodes[a]), [x2, y2] = stageXY(stage, nodes[b]), l = svg.appendChild(svgEl("line", { x1, y1, x2: x1, y2: y1, stroke: col, "stroke-width": o.width ?? 5, "stroke-linecap": "round", "stroke-dasharray": "1 13", opacity: 0 })); let tag = null;
      if (lab) { tag = document.createElement("div"); tag.textContent = lab; tag.style.cssText = `position:absolute;left:${(x1 + x2) / 2}px;top:${(y1 + y2) / 2}px;transform:translate(-50%,-50%) scale(0.8);background:${col};color:#fff;font-weight:700;padding:0.35em 0.75em;border-radius:1em;white-space:nowrap;opacity:0;z-index:3;font-size:${o.labelSize || "0.85em"};`; stage.appendChild(tag); made.push(tag); }
      return { l, tag, x1, y1, x2, y2 }; });
    stage._sfMap = made; const pickAt = dl + nodes.length * st + 0.5;
    return play(pickAt + 0.3 + links.length * 0.35 + 0.5, t => { const s = oExpo(clamp((t - pickAt) / 0.3));
      nodes.forEach((nd, i) => { const p = oExpo(clamp((t - dl - i * st) / 0.5)), on = pick.has(i), ring = on && s > 0 ? `0 0 0 ${(5 * s).toFixed(1)}px ${col}` : ""; nd.style.opacity = (p * (on ? 1 : 1 - 0.65 * s)).toFixed(3); nd.style.transform = `scale(${(0.85 + 0.15 * p).toFixed(3)})`;
        nd.style.boxShadow = [ring, nd._sfBs].filter(Boolean).join(", "); nd.style.textDecoration = !on && s > 0.5 ? "line-through" : ""; });
      ls.forEach(({ l, tag, x1, y1, x2, y2 }, i) => { const a = pickAt + 0.3 + i * 0.35, p = oExpo(clamp((t - a) / 0.35)), q = oExpo(clamp((t - a - 0.25) / 0.35)); l.setAttribute("x2", lerp(x1, x2, p).toFixed(1)); l.setAttribute("y2", lerp(y1, y2, p).toFixed(1)); l.setAttribute("opacity", p > 0 ? 1 : 0);
        if (tag) { tag.style.opacity = q.toFixed(3); tag.style.transform = `translate(-50%,-50%) scale(${(0.8 + 0.2 * q).toFixed(3)})`; } }); });
  }
  // Prompt send: a request types into a composer, the send button lights and is pressed, the box rises and the reply lines follow (Echoform, Kinetik, Vindora)
  function promptSend(el, o = {}) {
    rel(el); el.textContent = ""; const acc = o.color || "#ff6b3d", text = o.text || "Build a coverflow carousel", steps = o.steps || [], cps = o.cps ?? 22, dl = o.delay || 0, ink = o.ink || "#ededed", w = o.width || "min(86%, 30em)";
    const box = document.createElement("div"), line = document.createElement("div"), txt = document.createElement("span"), car = document.createElement("span"), btn = document.createElement("div"), out = document.createElement("div");
    box.style.cssText = `position:absolute;left:50%;top:50%;width:${w};transform:translate(-50%,-50%);box-sizing:border-box;padding:1.1em 1.3em 3.4em;border-radius:1.1em;background:${o.background || "#171818"};outline:1.5px solid ${o.border || "#2a2b2b"};`;
    line.style.cssText = "display:flex;align-items:center;min-height:1.3em;white-space:nowrap;overflow:hidden;"; car.style.cssText = `display:inline-block;width:2px;height:1.2em;margin-left:3px;background:${ink};`; line.append(txt, car);
    btn.style.cssText = "position:absolute;right:0.8em;bottom:0.8em;width:2em;height:2em;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#0b0b0b;background:#333434;"; btn.textContent = "↑"; btn.setAttribute("aria-hidden", "true"); box.append(line, btn);
    out.style.cssText = `position:absolute;left:50%;top:0;width:${w};transform:translateX(-50%);display:flex;flex-direction:column;gap:0.7em;`; el.append(box, out);
    const rows = [o.reply && `<span style="color:${acc};font-weight:500">${o.reply}</span>`, ...steps.map(s => `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.85em;color:#9a9b9b;white-space:pre">✓  ${s}</span>`)].filter(Boolean).map(h => { const r = document.createElement("div"); r.innerHTML = h; r.style.opacity = 0; out.appendChild(r); return r; });
    const T = text.length / cps, sendAt = dl + 0.4 + T + 0.25, H = el.clientHeight;
    return play(sendAt + 0.85 + rows.length * 0.3 + 0.4, t => { const n = Math.floor(clamp((t - dl - 0.4) / T) * text.length), m = EZ.inOut(clamp((t - sendAt - 0.15) / 0.5)), pr = t > sendAt && t < sendAt + 0.15 ? Math.sin((Math.PI * (t - sendAt)) / 0.15) : 0;
      txt.textContent = n ? text.slice(0, n) : o.placeholder || "Describe a component…"; txt.style.color = n ? ink : "#5e5f5f"; car.style.opacity = m > 0 ? 0 : n < text.length || Math.floor(t * 2.6) % 2 === 0 ? 1 : 0;
      btn.style.background = n ? acc : "#333434"; btn.style.transform = `scale(${(1 - 0.15 * pr).toFixed(3)})`; btn.style.opacity = (1 - m).toFixed(3); box.style.paddingBottom = lerp(3.4, 1.1, m).toFixed(3) + "em";
      const bh = box.offsetHeight; box.style.top = lerp(H / 2, bh / 2 + H * 0.06, m).toFixed(1) + "px"; out.style.top = (H * 0.06 + bh + 18).toFixed(1) + "px";
      rows.forEach((r, i) => { const p = oExpo(clamp((t - sendAt - 0.7 - i * 0.3) / 0.4)); r.style.opacity = p.toFixed(3); r.style.filter = blurPx(p, 6); r.style.transform = `translateY(${((1 - p) * 10).toFixed(1)}px)`; }); });
  }
  // Switch: a toggle slides its knob across as the track fills with colour (Vaulton, Vindora)
  function toggle(el, o = {}) {
    let k = el._sfKnob; if (!k) { el.textContent = ""; Object.assign(el.style, { position: "relative", display: "inline-block", width: el.style.width || "2.5em", height: el.style.height || "1.35em", borderRadius: "999px", flex: "none" });
      k = el._sfKnob = document.createElement("span"); k.style.cssText = "position:absolute;top:0.17em;left:0.17em;width:1.01em;height:1.01em;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);"; el.appendChild(k); el.setAttribute("role", "switch"); el._sfOn = 0; }
    const to = o.on !== false ? 1 : 0, from = el._sfOn, d = o.duration ?? 0.3, onC = o.color || "#1e5bff", offC = o.off || "#1c2745", trav = el.clientWidth - k.offsetWidth - k.offsetLeft * 2; el.setAttribute("aria-checked", String(!!to));
    return play(d, t => { const v = lerp(from, to, oExpo(clamp(t / d))); el._sfOn = v; k.style.transform = `translateX(${(v * trav).toFixed(1)}px)`; el.style.background = `color-mix(in srgb, ${onC} ${Math.round(v * 100)}%, ${offC})`; });
  }
  // Step list: a dot and an arrow mark the active item and step down the list; the rest stay muted (Gridd)
  function stepList(el, o = {}) {
    const ks = [...el.children], col = o.color || "#f5c46b", mute = o.muted || "#66666c", iv = o.interval ?? 0.8; let cur = 0, user = false;
    const marks = ks.map(k => { k.querySelectorAll(":scope > [data-sf-step]").forEach(n => n.remove()); Object.assign(k.style, { display: "flex", alignItems: "center" }); const dot = document.createElement("span"), ar = document.createElement("span"); dot.dataset.sfStep = ""; ar.dataset.sfStep = ""; dot.setAttribute("aria-hidden", "true"); ar.setAttribute("aria-hidden", "true");
      dot.style.cssText = `flex:none;width:0.4em;height:0.4em;border-radius:50%;background:${col};margin-right:0.5em;opacity:0;`; ar.style.cssText = "margin-left:0.6em;opacity:0;display:inline-block;"; ar.textContent = o.arrow ?? "←"; k.prepend(dot); k.appendChild(ar); return { k, dot, ar, v: 0 }; });
    const stopL = loopFx(t => { if (!user) cur = Math.floor(t / iv) % ks.length; marks.forEach((m, i) => { m.v += ((i === cur ? 1 : 0) - m.v) * 0.25; m.k.style.color = `color-mix(in srgb, ${o.ink || "#ffffff"} ${Math.round(m.v * 100)}%, ${mute})`; m.dot.style.opacity = m.v.toFixed(3); m.ar.style.opacity = m.v.toFixed(3); m.ar.style.transform = `translateX(${((1 - m.v) * 0.6).toFixed(3)}em)`; }); });
    const stop = () => stopL(); stop.set = (i) => { user = true; cur = i; }; return stop;
  }
  // ── Motion Tryouts: transitions ──
  const overlay = (el, z = 30) => { const w = document.createElement("div"); w.setAttribute("aria-hidden", "true"); w.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:${z};overflow:hidden;`; el.appendChild(w); return w; };
  const swapper = (o) => { let done = false; return () => { if (!done) { done = true; o.onSwap && o.onSwap(); } }; };
  // Blinds: horizontal bands close from their centre lines in a ragged order, the scene swaps, and they open again (Bllind)
  function blinds(el, o = {}) {
    rel(el); const N = o.bands ?? 12, col = o.color || "#c6f24e", CL = o.close ?? 0.4, OP = o.open ?? 0.42, seed = o.seed ?? Math.floor(Math.random() * 1000), wrap = overlay(el), swap = swapper(o);
    const bs = Array.from({ length: N }, (_, i) => { const b = document.createElement("div"), h = document.createElement("div"); b.style.cssText = `position:absolute;left:0;right:0;height:0;background:${col};`; h.style.cssText = `position:absolute;left:0;right:0;height:2px;background:${col};opacity:0;`; wrap.append(b, h); return { b, h, d1: rnd(i + seed, 1) * 0.16, d2: rnd(i + seed + 40, 1) * 0.16 }; });
    return play(CL + OP + 0.1, t => { if (t >= CL) swap(); const bh = el.clientHeight / N;
      bs.forEach(({ b, h, d1, d2 }, i) => { const v = t < CL ? EZ.inOut(clamp((t - d1) / 0.24)) : 1 - EZ.inOut(clamp((t - CL - d2) / 0.26)), hair = v < 0.02 && (t < CL ? t > d1 - 0.08 : t < CL + d2 + 0.34);
        b.style.top = (i * bh + (bh * (1 - v)) / 2 - 0.5).toFixed(1) + "px"; b.style.height = v > 0 ? (bh * v + 1).toFixed(1) + "px" : "0"; h.style.top = (i * bh + bh / 2 - 1).toFixed(1) + "px"; h.style.opacity = hair ? 0.7 : 0; }); }).then(() => wrap.remove());
  }
  // Column rise: stepped columns of colour rise to cover the frame, the scene swaps, then they retreat upward (Corporate Presentation)
  function columnWipe(el, o = {}) {
    rel(el); const C = o.cols ?? 16, col = o.color || "#2f6dd0", D = o.duration ?? 0.55, mode = o.mode || "both", wrap = overlay(el), swap = swapper(o), fill = document.createElement("div");
    fill.style.cssText = `position:absolute;inset:0;background:${o.background || `linear-gradient(135deg, rgba(0,0,0,.2), rgba(255,255,255,.14)), ${col}`};`; wrap.appendChild(fill);
    const lead = Array.from({ length: C * 2 }, (_, i) => { const d = document.createElement("div"); d.style.cssText = `position:absolute;display:none;background:color-mix(in srgb, ${col} ${i % 2 ? 25 : 65}%, #fff);opacity:${i % 2 ? 0.45 : 0.55};`; wrap.appendChild(d); return d; });
    const frame = (p, up, sd) => { const W = el.clientWidth, H = el.clientHeight, cw = W / C, q = o.step ?? Math.max(8, H / 20), pts = [up ? `0px ${H}px` : "0px 0px"];
      for (let i = 0; i < C; i++) { const k = clamp(p * 1.4 - rnd(i + sd, 3) * 0.4), yy = H - Math.round((EZ.inOut(k) * H) / q) * q, a = lead[i * 2], b = lead[i * 2 + 1], on = k > 0 && k < 1; pts.push(`${i * cw}px ${yy}px`, `${(i + 1) * cw}px ${yy}px`);
        a.style.display = b.style.display = on ? "" : "none"; if (on) { Object.assign(a.style, { left: i * cw + "px", width: cw + "px", height: q + "px", top: (up ? yy - q : yy) + "px" }); Object.assign(b.style, { left: i * cw + (rnd(i, 5) > 0.5 ? cw / 2 : 0) + "px", width: cw / 2 + "px", height: q + "px", top: (up ? yy - 2 * q : yy + q) + "px" }); } }
      pts.push(up ? `${W}px ${H}px` : `${W}px 0px`); fill.style.clipPath = `polygon(${pts.join(",")})`; };
    if (mode === "out") return play(D, t => frame(clamp(t / D), false, 40)).then(() => wrap.remove());
    return play(mode === "both" ? D * 2 + 0.05 : D, t => { if (t < D) frame(clamp(t / D), true, 0); else { swap(); mode === "both" ? frame(clamp((t - D) / D), false, 40) : frame(1, true, 0); } }).then(() => { if (mode === "both") wrap.remove(); return wrap; });
  }
  // Block wipe: a grid of blocks fills from one corner, the scene swaps, and the blocks clear in the same direction (Corporate Presentation)
  function blockWipe(el, o = {}) {
    rel(el); const W = el.clientWidth, H = el.clientHeight, cs = o.cell ?? Math.max(24, Math.round(W / 16)), C = Math.ceil(W / cs), R = Math.ceil(H / cs), col = o.color || "#2f6dd0", from = o.from || "tr", D = o.duration ?? 0.6, wrap = overlay(el), swap = swapper(o), lite = `color-mix(in srgb, ${col} 60%, #fff)`;
    const dist = (nx, ny) => ({ tr: (1 - nx) * 0.6 + ny * 0.4, tl: nx * 0.6 + ny * 0.4, br: (1 - nx) * 0.6 + (1 - ny) * 0.4, bl: nx * 0.6 + (1 - ny) * 0.4, r: (1 - nx) * 0.85 + ny * 0.15, l: nx * 0.85 + (1 - ny) * 0.15 })[from] ?? nx;
    const cells = []; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const d = document.createElement("div"); d.style.cssText = `position:absolute;left:${c * cs}px;top:${r * cs}px;width:${cs}px;height:${cs}px;display:none;`; wrap.appendChild(d); cells.push([d, dist(c / Math.max(1, C - 1), r / Math.max(1, R - 1)) * 0.82 + rnd(r * 31 + c, 7) * 0.18]); }
    const frame = (p, cover) => cells.forEach(([d, dd]) => { const k = clamp((p * 1.2 - dd) / 0.18), v = cover ? k : 1 - k; if (v <= 0) { d.style.display = "none"; return; } const solid = v >= 1; d.style.display = ""; d.style.background = solid ? col : lite; d.style.opacity = solid ? 1 : (0.35 + v * 0.4).toFixed(3); d.style.transform = solid ? "none" : `scale(${(0.6 + v * 0.4).toFixed(3)})`; });
    return play(D * 2 + 0.05, t => { if (t < D) frame(t / D, true); else { swap(); frame(clamp((t - D) / D), false); } }).then(() => wrap.remove());
  }
  // Doors: two panels slide in from the sides with ragged edges, meet in the middle for the swap, then part (Corporate Presentation)
  function doors(el, o = {}) {
    rel(el); const col = o.color || "#2f6dd0", CL = o.close ?? 0.4, OP = o.open ?? 0.35, wrap = overlay(el), swap = swapper(o), rows = 9;
    const side = (left) => { const p = document.createElement("div"); p.style.cssText = `position:absolute;top:0;bottom:0;${left ? "left" : "right"}:0;width:0;background:linear-gradient(135deg, rgba(0,0,0,.2), rgba(255,255,255,.14)), ${col};`;
      for (let i = 0; i < rows; i++) { const b = document.createElement("div"); b.style.cssText = `position:absolute;top:${(i * 100) / rows}%;height:${100 / rows}%;width:${rnd(i + (left ? 0 : 9), 2) > 0.5 ? 2 : 1}em;${left ? "left:100%" : "right:100%"};background:color-mix(in srgb, ${col} 55%, #fff);opacity:0.45;`; p.appendChild(b); } wrap.appendChild(p); return p; };
    const L = side(true), Rr = side(false);
    return play(CL + OP, t => { const w = 50 * EZ.inOut(clamp(t / CL)) * (1 - EZ.inOut(clamp((t - CL) / OP))), e = (0.45 * (1 - clamp((t - CL) / OP))).toFixed(3); wrap.style.visibility = w < 0.2 ? "hidden" : ""; L.style.width = Rr.style.width = w + "%";
      [...L.children, ...Rr.children].forEach(b => (b.style.opacity = e)); if (t >= CL) swap(); }).then(() => wrap.remove());
  }
  // Beam wipe: a bundle of slanted glass beams sweeps across; the next scene is revealed behind its trailing edge (Invois Reveal, Corporate Presentation)
  function beamWipe(el, o = {}) {
    rel(el); const W = el.clientWidth, H = el.clientHeight, ang = o.angle ?? 21, T = Math.tan((ang * Math.PI) / 180), d = o.duration ?? 1.2, cs = o.colors || ["#3d8bff", "#0a5cff", "#1fa0ff", "#0050f0", "#2e7bff", "#35e6ff"], sc = Math.max(W, 320) / 1920, nx = o.next, swap = swapper(o);
    const bars = [[0, 150], [185, 70], [300, 150], [490, 58], [585, 110], [735, 40]].map(([x, w], i) => [x * sc, w * sc, cs[i % cs.length]]), BW = 775 * sc, wrap = document.createElement("div"); wrap.setAttribute("aria-hidden", "true");
    wrap.style.cssText = `position:absolute;top:${-H * 0.1}px;height:${H * 1.2}px;left:0;width:${BW}px;pointer-events:none;z-index:32;transform-origin:0 50%;`;
    wrap.innerHTML = `<div style="position:absolute;inset:0;background:${o.backing || "rgba(0,12,70,0.8)"}"></div>` + bars.map(([x, w, c]) => `<div style="position:absolute;top:0;bottom:0;left:${x}px;width:${w}px;background:linear-gradient(90deg, #9fefff 0px, ${c} 4px, ${c} 55%, color-mix(in srgb, ${c} 55%, #001a8c) 100%);box-shadow:0 0 36px color-mix(in srgb, ${c} 55%, transparent)"></div>`).join("");
    el.appendChild(wrap); if (nx) nx.style.zIndex = nx.style.zIndex || 31;
    return play(d, t => { const e = lerp(-BW - H * T, W + H * T, EZ.inOut(clamp(t / d))); wrap.style.transform = `translateX(${e.toFixed(1)}px) skewX(${ang}deg)`;
      if (nx) nx.style.clipPath = `polygon(${-2 * W}px 0px, ${(e - (H / 2) * T).toFixed(1)}px 0px, ${(e + (H / 2) * T).toFixed(1)}px ${H}px, ${-2 * W}px ${H}px)`; if (e > W / 2) swap(); }).then(() => { wrap.remove(); if (nx) nx.style.clipPath = ""; });
  }
  // Mark expand: the logo mark grows until it fills the frame with its colour, ready for the next scene (Echoform, Kinetik)
  function markExpand(mark, o = {}) {
    const stage = o.stage || mark.parentElement; rel(stage); const [cx, cy, w, h] = stageXY(stage, mark), cs = getComputedStyle(mark), col = o.color || (cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? cs.backgroundColor : "#ff6b3d"), r0 = parseFloat(cs.borderRadius) || 0, W = stage.clientWidth, H = stage.clientHeight, d = o.duration ?? 0.6, x0 = cx - w / 2, y0 = cy - h / 2;
    const f = document.createElement("div"); f.setAttribute("aria-hidden", "true"); f.style.cssText = `position:absolute;background:${col};z-index:30;pointer-events:none;`; stage.appendChild(f);
    return play(d, t => { const k = EZ.inOut(clamp(t / d)); Object.assign(f.style, { left: lerp(x0, 0, k) + "px", top: lerp(y0, 0, k) + "px", width: lerp(w, W, k) + "px", height: lerp(h, H, k) + "px", borderRadius: lerp(r0, 0, k) + "px" }); mark.style.visibility = "hidden"; })
      .then(() => { o.onSwap && o.onSwap(); mark.style.visibility = ""; if (o.keep) return f; return play(0.35, t => (f.style.opacity = (1 - t / 0.35).toFixed(3))).then(() => f.remove()); });
  }
  // Circle flood: a disc of colour bursts out of a point (a pressed button, say) until it covers the frame; with next, the next scene follows inside it (Onne, Vindora, Invois App)
  function circleFlood(stage, o = {}) {
    rel(stage); const W = stage.clientWidth, H = stage.clientHeight, og = o.origin, [x, y] = og && og.getBoundingClientRect ? stageXY(stage, og) : og ? (og[0] <= 1 && og[1] <= 1 ? [og[0] * W, og[1] * H] : og) : [W / 2, H / 2];
    const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 4, d = o.duration ?? 0.6, nx = o.next, lag = nx ? o.lag ?? 0.14 : 0, swap = swapper(o), f = document.createElement("div"), cp = (r) => `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
    f.setAttribute("aria-hidden", "true"); f.style.cssText = `position:absolute;inset:0;background:${o.color || "#2e5bff"};clip-path:${cp(0)};z-index:30;pointer-events:none;`; stage.appendChild(f); if (nx) { nx.style.clipPath = cp(0); nx.style.zIndex = 31; }
    return play(d + lag + 0.05, t => { f.style.clipPath = cp(R * EZ.in(clamp(t / d))); if (nx) nx.style.clipPath = cp(R * EZ.in(clamp((t - lag) / d))); if (t >= d) swap(); })
      .then(() => { if (nx) { nx.style.clipPath = ""; f.remove(); return; } if (o.keep) return f; return play(0.35, t => (f.style.opacity = (1 - t / 0.35).toFixed(3))).then(() => f.remove()); });
  }
  // Circle sweep: two large discs sweep in one after the other, cover the frame for the swap, then sweep out the other side (Gridd)
  function circleSweep(el, o = {}) {
    rel(el); const W = el.clientWidth, H = el.clientHeight, R = Math.hypot(W, H) * 0.56, d = o.duration ?? 0.55, lag = o.lag ?? 0.09, swap = swapper(o);
    const mk = (c, z) => { const n = document.createElement("div"); n.setAttribute("aria-hidden", "true"); n.style.cssText = `position:absolute;left:0;top:0;border-radius:50%;background:${c};pointer-events:none;z-index:${z};width:${2 * R}px;height:${2 * R}px;`; el.appendChild(n); return n; };
    const A = mk(o.color2 || o.color || "#354cff", 30), B = mk(o.color || "#354cff", 31), P = [[W + R, H * 0.35], [W / 2, H / 2], [-R, H * 0.65]];
    const at = (k) => { const s0 = k < 1 ? 0 : 1, q = EZ.inOut(clamp(k - s0)); return [lerp(P[s0][0], P[s0 + 1][0], q), lerp(P[s0][1], P[s0 + 1][1], q)]; };
    const pos = (n, k) => { const [x, y] = at(clamp(k, 0, 2)); n.style.transform = `translate(${(x - R).toFixed(1)}px,${(y - R).toFixed(1)}px)`; };
    return play(2 * d + lag, t => { pos(A, t / d); pos(B, (t - lag) / d); if (t >= d + lag) swap(); }).then(() => { A.remove(); B.remove(); });
  }
  const css = (c) => `rgb(${c.map(v => Math.round(v * 255)).join(",")})`;
  window.Shaderfield = { version: "2.0.0", textPanel, EFFECTS, ORDER, PALETTES, Field, mount, css, motion: { typeIn, curtain, revealWords, springFollow, rise, lineRise, cycleWords, cut, typeLines, countUp, tick, bars, focusCard, pressable, signalBars, tabMorph, maskedScroll, iris, drawFrame, drawLine, stripes, cameraPush, flash, radialReveal, penTrail, underlayReveal, typeSwap, rollWords, solve, lyricFlow, bracketHop, colorIndex, discStack, pop, shock, spectrumRing, shine, typingDots, bracketCursor, glowText, neonType, focusPull, trackIn, clickCursor, scanBeam, wire, glowHub, traceBorder, pickFocus, lockClick, pushThrough, glyphWrite, slamIn, kinetic, splitTone, colorWave, converge, slotRoll, wordTrail, marquee, underlineCycle, pillWords, odometer, toastStack, dotMorph, coverflow, cardDrift, morph, flipCard, progressButton, liveFeed, faceScan, coinPill, streak, nodeMap, promptSend, toggle, stepList, blinds, columnWipe, blockWipe, doors, beamWipe, markExpand, circleFlood, circleSweep, ease: EZ, play, loop: loopFx, TYPE_MODES: Object.keys(TYPE_MODES) } };
})();
