import secrets
from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db


class Household(db.Model):
    """Grupo familiar: agrupa os usuários que compartilham as finanças."""

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    invite_code = db.Column(db.String(8), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship("User", backref="household", lazy=True)

    @staticmethod
    def generate_invite_code():
        while True:
            code = secrets.token_hex(3).upper()
            if not Household.query.filter_by(invite_code=code).first():
                return code


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    household_id = db.Column(db.Integer, db.ForeignKey("household.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    household_id = db.Column(db.Integer, db.ForeignKey("household.id"), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    kind = db.Column(db.String(10), nullable=False)  # 'receita' | 'despesa'


class Account(db.Model):
    """Conta corrente, dinheiro/carteira ou cartão de crédito."""

    id = db.Column(db.Integer, primary_key=True)
    household_id = db.Column(db.Integer, db.ForeignKey("household.id"), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    kind = db.Column(db.String(20), nullable=False)  # 'conta', 'dinheiro', 'cartao'
    closing_day = db.Column(db.Integer)  # somente para cartao
    due_day = db.Column(db.Integer)  # somente para cartao

    @property
    def is_card(self):
        return self.kind == "cartao"


class Invoice(db.Model):
    """Fatura mensal de um cartão de crédito."""

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("account.id"), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), default="aberta")  # aberta, paga
    paid_at = db.Column(db.Date)
    paid_from_account_id = db.Column(db.Integer, db.ForeignKey("account.id"))

    account = db.relationship("Account", foreign_keys=[account_id], backref="invoices")

    __table_args__ = (db.UniqueConstraint("account_id", "year", "month", name="uq_invoice_account_period"),)

    @property
    def total(self):
        return sum((t.amount for t in self.transactions), 0)


class Transaction(db.Model):
    """Lançamento: despesa ou receita, avulsa ou de cartão de crédito."""

    id = db.Column(db.Integer, primary_key=True)
    household_id = db.Column(db.Integer, db.ForeignKey("household.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey("account.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"))
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoice.id"))  # somente se account é cartao

    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    kind = db.Column(db.String(10), nullable=False)  # receita | despesa
    date = db.Column(db.Date, nullable=False)

    installment_group = db.Column(db.String(32))
    installment_number = db.Column(db.Integer)
    installment_total = db.Column(db.Integer)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User")
    account = db.relationship("Account")
    category = db.relationship("Category")
    invoice = db.relationship("Invoice", backref="transactions")
