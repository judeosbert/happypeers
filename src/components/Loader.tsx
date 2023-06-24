import { Button, Modal } from 'antd';
import { ClipLoader } from 'react-spinners';

export default function Loader(props:any){
    
    return <Modal
    centered
    closable={false}
    open={true}
    title={
        <>
        <div className='flex flex-col justify-center items-center'>
        <ClipLoader 
            color={"#000000"}
            loading={true}
            size={30}
            />
            <p>{props.message}</p>
        </div>
        </>
    }
    footer={null}
    confirmLoading={true} />

}

export function showError(message:string){
    Modal.error({
        centered:true,
        title:"Heads Up!",
        content:message,
        okType:"danger"
    
    })
}
export function showSuccess(message:string){
    Modal.success({
        centered:true,
        title:"Great!",
        content:message,
        okType:"danger"
    })
}