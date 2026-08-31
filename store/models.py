from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(60), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price_cents = db.Column(db.Integer, nullable=False, default=0)
    sizes = db.Column(db.String(120), nullable=True)
    color = db.Column(db.String(60), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    in_stock = db.Column(db.Boolean, nullable=False, default=True)
    active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def price_display(self):
        value = f"{self.price_cents / 100:,.2f}"
        value = value.replace(",", "X").replace(".", ",").replace("X", ".")
        return f"R$ {value}"

    @property
    def size_list(self):
        if not self.sizes:
            return []
        return [s.strip() for s in self.sizes.split(",") if s.strip()]
