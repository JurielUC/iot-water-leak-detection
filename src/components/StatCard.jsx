const StatCard = ({ title, value, subtitle }) => {
    return (
      <div className="modern-card stat-card">
        <div className="card-top-line" />
        <p className="card-title">{title}</p>
        <h3 className="card-value">{value}</h3>
        <p className="card-subtitle">{subtitle}</p>
      </div>
    );
  };
  
  export default StatCard;