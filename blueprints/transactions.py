import uuid
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from flask import Blueprint, render_template, redirect, url_for, request, flash, abort
from flask_login import login_required, current_user

from extensions import db
from models import Account, Category, Transaction, User
from services import purchase_invoice_period, get_or_create_invoice, split_installments, add_months

MONTH_NAMES = [
    "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

bp = Blueprint("transactions", __name__, url_prefix="/lancamentos")


def _get_transaction_or_404(transaction_id):
    txn = Transaction.query.get_or_404(transaction_id)
    if txn.household_id != current_user.household_id:
        abort(403)
    return txn


def _household_accounts():
    return Account.query.filter_by(household_id=current_user.household_id).all()


def _household_categories():
    return Category.query.filter_by(household_id=current_user.household_id).all()


def _household_users():
    return User.query.filter_by(household_id=current_user.household_id).all()


def _parse_amount(raw):
    try:
        value = Decimal(raw.replace(",", "."))
    except (InvalidOperation, AttributeError):
        return None
    if value <= 0:
        return None
    return value


@bp.route("/")
@login_required
def list_transactions():
    today = date.today()
    year = int(request.args.get("ano", today.year))
    month = int(request.args.get("mes", today.month))
    who = request.args.get("quem", "todos")

    query = Transaction.query.filter(
        Transaction.household_id == current_user.household_id,
        db.extract("year", Transaction.date) == year,
        db.extract("month", Transaction.date) == month,
    )

    if who == "eu":
        query = query.filter(Transaction.user_id == current_user.id)
    elif who.isdigit():
        query = query.filter(Transaction.user_id == int(who))

    transactions = query.order_by(Transaction.date.desc(), Transaction.id.desc()).all()

    prev_year, prev_month = add_months(year, month, -1)
    next_year, next_month = add_months(year, month, 1)

    return render_template(
        "transactions/list.html",
        transactions=transactions,
        year=year,
        month=month,
        who=who,
        users=_household_users(),
        month_names=MONTH_NAMES,
        prev_year=prev_year,
        prev_month=prev_month,
        next_year=next_year,
        next_month=next_month,
    )


@bp.route("/novo", methods=["GET", "POST"])
@login_required
def new_transaction():
    accounts = _household_accounts()
    categories = _household_categories()
    today = date.today().isoformat()

    if request.method == "POST":
        description = request.form["description"].strip()
        amount = _parse_amount(request.form.get("amount", ""))
        kind = request.form.get("kind")
        account_id = request.form.get("account_id")
        category_id = request.form.get("category_id") or None
        date_str = request.form.get("date")
        installments = int(request.form.get("installments", 1) or 1)

        account = Account.query.get(account_id) if account_id else None
        try:
            txn_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            txn_date = None

        errors = []
        if not description:
            errors.append("Informe uma descrição.")
        if amount is None:
            errors.append("Informe um valor válido maior que zero.")
        if kind not in ("receita", "despesa"):
            errors.append("Selecione o tipo (receita ou despesa).")
        if not account or account.household_id != current_user.household_id:
            errors.append("Selecione uma conta válida.")
        if not txn_date:
            errors.append("Informe uma data válida.")
        if account and account.is_card and (installments < 1 or installments > 48):
            errors.append("Número de parcelas inválido.")

        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("transactions/form.html", transaction=None, accounts=accounts, categories=categories, today=today)

        if account.is_card and kind == "despesa" and installments > 1:
            group = uuid.uuid4().hex[:16]
            base_year, base_month = purchase_invoice_period(account, txn_date)
            for idx, part_amount in enumerate(split_installments(amount, installments)):
                inv_year, inv_month = add_months(base_year, base_month, idx)
                invoice = get_or_create_invoice(account, inv_year, inv_month)
                db.session.add(Transaction(
                    household_id=current_user.household_id,
                    user_id=current_user.id,
                    account_id=account.id,
                    category_id=category_id,
                    invoice_id=invoice.id,
                    description=description,
                    amount=part_amount,
                    kind=kind,
                    date=txn_date,
                    installment_group=group,
                    installment_number=idx + 1,
                    installment_total=installments,
                ))
        else:
            invoice_id = None
            if account.is_card:
                inv_year, inv_month = purchase_invoice_period(account, txn_date)
                invoice_id = get_or_create_invoice(account, inv_year, inv_month).id

            db.session.add(Transaction(
                household_id=current_user.household_id,
                user_id=current_user.id,
                account_id=account.id,
                category_id=category_id,
                invoice_id=invoice_id,
                description=description,
                amount=amount,
                kind=kind,
                date=txn_date,
            ))

        db.session.commit()
        flash("Lançamento criado com sucesso!", "success")

        if request.form.get("and_new"):
            return redirect(url_for("transactions.new_transaction"))
        return redirect(url_for("transactions.list_transactions"))

    return render_template("transactions/form.html", transaction=None, accounts=accounts, categories=categories, today=today)


@bp.route("/<int:transaction_id>/editar", methods=["GET", "POST"])
@login_required
def edit_transaction(transaction_id):
    txn = _get_transaction_or_404(transaction_id)
    accounts = _household_accounts()
    categories = _household_categories()

    if request.method == "POST":
        description = request.form["description"].strip()
        amount = _parse_amount(request.form.get("amount", ""))
        date_str = request.form.get("date")
        category_id = request.form.get("category_id") or None

        try:
            txn_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            txn_date = None

        errors = []
        if not description:
            errors.append("Informe uma descrição.")
        if amount is None:
            errors.append("Informe um valor válido maior que zero.")
        if not txn_date:
            errors.append("Informe uma data válida.")

        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("transactions/form.html", transaction=txn, accounts=accounts, categories=categories)

        txn.description = description
        txn.amount = amount
        txn.date = txn_date
        txn.category_id = category_id

        if txn.account.is_card:
            inv_year, inv_month = purchase_invoice_period(txn.account, txn_date)
            txn.invoice_id = get_or_create_invoice(txn.account, inv_year, inv_month).id

        db.session.commit()
        flash("Lançamento atualizado com sucesso!", "success")
        return redirect(url_for("transactions.list_transactions"))

    return render_template("transactions/form.html", transaction=txn, accounts=accounts, categories=categories)


@bp.route("/<int:transaction_id>/excluir", methods=["POST"])
@login_required
def delete_transaction(transaction_id):
    txn = _get_transaction_or_404(transaction_id)
    db.session.delete(txn)
    db.session.commit()
    flash("Lançamento excluído.", "success")
    return redirect(url_for("transactions.list_transactions"))
