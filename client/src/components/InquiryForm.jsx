import { useState } from 'react';
import { createInquiry } from '../services/api';

const initialFormData = {
  customer_name: '',
  contact: '',
  subject: '',
  description: '',
};

function InquiryForm({ token, onClose, onCreated }) {
  const [formData, setFormData] = useState(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };
    
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const trimmedData = {
      customer_name: formData.customer_name.trim(),
      contact: formData.contact.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
    };

    const hasEmptyField = Object.values(trimmedData).some(
      (value) => value.length === 0
    );

    if (hasEmptyField) {
      setFormError('Please fill in all fields with valid information.');
      return;
    }

    setFormLoading(true);

    try {
      await createInquiry(token, trimmedData);
      setFormData(initialFormData);
      await onCreated();
    } catch (err) {
      setFormError(err.message || 'Unable to create inquiry');
    } finally {
      setFormLoading(false);
    }
  };


  const handleClose = () => {
    if (!formLoading) {
      onClose();
    }
  };

  return (
    <div className="form-overlay">
      <div className="inquiry-form-card">
        <div className="form-heading">
          <h2>Create New Inquiry</h2>

          <button
            type="button"
            className="close-button"
            onClick={handleClose}
            disabled={formLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="customer_name">Customer Name</label>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            placeholder="Enter customer name"
            value={formData.customer_name}
            onChange={handleChange}
            maxLength={100}
            required
          />

          <label htmlFor="contact">Contact Number / Method</label>
          <input
            id="contact"
            name="contact"
            type="text"
            placeholder="Enter contact details"
            value={formData.contact}
            onChange={handleChange}
            maxLength={30}
            required
          />

          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            placeholder="Enter inquiry subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={150}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the customer's inquiry"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />

          {formError && <p className="error">{formError}</p>}

          <button type="submit" disabled={formLoading}>
            {formLoading ? 'Creating...' : 'Create Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InquiryForm;
