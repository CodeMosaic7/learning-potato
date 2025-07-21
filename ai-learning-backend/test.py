
from database.db import Base, engine

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)