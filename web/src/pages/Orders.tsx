import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, type Order } from '../api/order';
import { FaSearch } from 'react-icons/fa';

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const statusOptions = ['Pending', 'Ready', 'Picked Up', 'Cancelled'];
    const tabs = ['All', ...statusOptions];

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrders(activeTab);
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
                await updateOrderStatus(id, newStatus);
                fetchOrders(); // Refresh list
            }
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'var(--warning)';
            case 'Ready': return 'var(--success)';
            case 'Picked Up': return 'var(--primary)';
            case 'Cancelled': return 'var(--danger)';
            default: return 'var(--text-light)';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.mobileNumber.includes(searchTerm)
    );

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h1>Orders Management</h1>
                    <p className="subtitle">Manage and track customer orders</p>
                </div>
                <div className="header-actions">
                    <span className="order-count">Total: {orders.length}</span>
                </div>
            </div>

            <div className="orders-controls">
                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="search-bar">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by ID or Mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="empty-state">No orders found.</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Address</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Items</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order._id}>
                                    <td className="font-mono text-sm">{order._id.slice(-6)}</td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <div className="customer-info">
                                            <div className="font-medium">{order.deliveryAddress?.fullName || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{order.deliveryAddress?.phoneNumber || order.user?.mobileNumber}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="address-cell">
                                            {order.deliveryAddress ? (
                                                <>
                                                    <div className="font-medium">{order.deliveryAddress.name}</div>
                                                    <div className="text-sm">{order.deliveryAddress.addressLine1}</div>
                                                    {order.deliveryAddress.landmark && (
                                                        <div className="text-xs text-gray-500">Near {order.deliveryAddress.landmark}</div>
                                                    )}
                                                    <div className="text-xs text-gray-500">{order.deliveryAddress.pincode}</div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">No Address</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="font-bold">₹{order.totalPrice}</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{
                                                backgroundColor: `${getStatusColor(order.status)}20`,
                                                color: getStatusColor(order.status)
                                            }}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="items-preview">
                                            {order.items.length} items
                                            <span className="tooltip">
                                                {order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            className="status-select"
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
