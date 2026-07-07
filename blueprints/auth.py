from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user

from extensions import db
from models import Household, User, Category

bp = Blueprint("auth", __name__)

DEFAULT_CATEGORIES = [
    ("Alimentação", "despesa"),
    ("Transporte", "despesa"),
    ("Moradia", "despesa"),
    ("Saúde", "despesa"),
    ("Lazer", "despesa"),
    ("Assinaturas", "despesa"),
    ("Outros", "despesa"),
    ("Salário", "receita"),
    ("Outras receitas", "receita"),
]


@bp.route("/registrar", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    if request.method == "POST":
        mode = request.form.get("mode", "new")
        name = request.form["name"].strip()
        email = request.form["email"].strip().lower()
        password = request.form["password"]

        if not name or not email or not password:
            flash("Preencha todos os campos.", "error")
            return render_template("auth/register.html")

        if User.query.filter_by(email=email).first():
            flash("Já existe uma conta com esse e-mail.", "error")
            return render_template("auth/register.html")

        if mode == "join":
            invite_code = request.form.get("invite_code", "").strip().upper()
            household = Household.query.filter_by(invite_code=invite_code).first()
            if not household:
                flash("Código de convite inválido.", "error")
                return render_template("auth/register.html")
        else:
            household_name = request.form.get("household_name", "").strip() or f"Família de {name}"
            household = Household(name=household_name, invite_code=Household.generate_invite_code())
            db.session.add(household)
            db.session.flush()
            for cat_name, kind in DEFAULT_CATEGORIES:
                db.session.add(Category(household_id=household.id, name=cat_name, kind=kind))

        user = User(household_id=household.id, name=name, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        flash("Conta criada com sucesso!", "success")
        return redirect(url_for("main.dashboard"))

    return render_template("auth/register.html")


@bp.route("/entrar", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    if request.method == "POST":
        email = request.form["email"].strip().lower()
        password = request.form["password"]
        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for("main.dashboard"))

        flash("E-mail ou senha inválidos.", "error")

    return render_template("auth/login.html")


@bp.route("/sair", methods=["POST"])
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))
