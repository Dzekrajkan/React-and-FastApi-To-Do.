import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { fetchLogin, setError, setSuccess } from "../js/authSlice"

function Login() {
  const dispatch = useDispatch()
  const { error, success, loading } = useSelector(state => state.auth)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setError(""))
    dispatch(setSuccess(""))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      dispatch(setError("The name must be at least 3 characters long."));
      return;
    }

    if (password.trim().length < 8) {
      dispatch(setError("The password must be at least 8 characters long."));
      return;
    }
    try {
      await dispatch(fetchLogin({ username, password })).unwrap();
      navigate("/profile");
    } catch (err) {
      dispatch(setError(err || "Login error"));
    }
};

  return (
    <div className="container">
      <div className="card">
        <h1>Login</h1>
        <div>
            <form onSubmit={handleLogin}>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}
              {loading && <p>Loading...</p>}
              <input className='input-auth' type="text" placeholder="Username" value={username}onChange={(e) => setUsername(e.target.value)}/>
              <input className='input-auth' type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
              <button className='button-auth' type="submit">Login</button>
            </form>
            <h4 className='text-auth'>If you don't have an account, then go to the page <Link className='link-auth' to="/register">registration</Link></h4>
        </div>
      </div>
    </div>
  )
}

export default Login;