from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

from app.config import settings
from app.database import Base

# Import all models so Alembic can detect their tables
from app.models.user import User
from app.models.deal import Deal
from app.models.participation import Participation
from app.models.order import Order
from app.models.notification import Notification


# ==========================================
# ALEMBIC CONFIGURATION
# ==========================================

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ==========================================
# DATABASE URL
# ==========================================

from sqlalchemy.engine import URL

database_url = URL.create(
    drivername="mysql+pymysql",
    username=settings.DATABASE_USER,
    password=settings.DATABASE_PASSWORD,
    host=settings.DATABASE_HOST,
    port=settings.DATABASE_PORT,
    database=settings.DATABASE_NAME,
)

config.set_main_option(
    "sqlalchemy.url",
    database_url.render_as_string(hide_password=False).replace("%", "%%")
)


# ==========================================
# MODEL METADATA
# ==========================================

target_metadata = Base.metadata


# ==========================================
# OFFLINE MIGRATION
# ==========================================

def run_migrations_offline() -> None:

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ==========================================
# ONLINE MIGRATION
# ==========================================

def run_migrations_online() -> None:

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ==========================================
# RUN MIGRATIONS
# ==========================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()