import { FileUpload } from "../components/upload/FileUpload";
import { documentApi } from "../api/documentApi";
import { useState } from "react";

export function UploadPage () {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpload = async (file: File) => {
        setIsSubmitting(true)

        try{
            await documentApi.uploadPolicy(file)
        } catch (err) {
            console.error('Error uploading file:', err)
            throw Error;
        } finally {
            setIsSubmitting(false)
        }
    }
    return(
        <>
            <FileUpload 
            onSubmit={handleUpload}
            isSubmitting={isSubmitting}
            />
        </>
    )
}

