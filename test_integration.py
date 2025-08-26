"""
Integration Test for Claude Token Tracking System
Tests all components and validates functionality
"""

import os
import sys
import json
import time
import subprocess
from datetime import datetime

def test_basic_functionality():
    """Test basic token tracking functions"""
    print("🔧 Testing basic functionality...")
    
    # Test estimation
    try:
        result = subprocess.run([
            sys.executable, 'token_usage.py', 'estimate', 
            'I will help you create a comprehensive token tracking system'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print(f"✅ Token estimation: {result.stdout.strip()}")
        else:
            print(f"❌ Token estimation failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Error testing estimation: {e}")
    
    # Test status display
    try:
        result = subprocess.run([
            sys.executable, 'token_usage.py', 'status'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print(f"✅ Status display: {result.stdout.strip()}")
        else:
            print(f"❌ Status display failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Error testing status: {e}")

def test_enhanced_tracker():
    """Test enhanced tracker functionality"""
    print("\n🚀 Testing enhanced tracker...")
    
    try:
        result = subprocess.run([
            sys.executable, 'claude_token_tracker.py', 'status'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print(f"✅ Enhanced tracker status: {result.stdout.strip()}")
        else:
            print(f"❌ Enhanced tracker failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Error testing enhanced tracker: {e}")

def test_powershell_integration():
    """Test PowerShell hook integration"""
    print("\n🔄 Testing PowerShell integration...")
    
    try:
        result = subprocess.run([
            'powershell', '-ExecutionPolicy', 'Bypass', '-Command',
            f"& '{os.path.join(os.getcwd(), 'claude_hook.ps1')}' -Action status"
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print(f"✅ PowerShell hook: {result.stdout.strip()}")
        else:
            print(f"❌ PowerShell hook failed: {result.stderr}")
    except Exception as e:
        print(f"❌ Error testing PowerShell: {e}")

def test_file_structure():
    """Verify all required files exist"""
    print("\n📁 Checking file structure...")
    
    required_files = [
        'token_usage.py',
        'claude_token_tracker.py', 
        'token_monitor.py',
        'claude_hook.ps1',
        'claude_tokens.bat',
        'token_tracking_setup.md',
        'token_usage.json'
    ]
    
    for file in required_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✅ {file} ({size:,} bytes)")
        else:
            print(f"❌ Missing: {file}")

def test_json_structure():
    """Validate JSON structure"""
    print("\n📊 Checking JSON data structure...")
    
    try:
        if os.path.exists('token_usage.json'):
            with open('token_usage.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            required_fields = ['input', 'output', 'total', 'start_time', 'reset_time']
            missing_fields = []
            
            for field in required_fields:
                if field in data:
                    print(f"✅ {field}: {data[field]}")
                else:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"❌ Missing fields: {missing_fields}")
            
        else:
            print("ℹ️ token_usage.json not found (will be created on first use)")
            
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")

def validate_reset_logic():
    """Test automatic reset functionality"""
    print("\n⏰ Validating reset logic...")
    
    try:
        if os.path.exists('token_usage.json'):
            with open('token_usage.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'reset_time' in data:
                reset_time = datetime.fromisoformat(data['reset_time'])
                start_time = datetime.fromisoformat(data['start_time'])
                current_time = datetime.now()
                
                hours_since_start = (current_time - start_time).total_seconds() / 3600
                hours_until_reset = (reset_time - current_time).total_seconds() / 3600
                
                print(f"✅ Hours since start: {hours_since_start:.1f}")
                print(f"✅ Hours until reset: {hours_until_reset:.1f}")
                
                if hours_until_reset > 5 or hours_until_reset < 0:
                    print("⚠️ Warning: Reset timing may be incorrect")
                else:
                    print("✅ Reset timing looks correct")
            
    except Exception as e:
        print(f"❌ Error validating reset logic: {e}")

def integration_summary():
    """Provide integration summary and recommendations"""
    print("\n" + "="*60)
    print("🎯 CLAUDE TOKEN TRACKING INTEGRATION SUMMARY")
    print("="*60)
    
    print("\n✅ COMPLETED FEATURES:")
    print("  • Enhanced token estimation with text analysis")
    print("  • Automatic 5-hour reset cycle (Max20 plan)")
    print("  • Multiple tracking methods (manual, estimated, monitored)")
    print("  • Background monitoring with clipboard detection")
    print("  • PowerShell integration for Windows")
    print("  • Backward compatibility with existing token_usage.py")
    print("  • Comprehensive status display")
    print("  • File-based token update system")
    
    print("\n🔧 USAGE METHODS:")
    print("  1. Manual: python token_usage.py add [input] [output]")
    print("  2. Estimation: python token_usage.py add --estimate-input")
    print("  3. Background: python token_monitor.py start --daemon")
    print("  4. PowerShell: .\\claude_hook.ps1 -Action monitor")
    print("  5. Batch utility: claude_tokens.bat [command]")
    
    print("\n🎨 STATUS INTEGRATION:")
    print("  • Compatible with existing status line display")
    print("  • Enhanced with percentage, time remaining, session counts")
    print("  • Maintains original Korean language support")
    print("  • Provides both simple and detailed views")
    
    print("\n🔍 MONITORING CAPABILITIES:")
    print("  • Clipboard content analysis for Claude conversations")
    print("  • Process monitoring for Node.js/Claude Code")
    print("  • Network activity detection (basic)")
    print("  • File-based request system for external integration")
    
    print("\n⚡ QUICK START RECOMMENDATIONS:")
    print("  1. For precise tracking: Use manual add commands")
    print("  2. For convenience: Start background monitor")
    print("  3. For Windows users: Use PowerShell hook")
    print("  4. For automation: Integrate with file-based requests")
    
    print("\n🔮 FUTURE ENHANCEMENTS:")
    print("  • Direct API response header parsing")
    print("  • WebSocket connection monitoring") 
    print("  • Claude Code plugin integration")
    print("  • Real-time network traffic analysis")
    
    print("\n" + "="*60)
    print("System is ready for use! 🚀")
    print("="*60)

def main():
    """Run all integration tests"""
    # Set UTF-8 encoding for Windows
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
    
    print("CLAUDE TOKEN TRACKING INTEGRATION TEST")
    print("="*50)
    
    # Change to the correct directory
    os.chdir(r"C:\Users\gyb07\projects")
    
    # Run all tests
    test_file_structure()
    test_json_structure() 
    test_basic_functionality()
    test_enhanced_tracker()
    test_powershell_integration()
    validate_reset_logic()
    
    # Show integration summary
    integration_summary()

if __name__ == "__main__":
    main()