from flask import Blueprint, render_template, redirect, url_for, request, flash, abort
from flask_login import login_required, current_user

from extensions import db
from models import Account, Transaction

bp = Blueprint("accounts", __name__, url_prefix="/contas")

KINDS = {"conta": "Conta corrente", "dinheiro": "Dinheiro/carteira", "cartao": "Cartão de crédito"}


def _get_account_or_404(account_id):
    account = Account.query.get_or_404(account_id)
    if account.household_id != current_user.household_id:
        abort(403)
    return account


def _balance(account):
    total = 0
    for t in Transaction.query.filter_by(account_id=account.id).all():
        total += t.amount if t.kind == "receita" else -t.amount
    return total


@bp.route("/")
@login_required
def list_accounts():
    accounts = Account.query.filter_by(household_id=current_user.household_id).all()
    balances = {a.id: _balance(a) for a in accounts if not a.is_card}
    return render_template("accounts/list.html", accounts=accounts, balances=balances, kinds=KINDS)


@bp.route("/nova", methods=["GET", "POST"])
@login_required
def new_account():
    if request.method == "POST":
        name = request.form["name"].strip()
        kind = request.form["kind"]

        if not name or kind not in KINDS:
            flash("Preencha os dados corretamente.", "error")
            return render_template("accounts/form.html", account=None, kinds=KINDS)

        account = Account(household_id=current_user.household_id, name=name, kind=kind)

        if kind == "cartao":
            closing_day = int(request.form.get("closing_day", 0) or 0)
            due_day = int(request.form.get("due_day", 0) or 0)
            if not (1 <= closing_day <= 31) or not (1 <= due_day <= 31):
                flash("Informe dia de fechamento e vencimento válidos (1-31).", "error")
                return render_template("accounts/form.html", account=None, kinds=KINDS)
            account.closing_day = closing_day
            account.due_day = due_day

        db.session.add(account)
        db.session.commit()
        flash("Conta criada com sucesso!", "success")
        return redirect(url_for("accounts.list_accounts"))

    return render_template("accounts/form.html", account=None, kinds=KINDS)


@bp.route("/<int:account_id>/editar", methods=["GET", "POST"])
@login_required
def edit_account(account_id):
    account = _get_account_or_404(account_id)

    if request.method == "POST":
        account.name = request.form["name"].strip()
        if account.is_card:
            closing_day = int(request.form.get("closing_day", 0) or 0)
            due_day = int(request.form.get("due_day", 0) or 0)
            if not (1 <= closing_day <= 31) or not (1 <= due_day <= 31):
                flash("Informe dia de fechamento e vencimento válidos (1-31).", "error")
                return render_template("accounts/form.html", account=account, kinds=KINDS)
            account.closing_day = closing_day
            account.due_day = due_day

        db.session.commit()
        flash("Conta atualizada com sucesso!", "success")
        return redirect(url_for("accounts.list_accounts"))

    return render_template("accounts/form.html", account=account, kinds=KINDS)


@bp.route("/<int:account_id>/excluir", methods=["POST"])
@login_required
def delete_account(account_id):
    account = _get_account_or_404(account_id)
    if Transaction.query.filter_by(account_id=account.id).first():
        flash("Não é possível excluir: existem lançamentos nesta conta.", "error")
        return redirect(url_for("accounts.list_accounts"))

    db.session.delete(account)
    db.session.commit()
    flash("Conta excluída.", "success")
    return redirect(url_for("accounts.list_accounts"))
