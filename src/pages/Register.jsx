import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { fetchRegister, setError, setSuccess } from "../js/authSlice"

function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const { error, success, loading} = useSelector(state => state.auth)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  
  useEffect(() => {
    dispatch(setError(""))
    dispatch(setSuccess(""))
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      dispatch(setError("The name must be at least 3 characters long."));
      return;
    }

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(email).trim())) {
      dispatch(setError("Incorrect email"));
      return;
    }

    if (password1.trim().length < 8) {
      dispatch(setError("The password must be at least 8 characters long."));
      return;
    }

    if (password1 !== password2) {
      dispatch(setError("The passwords don't match"));
      return;
    }
    try {
      await dispatch(fetchRegister({ username, email, password1, password2 })).unwrap()
      navigate("/profile");
    } catch (err) {
      dispatch(setError(err || "Error during registration"));
    }
};

  return (
    <div className="container">
      <div className="card">
        <h1>Registration</h1>
        <div>
            <form onSubmit={handleRegister}>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}
              {loading && <p>Loading...</p>}
              <input className='input-auth' type="text" placeholder="Username" value={username}onChange={(e) => setUsername(e.target.value)}/>
              <input className='input-auth' type="email" placeholder="Email" value={email}onChange={(e) => setEmail(e.target.value)}/>
              <input className='input-auth' type="password" placeholder="Password" value={password1} onChange={(e) => setPassword1(e.target.value)}/>
              <input className='input-auth' type="password" placeholder="Repeat password" value={password2} onChange={(e) => setPassword2(e.target.value)}/>
              <button className='button-auth' type="submit" >Register</button>
            </form>
            <h4 className='text-auth'>If you have an account, then go to the page <Link className='link-auth' to="/login">login</Link></h4>
        </div>
      </div>
    </div>
  )
}

export default Register;