"""
Test doctor routes
"""
import pytest
import json


class TestDoctorRoutes:
    """Test doctor-related endpoints"""
    
    def test_list_doctors(self, client, auth_headers):
        """Test listing all doctors"""
        response = client.get('/api/doctors', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'doctors' in data
        assert isinstance(data['doctors'], list)
    
    def test_get_doctor_profile(self, client, auth_headers, sample_doctor):
        """Test getting specific doctor profile"""
        response = client.get(f'/api/doctors/{sample_doctor.id}', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == sample_doctor.id
    
    def test_doctor_dashboard(self, client, doctor_auth_headers):
        """Test doctor dashboard access"""
        response = client.get('/api/doctors/dashboard', 
                            headers=doctor_auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        # Dashboard returns: patient_count, active_alerts, upcoming_sessions, recent_notes
        assert 'patient_count' in data
        assert 'active_alerts' in data
    
    def test_doctor_patients(self, client, doctor_auth_headers):
        """Test getting doctor's patients"""
        response = client.get('/api/doctors/patients',
                            headers=doctor_auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'patients' in data
    
    def test_non_doctor_access_dashboard(self, client, auth_headers):
        """Test non-doctor cannot access doctor dashboard"""
        response = client.get('/api/doctors/dashboard',
                            headers=auth_headers)
        
        assert response.status_code == 403
