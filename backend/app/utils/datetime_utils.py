
from datetime import datetime, timezone

# GET CURRENT UTC TIME

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# NORMALIZE DATETIME TO UTC

def normalize_datetime(value: datetime) -> datetime:

    if value.tzinfo is None or value.utcoffset() is None:
        # MySQL DATETIME returns naive datetime values.
        # Our application stores all datetimes in UTC.
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)

# CHECK IF DEADLINE HAS PASSED

def is_deadline_passed(deadline: datetime) -> bool:

    normalized_deadline = normalize_datetime(deadline)

    return utc_now() >= normalized_deadline

# CHECK IF DEAL IS STILL OPEN

def is_before_deadline(deadline: datetime) -> bool:

    normalized_deadline = normalize_datetime(deadline)

    return utc_now() < normalized_deadline
