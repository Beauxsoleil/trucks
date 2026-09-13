'use client';
import {useState,type ReactNode} from 'react';
export function ChoicePager({items,onChoose}:{items:{id:string;label:string;icon?:ReactNode}[];onChoose:(id:string)=>void}){
 const [page,setPage]=useState(0),size=4,pages=Math.max(1,Math.ceil(items.length/size)),current=Math.min(page,pages-1);
 return <><div className="paged-choices">{items.slice(current*size,current*size+size).map(item=><button key={item.id} className="trace-button" onClick={()=>onChoose(item.id)}>{item.icon}{item.label}</button>)}</div><nav className="page-buttons" aria-label="Choice pages"><button className="trace-button" disabled={current===0} onClick={()=>setPage(current-1)}>← Back</button><span>{current+1} / {pages}</span><button className="trace-button" disabled={current===pages-1} onClick={()=>setPage(current+1)}>More →</button></nav></>;
}
