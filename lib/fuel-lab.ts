export const MATERIAL={empty:0,sand:1,water:2,ice:3,crystal:4,bubble:5,steam:6,mud:7,wall:8} as const;
export type Material=typeof MATERIAL[keyof typeof MATERIAL];
export type Temperature='off'|'warm'|'cool';
export const LAB_COLORS=['#e5f6fc','#e9bb58','#349fe4','#b8edfa','#a371e8','#e0a9ff','#f7fbff','#98734a','#466579'];
export class FuelLab {
  readonly cells:Uint8Array;readonly age:Uint16Array;private visited:Uint8Array;
  energy=0;ticks=0;temperature:Temperature='off';discoveries=new Set<string>();
  readonly width:number;readonly height:number;private random:()=>number;
  constructor(width=128,height=88,random:()=>number=Math.random){
    this.width=width;this.height=height;this.random=random;
    this.cells=new Uint8Array(width*height);this.age=new Uint16Array(width*height);this.visited=new Uint8Array(width*height);this.reset();
  }
  reset(){this.cells.fill(0);this.age.fill(0);this.energy=0;this.ticks=0;this.temperature='off';this.discoveries.clear();
    for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++)if(x===0||x===this.width-1||y===this.height-1)this.cells[y*this.width+x]=MATERIAL.wall;
  }
  paint(x:number,y:number,material:Material,radius=3){
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
      const px=Math.round(x)+dx,py=Math.round(y)+dy;if(dx*dx+dy*dy>radius*radius||px<1||px>=this.width-1||py<2||py>=this.height-1)continue;
      const i=py*this.width+px;if(material===0||this.cells[i]===0){this.cells[i]=material;this.age[i]=0;}
    }
  }
  private move(a:number,b:number){
    [this.cells[a],this.cells[b]]=[this.cells[b],this.cells[a]];[this.age[a],this.age[b]]=[this.age[b],this.age[a]];this.visited[a]=1;this.visited[b]=1;
  }
  step(){
    this.ticks++;this.visited.fill(0);
    for(let y=this.height-2;y>=0;y--)for(let scan=1;scan<this.width-1;scan++){
      const x=this.ticks%2?scan:this.width-1-scan,i=y*this.width+x,t=this.cells[i];
      if(!t||t===MATERIAL.wall||this.visited[i])continue;
      this.visited[i]=1;this.age[i]++;
      if(t===MATERIAL.bubble&&y<=2){this.cells[i]=0;this.energy=Math.min(100,this.energy+2);this.discoveries.add('power');continue;}
      const neighbors=[i-1,i+1,i-this.width,i-this.width-1,i-this.width+1,i+this.width,i+this.width-1,i+this.width+1].filter(j=>j>=0&&j<this.cells.length);
      const water=neighbors.find(j=>this.cells[j]===MATERIAL.water);
      if(t===MATERIAL.crystal&&water!==undefined){this.cells[i]=MATERIAL.bubble;this.cells[water]=MATERIAL.bubble;this.age[i]=0;this.age[water]=0;this.visited[water]=1;this.discoveries.add('fizz');continue;}
      if(t===MATERIAL.sand&&water!==undefined){this.cells[i]=MATERIAL.mud;this.cells[water]=0;this.discoveries.add('mud');continue;}
      const onPad=y>=this.height-10;
      if(onPad&&this.temperature==='warm'&&this.age[i]>20&&(t===MATERIAL.ice||t===MATERIAL.water)){
        this.cells[i]=t===MATERIAL.ice?MATERIAL.water:MATERIAL.steam;this.age[i]=0;this.discoveries.add(t===MATERIAL.ice?'melt':'steam');continue;
      }
      if(onPad&&this.temperature==='cool'&&t===MATERIAL.water){this.cells[i]=MATERIAL.ice;this.discoveries.add('freeze');continue;}
      if(t===MATERIAL.steam&&(this.age[i]>100||this.temperature==='cool')){this.cells[i]=MATERIAL.water;this.age[i]=0;this.discoveries.add('condense');continue;}
      if(t===MATERIAL.ice&&y>0&&this.cells[i-this.width]===MATERIAL.water){this.move(i,i-this.width);continue;}
      if(t===MATERIAL.ice&&onPad)continue;
      if(t===MATERIAL.mud&&this.ticks%3)continue;
      const rising=t===MATERIAL.bubble||t===MATERIAL.steam,dy=rising?-1:1,ny=y+dy;
      if(ny<0){if(t===MATERIAL.steam){this.cells[i]=MATERIAL.water;this.age[i]=0;}continue;}
      if(ny>=this.height)continue;
      const direction=this.random()<.5?-1:1;
      const canMove=(j:number)=>this.cells[j]===0||(!rising&&t!==MATERIAL.water&&t!==MATERIAL.ice&&this.cells[j]===MATERIAL.water)||(rising&&this.cells[j]===MATERIAL.water)||(t===MATERIAL.water&&this.cells[j]===MATERIAL.ice);
      const below=i+dy*this.width;
      if(canMove(below)){this.move(i,below);continue;}
      let moved=false;
      for(const d of [direction,-direction]){const nx=x+d,j=below+d;if(nx>0&&nx<this.width-1&&canMove(j)){this.move(i,j);moved=true;break;}}
      if(!moved&&(t===MATERIAL.water||rising))for(const d of [direction,-direction]){const nx=x+d,j=i+d;if(nx>0&&nx<this.width-1&&this.cells[j]===0){this.move(i,j);break;}}
    }
  }
  usePower(){if(this.energy<30)return false;this.energy-=30;return true;}
}
export type LabTruck={x:number;speed:number;height:number;vy:number;running:boolean;finished:boolean};
export const newLabTruck=():LabTruck=>({x:0,speed:0,height:0,vy:0,running:false,finished:false});
export function stepLabTruck(state:LabTruck,dt:number):LabTruck {
  if(!state.running)return state;dt=Math.min(.05,Math.max(0,dt));
  const speed=Math.min(44,state.speed+24*dt),x=Math.min(100,state.x+speed*dt);
  let vy=state.vy-95*dt,height=Math.max(0,state.height+vy*dt);
  if(state.x<43&&x>=43&&state.height===0){vy=40;height=.01;}
  if(height===0)vy=0;
  return {x,speed,height,vy,running:x<100,finished:x>=100};
}
