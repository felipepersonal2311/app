from .models import Product, db

SEED_PRODUCTS = [
    {
        "name": "Legging Suplex Preta",
        "category": "Legging",
        "description": "Legging de cintura alta em suplex, ótima compressão para treino ou dia a dia.",
        "price_cents": 12990,
        "sizes": "P, M, G, GG",
        "color": "Preto",
        "in_stock": True,
    },
    {
        "name": "Top Fitness Nude",
        "category": "Top",
        "description": "Top com bojo removível e alças reguláveis.",
        "price_cents": 7990,
        "sizes": "P, M, G",
        "color": "Nude",
        "in_stock": True,
    },
    {
        "name": "Shorts Tactel Rosa",
        "category": "Shorts",
        "description": "Shorts leve e respirável, ideal para corrida e treino funcional.",
        "price_cents": 6990,
        "sizes": "P, M, G",
        "color": "Rosa",
        "in_stock": False,
    },
]


def seed_if_empty():
    if Product.query.first():
        return
    for data in SEED_PRODUCTS:
        db.session.add(Product(**data))
    db.session.commit()
