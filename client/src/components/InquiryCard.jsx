function InquiryCard({ inquiry, onView }) {
  const statusClass = inquiry.status.toLowerCase().replace(' ', '-');

  return (
    <article className="inquiry-card">
      <div className="inquiry-card-header">
        <h3>{inquiry.subject}</h3>

        <span className={`status status-${statusClass}`}>
          {inquiry.status}
        </span>
      </div>

      <p>
        <strong>Customer:</strong> {inquiry.customer_name}
      </p>

      <p>
        <strong>Contact:</strong> {inquiry.contact}
      </p>

      <p className="description">{inquiry.description}</p>

      <small>Inquiry #{inquiry.id}</small>

    <div>
      <button
        className="refresh-button"
        onClick={() => onView(inquiry.id)}
      >
        View Details
      </button>
    </div>


    </article>
  );
}

export default InquiryCard;
