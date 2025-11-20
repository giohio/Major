import { Outlet } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import './DoctorLayout.css';

const DoctorLayout = () => {
  return (
    <div className="doctor-layout">
      <DoctorSidebar />
      <div className="doctor-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorLayout;
