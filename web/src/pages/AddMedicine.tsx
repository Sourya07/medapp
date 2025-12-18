import MedicineForm from '../components/MedicineForm';
import { createMedicine, type Medicine } from '../api/medicine';
import { useNavigate } from 'react-router-dom';

const AddMedicine = () => {
    const navigate = useNavigate();

    const handleSubmit = async (data: Partial<Medicine>) => {
        try {
            await createMedicine(data);
            alert('Medicine added successfully!');
            navigate('/');
        } catch (error) {
            console.error('Failed to create medicine', error);
            alert('Failed to create medicine.');
        }
    };

    return (
        <div className="page-container">
            <h1>Add New Medicine</h1>
            <div className="card-container">
                <MedicineForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default AddMedicine;
