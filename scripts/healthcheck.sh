#!/bin/bash

BASE_URL="${1:-http://localhost:8000}"
PASS=0
FAIL=0

check() {
  local desc="$1"
  local url="$2"
  local expect="$3"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [ "$status" = "$expect" ]; then
    echo "  PASS: $desc ($status)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $desc (expected $expect, got $status)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Life Compass Health Check ==="
echo "Target: $BASE_URL"
echo ""

check "Health endpoint" "$BASE_URL/api/health" "200"
check "Careers endpoint" "$BASE_URL/api/careers/" "200"
check "Sample report" "$BASE_URL/api/sample-report" "200"
check "Landing page" "$BASE_URL/api/admin/landing-page" "200"
check "Auth no token" "$BASE_URL/api/discovery/history" "401"
check "Admin no token" "$BASE_URL/api/admin/stats" "401"
check "404 route" "$BASE_URL/api/nonexistent" "404"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
exit $FAIL
