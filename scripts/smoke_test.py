#!/usr/bin/env python3
"""Smoke tests for Life Compass API. Run: python3 scripts/smoke_test.py"""
import sys, os, json, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import httpx

BASE = os.environ.get("API_URL", "http://localhost:8000")
PASS = 0
FAIL = 0

def check(desc, method, path, expect_status=200, authed=None, data=None):
    global PASS, FAIL
    url = f"{BASE}{path}"
    headers = {}
    if authed:
        headers["Authorization"] = f"Bearer {authed}"
    try:
        if method == "GET":
            r = httpx.get(url, headers=headers, timeout=10)
        elif method == "POST":
            r = httpx.post(url, headers=headers, json=data, timeout=10)
        elif method == "PUT":
            r = httpx.put(url, headers=headers, json=data, timeout=10)
        elif method == "DELETE":
            r = httpx.delete(url, headers=headers, timeout=10)
        status = r.status_code
        ok = "PASS" if status == expect_status else "FAIL"
        print(f"  {ok}: {desc} ({status})")
        if status == expect_status:
            PASS += 1
        else:
            FAIL += 1
        return r.json() if status == 200 else None
    except Exception as e:
        print(f"  FAIL: {desc} (error: {e})")
        FAIL += 1
        return None

def run():
    print(f"=== Life Compass Smoke Tests ===")
    print(f"Target: {BASE}\n")

    # Public endpoints
    health = check("Health", "GET", "/api/health")
    check("Sample report", "GET", "/api/sample-report")
    check("Landing page", "GET", "/api/admin/landing-page")
    check("Careers list", "GET", "/api/careers/")

    # Auth flow
    email = f"test_{int(time.time())}@test.com"
    pw = "testpass123"

    register = check("Register", "POST", "/api/auth/register", data={"email": email, "password": pw})
    token = register.get("access_token") if register else None

    if token:
        login = check("Login", "POST", "/api/auth/login", data={"email": email, "password": pw})
        check("History (authed)", "GET", "/api/discovery/history", authed=token)
        check("Experiments (authed)", "GET", "/api/discovery/experiments", authed=token)

        refresh_token = login.get("refresh_token", "")
        check("Refresh token", "POST", "/api/auth/refresh", data={"refresh_token": refresh_token})

        # Discovery
        profile = {
            "stage": "Mahasiswa", "interests": ["Memprogram", "Merancang"],
            "work_values": ["Kreativitas", "Gaji Tinggi"],
            "skills": ["Pemrograman", "Desain Grafis"],
            "constraints": ["Biaya Terbatas"],
            "work_preferences": ["Kerja dalam Tim", "Remote/WFH"],
        }
        discovery = check("Submit discovery", "POST", "/api/discovery/submit", authed=token, data=profile)
        if discovery:
            match_id = discovery.get("match_id")
            if match_id:
                check(f"Result {match_id}", "GET", f"/api/discovery/result/{match_id}", authed=token)

        # Chat
        check("Chat", "POST", "/api/chat/", authed=token, data={"question": "Apa itu Life Compass?"})

        # Profile
        check("Get profile", "GET", "/api/user/profile", authed=token)
        check("Update profile", "PUT", "/api/user/profile", authed=token, data={"display_name": "Test User"})

        # Admin should fail (user is not admin)
        check("Admin stats (unauthorized)", "GET", "/api/admin/stats", authed=token, expect_status=403)

        # Career detail
        careers = check("Careers list", "GET", "/api/careers/")
        if careers and len(careers) > 0:
            career_id = careers[0]["id"]
            check(f"Career detail {career_id}", "GET", f"/api/careers/{career_id}")

        # Export
        check("Export data", "GET", "/api/auth/export", authed=token)

        # Account deletion
        check("Delete account", "DELETE", "/api/auth/account", authed=token)
    else:
        print("  SKIP: Auth-dependent tests (registration failed)")

    # Unauthed tests
    check("History (unauthed)", "GET", "/api/discovery/history", expect_status=401)
    check("Admin (unauthed)", "GET", "/api/admin/stats", expect_status=401)

    print(f"\n=== Results: {PASS} passed, {FAIL} failed ===")
    return 1 if FAIL > 0 else 0

if __name__ == "__main__":
    sys.exit(run())
