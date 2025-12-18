import { useEffect, useState } from 'react';
import MedicineForm from '../components/MedicineForm';
import { updateMedicine, getMedicineById, type Medicine } from '../api/medicine';
import { useNavigate, useParams } from 'react-router-dom';

const EditMedicine = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [medicine, setMedicine] = useState<Medicine | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedicine = async () => {
            if (!id) return;
            try {
                const response = await getMedicineById(id);
                // response.data or response directly?
                // backend getMedicineById returns { success, data }
                if (response.success) {
                    setMedicine(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch medicine', error);
                alert('Could not load medicine details');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchMedicine();
    }, [id, navigate]);

    const handleSubmit = async (data: Partial<Medicine>) => {
        if (!id) return;
        try {
            await updateMedicine(id, data);
            alert('Medicine updated successfully!');
            navigate('/');
        } catch (error) {
            console.error('Failed to update medicine', error);
            alert('Failed to update medicine.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!medicine) return <div>Medicine not found</div>;

    return (
        <div className="page-container">
            <h1>Edit Medicine</h1>
            <div className="card-container">
                <MedicineForm initialData={medicine} onSubmit={handleSubmit} isEdit />
            </div>
        </div>
    );
};

export default EditMedicine;
