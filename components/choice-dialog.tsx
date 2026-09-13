'use client';
import {useEffect,useRef,type ReactNode} from 'react';
export function ChoiceDialog({label,onClose,children}:{label:string;onClose:()=>void;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const element=dialog.current!;element.showModal();return()=>element.close();},[]);
 return <dialog ref={dialog} className="choice-screen" aria-label={label} onCancel={e=>{e.preventDefault();onClose()}}>{children}</dialog>;
}
