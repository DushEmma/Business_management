from app import create_app, db
from app.models.user import User
from app.models.business import Business

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    for u in users:
        print(f"User ID: {u.id}, Username: {u.username}, Email: {u.email}, Role: {u.role}, Active: {u.is_active}, BusinessID: {u.business_id}")
    
    businesses = Business.query.all()
    print(f"Total businesses: {len(businesses)}")
    for b in businesses:
        print(f"Business ID: {b.id}, Name: {b.name}, Email: {b.email}, Active: {b.is_active}")
