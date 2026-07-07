import calendar
from datetime import date

from extensions import db
from models import Invoice


def add_months(year, month, delta):
    total = year * 12 + (month - 1) + delta
    return total // 12, total % 12 + 1


def shift_date(d, months):
    year, month = add_months(d.year, d.month, months)
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def purchase_invoice_period(account, purchase_date):
    """Retorna (ano, mes) da fatura em que uma compra cai, dado o dia de fechamento."""
    year, month = purchase_date.year, purchase_date.month
    if purchase_date.day > account.closing_day:
        year, month = add_months(year, month, 1)
    return year, month


def invoice_due_date(account, year, month):
    if account.due_day <= account.closing_day:
        due_year, due_month = add_months(year, month, 1)
    else:
        due_year, due_month = year, month
    day = min(account.due_day, calendar.monthrange(due_year, due_month)[1])
    return date(due_year, due_month, day)


def get_or_create_invoice(account, year, month):
    invoice = Invoice.query.filter_by(account_id=account.id, year=year, month=month).first()
    if invoice:
        return invoice
    invoice = Invoice(
        account_id=account.id,
        year=year,
        month=month,
        due_date=invoice_due_date(account, year, month),
        status="aberta",
    )
    db.session.add(invoice)
    db.session.flush()
    return invoice


def split_installments(total_amount, installments):
    """Divide o valor total em N parcelas, ajustando centavos na última."""
    cents = round(total_amount * 100)
    base = cents // installments
    remainder = cents - base * installments
    amounts = []
    for i in range(installments):
        value = base + (remainder if i == installments - 1 else 0)
        amounts.append(value / 100)
    return amounts
