from datetime import date, datetime

from flask import Blueprint, render_template, redirect, url_for, request, flash, abort
from flask_login import login_required, current_user

from extensions import db
from models import Account, Invoice, Transaction

bp = Blueprint("invoices", __name__, url_prefix="/faturas")


def _get_invoice_or_404(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    if invoice.account.household_id != current_user.household_id:
        abort(403)
    return invoice


@bp.route("/")
@login_required
def list_invoices():
    cards = Account.query.filter_by(household_id=current_user.household_id, kind="cartao").all()
    card_ids = [c.id for c in cards]
    invoices = (
        Invoice.query.filter(Invoice.account_id.in_(card_ids))
        .order_by(Invoice.year.desc(), Invoice.month.desc())
        .all()
        if card_ids
        else []
    )
    return render_template("invoices/list.html", invoices=invoices, cards=cards)


@bp.route("/<int:invoice_id>")
@login_required
def invoice_detail(invoice_id):
    invoice = _get_invoice_or_404(invoice_id)
    payment_accounts = Account.query.filter(
        Account.household_id == current_user.household_id,
        Account.kind != "cartao",
    ).all()
    transactions = sorted(invoice.transactions, key=lambda t: t.date)
    return render_template("invoices/detail.html", invoice=invoice, transactions=transactions, payment_accounts=payment_accounts)


@bp.route("/<int:invoice_id>/pagar", methods=["POST"])
@login_required
def pay_invoice(invoice_id):
    invoice = _get_invoice_or_404(invoice_id)

    if invoice.status == "paga":
        flash("Esta fatura já está paga.", "error")
        return redirect(url_for("invoices.invoice_detail", invoice_id=invoice.id))

    payment_account_id = request.form.get("payment_account_id")
    payment_account = Account.query.get(payment_account_id) if payment_account_id else None
    if not payment_account or payment_account.household_id != current_user.household_id or payment_account.is_card:
        flash("Selecione uma conta válida para o pagamento.", "error")
        return redirect(url_for("invoices.invoice_detail", invoice_id=invoice.id))

    paid_at_str = request.form.get("paid_at")
    try:
        paid_at = datetime.strptime(paid_at_str, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        paid_at = date.today()

    invoice.status = "paga"
    invoice.paid_at = paid_at
    invoice.paid_from_account_id = payment_account.id

    db.session.add(Transaction(
        household_id=current_user.household_id,
        user_id=current_user.id,
        account_id=payment_account.id,
        category_id=None,
        description=f"Pagamento fatura {invoice.account.name} {invoice.month:02d}/{invoice.year}",
        amount=invoice.total,
        kind="despesa",
        date=paid_at,
    ))

    db.session.commit()
    flash("Fatura marcada como paga!", "success")
    return redirect(url_for("invoices.invoice_detail", invoice_id=invoice.id))
