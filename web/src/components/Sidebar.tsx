import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaSignOutAlt, FaChartLine, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>MedStore</h2>
            </div>
            <nav className="sidebar-nav">
                <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <FaChartLine /> Dashboard
                </Link>
                <Link to="/orders" className={`nav-item ${location.pathname === '/orders' ? 'active' : ''}`}>
                    <FaShoppingCart /> Orders
                </Link>
                <Link to="/add-medicine" className={`nav-item ${location.pathname === '/add-medicine' ? 'active' : ''}`}>
                    <FaPlus /> Add Medicine
                </Link>
                <div className="nav-divider"></div>
                <button onClick={logout} className="nav-item logout-btn">
                    <FaSignOutAlt /> Logout
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
