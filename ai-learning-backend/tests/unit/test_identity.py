import pytest
from bson import ObjectId
from app.domains.identity.policies import AuthenticatedStudent, verify_resource_ownership
from app.core.exceptions import AppException


def test_verify_resource_ownership_success():
    student_id = str(ObjectId())
    student = AuthenticatedStudent(
        id=student_id,
        email="test@example.com",
        username="testuser",
        full_name="Test Student",
        role="student",
        account_status="active",
        is_verified=False,
    )
    # Should not raise exception
    verify_resource_ownership(student_id, student)
    verify_resource_ownership(ObjectId(student_id), student)


def test_verify_resource_ownership_forbidden():
    student_a_id = str(ObjectId())
    student_b_id = str(ObjectId())

    student_a = AuthenticatedStudent(
        id=student_a_id,
        email="student_a@example.com",
        username="student_a",
        full_name="Student A",
        role="student",
        account_status="active",
    )

    with pytest.raises(AppException) as exc_info:
        verify_resource_ownership(student_b_id, student_a)

    assert exc_info.value.status_code == 403
    assert exc_info.value.code == "RESOURCE_ACCESS_DENIED"
