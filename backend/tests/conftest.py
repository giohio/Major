import pytest
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db as _db

@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    # Use 'testing' config which should use a separate test DB
    app = create_app('testing')
    
    # Create an app context for the tests
    ctx = app.app_context()
    ctx.push()

    yield app

    ctx.pop()

@pytest.fixture(scope='session')
def db(app):
    """Create database for the tests."""
    _db.create_all()
    yield _db
    _db.session.remove()
    _db.drop_all()

@pytest.fixture(scope='function')
def session(db):
    """Creates a new database session for a test."""
    db.session.begin_nested()
    yield db.session
    db.session.rollback()

@pytest.fixture(scope='module')
def client(app):
    """A test client for the app."""
    return app.test_client()
