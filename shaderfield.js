/*! Shaderfield v1.0 — live shaders + motion effects for websites and video. One file, no dependencies.
 * Fret and Skein adapted from shader.gallery (MIT, E. T. Carter). Halo and Thermal are native rewrites
 * inspired by Paper Shaders. Current, Harmonia, Mesh and motion helpers come from the Shaders Lab films.
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
  };
  const ORDER = Object.keys(EFFECTS);

  // ── WebGL renderer: one shared context, blitted into each field's 2D canvas ──
  // (browsers cap live WebGL contexts at ~8–16; sharing one keeps any number of fields alive)
  const SHARED = { canvas: null, gl: null, progs: {}, U: {} };
  function sharedGL() {
    if (SHARED.gl && !SHARED.gl.isContextLost()) return SHARED.gl;
    if (!SHARED.canvas) {
      SHARED.canvas = document.createElement("canvas");
      SHARED.canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); SHARED.gl = null; SHARED.progs = {}; });
      SHARED.canvas.addEventListener("webglcontextrestored", () => { SHARED.gl = null; SHARED.progs = {}; });
    }
    const gl = SHARED.canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false, alpha: false });
    if (!gl || gl.isContextLost()) return null;
    SHARED.gl = gl; SHARED.progs = {};
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    return gl;
  }
  function sharedProg(gl, id) {
    if (SHARED.progs[id]) return SHARED.progs[id];
    const e = EFFECTS[id];
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("[shaderfield]", id, gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, e.frag));
    gl.linkProgram(p);
    return (SHARED.progs[id] = { p, loc: gl.getAttribLocation(p, "a"), U: {} });
  }
  class GLRenderer {
    constructor(canvas) { this.kind = "gl"; this.canvas = canvas; this.ctx = canvas.getContext("2d"); }
    draw(c, id, params, palette) {
      const gl = sharedGL(); if (!gl) return;
      const sc = SHARED.canvas;
      if (sc.width < c.w || sc.height < c.h) { sc.width = Math.max(sc.width, c.w); sc.height = Math.max(sc.height, c.h); }
      const e = EFFECTS[id], pr = sharedProg(gl, id);
      gl.useProgram(pr.p);
      gl.enableVertexAttribArray(pr.loc); gl.vertexAttribPointer(pr.loc, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, c.w, c.h);
      const set = (n, v) => {
        let l = pr.U[n]; if (l === undefined) l = pr.U[n] = gl.getUniformLocation(pr.p, n);
        if (l === null) return;
        if (typeof v === "number") gl.uniform1f(l, v);
        else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
        else gl.uniform3f(l, v[0], v[1], v[2]);
      };
      set("u_time", c.t); set("u_resolution", [c.w, c.h]); set("u_pixelRatio", e.rawPr ? c.pr : Math.max(1, c.pr));
      set("u_mouse", [c.mouse[0], c.h - c.mouse[1], c.mouse[2]]);
      set("u_wc", [lerp(c.w / 2, c.mouse[0], c.mouse[2]), lerp(c.h / 2, c.h - c.mouse[1], c.mouse[2])]);
      set("u_shockC", [c.shockX, c.h - c.shockY]); set("u_shockR", c.shockR); set("u_shockA", c.shockA);
      let l = pr.U.u_palette; if (l === undefined) l = pr.U.u_palette = gl.getUniformLocation(pr.p, "u_palette");
      if (l) gl.uniform3fv(l, new Float32Array((PALETTES[palette] || PALETTES[e.palette]).flat()));
      const u = e.uniforms(c, params);
      for (const k in u) set(k, u[k]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.ctx.drawImage(sc, 0, sc.height - c.h, c.w, c.h, 0, 0, c.w, c.h);
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
      const kind = e.kind === "Canvas 2D" ? "2d" : "gl";
      if (!this.r || this.r.kind !== kind) {
        if (this.r) { this.r.destroy(); this.r.canvas.remove(); }
        const cv = document.createElement("canvas");
        cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
        this.el.insertBefore(cv, this.el.firstChild);
        this.r = kind === "2d" ? new MeshRenderer(cv) : new GLRenderer(cv);
      }
      return this;
    }
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
      const c = { t: this.clock, w, h, pr, live: !!isLive, mouse: [m.x, m.y, m.z], mouseV: m.v, shockX: (this.shock.cx ?? 0.5) * w, shockY: (this.shock.cy ?? 0.5) * h, shockR: Math.max(0, age) * Math.min(w, h) * 0.9, shockA };
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
      static get observedAttributes() { return ["effect", "palette", ...PARAM_KEYS]; }
      connectedCallback() {
        if (!this.style.display) this.style.display = "block";
        if (this.f) return;
        const params = {};
        for (const k of PARAM_KEYS) { const v = parseFloat(this.getAttribute(k)); if (!isNaN(v)) params[k] = v; }
        this.f = mount(this, { effect: this.getAttribute("effect") || "current", palette: this.getAttribute("palette"), params, interactive: this.hasAttribute("interactive") });
      }
      disconnectedCallback() { this.f && this.f.destroy(); this.f = null; }
      attributeChangedCallback(n, o, v) {
        if (!this.f || o === v) return;
        if (n === "effect") this.f.setEffect(v, this.getAttribute("palette"));
        else if (n === "palette") this.f.setPalette(v);
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

  // ── More motion from the films ──
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
  const css = (c) => `rgb(${c.map(v => Math.round(v * 255)).join(",")})`;
  window.Shaderfield = { version: "1.1.4", EFFECTS, ORDER, PALETTES, Field, mount, css, motion: { typeIn, curtain, revealWords, springFollow, rise, countUp, tick, bars, ease: EZ, play, loop: loopFx, TYPE_MODES: Object.keys(TYPE_MODES) } };
})();
