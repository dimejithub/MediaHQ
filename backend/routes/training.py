from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

# Shared database connection
from database import db

class TrainingVideoCreate(BaseModel):
    title: str
    youtube_url: str
    category: str
    duration: Optional[str] = None
    description: Optional[str] = None

class TrainingMaterialCreate(BaseModel):
    title: str
    url: str
    type: str
    category: str
    description: Optional[str] = None

# ========== TRAINING VIDEOS ==========

@router.post("/training/videos")
async def create_training_video(video: TrainingVideoCreate):
    """Create a new training video"""
    video_id = f"video_{uuid.uuid4().hex[:12]}"
    new_video = {
        "video_id": video_id,
        **video.dict(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.training_videos.insert_one(new_video)
    
    doc = await db.training_videos.find_one({"video_id": video_id}, {"_id": 0})
    return doc

@router.get("/training/videos")
async def get_training_videos():
    """Get all training videos"""
    videos = await db.training_videos.find({}, {"_id": 0}).to_list(1000)
    return videos

@router.post("/training/videos/{video_id}/complete")
async def complete_training_video(video_id: str, user_id: str):
    """Mark a training video as completed"""
    existing = await db.training_progress.find_one(
        {"user_id": user_id, "video_id": video_id},
        {"_id": 0}
    )
    
    if existing:
        await db.training_progress.update_one(
            {"user_id": user_id, "video_id": video_id},
            {"$set": {
                "completed": True,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        await db.training_progress.insert_one({
            "user_id": user_id,
            "video_id": video_id,
            "completed": True,
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Progress updated"}

@router.get("/training/progress/{user_id}")
async def get_training_progress(user_id: str):
    """Get training progress for a user"""
    progress = await db.training_progress.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    return progress

# ========== TRAINING MATERIALS ==========

@router.post("/training/materials")
async def create_training_material(material: TrainingMaterialCreate):
    """Create a new training material"""
    material_id = f"material_{uuid.uuid4().hex[:12]}"
    new_material = {
        "material_id": material_id,
        **material.dict(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.training_materials.insert_one(new_material)
    
    doc = await db.training_materials.find_one({"material_id": material_id}, {"_id": 0})
    return doc

@router.get("/training/materials")
async def get_training_materials(category: Optional[str] = None):
    """Get all training materials, optionally filtered by category"""
    query = {"category": category} if category else {}
    materials = await db.training_materials.find(query, {"_id": 0}).to_list(1000)
    return materials

@router.delete("/training/materials/{material_id}")
async def delete_training_material(material_id: str):
    """Delete a training material"""
    result = await db.training_materials.delete_one({"material_id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted"}
