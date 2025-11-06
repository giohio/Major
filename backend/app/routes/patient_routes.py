"""
Patient routes for managing patient records and psychological tests
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from datetime import datetime

from app.models.models import User, PatientRecord, PsychologicalTest
from app.extensions import db
from app.middleware.role_middleware import role_required
from app.schemas.patient_schemas import (
    CreatePatientRecordSchema,
    UpdatePatientRecordSchema,
    CreatePsychologicalTestSchema,
    SubmitTestResponseSchema
)

patient_bp = Blueprint('patient', __name__, url_prefix='/api/patient')

# Initialize schemas
create_record_schema = CreatePatientRecordSchema()
update_record_schema = UpdatePatientRecordSchema()
create_test_schema = CreatePsychologicalTestSchema()
submit_test_schema = SubmitTestResponseSchema()


@patient_bp.route('/records', methods=['GET'])
@jwt_required()
def get_patient_records():
    """
    Get patient records
    - Users see their own records
    - Doctors see records they created
    - Admins see all records
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20)
    - patient_id: Filter by patient (doctors/admins only)
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        if user.role == 'user':
            # Users see their own records
            query = PatientRecord.query.filter_by(patient_id=user_id)
        elif user.role == 'doctor':
            # Doctors see records they created
            patient_id = request.args.get('patient_id', type=int)
            if patient_id:
                query = PatientRecord.query.filter_by(
                    doctor_id=user_id,
                    patient_id=patient_id
                )
            else:
                query = PatientRecord.query.filter_by(doctor_id=user_id)
        else:  # admin
            patient_id = request.args.get('patient_id', type=int)
            if patient_id:
                query = PatientRecord.query.filter_by(patient_id=patient_id)
            else:
                query = PatientRecord.query
        
        query = query.order_by(PatientRecord.created_at.desc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'records': [record.to_dict() for record in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/records/<int:record_id>', methods=['GET'])
@jwt_required()
def get_patient_record(record_id):
    """Get specific patient record"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        record = PatientRecord.query.get(record_id)
        
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        # Check permission
        if user.role == 'user' and record.patient_id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        elif user.role == 'doctor' and record.doctor_id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        return jsonify(record.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/records', methods=['POST'])
@jwt_required()
@role_required(['doctor', 'admin'])
def create_patient_record():
    """
    Create a patient record (doctors only)
    
    Request body:
    {
        "patient_id": 1,  # Not needed if creating for self
        "diagnosis": "Major Depressive Disorder",
        "symptoms": "Persistent sadness, loss of interest",
        "treatment_plan": "CBT therapy, medication",
        "medications": "Sertraline 50mg daily",
        "allergies": "None known",
        "medical_history": "No prior mental health treatment",
        "notes": "Patient is cooperative"
    }
    """
    try:
        data = create_record_schema.load(request.json)
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # For doctors, they must specify patient_id
        # For creating own record, patient_id = user_id
        patient_id = request.json.get('patient_id', user_id)
        
        # Check if patient exists
        patient = User.query.get(patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Create record
        record = PatientRecord(
            patient_id=patient_id,
            doctor_id=user_id if user.role == 'doctor' else None,
            diagnosis=data['diagnosis'],
            symptoms=data.get('symptoms'),
            treatment_plan=data.get('treatment_plan'),
            medications=data.get('medications'),
            allergies=data.get('allergies'),
            medical_history=data.get('medical_history'),
            notes=data.get('notes'),
            status='active'
        )
        
        db.session.add(record)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient record created successfully',
            'record': record.to_dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/records/<int:record_id>', methods=['PUT'])
@jwt_required()
@role_required(['doctor', 'admin'])
def update_patient_record(record_id):
    """Update patient record (doctors only)"""
    try:
        data = update_record_schema.load(request.json)
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        record = PatientRecord.query.get(record_id)
        
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        # Check permission
        if user.role == 'doctor' and record.doctor_id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Update fields
        for field, value in data.items():
            if hasattr(record, field):
                setattr(record, field, value)
        
        record.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Record updated successfully',
            'record': record.to_dict()
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/records/<int:record_id>', methods=['DELETE'])
@jwt_required()
@role_required(['doctor', 'admin'])
def delete_patient_record(record_id):
    """Delete patient record (doctors only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        record = PatientRecord.query.get(record_id)
        
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        # Check permission
        if user.role == 'doctor' and record.doctor_id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({'message': 'Record deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/tests', methods=['GET'])
@jwt_required()
def get_psychological_tests():
    """
    Get psychological tests
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20)
    - test_type: Filter by type (optional)
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Users see their own tests, doctors/admins see all
        if user.role == 'user':
            query = PsychologicalTest.query.filter_by(user_id=user_id)
        else:
            user_filter = request.args.get('user_id', type=int)
            if user_filter:
                query = PsychologicalTest.query.filter_by(user_id=user_filter)
            else:
                query = PsychologicalTest.query
        
        # Filter by test type
        test_type = request.args.get('test_type')
        if test_type:
            query = query.filter_by(test_type=test_type)
        
        query = query.order_by(PsychologicalTest.created_at.desc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'tests': [test.to_dict() for test in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/tests/<int:test_id>', methods=['GET'])
@jwt_required()
def get_psychological_test(test_id):
    """Get specific psychological test"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        test = PsychologicalTest.query.get(test_id)
        
        if not test:
            return jsonify({'error': 'Test not found'}), 404
        
        # Check permission
        if user.role == 'user' and test.user_id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        return jsonify(test.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/tests', methods=['POST'])
@jwt_required()
@role_required(['doctor', 'admin'])
def create_psychological_test():
    """
    Create a psychological test (doctors/admins only)
    
    Request body:
    {
        "test_name": "Beck Depression Inventory",
        "test_type": "depression",
        "description": "21-question assessment",
        "questions": [
            {
                "id": 1,
                "question": "How do you feel?",
                "type": "multiple_choice",
                "options": ["Happy", "Sad", "Neutral"]
            }
        ]
    }
    """
    try:
        data = create_test_schema.load(request.json)
        
        test = PsychologicalTest(
            test_name=data['test_name'],
            test_type=data['test_type'],
            description=data.get('description'),
            questions=data['questions']
        )
        
        db.session.add(test)
        db.session.commit()
        
        return jsonify({
            'message': 'Test created successfully',
            'test': test.to_dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@patient_bp.route('/tests/<int:test_id>/submit', methods=['POST'])
@jwt_required()
def submit_test_response(test_id):
    """
    Submit test response
    
    Request body:
    {
        "test_id": 1,
        "responses": {
            "1": "Happy",
            "2": "Sometimes"
        }
    }
    """
    try:
        data = submit_test_schema.load(request.json)
        
        user_id = get_jwt_identity()
        
        test = PsychologicalTest.query.get(test_id)
        
        if not test:
            return jsonify({'error': 'Test not found'}), 404
        
        # Create test response (you might want a separate TestResponse model)
        # For now, we'll update the test record
        test.user_id = user_id
        test.responses = data['responses']
        test.completed_at = data.get('completed_at', datetime.utcnow())
        
        db.session.commit()
        
        return jsonify({
            'message': 'Test response submitted successfully',
            'test': test.to_dict()
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
