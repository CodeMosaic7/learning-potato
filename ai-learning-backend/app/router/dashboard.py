from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from datetime import datetime, timedelta
from bson import ObjectId
from app.dependencies import get_db
from app.authentication.auth import get_current_user
from app.model.user_profile_model import UserProfileCreate, UserProfileOut, UserProfileDB

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", response_model=Dict[str, Any])
async def get_dashboard_overview(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get dashboard overview with user stats and profile
    """
    user_id = str(current_user["_id"])

    profiles_collection = db["user_profiles"]
    user_profile = await profiles_collection.find_one({"user_id": ObjectId(user_id)})
    
    courses_collection = db["user_courses"]
    total_courses = await courses_collection.count_documents({"user_id": ObjectId(user_id)})
    
    progress_collection = db["user_progress"]
    completed_courses = await progress_collection.count_documents({
        "user_id": ObjectId(user_id),
        "status": "completed"
    })
    in_progress = await progress_collection.count_documents({
        "user_id": ObjectId(user_id),
        "status": "in_progress"
    })
    
    return {
        "message": f"Welcome back, {current_user['name']}!",
        "user": {
            "id": user_id,
            "name": current_user["name"],
            "username": current_user["username"],
            "email": current_user["email"],
            "profile_image": current_user.get("profile_image", ""),
            "grade_level": current_user.get("grade_level", ""),
            "member_since": current_user.get("created_at").strftime("%B %Y") if current_user.get("created_at") else "Unknown"
        },
        "stats": {
            "total_courses": total_courses,
            "completed_courses": completed_courses,
            "in_progress": in_progress,
            "completion_rate": round((completed_courses / total_courses * 100), 1) if total_courses > 0 else 0
        },
        "profile_completed": user_profile is not None,
        "learning_profile": {
            "intellectual_level": user_profile.get("intellectual_level") if user_profile else None,
            "learning_style": user_profile.get("learning_style") if user_profile else None,
            "interests": user_profile.get("interests", []) if user_profile else []
        }
    }


@router.get("/profile", response_model=UserProfileOut)
async def get_user_profile(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get user's learning profile
    """
    user_id = ObjectId(current_user["_id"])
    profiles_collection = db["user_profiles"]
    
    profile = await profiles_collection.find_one({"user_id": user_id})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please create a profile first."
        )
    # Convert MongoDB document to Pydantic model
    profile["id"] = str(profile.pop("_id"))
    profile["user_id"] = str(profile["user_id"])
    
    return UserProfileOut(**profile)


@router.post("/profile", response_model=UserProfileOut, status_code=status.HTTP_201_CREATED)
async def create_user_profile(
    profile_data: UserProfileCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a new user learning profile
    """
    user_id = ObjectId(current_user["_id"])
    profiles_collection = db["user_profiles"]
    
    # Check if profile already exists
    existing_profile = await profiles_collection.find_one({"user_id": user_id})
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update."
        )
    
    # Create profile document
    profile_doc = {
        "user_id": user_id,
        "bio": profile_data.bio,
        "location": profile_data.location,
        "interests": profile_data.interests,
        "learning_goals": profile_data.learning_goals,
        "preferred_learning_style": profile_data.preferred_learning_style,
        "intellectual_level": profile_data.intellectual_level,
        "emotional_state": profile_data.emotional_state,
        "strengths": profile_data.strengths,
        "weaknesses": profile_data.weaknesses,
        "learning_style": profile_data.learning_style,
        "recommended_subjects": profile_data.recommended_subjects,
        "updated_at": datetime.now()
    }
    
    result = await profiles_collection.insert_one(profile_doc)
    
    # Return created profile
    created_profile = await profiles_collection.find_one({"_id": result.inserted_id})
    created_profile["id"] = str(created_profile.pop("_id"))
    created_profile["user_id"] = str(created_profile["user_id"])
    
    return UserProfileOut(**created_profile)


@router.put("/profile", response_model=UserProfileOut)
async def update_user_profile(
    profile_data: UserProfileCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update user's learning profile
    """
    user_id = ObjectId(current_user["_id"])
    profiles_collection = db["user_profiles"]
    
    # Check if profile exists
    existing_profile = await profiles_collection.find_one({"user_id": user_id})
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Use POST to create one."
        )
    
    # Update profile
    update_data = {
        "bio": profile_data.bio,
        "location": profile_data.location,
        "interests": profile_data.interests,
        "learning_goals": profile_data.learning_goals,
        "preferred_learning_style": profile_data.preferred_learning_style,
        "intellectual_level": profile_data.intellectual_level,
        "emotional_state": profile_data.emotional_state,
        "strengths": profile_data.strengths,
        "weaknesses": profile_data.weaknesses,
        "learning_style": profile_data.learning_style,
        "recommended_subjects": profile_data.recommended_subjects,
        "updated_at": datetime.now()
    }
    
    await profiles_collection.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    # Return updated profile
    updated_profile = await profiles_collection.find_one({"user_id": user_id})
    updated_profile["id"] = str(updated_profile.pop("_id"))
    updated_profile["user_id"] = str(updated_profile["user_id"])
    
    return UserProfileOut(**updated_profile)


@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_profile(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete user's learning profile
    """
    user_id = ObjectId(current_user["_id"])
    profiles_collection = db["user_profiles"]
    
    result = await profiles_collection.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return None


@router.get("/learning-insights")
async def get_learning_insights(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get personalized learning insights based on user profile
    """
    user_id = ObjectId(current_user["_id"])
    profiles_collection = db["user_profiles"]
    
    profile = await profiles_collection.find_one({"user_id": user_id})
    
    if not profile:
        return {
            "message": "Complete your profile to get personalized insights",
            "profile_completed": False
        }
    
    return {
        "profile_completed": True,
        "insights": {
            "intellectual_level": profile.get("intellectual_level"),
            "learning_style": profile.get("learning_style"),
            "strengths": profile.get("strengths", []),
            "areas_for_improvement": profile.get("weaknesses", []),
            "recommended_subjects": profile.get("recommended_subjects", []),
            "current_emotional_state": profile.get("emotional_state"),
        },
        "recommendations": {
            "message": "Based on your profile, we recommend focusing on these areas",
            "priority_goals": profile.get("learning_goals", [])[:3],
            "matching_courses": []  # TODO: Implement course matching logic
        }
    }


@router.get("/progress")
async def get_learning_progress(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get user's overall learning progress
    """
    user_id = ObjectId(current_user["_id"])
    progress_collection = db["user_progress"]
    
    progress_data = await progress_collection.find({"user_id": user_id}).to_list(length=100)
    
    total_courses = len(progress_data)
    completed = len([p for p in progress_data if p.get("status") == "completed"])
    in_progress = len([p for p in progress_data if p.get("status") == "in_progress"])
    
    return {
        "user_id": str(user_id),
        "summary": {
            "total_courses": total_courses,
            "completed": completed,
            "in_progress": in_progress,
            "not_started": total_courses - completed - in_progress,
            "overall_completion": round((completed / total_courses * 100), 1) if total_courses > 0 else 0
        },
        "progress_details": [
            {
                "course_id": str(p.get("course_id")),
                "status": p.get("status"),
                "progress_percentage": p.get("progress_percentage", 0),
                "last_accessed": p.get("last_accessed")
            }
            for p in progress_data
        ]
    }


@router.get("/recent-activity")
async def get_recent_activity(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db),
    limit: int = 10
):
    """
    Get user's recent learning activities
    """
    user_id = ObjectId(current_user["_id"])
    activity_collection = db["user_activity"]
    
    activities = await activity_collection.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(length=limit)
    
    return {
        "count": len(activities),
        "activities": [
            {
                "id": str(a.get("_id")),
                "activity_type": a.get("activity_type"),
                "description": a.get("description"),
                "timestamp": a.get("timestamp"),
                "course_id": str(a.get("course_id")) if a.get("course_id") else None
            }
            for a in activities
        ]
    }


@router.get("/stats/weekly")
async def get_weekly_stats(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get weekly learning statistics
    """
    user_id = ObjectId(current_user["_id"])
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    activity_collection = db["user_activity"]
    
    weekly_activities = await activity_collection.find({
        "user_id": user_id,
        "timestamp": {"$gte": start_date, "$lte": end_date}
    }).to_list(length=1000)
    
    # Group activities by day
    daily_activity = {}
    for activity in weekly_activities:
        day = activity.get("timestamp").strftime("%Y-%m-%d")
        daily_activity[day] = daily_activity.get(day, 0) + 1
    
    return {
        "period": {
            "start": start_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d")
        },
        "summary": {
            "total_activities": len(weekly_activities),
            "active_days": len(daily_activity),
            "average_daily_activities": round(len(weekly_activities) / 7, 1)
        },
        "daily_breakdown": daily_activity
    }