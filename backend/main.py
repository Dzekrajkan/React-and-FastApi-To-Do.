# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status, Response, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

from backend import models, schemas, auth
from backend.database import get_db, engine
from sqlalchemy.orm import Session

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Создаем таблицы (engine берется из database.py)
models.Base.metadata.create_all(bind=engine)

# читаем CORS_ORIGINS из .env (пример: http://localhost:5173,http://localhost:3000)
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
allow_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(request: Request, db: Session = Depends(get_db)):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = auth.verify_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    username = payload.get("sub")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


@app.post("/api/refresh")
def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="You are not logged in.")
    
    payload = auth.verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    username = payload.get("sub")
    new_access_token = auth.create_access_token({"sub": username})

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=False,
        samesite="lax"
    )

    return {"msg": "Access token refreshed"}


@app.post("/api/login")
async def login(response: Response, data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    if not auth.verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password or login")
    
    access_token = auth.create_access_token({"sub": user.username})
    refresh_token = auth.create_refresh_token({"sub": user.username})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=False,
        samesite="lax"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=auth.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        secure=False,
        samesite="lax"
    )

    return {"msg": "Logged in successfully"}


@app.post("/api/register")
async def register(user: schemas.UserCreate, response: Response, db: Session = Depends(get_db)):
    user_by_email = db.query(models.User).filter(models.User.email == user.email).first()
    user_by_username = db.query(models.User).filter(models.User.username == user.username).first()
    if user_by_email:
        raise HTTPException(status_code=400, detail="Email is already in use")
    if user_by_username:
        raise HTTPException(status_code=400, detail="Name already in use")
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        password=auth.hash_password(user.password1)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token({"sub": new_user.username})
    refresh_token = auth.create_refresh_token({"sub": new_user.username})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=False,
        samesite="lax"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=auth.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        secure=False,
        samesite="lax"
    )

    return {"msg": "Register in successfully"}


@app.post("/api/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", httponly=True, samesite="lax", path="/")
    response.delete_cookie("refresh_token", httponly=True, samesite="lax", path="/")
    return {"msg": "Logout successful"}


@app.get("/api/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.get("/api/task")
async def getTask(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(models.Task).filter(models.Task.owner_id == current_user.id).all()
    tasks_list = [
        {"id": task.id, "title": task.title, "description": task.description, "completed": task.completed}
        for task in tasks
    ]
    return {"message": "Tasks retrieved successfully", "tasks": tasks_list}


@app.get("/api/task/{task_id}")
async def getTaskId(task_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.owner_id == current_user.id, models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "message": "Tasks retrieved successfully",
        "task": {"id": task.id, "title": task.title, "description": task.description, "completed": task.completed}
    }


@app.patch("/api/task/{task_id}")
async def patchTaskId(task_id: int, payload: schemas.TaskUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.owner_id == current_user.id, models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return {
        "message": "Tasks updated successfully",
        "task": {"id": task.id, "title": task.title, "description": task.description, "completed": task.completed}
    }


@app.delete("/api/task/{task_id}")
async def deleteTaskId(task_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.owner_id == current_user.id, models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully", "deleted_id": task_id}


@app.post("/api/task")
async def addtask(task: schemas.TaskCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        completed=task.completed,
        owner_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return {
        "message": "Task added successfully",
        "task": {"id": db_task.id, "title": db_task.title, "description": db_task.description, "completed": db_task.completed}
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
