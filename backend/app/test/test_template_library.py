# test_template_library.py - Run this to test your API

import requests
import json

BASE_URL = "http://localhost:8000/template-library"

def test_endpoint(endpoint, method="GET", data=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)

        print(f"\n🧪 Testing {method} {endpoint}")
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {json.dumps(result, indent=2)[:200]}...")
            return result
        else:
            print(f"❌ Failed: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("🚀 Testing Template Library API...")

    # Test 1: Health Check
    health = test_endpoint("/health")

    # Test 2: Categories
    categories = test_endpoint("/categories")

    # Test 3: Templates
    templates = test_endpoint("/templates")

    # Test 4: Featured Templates
    featured = test_endpoint("/templates/featured")

    # Test 5: Dashboard
    dashboard = test_endpoint("/dashboard")

    # Test 6: Create Template
    new_template_data = {
        "title": "API Test Template",
        "description": "Created via Python test script",
        "content": "Test prompt for [TOPIC] with [GOAL]",
        "category": "Marketing",
        "tags": ["test", "api"],
        "is_public": True,
        "is_featured": False
    }
    created = test_endpoint("/templates", "POST", new_template_data)

    # Summary
    print("\n📊 Test Summary:")
    tests = [
        ("Health Check", health is not None),
        ("Categories", categories is not None),
        ("Templates", templates is not None),
        ("Featured", featured is not None),
        ("Dashboard", dashboard is not None),
        ("Create Template", created is not None)
    ]

    for test_name, passed in tests:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")

if __name__ == "__main__":
    main()
