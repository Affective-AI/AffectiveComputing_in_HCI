from datetime import datetime
from typing import List, Dict, Tuple

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, and_
from sqlalchemy.orm import Session, aliased

from .database import get_db
from .auth import get_current_user
from .models import User, Stress, StressStrength
from .schemas import StressCreate, StressPatch, StrengthAdd, StressOut, StressDetail, StrengthItem

router = APIRouter(prefix="/api/stress", tags=["stress"])

# ---- 辅助：取“最新强度” ----
def latest_strength_map(db: Session, stress_ids: List[int]) -> Dict[int, Tuple[int, datetime]]:
    if not stress_ids:
        return {}
    # 子查询：每个 stress 的最大 ts
    sub = (
        db.query(
            StressStrength.stress_id.label("sid"),
            func.max(StressStrength.ts).label("max_ts"),
        )
        .filter(StressStrength.stress_id.in_(stress_ids))
        .group_by(StressStrength.stress_id)
        .subquery()
    )
    ss2 = aliased(StressStrength)
    rows = (
        db.query(ss2.stress_id, ss2.strength, ss2.ts)
        .join(sub, and_(ss2.stress_id == sub.c.sid, ss2.ts == sub.c.max_ts))
        .all()
    )
    return {r[0]: (r[1], r[2]) for r in rows}


# ---- 创建压力 ----
@router.post("", response_model=StressOut, status_code=status.HTTP_201_CREATED)
def create_stress(payload: StressCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = Stress(
        user_id=user.id,
        title=payload.title.strip(),
        description=(payload.description or None),
        status="active",
    )
    db.add(s)
    db.flush()  # 先拿到 id

    first = StressStrength(stress_id=s.id, strength=payload.strength, note="initial", source="manual")
    db.add(first)
    db.commit()
    db.refresh(s)

    return StressOut(
        id=s.id,
        title=s.title,
        description=s.description,
        status=s.status,
        created_at=s.created_at,
        updated_at=s.updated_at,
        current_strength=first.strength,
        last_strength_at=first.ts,
    )


# ---- 列表：我的压力（含当前强度） ----
@router.get("", response_model=List[StressOut])
def list_stresses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(Stress).filter(Stress.user_id == user.id).order_by(Stress.created_at.desc()).all()
    ids = [x.id for x in items]
    latest = latest_strength_map(db, ids)
    out: List[StressOut] = []
    for s in items:
        cur, ts = latest.get(s.id, (0, s.created_at))
        out.append(
            StressOut(
                id=s.id,
                title=s.title,
                description=s.description,
                status=s.status,
                created_at=s.created_at,
                updated_at=s.updated_at,
                current_strength=cur,
                last_strength_at=ts,
            )
        )
    # 可按 last_strength_at 排序（最近有记录的排前）
    out.sort(key=lambda x: x.last_strength_at, reverse=True)
    return out


# ---- 详情：含完整时间序列 ----
@router.get("/{stress_id}", response_model=StressDetail)
def get_stress(stress_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.query(Stress).filter(Stress.id == stress_id, Stress.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")

    hist = (
        db.query(StressStrength)
        .filter(StressStrength.stress_id == s.id)
        .order_by(StressStrength.ts.asc())
        .all()
    )
    return StressDetail(
        id=s.id,
        title=s.title,
        description=s.description,
        status=s.status,
        created_at=s.created_at,
        updated_at=s.updated_at,
        history=[StrengthItem.model_validate(h) for h in hist],
    )


# ---- 追加一次强度记录 ----
@router.post("/{stress_id}/strength", response_model=StrengthItem, status_code=status.HTTP_201_CREATED)
def add_strength(stress_id: int, payload: StrengthAdd, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.query(Stress).filter(Stress.id == stress_id, Stress.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")

    h = StressStrength(
        stress_id=s.id,
        strength=payload.strength,
        note=(payload.note or None),
        source=(payload.source or "manual"),
    )
    db.add(h)

    # 顺手更新父行的 updated_at（因为插子表默认不会触发 onupdate）
    s.updated_at = func.now()

    db.commit()
    db.refresh(h)
    return StrengthItem.model_validate(h)


# ---- 修改标题/描述/状态（可选） ----
@router.patch("/{stress_id}", response_model=StressDetail)
def patch_stress(stress_id: int, payload: StressPatch, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.query(Stress).filter(Stress.id == stress_id, Stress.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")

    if payload.title is not None:
        s.title = payload.title.strip()
    if payload.description is not None:
        s.description = payload.description.strip() or None
    if payload.status is not None:
        s.status = payload.status

    db.commit()
    db.refresh(s)

    hist = (
        db.query(StressStrength)
        .filter(StressStrength.stress_id == s.id)
        .order_by(StressStrength.ts.asc())
        .all()
    )
    return StressDetail(
        id=s.id,
        title=s.title,
        description=s.description,
        status=s.status,
        created_at=s.created_at,
        updated_at=s.updated_at,
        history=[StrengthItem.model_validate(h) for h in hist],
    )
