import { useState, useEffect } from 'react';
import { type Medicine, uploadImage } from '../api/medicine';
import { FaUpload, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface MedicineFormProps {
    initialData?: Partial<Medicine>;
    onSubmit: (data: Partial<Medicine>) => Promise<void>;
    isEdit?: boolean;
}

const MedicineForm = ({ initialData, onSubmit, isEdit = false }: MedicineFormProps) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<Medicine>>({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        imageUrl: '',
        prescriptionRequired: false,
        category: 'Pharmacy',
        subcategory: '',
        manufacturer: '',
        dosage: '',
        discount: 0,
        isActive: true,
        ...initialData
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const response = await uploadImage(e.target.files[0]);
                // Backend returns { success: true, data: { imageUrl: '...' } }
                if (response.data && response.data.imageUrl) {
                    setFormData(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
                }
            } catch (error) {
                alert('Image upload failed');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form className="medicine-form" onSubmit={handleSubmit}>
            <div className="form-actions-top">
                <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <button type="submit" className="btn-primary">
                    <FaSave /> {isEdit ? 'Update Medicine' : 'Save Medicine'}
                </button>
            </div>

            <div className="form-grid">
                <div className="form-group span-2">
                    <label>Medicine Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group span-2">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="form-textarea"
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label>Price</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="0"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Lab Tests">Lab Tests</option>
                        <option value="Pet Care">Pet Care</option>
                        <option value="Consults">Consults</option>
                        <option value="Wellness">Wellness</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Sub Category</label>
                    <input
                        type="text"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Manufacturer</label>
                    <input
                        type="text"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Dosage</label>
                    <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. 500mg"
                    />
                </div>

                <div className="form-group">
                    <label>Discount (%)</label>
                    <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="form-input"
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="prescriptionRequired"
                            checked={formData.prescriptionRequired}
                            onChange={handleChange}
                        />
                        Prescription Required
                    </label>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        Active Logic
                    </label>
                </div>

                <div className="form-group span-2 image-upload-section">
                    <label>Product Image</label>
                    <div className="image-uploader">
                        {formData.imageUrl && (
                            <img src={formData.imageUrl} alt="Preview" className="image-preview" />
                        )}
                        <label className="upload-btn">
                            <FaUpload /> {uploading ? 'Uploading...' : 'Choose Image'}
                            <input type="file" onChange={handleImageUpload} accept="image/*" hidden />
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default MedicineForm;
