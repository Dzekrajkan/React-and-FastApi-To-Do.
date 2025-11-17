import { useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { fetchLogout, setError, setSuccess } from "../js/authSlice"
import avatar_black from '../assets/avatar_black.svg'
import avatar_white from '../assets/avatar_white.png'
import { useTheme } from "../ThemeContext";

function Profile() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { error, isAuthenticated, user } = useSelector(state => state.auth)
    const { theme } = useTheme();

    useEffect(() => {
      dispatch(setError(""))
      dispatch(setSuccess(""))
      if (!isAuthenticated) {
        navigate("/login")
      }
    }, [])

    const Logout =  async () => {
      await dispatch(fetchLogout())
      navigate("/")
    }

    if (!user) return <p>Loading...</p> 

  return (
    <div className="container" style={{ textAlign: "center" }}>
      <p>{error}</p>
      <img src={theme === "light" ? avatar_black : avatar_white} alt="Avatar" className="avatar-profile"></img>
      <h1>Profile {user.username}</h1>
      <h3>username: {user.username}</h3>
      <h3>email: {user.email}</h3>
      <button onClick={Logout}>Logout</button>
    </div>
  )
}


export default Profile