import uuid

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import HTTPException
from fastapi import Depends

from app.database.config import supabase
from app.middleware.jwtauth import get_current_user

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

ALLOWED_TYPES = {

    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",

    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/m4a",
}


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):

    if file.content_type not in ALLOWED_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    file_bytes = await file.read()

    if len(file_bytes) > 20 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 20 MB"
        )

    extension = file.filename.split(".")[-1]

    filename = f"{uuid.uuid4()}.{extension}"

    storage_path = f"{current_user.id}/{filename}"

    response = supabase.storage.from_("uploads").upload(

        path=storage_path,

        file=file_bytes,

        file_options={
            "content-type": file.content_type
        }

    )

    public_url = supabase.storage.from_("uploads").get_public_url(storage_path)

    supabase.table("files").insert({

        "user_id": current_user.id,

        "original_name": file.filename,

        "stored_name": filename,

        "file_type": file.content_type,

        "file_size": len(file_bytes),

        "storage_path": storage_path,

        "public_url": public_url

    }).execute()

    return {

        "message": "Upload Successful",

        "file_name": filename,

        "url": public_url

    }

@router.get("/files")
def get_files(
    current_user=Depends(get_current_user)
):

    response = (

        supabase.table("files")

        .select("*")

        .eq("user_id", current_user.id)

        .order("created_at", desc=True)

        .execute()

    )

    return response.data

@router.delete("/{file_id}")
def delete_file(
    file_id: str,
    current_user=Depends(get_current_user)
):

    file = (

        supabase.table("files")

        .select("*")

        .eq("id", file_id)

        .eq("user_id", current_user.id)

        .single()

        .execute()

    )

    if not file.data:

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )
    supabase.storage.from_("uploads").remove(
        [file.data["storage_path"]]
    )

    supabase.table("files").delete().eq(

        "id",
        file_id

    ).execute()

    return {

        "message": "File deleted successfully"

    }