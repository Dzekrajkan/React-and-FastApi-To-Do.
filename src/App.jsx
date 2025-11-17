import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx"
import About from "./pages/About.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Tasks from "./pages/Tasks.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import { useEffect, useState } from "react";
import avatar_black from './assets/avatar_black.svg'
import avatar_white from './assets/avatar_white.png'
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./js/authSlice.js";
import { ThemeContext } from "./ThemeContext";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, checked } = useSelector(state => state.auth);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    dispatch(fetchMe());
  }, []);

  const handleProfile = (e) => {
    e.preventDefault();

    if (!checked) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate("/profile");
  };

  useEffect(() => {
    const checkbox = document.getElementById("switch-theme");
    if (checkbox) checkbox.checked = theme === "dark";
  }, []);

  useEffect(() => {
    document.body.className = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
    <div>
      <nav role="navigation" aria-label="Main navigation">
        <div className="brand" translate="no">Tasker</div>

        <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end>Home</NavLink>
        <NavLink to="/about" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>About Us</NavLink>
        <NavLink to="/tasks" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Tasks</NavLink>
        <label className="switch" aria-label="Switch topic" title="Switch topic">
          <input id="switch-theme" type="checkbox" onChange={toggleTheme}/>
          <span className="slider"></span>
        </label>
        <div className="avatar-container">
          <form onClick={handleProfile}>
            <img src={theme === "light" ? avatar_black : avatar_white} alt="Avatar" className="avatar"></img>
          </form>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile"element={checked ? (isAuthenticated ? <Profile /> : <Navigate to="/login" replace />) : (<div>Loading...</div>)}/>
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
      </Routes>
    </div>
    </ThemeContext.Provider>
  );
}

export default App;
