export type DriveState = { distance: number; speed: number; height: number; verticalSpeed: number; impact?: number };
type Physics = { gravity: number; jump: number };
const flat = () => 0;
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function stepDrive(state: DriveState, gas: boolean, jump: boolean, elapsed: number, physics:Physics = { gravity: 22, jump: 9 }, ground:(distance:number)=>number=flat): DriveState {
  const duration=Number.isFinite(elapsed)?clamp(elapsed,0,.05):0;
  if(!duration)return {...state,impact:0};
  // Substeps keep slopes and landing contacts consistent at 30/60/120 Hz.
  const steps=Math.ceil(duration*120),dt=duration/steps;
  let {distance,speed,height,verticalSpeed}=state,impact=0;
  for(let i=0;i<steps;i++){
    const floor=ground(distance),slope=(ground(distance+.1)-ground(distance-.1))/.2;
    const grounded=height<=0;
    const acceleration=(gas?7:-9)-(grounded?physics.gravity*slope*.45:0);
    speed=clamp(speed+acceleration*dt,0,12);
    if(!gas&&speed<.05)speed=0;
    const nextDistance=distance+speed*dt,nextFloor=ground(nextDistance);
    if(jump&&i===0&&grounded){verticalSpeed=physics.jump+Math.max(0,slope*speed);height=.000001;}
    if(height>0){
      verticalSpeed-=physics.gravity*dt;
      const worldHeight=floor+height+verticalSpeed*dt;
      height=Math.max(0,worldHeight-nextFloor);
      if(height===0){impact=Math.max(impact,Math.max(0,slope*speed-verticalSpeed));verticalSpeed=0;}
    }else verticalSpeed=0;
    distance=nextDistance;
  }
  return {distance,speed,height,verticalSpeed,impact};
}

export type SpringState={offset:number;velocity:number};
export function stepSpring(state:SpringState,target:number,elapsed:number,impulse=0):SpringState {
  const duration=Number.isFinite(elapsed)?clamp(elapsed,0,.05):0;
  let offset=state.offset,velocity=state.velocity+clamp(impulse,-3,3);
  const steps=Math.max(1,Math.ceil(duration*120)),dt=duration/steps;
  for(let i=0;i<steps;i++){
    velocity+=((target-offset)*95-velocity*15)*dt;offset+=velocity*dt;
    if(Math.abs(offset)>.3){offset=clamp(offset,-.3,.3);velocity=0;}
  }
  return {offset,velocity};
}
