import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { fetchTasks, fetchAddTask, fetchDeleteTaskById, toggleTask, setFilter, setError, fetchPatchTaskById } from '../js/tasksSlice'

function Tasks() {
  const dispatch = useDispatch()
  const { tasks, filter, loading, error } = useSelector(state => state.tasks)
  const { isAuthenticated } = useSelector(state => state.auth)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setError("You must be logged in to see tasks."));
      return;
    }
      dispatch(fetchTasks());
  }, [dispatch]);

  const patchTask = async (task_id, completed) => {
    try {
      await dispatch(fetchPatchTaskById({ task_id: task_id, data: { completed: completed } })).unwrap();
    } catch (err) {
      console.error("Error patching task:", err);
    }
  };

  const addTasks = async (e) => {
    e.preventDefault();
    if (title.trim().length <= 3) {
      dispatch(setError("The task name must be at least 3 characters long."));
      return
    }
    if (description.trim().length <= 10) {
      dispatch(setError("The task description must be at least 10 characters long."));
      return 
    }
    if (!isAuthenticated) {
      dispatch(setError("You must be logged in to add tasks."));
      return;
    }
      await dispatch(fetchAddTask({ title, description, completed }));
      setCompleted(false)
      setTitle("");
      setDescription("");
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'not_completed') return !task.completed;
    return true;
  });
  
  return (
    <div className="container">
      <div className="card">
        <h1>List of tasks</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {tasks.length === 0 && !error && <p>You have no tasks</p>}
        <div className="filters" role="tablist" aria-label="Task filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => dispatch(setFilter('all'))} aria-pressed={filter === 'all'}>All</button>
          <button className={filter === 'completed' ? 'active' : ''} onClick={() => dispatch(setFilter('completed'))} aria-pressed={filter === 'completed'}>Completed</button>
          <button className={filter === 'not_completed' ? 'active' : ''} onClick={() => dispatch(setFilter('not_completed'))} aria-pressed={filter === 'not_completed'}>Not completed</button>
        </div>
          <form onSubmit={addTasks}>
            <input className='input-task' placeholder='Write the task text' type='text' value={title}onChange={(e) => setTitle(e.target.value)}></input>
            <input className='input-task' style={{ marginBottom: "10px" }} placeholder='Enter a description of the task' type='text' value={description}onChange={(e) => setDescription(e.target.value)}></input>
            <button type="submit" style={{ marginLeft: "10px" }}>Send</button>
          </form>
          <ul>
            {filteredTasks.map(task =>  
            <li key={task.id} style={{color: task.completed ? 'green' : 'red'}}>
              <span className={`toggle-indicator ${task.completed ? 'done' : 'not'}`} role="button" aria-pressed={task.completed} onClick={() => { dispatch(toggleTask(task.id)), patchTask(task.id, !task.completed)}}>
                {task.completed ? '✅ ' : '❌ '}
              </span>
                <div className="meta">
                  <div className="id">{task.id}</div>
                  <Link to={`/tasks/${task.id}`} className={task.completed ? 'striked' : ''} style={{ color: 'inherit' }}>{task.title}</Link>
                </div>
              <span className={'toggle-indicator not'} role="button" aria-pressed={task.completed} onClick={() => {dispatch(fetchDeleteTaskById({ task_id: task.id }))}}>
                🗑️
              </span>
              </li>)}
          </ul>
      </div>
    </div>
  );
}

export default Tasks;
