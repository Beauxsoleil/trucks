export function LabIcon({kind}:{kind:number}){
 return <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true" fill="none" stroke="#193c50" strokeWidth="2.5" strokeLinejoin="round">
  {kind===2?<path d="M24 4C19 14 10 21 10 30a14 14 0 0028 0C38 21 29 14 24 4Z" fill="#49b3ed"/>:
   kind===1?<><path d="M5 39L24 12L43 39Z" fill="#e9bb58"/><path d="M12 31h24M20 22h8"/></>:
   kind===3?<><path d="M7 14L24 5L41 14V35L24 44L7 35Z" fill="#b8edfa"/><path d="M7 14L24 23L41 14M24 23V44"/></>:
   kind===4?<><path d="M15 5H33L43 20L24 44L5 20Z" fill="#ac78e4"/><path d="M5 20H43M15 5L19 20L24 44L29 20L33 5"/></>:
   kind===8?<><path d="M5 9H43V39H5Z" fill="#819aa8"/><path d="M5 24H43M24 9V24M15 24V39M34 24V39"/></>:
   kind===0?<><path d="M7 30L25 9L42 24L29 39H17Z" fill="#f4a2a0"/><path d="M18 17L35 32M28 40H45"/></>:
   <><path d="M17 4H31M20 4V18L7 38Q5 44 12 44H36Q43 44 41 38L28 18V4" fill="#dff5fa"/><path d="M13 30H35L41 39Q42 44 36 44H12Q5 44 7 39Z" fill="#ac78e4"/><circle cx="21" cy="34" r="2" fill="white"/><circle cx="27" cy="24" r="2" fill="white"/></>}
 </svg>;
}
