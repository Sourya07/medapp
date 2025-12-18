import { useEffect, useState } from 'react';
import { getMedicines, deleteMedicine, type Medicine } from '../api/medicine';
import MedicineCard from '../components/MedicineCard';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await getMedicines(searchTerm);
            // Assuming the API returns { success: true, data: [...] } or just [...]
            // My previous mock implementation returned response.data directly.
            // Let's assume response.data is the list or object containing list.
            // If API returns { success: true, data: [...] }, getMedicines returns that object.
            // Let's adjust based on typical pattern. I wrote getMedicines returning response.data
            // Backend medicineController searchMedicines returns { success: true, count, data: [] }
            // So response.data in axios was the whole JSON.
            // So `data` variable here will be the whole JSON.
            // Wait, getMedicines returns `response.data`.
            // So `const res = await getMedicines()` -> res = { success: true, data: [...] }
            if (response.success) {
                setMedicines(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch medicines', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMedicines();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await deleteMedicine(id);
                fetchMedicines(); // Refresh list
            } catch (error) {
                alert('Failed to delete medicine');
            }
        }
    };

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <Link to="/add-medicine" className="btn-primary">
                    <FaPlus /> Add Medicine
                </Link>
            </div>

            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="medicine-grid">
                    {medicines.map((med) => (
                        <MedicineCard key={med._id} medicine={med} onDelete={handleDelete} />
                    ))}
                    {medicines.length === 0 && (
                        <div className="no-results">No medicines found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
