from datetime import date

from flask import Blueprint, render_template, request
from flask_login import login_required, current_user

from extensions import db
from models import Account, Invoice, Transaction, User
from services import add_months

bp = Blueprint("main", __name__)

MONTH_NAMES = [
    "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]


@bp.route("/")
@login_required
def dashboard():
    today = date.today()
    year = int(request.args.get("ano", today.year))
    month = int(request.args.get("mes", today.month))
    who = request.args.get("quem", "todos")

    users = User.query.filter_by(household_id=current_user.household_id).all()
    accounts = Account.query.filter_by(household_id=current_user.household_id).all()

    base_query = Transaction.query.filter(
        Transaction.household_id == current_user.household_id,
        db.extract("year", Transaction.date) == year,
        db.extract("month", Transaction.date) == month,
    )
    if who == "eu":
        base_query = base_query.filter(Transaction.user_id == current_user.id)
    elif who.isdigit():
        base_query = base_query.filter(Transaction.user_id == int(who))

    month_transactions = base_query.all()

    receitas = sum((t.amount for t in month_transactions if t.kind == "receita"), 0)
    despesas_avulsas = sum(
        (t.amount for t in month_transactions if t.kind == "despesa" and not t.account.is_card), 0
    )
    gastos_cartao = sum(
        (t.amount for t in month_transactions if t.kind == "despesa" and t.account.is_card), 0
    )

    por_categoria = {}
    for t in month_transactions:
        if t.kind != "despesa":
            continue
        nome = t.category.name if t.category else "Sem categoria"
        por_categoria[nome] = por_categoria.get(nome, 0) + t.amount
    por_categoria = sorted(por_categoria.items(), key=lambda kv: kv[1], reverse=True)

    card_ids = [a.id for a in accounts if a.is_card]
    faturas_no_mes = (
        Invoice.query.filter(
            Invoice.account_id.in_(card_ids),
            db.extract("year", Invoice.due_date) == year,
            db.extract("month", Invoice.due_date) == month,
        ).all()
        if card_ids
        else []
    )

    saldos = {}
    for a in accounts:
        if a.is_card:
            continue
        total = 0
        for t in Transaction.query.filter_by(account_id=a.id).all():
            total += t.amount if t.kind == "receita" else -t.amount
        saldos[a.id] = total

    prev_year, prev_month = add_months(year, month, -1)
    next_year, next_month = add_months(year, month, 1)
    max_categoria = por_categoria[0][1] if por_categoria else 0

    return render_template(
        "main/dashboard.html",
        year=year,
        month=month,
        who=who,
        users=users,
        month_names=MONTH_NAMES,
        receitas=receitas,
        despesas_avulsas=despesas_avulsas,
        gastos_cartao=gastos_cartao,
        por_categoria=por_categoria,
        max_categoria=max_categoria,
        faturas_no_mes=faturas_no_mes,
        accounts=accounts,
        saldos=saldos,
        prev_year=prev_year,
        prev_month=prev_month,
        next_year=next_year,
        next_month=next_month,
        today=today,
    )
