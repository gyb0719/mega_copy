"""
Background Token Monitor for Claude Code
Continuously monitors for Claude usage patterns and updates token tracking.
"""

import os
import sys
import time
import json
import threading
import subprocess
import signal
from datetime import datetime
from claude_token_tracker import TokenTracker, APIHook
import argparse


class BackgroundMonitor:
    def __init__(self, update_interval: int = 30):
        self.tracker = TokenTracker()
        self.api_hook = APIHook(self.tracker)
        self.update_interval = update_interval
        self.running = False
        self.monitor_thread = None
        self.last_clipboard_hash = None
        
    def start(self):
        """Start background monitoring"""
        if self.running:
            print("Monitor is already running")
            return
        
        self.running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        print(f"Token monitor started (update interval: {self.update_interval}s)")
        print("Press Ctrl+C to stop")
        
        # Set up signal handler for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        
        try:
            # Keep main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()
    
    def stop(self):
        """Stop background monitoring"""
        if not self.running:
            return
        
        print("\nStopping token monitor...")
        self.running = False
        
        if self.monitor_thread and self.monitor_thread.is_alive():
            self.monitor_thread.join(timeout=5)
        
        print("Token monitor stopped")
    
    def _signal_handler(self, signum, frame):
        """Handle interrupt signal"""
        self.stop()
        sys.exit(0)
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                self._check_for_updates()
                time.sleep(self.update_interval)
            except Exception as e:
                print(f"Monitor error: {e}")
                time.sleep(5)  # Wait before retrying
    
    def _check_for_updates(self):
        """Check for potential token usage updates"""
        # Monitor clipboard for Claude conversations
        self._monitor_clipboard()
        
        # Monitor process activity (if possible)
        self._monitor_processes()
        
        # Check for manual update requests
        self._check_update_requests()
    
    def _monitor_clipboard(self):
        """Monitor clipboard for Claude conversation content"""
        try:
            result = subprocess.run(
                ['powershell', '-command', 'Get-Clipboard'],
                capture_output=True, text=True, timeout=5
            )
            
            if result.returncode == 0 and result.stdout:
                content = result.stdout.strip()
                content_hash = hash(content)
                
                # Only process if clipboard changed
                if content_hash != self.last_clipboard_hash:
                    self.last_clipboard_hash = content_hash
                    
                    # Check if it looks like a Claude conversation
                    if self._is_claude_content(content):
                        tokens = self.api_hook.intercept_request(content)
                        if tokens:
                            input_tokens, output_tokens = tokens
                            if input_tokens > 0 or output_tokens > 0:
                                self.tracker.save_usage(input_tokens, output_tokens, is_estimated=True)
                                self._log_detection("clipboard", input_tokens, output_tokens)
        
        except Exception:
            pass  # Silent fail for clipboard monitoring
    
    def _monitor_processes(self):
        """Monitor for Claude Code processes"""
        try:
            # Check for running Claude processes
            result = subprocess.run(
                ['tasklist', '/FI', 'IMAGENAME eq node.exe', '/FO', 'CSV'],
                capture_output=True, text=True, timeout=5
            )
            
            if result.returncode == 0 and 'node.exe' in result.stdout:
                # Claude Code is likely running
                self._log_activity("process_detected", "Claude Code process active")
        
        except Exception:
            pass
    
    def _check_update_requests(self):
        """Check for manual update request files"""
        request_file = "token_update_request.json"
        
        if os.path.exists(request_file):
            try:
                with open(request_file, 'r', encoding='utf-8') as f:
                    request = json.load(f)
                
                input_tokens = request.get('input', 0)
                output_tokens = request.get('output', 0)
                
                if input_tokens > 0 or output_tokens > 0:
                    self.tracker.save_usage(input_tokens, output_tokens, is_estimated=False)
                    self._log_detection("manual_request", input_tokens, output_tokens)
                
                # Remove processed request
                os.remove(request_file)
                
            except Exception as e:
                print(f"Error processing update request: {e}")
    
    def _is_claude_content(self, content: str) -> bool:
        """Enhanced detection of Claude conversation content"""
        claude_indicators = [
            "I'll help you",
            "Let me",
            "I can help",
            "I'll create",
            "I'll analyze",
            "<function_calls>",
            "```python",
            "```javascript",
            "Assistant:",
            "Human:",
            "Claude:",
            "antml:invoke",
            "function_calls",
            "Tool:",
            "I understand you'd like"
        ]
        
        content_lower = content.lower()
        indicator_count = sum(1 for indicator in claude_indicators 
                            if indicator.lower() in content_lower)
        
        # Also check for typical code patterns Claude generates
        code_patterns = [
            "def ", "class ", "import ", "from ", "function",
            "const ", "let ", "var ", "=>", "console.log"
        ]
        
        code_count = sum(1 for pattern in code_patterns 
                        if pattern in content_lower)
        
        # Require multiple indicators for confidence
        return indicator_count >= 2 or (indicator_count >= 1 and code_count >= 2)
    
    def _log_detection(self, source: str, input_tokens: int, output_tokens: int):
        """Log token detection"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message = f"[{timestamp}] Monitor: {source} - Input: {input_tokens}, Output: {output_tokens}"
        print(message)
        
        # Also log to file
        try:
            with open("token_monitor.log", 'a', encoding='utf-8') as f:
                f.write(message + "\n")
        except Exception:
            pass
    
    def _log_activity(self, activity_type: str, message: str):
        """Log general activity"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] Activity: {activity_type} - {message}"
        
        try:
            with open("token_monitor.log", 'a', encoding='utf-8') as f:
                f.write(log_message + "\n")
        except Exception:
            pass
    
    def get_status(self):
        """Get current monitoring status"""
        status = {
            "running": self.running,
            "update_interval": self.update_interval,
            "current_usage": self.tracker.load_usage()
        }
        return status


def create_update_request(input_tokens: int, output_tokens: int):
    """Create a manual update request file"""
    request = {
        "input": input_tokens,
        "output": output_tokens,
        "timestamp": datetime.now().isoformat()
    }
    
    with open("token_update_request.json", 'w', encoding='utf-8') as f:
        json.dump(request, f, ensure_ascii=False, indent=2)
    
    print(f"Update request created: Input={input_tokens}, Output={output_tokens}")


def main():
    parser = argparse.ArgumentParser(description='Background Token Monitor')
    parser.add_argument('command', nargs='?', default='start',
                       help='Command: start, stop, status, request')
    parser.add_argument('--interval', type=int, default=30,
                       help='Update interval in seconds (default: 30)')
    parser.add_argument('--input', type=int, help='Input tokens for request command')
    parser.add_argument('--output', type=int, help='Output tokens for request command')
    parser.add_argument('--daemon', action='store_true',
                       help='Run as daemon process')
    
    args = parser.parse_args()
    
    if args.command == 'start':
        monitor = BackgroundMonitor(args.interval)
        
        if args.daemon:
            # Run as background process (simplified daemon)
            print("Starting monitor as background process...")
            print(f"PID file will be created: token_monitor.pid")
            
            # Save PID for later stopping
            with open("token_monitor.pid", 'w') as f:
                f.write(str(os.getpid()))
            
            try:
                monitor.start()
            finally:
                # Clean up PID file
                if os.path.exists("token_monitor.pid"):
                    os.remove("token_monitor.pid")
        else:
            monitor.start()
    
    elif args.command == 'stop':
        # Stop daemon if running
        if os.path.exists("token_monitor.pid"):
            try:
                with open("token_monitor.pid", 'r') as f:
                    pid = int(f.read().strip())
                
                os.kill(pid, signal.SIGTERM)
                os.remove("token_monitor.pid")
                print(f"Stopped monitor process (PID: {pid})")
            except Exception as e:
                print(f"Error stopping monitor: {e}")
        else:
            print("No monitor PID file found")
    
    elif args.command == 'status':
        monitor = BackgroundMonitor()
        status = monitor.get_status()
        print(f"Monitor running: {status['running']}")
        print(f"Update interval: {status['update_interval']}s")
        print(f"Current usage: {status['current_usage']['total']} tokens")
    
    elif args.command == 'request':
        if args.input is not None and args.output is not None:
            create_update_request(args.input, args.output)
        else:
            print("Error: --input and --output required for 'request' command")
    
    else:
        print(f"Unknown command: {args.command}")
        print("Available commands: start, stop, status, request")


if __name__ == "__main__":
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
    
    main()