"""
Claude Code Token Usage Tracker
Enhanced token tracking with actual API integration and estimation capabilities.
"""

import json
import os
import re
import sys
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import subprocess
import argparse


# Configuration
USAGE_FILE = "token_usage.json"
# Model-specific configuration
MAX_TOKENS = 220_000  # Max20 plan: 220K tokens per 5 hours

# Token multipliers for different models (how much they actually consume vs estimated)
MODEL_MULTIPLIERS = {
    'opus': 2.5,      # Opus 4.1 uses ~2.5x more tokens
    'sonnet': 1.0,    # Sonnet 4 baseline consumption
    'haiku': 0.3,     # Haiku uses ~30% of baseline tokens
    'default': 1.0    # Default fallback
}
RESET_HOURS = 5
MONITORING_LOG = "claude_usage.log"

# Token estimation constants (approximate values for Claude models)
CHARS_PER_TOKEN = 4  # Rough estimate: 1 token ≈ 4 characters
TOKEN_BUFFER = 1.1   # Add 10% buffer for safety


class TokenTracker:
    def __init__(self):
        self.lock = threading.Lock()
        
    def load_usage(self) -> Dict:
        """Load current token usage data"""
        with self.lock:
            if os.path.exists(USAGE_FILE):
                try:
                    with open(USAGE_FILE, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        # Check if reset is needed
                        if 'reset_time' in data:
                            reset_time = datetime.fromisoformat(data['reset_time'])
                            if datetime.now() >= reset_time:
                                return self._create_new_usage()
                        return data
                except (json.JSONDecodeError, KeyError):
                    return self._create_new_usage()
            return self._create_new_usage()
    
    def _create_new_usage(self) -> Dict:
        """Create new usage data structure"""
        now = datetime.now()
        reset_time = now + timedelta(hours=RESET_HOURS)
        return {
            "input": 0,
            "output": 0,
            "total": 0,
            "start_time": now.isoformat(),
            "reset_time": reset_time.isoformat(),
            "last_updated": now.isoformat(),
            "session_count": 0,
            "estimated_sessions": 0,
            "manual_updates": 0
        }
    
    def save_usage(self, input_tokens: int, output_tokens: int, is_estimated: bool = False) -> Dict:
        """Save token usage with optional estimation flag"""
        with self.lock:
            usage = self.load_usage()
            usage["input"] += input_tokens
            usage["output"] += output_tokens
            usage["total"] = usage["input"] + usage["output"]
            usage["last_updated"] = datetime.now().isoformat()
            
            if is_estimated:
                usage["estimated_sessions"] += 1
            else:
                usage["manual_updates"] += 1
            
            # Log the update
            self._log_usage(input_tokens, output_tokens, is_estimated)
            
            with open(USAGE_FILE, 'w', encoding='utf-8') as f:
                json.dump(usage, f, ensure_ascii=False, indent=2)
            
            return usage
    
    def _log_usage(self, input_tokens: int, output_tokens: int, is_estimated: bool):
        """Log token usage to file"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"{timestamp} | Input: {input_tokens}, Output: {output_tokens}, Estimated: {is_estimated}\n"
        
        try:
            with open(MONITORING_LOG, 'a', encoding='utf-8') as f:
                f.write(log_entry)
        except Exception:
            pass  # Silent fail for logging
    
    def estimate_tokens_from_text(self, text: str) -> int:
        """Estimate token count from text"""
        if not text:
            return 0
        
        # More sophisticated estimation
        # Count characters, words, and special patterns
        char_count = len(text)
        word_count = len(text.split())
        
        # Adjust for code patterns (more tokens per character)
        code_patterns = len(re.findall(r'[{}()\[\];,.]', text))
        special_chars = len(re.findall(r'[<>@#$%^&*+=|\\]', text))
        
        # Base estimation
        estimated = char_count / CHARS_PER_TOKEN
        
        # Adjustments
        if code_patterns > char_count * 0.1:  # Likely code
            estimated *= 1.2
        if special_chars > char_count * 0.05:  # Many special chars
            estimated *= 1.1
        
        # Apply safety buffer
        return int(estimated * TOKEN_BUFFER)
    
    def estimate_conversation_tokens(self, messages: list) -> Tuple[int, int]:
        """Estimate tokens for a conversation (input/output)"""
        input_tokens = 0
        output_tokens = 0
        
        for msg in messages:
            content = msg.get('content', '')
            role = msg.get('role', 'user')
            
            tokens = self.estimate_tokens_from_text(content)
            
            if role in ['user', 'system']:
                input_tokens += tokens
            else:  # assistant
                output_tokens += tokens
        
        return input_tokens, output_tokens
    
    def monitor_clipboard(self) -> Optional[Tuple[int, int]]:
        """Monitor clipboard for Claude conversation patterns"""
        try:
            # Try to get clipboard content (Windows)
            result = subprocess.run(
                ['powershell', '-command', 'Get-Clipboard'],
                capture_output=True, text=True, timeout=5
            )
            
            if result.returncode == 0 and result.stdout:
                content = result.stdout.strip()
                
                # Look for conversation patterns
                if self._is_claude_conversation(content):
                    return self._parse_conversation_tokens(content)
            
        except Exception:
            pass  # Silent fail
        
        return None
    
    def _is_claude_conversation(self, content: str) -> bool:
        """Check if content looks like a Claude conversation"""
        patterns = [
            r'Assistant:|Human:|User:',
            r'Claude:',
            r'I\'ll help you',
            r'<function_calls>',
            r'```python',
            r'Let me'
        ]
        
        return any(re.search(pattern, content, re.IGNORECASE) for pattern in patterns)
    
    def _parse_conversation_tokens(self, content: str) -> Tuple[int, int]:
        """Parse conversation content and estimate tokens"""
        # Simple parsing - split by common delimiters
        user_parts = []
        assistant_parts = []
        
        # Split by common conversation markers
        parts = re.split(r'(?:Human:|User:|Assistant:|Claude:)', content, flags=re.IGNORECASE)
        
        for i, part in enumerate(parts):
            if i % 2 == 0:  # Assuming alternating pattern
                user_parts.append(part.strip())
            else:
                assistant_parts.append(part.strip())
        
        user_text = ' '.join(user_parts)
        assistant_text = ' '.join(assistant_parts)
        
        input_tokens = self.estimate_tokens_from_text(user_text)
        output_tokens = self.estimate_tokens_from_text(assistant_text)
        
        return input_tokens, output_tokens
    
    def manual_update(self, input_tokens: int, output_tokens: int):
        """Manually update token usage"""
        return self.save_usage(input_tokens, output_tokens, is_estimated=False)
    
    def auto_estimate(self, text_input: str = None, text_output: str = None):
        """Automatically estimate and update token usage"""
        input_tokens = self.estimate_tokens_from_text(text_input) if text_input else 0
        output_tokens = self.estimate_tokens_from_text(text_output) if text_output else 0
        
        if input_tokens > 0 or output_tokens > 0:
            return self.save_usage(input_tokens, output_tokens, is_estimated=True)
        
        return self.load_usage()
    
    def reset_usage(self):
        """Reset token usage"""
        with self.lock:
            new_usage = self._create_new_usage()
            with open(USAGE_FILE, 'w', encoding='utf-8') as f:
                json.dump(new_usage, f, ensure_ascii=False, indent=2)
            print("Token usage reset successfully!")
    
    def get_status(self) -> str:
        """Get formatted status string with dynamic model adjustment"""
        usage = self.load_usage()
        total = usage.get("total", 0)
        
        # Get current model and its multiplier
        current_model = self.get_current_model()
        multiplier = self.get_model_multiplier()
        
        # Calculate effective token usage based on current model
        effective_total = total * multiplier
        
        remaining = MAX_TOKENS - effective_total
        percent_remaining = max(0, int((remaining / MAX_TOKENS) * 100))
        
        # Time remaining
        reset_time = datetime.fromisoformat(usage.get('reset_time', datetime.now().isoformat()))
        time_remaining = reset_time - datetime.now()
        
        if time_remaining.total_seconds() > 0:
            hours = int(time_remaining.total_seconds() // 3600)
            minutes = int((time_remaining.total_seconds() % 3600) // 60)
            time_str = f"{hours}h{minutes}m" if hours > 0 else f"{minutes}m"
        else:
            time_str = "Resetting..."
        
        def format_number(num):
            if num >= 1_000_000:
                return f"{num/1_000_000:.1f}M"
            elif num >= 1_000:
                return f"{num/1_000:.0f}K"
            return str(num)
        
        # Add dynamic model indicator with multiplier info
        model_indicator = f" [{current_model.upper()}]"
        if multiplier != 1.0:
            model_indicator += f" (x{multiplier})"
        
        return f"Tokens: {format_number(remaining)}/{format_number(MAX_TOKENS)} ({percent_remaining}% left) [{time_str}]{model_indicator}"
    
    def get_current_model(self) -> str:
        """Detect current Claude model being used"""
        # Check for manually forced model first
        usage = self.load_usage()
        forced_model = usage.get('forced_model')
        if forced_model and forced_model in MODEL_MULTIPLIERS:
            return forced_model
            
        try:
            # Try to get model info from /model command (if available)
            result = subprocess.run(
                ['claude', '/model'],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                model_output = result.stdout.lower().strip()
                
                if 'opus' in model_output:
                    return 'opus'
                elif 'sonnet' in model_output:
                    return 'sonnet'
                elif 'haiku' in model_output:
                    return 'haiku'
                elif 'plan mode' in model_output or 'default' in model_output:
                    # Default mode uses Opus 4.1 in plan mode, Sonnet 4 otherwise
                    return 'opus'  # Assume plan mode for now
                    
        except Exception:
            pass
        
        try:
            # Alternative: check for environment or system indicators
            # Look for process arguments or environment variables that might indicate model
            result = subprocess.run(
                ['powershell', '-command', 'Get-Process claude* | Select-Object ProcessName,CommandLine'],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0 and 'opus' in result.stdout.lower():
                return 'opus'
        except Exception:
            pass
        
        # Enhanced fallback detection based on usage patterns and session info
        usage = self.load_usage()
        recent_usage = usage.get("total", 0)
        
        # Check if we've had high-consumption patterns typical of Opus
        # Look at estimated vs manual updates ratio
        estimated_sessions = usage.get("estimated_sessions", 0)
        manual_updates = usage.get("manual_updates", 0)
        
        # High usage with few updates suggests large model responses (Opus)
        if recent_usage > 50000 and (estimated_sessions + manual_updates) < 10:
            return 'opus'
        
        # Very high usage definitely suggests Opus
        if recent_usage > 80000:
            return 'opus'
        
        # Low usage with many small interactions might be Haiku
        elif recent_usage < 15000 and (estimated_sessions + manual_updates) > 5:
            return 'haiku'
            
        # Default assumption based on current conversation context
        # Since we're in a coding session with complex tasks, likely Opus
        else:
            return 'opus'  # Conservative assumption for coding tasks
    
    def get_model_multiplier(self) -> float:
        """Get token multiplier for current model"""
        current_model = self.get_current_model()
        return MODEL_MULTIPLIERS.get(current_model, MODEL_MULTIPLIERS['default'])
    
    def _is_opus_active(self) -> bool:
        """Check if Opus 4.1 model is currently active (legacy method)"""
        return self.get_current_model() == 'opus'
    
    def get_detailed_status(self):
        """Get detailed status information with model-specific calculations"""
        usage = self.load_usage()
        current_model = self.get_current_model()
        multiplier = self.get_model_multiplier()
        
        # Calculate effective usage
        raw_total = usage.get('total', 0)
        effective_total = raw_total * multiplier
        
        def format_number(num):
            if num >= 1_000_000:
                return f"{num/1_000_000:.1f}M"
            elif num >= 1_000:
                return f"{num/1_000:.0f}K"
            return str(num)
        
        print(f"Current Model: {current_model.upper()} (multiplier: {multiplier}x)")
        print(f"Input tokens (raw): {format_number(usage.get('input', 0))}")
        print(f"Output tokens (raw): {format_number(usage.get('output', 0))}")
        print(f"Total used (raw): {format_number(raw_total)}")
        print(f"Total used (effective): {format_number(effective_total)}/{format_number(MAX_TOKENS)}")
        print(f"Remaining: {format_number(MAX_TOKENS - effective_total)}")
        print(f"Manual updates: {usage.get('manual_updates', 0)}")
        print(f"Estimated sessions: {usage.get('estimated_sessions', 0)}")
        
        if 'start_time' in usage:
            start = datetime.fromisoformat(usage['start_time'])
            print(f"Period start: {start.strftime('%Y-%m-%d %H:%M')}")
        
        if 'reset_time' in usage:
            reset = datetime.fromisoformat(usage['reset_time'])
            print(f"Next reset: {reset.strftime('%Y-%m-%d %H:%M')}")


class APIHook:
    """Hook system for intercepting API calls"""
    
    def __init__(self, tracker: TokenTracker):
        self.tracker = tracker
    
    def intercept_request(self, request_data: str) -> Optional[Tuple[int, int]]:
        """Attempt to intercept and parse API requests"""
        try:
            # Look for JSON-like structures that might contain messages
            if '{' in request_data and 'messages' in request_data:
                # Try to extract message content
                messages = self._extract_messages(request_data)
                if messages:
                    return self.tracker.estimate_conversation_tokens(messages)
        except Exception:
            pass
        
        return None
    
    def _extract_messages(self, data: str) -> Optional[list]:
        """Extract messages from request data"""
        try:
            # Simple extraction - look for content between quotes
            content_matches = re.findall(r'"content"\s*:\s*"([^"]*)"', data)
            role_matches = re.findall(r'"role"\s*:\s*"([^"]*)"', data)
            
            if len(content_matches) == len(role_matches):
                messages = []
                for content, role in zip(content_matches, role_matches):
                    messages.append({'content': content, 'role': role})
                return messages
        except Exception:
            pass
        
        return None


def main():
    parser = argparse.ArgumentParser(description='Claude Token Usage Tracker')
    parser.add_argument('command', nargs='?', default='status', 
                       help='Command: status, detail, reset, add, estimate, monitor, model')
    parser.add_argument('--input', type=int, help='Input tokens to add')
    parser.add_argument('--output', type=int, help='Output tokens to add')
    parser.add_argument('--text-input', help='Text to estimate input tokens from')
    parser.add_argument('--text-output', help='Text to estimate output tokens from')
    parser.add_argument('--monitor-time', type=int, default=60, help='Monitor duration in seconds')
    parser.add_argument('--set-model', help='Set current model (opus, sonnet, haiku)')
    
    args = parser.parse_args()
    tracker = TokenTracker()
    
    if args.command == 'add':
        if args.input is not None and args.output is not None:
            usage = tracker.manual_update(args.input, args.output)
            print(f"Added - Input: {args.input}, Output: {args.output}")
            print(f"Total usage: {usage['total']}")
        else:
            print("Error: --input and --output required for 'add' command")
    
    elif args.command == 'estimate':
        usage = tracker.auto_estimate(args.text_input, args.text_output)
        input_est = tracker.estimate_tokens_from_text(args.text_input) if args.text_input else 0
        output_est = tracker.estimate_tokens_from_text(args.text_output) if args.text_output else 0
        print(f"Estimated - Input: {input_est}, Output: {output_est}")
        if input_est > 0 or output_est > 0:
            print(f"Updated total: {usage['total']}")
    
    elif args.command == 'reset':
        tracker.reset_usage()
    
    elif args.command == 'detail':
        tracker.get_detailed_status()
    
    elif args.command == 'monitor':
        print(f"Monitoring clipboard for {args.monitor_time} seconds...")
        end_time = time.time() + args.monitor_time
        
        while time.time() < end_time:
            result = tracker.monitor_clipboard()
            if result:
                input_tokens, output_tokens = result
                usage = tracker.save_usage(input_tokens, output_tokens, is_estimated=True)
                print(f"Detected conversation - Input: {input_tokens}, Output: {output_tokens}")
                print(f"Updated total: {usage['total']}")
                break
            
            time.sleep(2)
        
        print("Monitoring completed.")
    
    elif args.command == 'model':
        if args.set_model:
            if args.set_model.lower() in MODEL_MULTIPLIERS:
                # Save model preference to usage file
                usage = tracker.load_usage()
                usage['forced_model'] = args.set_model.lower()
                with open(USAGE_FILE, 'w', encoding='utf-8') as f:
                    json.dump(usage, f, ensure_ascii=False, indent=2)
                print(f"Model set to: {args.set_model.upper()}")
            else:
                print(f"Invalid model: {args.set_model}")
                print("Available models: opus, sonnet, haiku")
        else:
            current_model = tracker.get_current_model()
            multiplier = tracker.get_model_multiplier()
            print(f"Current model: {current_model.upper()} (multiplier: {multiplier}x)")
    
    elif args.command == 'status':
        print(tracker.get_status())
    
    else:
        print(f"Unknown command: {args.command}")
        print("Available commands: status, detail, reset, add, estimate, monitor, model")


if __name__ == "__main__":
    # Windows UTF-8 encoding
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8')
    
    main()