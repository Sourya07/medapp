import { FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { type Medicine } from '../api/medicine';
import { useNavigate } from 'react-router-dom';

interface MedicineCardProps {
    medicine: Medicine;
    onDelete: (id: string) => void;
}

const MedicineCard = ({ medicine, onDelete }: MedicineCardProps) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/edit-medicine/${medicine._id}`);
    };

    return (
        <div className="medicine-card">
            <div className="card-image">
                {medicine.imageUrl ? (
                    <img src={medicine.imageUrl} alt={medicine.name} />
                ) : (
                    <div className="placeholder-image">No Image</div>
                )}
                {medicine.quantity < 10 && (
                    <div className="low-stock-badge">
                        <FaExclamationTriangle /> Low Stock
                    </div>
                )}
            </div>
            <div className="card-content">
                <div className="card-header">
                    <h3>{medicine.name}</h3>
                    <span className="price">${medicine.price}</span>
                </div>
                <p className="description">{medicine.description.substring(0, 60)}...</p>
                <div className="card-details">
                    <span className="badge category">{medicine.category}</span>
                    <span className="stock">Stock: {medicine.quantity}</span>
                </div>
                <div className="card-actions">
                    <button className="btn-icon edit" onClick={handleEdit}>
                        <FaEdit />
                    </button>
                    <button className="btn-icon delete" onClick={() => onDelete(medicine._id)}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicineCard;
