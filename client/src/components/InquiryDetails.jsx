
import { useEffect, useState } from 'react';
import {
  getInquiryById,
  updateInquiryStatus
} from '../services/api';

function InquiryDetails({ token, inquiryId, onClose, onUpdated }) {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        setError('');

        const data = await getInquiryById(token, inquiryId);

        // Support either a direct inquiry or { inquiry: ... } response.
        setInquiry(data.inquiry || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [token, inquiryId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setSaving(true);
      setError('');

      const data = await updateInquiryStatus(
        token,
        inquiryId,
        newStatus
      );

      setInquiry(data.inquiry || data);

      // Refresh the dashboard after a successful update.
      await onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="form-overlay">
        <div className="inquiry-form-card">
          <p>Loading inquiry details...</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="form-overlay">
        <div className="inquiry-form-card">
          <p className="error">{error || 'Inquiry not found.'}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-overlay">
      <div className="inquiry-form-card">
        <div className="form-heading">
          <h2>Inquiry Details</h2>
          <button
            className="close-button"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="details-content">
          <p><strong>Inquiry ID:</strong> {inquiry.id}</p>
          <p><strong>Customer:</strong> {inquiry.customer_name}</p>
          <p><strong>Contact:</strong> {inquiry.contact}</p>
          <p><strong>Subject:</strong> {inquiry.subject}</p>
          <p><strong>Description:</strong></p>
          <p>{inquiry.description}</p>
          <p><strong>Current Status:</strong> {inquiry.status}</p>
        </div>

        <div className="status-actions">
          <label htmlFor="inquiry-status">Update Status</label>

          <select
            id="inquiry-status"
            value={inquiry.status}
            disabled={saving}
            onChange={(event) => handleStatusChange(event.target.value)}
          >
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {saving && <p>Updating status...</p>}
        </div>

        <button
          className="create-button"
          onClick={onClose}
          disabled={saving}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default InquiryDetails;
