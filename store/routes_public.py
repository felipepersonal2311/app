import os

from flask import Blueprint, current_app, jsonify, render_template, request

from .models import Product, db

bp = Blueprint("public", __name__)


@bp.route("/__debug")
def debug_files():
    def listing(path):
        try:
            return sorted(os.listdir(path))
        except Exception as exc:
            return f"ERRO: {exc}"

    app = current_app
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    templates_dir = os.path.join(basedir, "templates")
    static_dir = os.path.join(basedir, "static")

    return jsonify(
        {
            "cwd": os.getcwd(),
            "__file__": os.path.abspath(__file__),
            "basedir_calculado": basedir,
            "basedir_existe": os.path.isdir(basedir),
            "conteudo_basedir": listing(basedir),
            "app_root_path": app.root_path,
            "app_template_folder": app.template_folder,
            "app_static_folder": app.static_folder,
            "jinja_searchpath": list(app.jinja_loader.searchpath) if app.jinja_loader else None,
            "templates_dir_existe": os.path.isdir(templates_dir),
            "conteudo_templates_dir": listing(templates_dir),
            "conteudo_templates_public": listing(os.path.join(templates_dir, "public")),
            "static_dir_existe": os.path.isdir(static_dir),
            "conteudo_static_dir": listing(static_dir),
        }
    )


@bp.route("/")
def catalog():
    selected_category = request.args.get("categoria", "").strip()

    categories = [
        row[0]
        for row in db.session.query(Product.category)
        .filter_by(active=True)
        .distinct()
        .order_by(Product.category)
        .all()
    ]

    query = Product.query.filter_by(active=True)
    if selected_category:
        query = query.filter_by(category=selected_category)
    products = query.order_by(Product.in_stock.desc(), Product.created_at.desc()).all()

    return render_template(
        "public/catalog.html",
        products=products,
        categories=categories,
        selected_category=selected_category,
    )


@bp.route("/produto/<int:product_id>")
def product_detail(product_id):
    product = Product.query.filter_by(id=product_id, active=True).first_or_404()
    return render_template("public/product_detail.html", product=product)


@bp.route("/carrinho")
def cart():
    return render_template("public/cart.html")
