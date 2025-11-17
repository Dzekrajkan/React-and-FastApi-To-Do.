import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/tasks');
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome to the assignment site!</h1>
        <p className="small">A simple demo panel for managing tasks. Click the button below to go to the list.</p>
        <div style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={handleLogin}>Go to tasks</button>
        </div>
      </div>
    </div>
  );
}
