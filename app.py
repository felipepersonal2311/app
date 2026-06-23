from flask import Flask, render_template, redirect, url_for, request, flash, abort
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from slugify import slugify

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-me-in-production"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///blog.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


with app.app_context():
    db.create_all()


@app.route("/")
def index():
    posts = Post.query.filter_by(published=True).order_by(Post.created_at.desc()).all()
    return render_template("index.html", posts=posts)


@app.route("/post/<slug>")
def post_detail(slug):
    post = Post.query.filter_by(slug=slug, published=True).first_or_404()
    return render_template("post_detail.html", post=post)


@app.route("/admin")
def admin():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return render_template("admin/index.html", posts=posts)


@app.route("/admin/new", methods=["GET", "POST"])
def new_post():
    if request.method == "POST":
        title = request.form["title"].strip()
        content = request.form["content"].strip()
        published = "published" in request.form

        if not title or not content:
            flash("Título e conteúdo são obrigatórios.", "error")
            return render_template("admin/form.html", post=None)

        slug = slugify(title)
        existing = Post.query.filter_by(slug=slug).first()
        if existing:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"

        post = Post(title=title, slug=slug, content=content, published=published)
        db.session.add(post)
        db.session.commit()
        flash("Post criado com sucesso!", "success")
        return redirect(url_for("admin"))

    return render_template("admin/form.html", post=None)


@app.route("/admin/edit/<int:post_id>", methods=["GET", "POST"])
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)

    if request.method == "POST":
        post.title = request.form["title"].strip()
        post.content = request.form["content"].strip()
        post.published = "published" in request.form
        post.updated_at = datetime.utcnow()

        if not post.title or not post.content:
            flash("Título e conteúdo são obrigatórios.", "error")
            return render_template("admin/form.html", post=post)

        db.session.commit()
        flash("Post atualizado com sucesso!", "success")
        return redirect(url_for("admin"))

    return render_template("admin/form.html", post=post)


@app.route("/admin/delete/<int:post_id>", methods=["POST"])
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    flash("Post excluído.", "success")
    return redirect(url_for("admin"))


@app.route("/admin/toggle/<int:post_id>", methods=["POST"])
def toggle_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.published = not post.published
    db.session.commit()
    status = "publicado" if post.published else "despublicado"
    flash(f'Post "{post.title}" {status}.', "success")
    return redirect(url_for("admin"))


if __name__ == "__main__":
    app.run(debug=True)
