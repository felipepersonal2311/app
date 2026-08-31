import os
import secrets

from flask import Blueprint, current_app, flash, redirect, render_template, request, session, url_for
from PIL import Image
from werkzeug.utils import secure_filename

from .auth import login_required
from .models import Product, db

bp = Blueprint("admin", __name__, url_prefix="/admin")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def _allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _parse_price_to_cents(raw):
    raw = (raw or "").strip().replace("R$", "").strip()
    if not raw:
        return 0
    if "," in raw:
        raw = raw.replace(".", "").replace(",", ".")
    try:
        return round(float(raw) * 100)
    except ValueError:
        return 0


def _apply_form(product, form):
    product.name = form.get("name", "").strip()
    product.category = form.get("category", "").strip() or "Outros"
    product.description = form.get("description", "").strip()
    product.color = form.get("color", "").strip()
    product.sizes = form.get("sizes", "").strip()
    product.price_cents = _parse_price_to_cents(form.get("price"))
    product.in_stock = "in_stock" in form
    product.active = "active" in form


def _remove_image_file(filename):
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


def _handle_image_upload(product, file_storage):
    if not file_storage or not file_storage.filename:
        return
    if not _allowed_file(file_storage.filename):
        flash("Formato de imagem não suportado. Use PNG, JPG ou WEBP.", "error")
        return

    ext = file_storage.filename.rsplit(".", 1)[1].lower()

    try:
        image = Image.open(file_storage.stream)
        image.verify()
        file_storage.stream.seek(0)
        image = Image.open(file_storage.stream)
        image.thumbnail((1200, 1200))
        if ext in ("jpg", "jpeg") and image.mode != "RGB":
            image = image.convert("RGB")
    except Exception:
        flash("Não foi possível processar a imagem enviada. Tente outro arquivo.", "error")
        return

    filename = secure_filename(f"{secrets.token_hex(8)}.{ext}")
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    image.save(path)

    old_filename = product.image_filename
    product.image_filename = filename
    if old_filename:
        _remove_image_file(old_filename)


@bp.route("/login", methods=["GET", "POST"])
def login():
    if session.get("is_admin"):
        return redirect(url_for("admin.dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        valid_user = secrets.compare_digest(username, current_app.config["ADMIN_USERNAME"])
        valid_pass = secrets.compare_digest(password, current_app.config["ADMIN_PASSWORD"])

        if valid_user and valid_pass:
            session.clear()
            session["is_admin"] = True
            flash("Login realizado com sucesso!", "success")
            next_url = request.args.get("next") or url_for("admin.dashboard")
            return redirect(next_url)

        flash("Usuário ou senha inválidos.", "error")

    return render_template("admin/login.html")


@bp.route("/logout")
def logout():
    session.clear()
    flash("Você saiu do painel administrativo.", "success")
    return redirect(url_for("admin.login"))


@bp.route("/")
@login_required
def dashboard():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template("admin/dashboard.html", products=products)


@bp.route("/produtos/novo", methods=["GET", "POST"])
@login_required
def new_product():
    if request.method == "POST":
        product = Product()
        _apply_form(product, request.form)

        if not product.name:
            flash("O nome da peça é obrigatório.", "error")
            return render_template("admin/product_form.html", product=None)

        _handle_image_upload(product, request.files.get("image"))
        db.session.add(product)
        db.session.commit()
        flash("Produto cadastrado com sucesso!", "success")
        return redirect(url_for("admin.dashboard"))

    return render_template("admin/product_form.html", product=None)


@bp.route("/produtos/<int:product_id>/editar", methods=["GET", "POST"])
@login_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)

    if request.method == "POST":
        _apply_form(product, request.form)

        if not product.name:
            flash("O nome da peça é obrigatório.", "error")
            return render_template("admin/product_form.html", product=product)

        _handle_image_upload(product, request.files.get("image"))
        db.session.commit()
        flash("Produto atualizado com sucesso!", "success")
        return redirect(url_for("admin.dashboard"))

    return render_template("admin/product_form.html", product=product)


@bp.route("/produtos/<int:product_id>/excluir", methods=["POST"])
@login_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    if product.image_filename:
        _remove_image_file(product.image_filename)
    db.session.delete(product)
    db.session.commit()
    flash("Produto excluído.", "success")
    return redirect(url_for("admin.dashboard"))


@bp.route("/produtos/<int:product_id>/estoque", methods=["POST"])
@login_required
def toggle_stock(product_id):
    product = Product.query.get_or_404(product_id)
    product.in_stock = not product.in_stock
    db.session.commit()
    return redirect(url_for("admin.dashboard"))


@bp.route("/produtos/<int:product_id>/ativo", methods=["POST"])
@login_required
def toggle_active(product_id):
    product = Product.query.get_or_404(product_id)
    product.active = not product.active
    db.session.commit()
    return redirect(url_for("admin.dashboard"))
