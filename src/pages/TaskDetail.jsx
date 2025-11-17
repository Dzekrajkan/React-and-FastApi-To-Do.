import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { fetchTaskById, toggleTask , fetchPatchTaskById } from '../js/tasksSlice'

function TaskDetail() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { tasks, loading, error } = useSelector(state => state.tasks);
  const task = tasks.find(t => t.id === parseInt(id));

  useEffect(() => {
      if (!task) {
       dispatch(fetchTaskById({ task_id: parseInt(id) }))
      }
  }, [dispatch, id, task])

  const patchTask = async () => {
    try {
      await dispatch(fetchPatchTaskById({ task_id: parseInt(id), data: { completed: !task.completed } })).unwrap();
    } catch (err) {
      console.error("Error patching task:", err);
    }
  };

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;
  if (error) return <div className="container"><div className="card" style={{ color: "red" }}>{error}</div></div>;
  if (!task) return <div className="container"><div className="card">Task not found</div></div>;

  return (
    <div className="container">
      <div className="card task-detail">
        <h1>Task details #{task.id}</h1>
        <p style={{ color: task.completed ? 'green' : 'red' }}>
          {task.completed ? '✅ Completed' : '❌ Not completed'}
        </p>
        <p>{task.title}</p>
        <p>{task.description}</p>
        <button onClick={() => { dispatch(toggleTask(task.id)), patchTask()}}>Switch status</button>
      </div>
    </div>
  );
}

export default TaskDetail;
