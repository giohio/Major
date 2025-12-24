"""
Test review routes
"""
import pytest
import json


class TestReviewRoutes:
    """Test doctor review endpoints"""
    
    def test_get_doctor_reviews(self, client, sample_doctor):
        """Test getting reviews for a doctor"""
        response = client.get(f'/api/reviews/doctor/{sample_doctor.id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reviews' in data
        assert isinstance(data['reviews'], list)
    
    def test_get_review_stats(self, client, sample_doctor):
        """Test getting review statistics"""
        response = client.get(f'/api/reviews/doctor/{sample_doctor.id}/stats')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'average_rating' in data
        assert 'review_count' in data
    
    def test_create_review(self, client, auth_headers, sample_doctor, app):
        """Test creating a review"""
        response = client.post(f'/api/reviews/doctor/{sample_doctor.id}',
            headers=auth_headers,
            json={
                'rating': 5,
                'review_text': 'Excellent doctor, very professional!',
                'professionalism': 5,
                'communication': 5,
                'effectiveness': 5
            }
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['message'] == 'Review submitted successfully'
    
    def test_create_review_invalid_rating(self, client, auth_headers, sample_doctor):
        """Test creating review with invalid rating"""
        response = client.post(f'/api/reviews/doctor/{sample_doctor.id}',
            headers=auth_headers,
            json={
                'rating': 6,  # Invalid rating
                'review_text': 'Good'
            }
        )
        
        assert response.status_code == 400
    
    def test_get_doctor_availability(self, client, sample_doctor):
        """Test getting doctor available slots"""
        # Use the existing slots endpoint instead of non-existent availability endpoint
        response = client.get(f'/api/reviews/doctor/{sample_doctor.id}/slots?date=2024-03-01')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'slots' in data
