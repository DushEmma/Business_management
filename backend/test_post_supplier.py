import os
from app import create_app, db
from app.models.user import User, UserRole
from app.models.supplier import Supplier
from flask_jwt_extended import create_access_token

app = create_app()
with app.app_context():
    # Find any user that is admin or superadmin
    admin_user = User.query.filter(User.role.in_([UserRole.superadmin, UserRole.admin])).first()
    if not admin_user:
        print("No admin user found! Creating one...")
        admin_user = User(
            username="testadmin",
            email="testadmin@example.com",
            role=UserRole.admin,
            is_active=True,
            business_id=1
        )
        admin_user.set_password("password123")
        db.session.add(admin_user)
        db.session.commit()
    
    print(f"Using admin user: {admin_user.username} (Email: {admin_user.email}, Role: {admin_user.role}, BusinessID: {admin_user.business_id})")
    
    # Generate access token - converting identity to string!
    additional_claims = {
        "business_id": admin_user.business_id if admin_user.business_id else 1, 
        "role": admin_user.role.value,
        "mfa_required": False,
        "mfa_verified": True
    }
    access_token = create_access_token(
        identity=str(admin_user.id),
        additional_claims=additional_claims
    )
    
    # Simulate POST /api/suppliers/
    client = app.test_client()
    
    # Test 1: Valid payload
    payload = {
        "company_name": "Acme Corp",
        "contact_person": "John Doe",
        "email": "john@acme.com",
        "phone": "1234567890",
        "address": "123 Main St",
        "is_active": True
    }
    
    print("\n--- Test 1: Valid Payload ---")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = client.post("/api/suppliers/", json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.get_json()}")
    
    # Test 2: Required field company_name missing
    print("\n--- Test 2: Missing company_name ---")
    bad_payload = payload.copy()
    del bad_payload["company_name"]
    response = client.post("/api/suppliers/", json=bad_payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.get_json()}")
    
    # Test 3: Invalid email format
    print("\n--- Test 3: Invalid email format ---")
    bad_payload = payload.copy()
    bad_payload["email"] = "invalid-email"
    response = client.post("/api/suppliers/", json=bad_payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.get_json()}")
