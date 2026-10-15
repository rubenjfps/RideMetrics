from alembic import context
from sqlalchemy import engine_from_config, pool

from app.config import settings
from app.database import Base
from app import models  # noqa: F401
# Importar os modelos para o Alembic os conseguir detetar.
# Vamos acrescentar os modelos aqui à medida que forem criados.

config = context.config

# A ligação vem do .env, não do alembic.ini.
config.set_main_option(
    "sqlalchemy.url",
    settings.database_url.replace("%", "%%"),
)

target_metadata = Base.metadata

# Gerir apenas o schema das atividades.
ACTIVITY_SCHEMA = "ridemetrics"


def include_name(name, type_, parent_names):
    if type_ == "schema":
        return name == ACTIVITY_SCHEMA

    if type_ == "table":
        return parent_names.get("schema_name") == ACTIVITY_SCHEMA

    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        include_name=include_name,
        version_table_schema=ACTIVITY_SCHEMA,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Criar o schema de atividades se ainda não existir.
        connection.exec_driver_sql(
            f"CREATE SCHEMA IF NOT EXISTS {ACTIVITY_SCHEMA}"
        )
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            include_name=include_name,
            version_table_schema=ACTIVITY_SCHEMA,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()