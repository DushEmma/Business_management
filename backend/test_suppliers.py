import os
from app import create_app, db
from app.models.supplier import Supplier

app = create_app()
with app.app_context():
    suppliers = Supplier.query.all()
    print(f"Total suppliers: {len(suppliers)}")
    for sup in suppliers[:10]:
        print(f"ID: {sup.id}, BusinessID: {sup.business_id}, SupplierID: {sup.supplier_id}, Name: {sup.company_name}, Contact: {sup.contact_person}, Email: {sup.email}")
