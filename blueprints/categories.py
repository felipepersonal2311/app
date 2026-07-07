from flask import Blueprint, render_template, redirect, url_for, request, flash, abort
from flask_login import login_required, current_user

from extensions import db
from models import Category, Transaction

bp = Blueprint("categories", __name__, url_prefix="/categorias")


def _get_category_or_404(category_id):
    category = Category.query.get_or_404(category_id)
    if category.household_id != current_user.household_id:
        abort(403)
    return category


@bp.route("/")
@login_required
def list_categories():
    categories = Category.query.filter_by(household_id=current_user.household_id).order_by(Category.kind, Category.name).all()
    return render_template("categories/list.html", categories=categories)


@bp.route("/nova", methods=["GET", "POST"])
@login_required
def new_category():
    if request.method == "POST":
        name = request.form["name"].strip()
        kind = request.form["kind"]

        if not name or kind not in ("receita", "despesa"):
            flash("Preencha os dados corretamente.", "error")
            return render_template("categories/form.html", category=None)

        db.session.add(Category(household_id=current_user.household_id, name=name, kind=kind))
        db.session.commit()
        flash("Categoria criada com sucesso!", "success")
        return redirect(url_for("categories.list_categories"))

    return render_template("categories/form.html", category=None)


@bp.route("/<int:category_id>/editar", methods=["GET", "POST"])
@login_required
def edit_category(category_id):
    category = _get_category_or_404(category_id)

    if request.method == "POST":
        category.name = request.form["name"].strip()
        category.kind = request.form["kind"]
        db.session.commit()
        flash("Categoria atualizada com sucesso!", "success")
        return redirect(url_for("categories.list_categories"))

    return render_template("categories/form.html", category=category)


@bp.route("/<int:category_id>/excluir", methods=["POST"])
@login_required
def delete_category(category_id):
    category = _get_category_or_404(category_id)
    if Transaction.query.filter_by(category_id=category.id).first():
        flash("Não é possível excluir: existem lançamentos nesta categoria.", "error")
        return redirect(url_for("categories.list_categories"))

    db.session.delete(category)
    db.session.commit()
    flash("Categoria excluída.", "success")
    return redirect(url_for("categories.list_categories"))
