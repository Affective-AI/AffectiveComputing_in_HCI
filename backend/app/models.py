from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import relationship, validates
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())

    __table_args__ = (Index("ix_users_username_unique", "username", unique=True),)

    @validates("username")
    def validate_username(self, key, value):
        v = (value or "").strip()
        if len(v) < 2:
            raise ValueError("username too short")
        return v


class Stress(Base):
    __tablename__ = "stress"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    title = Column(String(255), nullable=False)        # 名称
    description = Column(String(2000), nullable=True)  # 描述（可空）
    status = Column(String(32), nullable=False, server_default="active")  # active/resolved/snoozed/maintenance

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", lazy="joined")
    strengths = relationship("StressStrength", back_populates="stress", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_stress_user", "user_id"),
    )


class StressStrength(Base):
    __tablename__ = "stress_strength"

    id = Column(Integer, primary_key=True)
    stress_id = Column(Integer, ForeignKey("stress.id", ondelete="CASCADE"), index=True, nullable=False)

    # 本次强度（0-10）
    strength = Column(Integer, nullable=False)
    # 备注（可空），例如“完成一次微计划后再评估”
    note = Column(String(1000), nullable=True)
    # 来源（可空），如 manual/plan/practice/auto
    source = Column(String(32), nullable=True)

    ts = Column(DateTime, server_default=func.now(), nullable=False)

    stress = relationship("Stress", back_populates="strengths")

    __table_args__ = (
        Index("ix_strength_stress_ts", "stress_id", "ts"),
    )
