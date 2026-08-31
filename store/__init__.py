import os

from flask import Flask
from flask_wtf import CSRFProtect

from .models import db

csrf = CSRFProtect()


def create_app():
    app = Flask(__name__)

    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    instance_dir = os.path.join(basedir, "instance")
    os.makedirs(instance_dir, exist_ok=True)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-troque-em-producao")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(instance_dir, 'loja.db')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["UPLOAD_FOLDER"] = os.path.join(app.static_folder, "uploads", "products")
    app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024  # 6 MB por upload
    app.config["WHATSAPP_NUMBER"] = os.environ.get("WHATSAPP_NUMBER", "5561996994875")
    app.config["ADMIN_USERNAME"] = os.environ.get("ADMIN_USERNAME", "admin")
    app.config["ADMIN_PASSWORD"] = os.environ.get("ADMIN_PASSWORD", "troque-esta-senha")
    app.config["STORE_NAME"] = os.environ.get("STORE_NAME", "Minha Loja Fitness")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    csrf.init_app(app)

    from . import routes_admin, routes_public

    app.register_blueprint(routes_public.bp)
    app.register_blueprint(routes_admin.bp)

    with app.app_context():
        db.create_all()
        from .seed import seed_if_empty

        seed_if_empty()

    @app.context_processor
    def inject_globals():
        return {
            "whatsapp_number": app.config["WHATSAPP_NUMBER"],
            "store_name": app.config["STORE_NAME"],
        }

    return app
