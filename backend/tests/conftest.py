import pytest
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db as _db
from app.models import *  # Import all models

def create_test_database():
    """Create test database if it doesn't exist"""
    # Connect to default postgres database
    engine = create_engine('postgresql://postgres:postgres_db_metal_health_care@localhost:5432/postgres')
    conn = engine.connect()
    conn.execution_options(isolation_level="AUTOCOMMIT")
    
    try:
        # Check if test database exists
        result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='mental_care_test_db'"))
        exists = result.scalar()
        
        if not exists:
            # Create test database
            conn.execute(text("CREATE DATABASE mental_care_test_db"))
            print("Test database created successfully")
    except Exception as e:
        print(f"Error checking/creating test database: {e}")
    finally:
        conn.close()
        engine.dispose()

def drop_test_database():
    """Drop test database"""
    # Connect to default postgres database
    engine = create_engine('postgresql://postgres:postgres_db_metal_health_care@localhost:5432/postgres')
    conn = engine.connect()
    conn.execution_options(isolation_level="AUTOCOMMIT")
    
    try:
        # Terminate all connections to test database
        conn.execute(text("""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'mental_care_test_db'
            AND pid <> pg_backend_pid()
        """))
        
        # Drop test database
        conn.execute(text("DROP DATABASE IF EXISTS mental_care_test_db"))
        print("Test database dropped successfully")
    except Exception as e:
        print(f"Error dropping test database: {e}")
    finally:
        conn.close()
        engine.dispose()

@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    # Create test database
    create_test_database()
    
    # Use 'testing' config which should use a separate test DB
    app = create_app('testing')
    
    # Create an app context for the tests
    ctx = app.app_context()
    ctx.push()
    
    # Create all database tables
    _db.create_all()

    yield app
    
    # Clean up: drop all tables
    _db.drop_all()
    ctx.pop()
    
    # Drop test database after all tests
    # drop_test_database()  # Comment out to keep DB for debugging

@pytest.fixture(scope='session')
def db(app):
    """Create database for the tests."""
    _db.create_all()
    yield _db
    _db.session.remove()
    _db.drop_all()

@pytest.fixture(scope='function', autouse=True)
def session(db):
    """Creates a new database session for a test."""
    # Clear all data before each test
    yield db.session
    
    # Rollback any pending changes and clear session
    db.session.rollback()
    db.session.remove()
    
    # Truncate all tables to avoid unique constraint issues
    for table in reversed(db.metadata.sorted_tables):
        db.session.execute(table.delete())
    db.session.commit()

@pytest.fixture(scope='module')
def client(app):
    """A test client for the app."""
    return app.test_client()


# Sample data fixtures
@pytest.fixture
def sample_user(db):
    """Create a sample user"""
    user = User(
        email='test@example.com',
        full_name='Test User',
        role='user'
    )
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()
    db.session.refresh(user)
    return user


@pytest.fixture
def sample_doctor_user(db):
    """Create a sample doctor user"""
    user = User(
        email='doctor@example.com',
        full_name='Dr. Test',
        role='doctor'
    )
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()
    db.session.refresh(user)
    return user


@pytest.fixture
def sample_doctor(db, sample_doctor_user):
    """Create a sample doctor profile"""
    doctor = DoctorProfile(
        user_id=sample_doctor_user.id,
        license_number='DOC123',
        specialization='Clinical Psychology',
        years_of_experience=5,
        consultation_fee=500000,
        is_verified=True,
        is_available=True
    )
    db.session.add(doctor)
    db.session.commit()
    db.session.refresh(doctor)
    return doctor


@pytest.fixture
def sample_plan(db):
    """Create a sample plan"""
    # Create free plan first (for default users)
    free_plan = Plan.query.filter_by(name='free').first()
    if not free_plan:
        free_plan = Plan(
            name='free',
            user_type='user',
            price_monthly=0,
            price_yearly=0,
            chat_limit=10,
            is_active=True
        )
        db.session.add(free_plan)
    
    # Create test plan
    plan = Plan(
        name='Test Plan',
        user_type='user',
        price_monthly=99000,
        price_yearly=990000,
        chat_limit=-1,
        is_active=True
    )
    db.session.add(plan)
    db.session.commit()
    db.session.refresh(plan)
    return plan


@pytest.fixture
def sample_payment(db, sample_user, sample_plan):
    """Create a sample payment"""
    payment = Payment(
        user_id=sample_user.id,
        plan_id=sample_plan.id,
        amount=99000,
        payment_method='vnpay',
        payment_status='completed',
        billing_cycle='monthly'
    )
    db.session.add(payment)
    db.session.commit()
    db.session.refresh(payment)
    return payment


@pytest.fixture
def sample_chat_session(db, sample_user):
    """Create a sample chat session"""
    chat_session = ChatSession(
        user_id=sample_user.id,
        title='Test Session',
        status='active'
    )
    db.session.add(chat_session)
    db.session.commit()
    db.session.refresh(chat_session)
    return chat_session


@pytest.fixture
def sample_chat_message(db, sample_chat_session):
    """Create a sample chat message"""
    message = ChatMessage(
        session_id=sample_chat_session.id,
        role='user',
        content='Test message'
    )
    db.session.add(message)
    db.session.commit()
    db.session.refresh(message)
    return message


@pytest.fixture
def sample_exercise(db):
    """Create a sample exercise"""
    exercise = Exercise(
        title='Test Exercise',
        description='Test description',
        category='breathing',
        difficulty='beginner',
        duration_minutes=5,
        instructions='Test instructions',
        is_active=True
    )
    db.session.add(exercise)
    db.session.commit()
    db.session.refresh(exercise)
    return exercise


@pytest.fixture
def auth_headers(client, sample_user):
    """Get authentication headers"""
    response = client.post('/api/auth/login',
        json={
            'email': 'test@example.com',
            'password': 'password123'
        }
    )
    data = response.get_json()
    return {
        'Authorization': f'Bearer {data["access_token"]}'
    }


@pytest.fixture
def doctor_auth_headers(client, sample_doctor_user):
    """Get doctor authentication headers"""
    response = client.post('/api/auth/login',
        json={
            'email': 'doctor@example.com',
            'password': 'password123'
        }
    )
    data = response.get_json()
    return {
        'Authorization': f'Bearer {data["access_token"]}'
    }
