
import { useCallback, useEffect, useState } from 'react';

import InquiryCard from './InquiryCard';
import InquiryForm from './InquiryForm';
import InquiryDetails from './InquiryDetails';
import { getInquiries } from '../services/api';

function Dashboard({ user, token, onLogout }) {
  const [inquiries, setInquiries] = useState([]);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [selectedInquiryId, setSelectedInquiryId] = useState(null);

  const fetchInquiries = useCallback(async () => {
    setInquiryLoading(true);
    setInquiryError('');

    try {
      const records = await getInquiries(token, { search, status });
      setInquiries(records);
    } catch (err) {
      setInquiryError(err.message || 'Unable to load inquiries');
    } finally {
      setInquiryLoading(false);
    }
  }, [token, search, status]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleInquiryCreated = async () => {
    setShowForm(false);
    await fetchInquiries();
  };

  const handleViewInquiry = (inquiryId) => {
    setSelectedInquiryId(inquiryId);
  };

  const handleInquiryUpdated = async () => {
    await fetchInquiries();
  };

  const handleCloseDetails = () => {
    setSelectedInquiryId(null);
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <h2>Coffee Ninja</h2>

        <div className="user-info">
          <span>{user.name}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <h1>Customer Inquiries</h1>
            <p>Manage and track customer inquiries.</p>
          </div>

          <div className="dashboard-actions">
            <button
              className="refresh-button"
              onClick={fetchInquiries}
              disabled={inquiryLoading}
            >
              {inquiryLoading ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              className="create-button"
              onClick={() => setShowForm(true)}
            >
              + New Inquiry
            </button>
          </div>
        </div>

        {showForm && (
          <InquiryForm
            token={token}
            onClose={() => setShowForm(false)}
            onCreated={handleInquiryCreated}
          />
        )}

        {selectedInquiryId !== null && (
          <InquiryDetails
            token={token}
            inquiryId={selectedInquiryId}
            onClose={handleCloseDetails}
            onUpdated={handleInquiryUpdated}
          />
        )}

        <div className="filters">
          <input
            type="text"
            placeholder="Search customer or subject..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {inquiryError && <p className="error">{inquiryError}</p>}

        {inquiryLoading ? (
          <p className="message">Loading inquiries...</p>
        ) : inquiryError ? null : inquiries.length === 0 ? (
          <p className="message">No inquiries found.</p>
        ) : (
          <div className="inquiry-list">
            {inquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                onView={handleViewInquiry}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
