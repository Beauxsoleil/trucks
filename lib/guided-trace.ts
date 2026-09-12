import type { Point, RoadBin } from './trace-geometry';
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export type GuidedState = { stroke:number; cursor:number; previous:Point|null; complete:boolean };
export const newGuidedTrace=():GuidedState=>({stroke:0,cursor:0,previous:null,complete:false});
export function guidePoint(bins:RoadBin[],state:GuidedState):Point {
  const stroke=bins.filter(b=>b.stroke===state.stroke);
  return stroke[Math.min(state.cursor,stroke.length-1)]?.start??{x:210,y:75};
}
// Progress is a prefix of the current stroke, never an unordered painted area.
export function advanceGuide(bins:RoadBin[],state:GuidedState,point:Point,transform:(p:Point)=>Point):GuidedState {
  if(state.complete)return state;
  const path=bins.filter(b=>b.stroke===state.stroke);if(!path.length)return state;
  const cursor=Math.min(state.cursor,path.length-1),anchor=transform(path[cursor].start);
  if(!state.previous)return distance(point,anchor)<=24?{...state,previous:point}:state;
  const movement=distance(point,state.previous);
  if(movement<.5)return state;
  if(movement>70)return {...state,previous:null};
  let best=Infinity,next=cursor,arc=0;
  for(let i=cursor;i<path.length;i++){
    if(i>cursor)arc+=distance(transform(path[i-1].start),transform(path[i].start));
    if(arc>Math.min(70,movement*1.5+4))break;
    const d=distance(point,transform(path[i].end));if(d<best){best=d;next=i;}
  }
  if(best>24)return {...state,previous:null};
  // Advancing requires moving forward towards the next part of the path.
  const target=transform(path[next].end),start=transform(path[next].start);
  if((point.x-state.previous.x)*(target.x-start.x)+(point.y-state.previous.y)*(target.y-start.y)<=0)return {...state,previous:point};
  if(distance(point,target)>=distance(state.previous,target))return {...state,previous:point};
  const end=transform(path[path.length-1].end);
  if(next===path.length-1&&distance(point,end)<=12){
    const stroke=state.stroke+1;
    return {stroke,cursor:0,previous:null,complete:!bins.some(b=>b.stroke===stroke)};
  }
  return {...state,cursor:Math.max(cursor,next),previous:point};
}
