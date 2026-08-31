from flask import Blueprint, render_template, request

from .models import Product, db

bp = Blueprint("public", __name__)


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
        "site/catalog.html",
        products=products,
        categories=categories,
        selected_category=selected_category,
    )


@bp.route("/produto/<int:product_id>")
def product_detail(product_id):
    product = Product.query.filter_by(id=product_id, active=True).first_or_404()
    return render_template("site/product_detail.html", product=product)


@bp.route("/carrinho")
def cart():
    return render_template("site/cart.html")
