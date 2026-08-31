import os

from flask import Flask
from flask_wtf import CSRFProtect
from sqlalchemy.pool import NullPool

from .models import db

csrf = CSRFProtect()


def create_app():
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

    # templates/ e static/ ficam na raiz do projeto (fora do pacote store/) porque
    # o empacotador Python da Vercel não inclui de forma confiável arquivos que
    # não sejam .py quando eles estão aninhados dentro de um subpacote.
    app = Flask(
        __name__,
        template_folder=os.path.join(basedir, "templates"),
        static_folder=os.path.join(basedir, "static"),
    )

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-troque-em-producao")

    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        # Supabase/Postgres configurado: nunca tocar no disco local (a Vercel,
        # por exemplo, só permite escrita em /tmp).
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        instance_dir = os.path.join(basedir, "instance")
        os.makedirs(instance_dir, exist_ok=True)
        app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(instance_dir, 'loja.db')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # Sem pool de conexões: cada invocação serverless (Vercel) parte de um processo
    # novo, então reaproveitar conexões entre requisições não ajuda e pode deixar
    # conexões "penduradas" no Postgres/pgbouncer do Supabase.
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"poolclass": NullPool}
    app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024  # 6 MB por upload
    app.config["WHATSAPP_NUMBER"] = os.environ.get("WHATSAPP_NUMBER", "5561996994875")
    app.config["ADMIN_USERNAME"] = os.environ.get("ADMIN_USERNAME", "admin")
    app.config["ADMIN_PASSWORD"] = os.environ.get("ADMIN_PASSWORD", "troque-esta-senha")
    app.config["STORE_NAME"] = os.environ.get("STORE_NAME", "Minha Loja Fitness")

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
