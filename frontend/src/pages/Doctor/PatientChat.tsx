import { useParams } from 'react-router-dom';
import '../Page.css';

const PatientChat = () => {
  const { patientId } = useParams();
  
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title"><span className="page-icon">💬</span> Chat với bệnh nhân</h1>
        <p className="page-description">Bệnh nhân #{patientId}</p>
      </div>
      <div className="page-content">
        <div className="placeholder-card">
          <div className="placeholder-icon">💬</div>
          <h3>Chat với bệnh nhân</h3>
          <p>Tính năng đang được phát triển</p>
        </div>
      </div>
    </div>
  );
};

export default PatientChat;
