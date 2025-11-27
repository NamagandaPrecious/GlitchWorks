#!/usr/bin/env python3
"""
Quick test script to verify Kaggle API authentication.
"""

import os
import sys

def test_kaggle_auth():
    """Test Kaggle API authentication."""
    print("=" * 60)
    print("Testing Kaggle API Authentication")
    print("=" * 60)
    
    # Check environment variable
    token = os.getenv("KAGGLE_API_TOKEN")
    if token:
        print(f"✅ KAGGLE_API_TOKEN found (first 10 chars: {token[:10]}...)")
    else:
        print("❌ KAGGLE_API_TOKEN not set")
        print("   Set it with: export KAGGLE_API_TOKEN=your_token")
        return False
    
    # Check if using KAGGLE_API_TOKEN (CLI only, not Python API)
    username = os.getenv("KAGGLE_USERNAME")
    key = os.getenv("KAGGLE_KEY")
    
    if token and not (username and key):
        print("ℹ️  Using KAGGLE_API_TOKEN (CLI method)")
        print("   Note: Python API requires KAGGLE_USERNAME/KAGGLE_KEY")
        print("   Testing with CLI...")
        
        # Test with CLI
        import subprocess
        try:
            result = subprocess.run(
                ["kaggle", "competitions", "list"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                print("✅ CLI authentication successful!")
                print("\nSample output:")
                lines = result.stdout.strip().split('\n')
                for line in lines[:5]:
                    print(f"  {line}")
                return True
            else:
                print(f"❌ CLI authentication failed: {result.stderr}")
                return False
        except FileNotFoundError:
            print("❌ kaggle CLI not found. Activate venv: source venv/bin/activate")
            return False
        except Exception as e:
            print(f"❌ CLI test failed: {e}")
            return False
    
    # Try Python API method
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        print("✅ Kaggle Python API authentication successful!")
        
        # Test by getting user info or listing competitions
        try:
            competitions = api.competitions_list(max_items=3)
            print(f"✅ Successfully retrieved {len(competitions)} competitions")
            print("\nSample competitions:")
            for comp in competitions:
                print(f"  - {comp.ref}")
            return True
        except Exception as e:
            print(f"⚠️  Authentication works but API call failed: {e}")
            return True  # Auth worked, just API call issue
    except ImportError:
        print("❌ Kaggle package not installed")
        print("   Install with: pip install kaggle")
        return False
    except Exception as e:
        print(f"❌ Python API authentication failed: {e}")
        print("   If using KAGGLE_API_TOKEN, the CLI method will be used instead")
        return False

if __name__ == "__main__":
    success = test_kaggle_auth()
    sys.exit(0 if success else 1)

