import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login: authLogin, logout } = useAuth();
    const navigate = useNavigate();

    // Clear any existing token on mount to ensure fresh login
    React.useEffect(() => {
        logout();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await login(email, password);
            if (response.success) {
                authLogin(response.data.token, response.data.admin);
                navigate('/');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred during login');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h2>Admin Portal</h2>
                    <p>Sign in to manage your store</p>
                </div>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-login">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
