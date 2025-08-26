# Claude Code Token Tracking System

This enhanced token tracking system provides real-time monitoring of Claude API token usage with automatic reset cycles and multiple integration methods.

## Files Created

1. **`claude_token_tracker.py`** - Enhanced Python tracker with estimation capabilities
2. **`token_monitor.py`** - Background monitoring service
3. **`claude_hook.ps1`** - PowerShell hook for Windows integration
4. **Enhanced `token_usage.py`** - Improved original script with new features

## Features

### 🔄 Automatic Reset Cycle
- Automatically resets every 5 hours (Max20 plan: 220K tokens)
- Maintains accurate timing across sessions
- No manual intervention needed

### 📊 Token Estimation
- Estimates tokens from text content using character/word analysis
- Adjusts for code patterns and special characters
- Provides 10% safety buffer for accuracy

### 🔍 Multiple Monitoring Methods
1. **Clipboard monitoring** - Detects Claude conversations copied to clipboard
2. **Process monitoring** - Tracks Node.js/Claude processes
3. **Manual updates** - Direct token count input
4. **Request file system** - File-based token updates

### 📈 Enhanced Status Display
- Shows remaining tokens and percentage
- Displays time until next reset
- Tracks manual vs. estimated updates
- Integration with existing status line

## Usage Guide

### Basic Commands

```bash
# Show current token status
python token_usage.py

# Show detailed information
python token_usage.py detail

# Manually add tokens
python token_usage.py add 1500 800

# Estimate tokens from text
python token_usage.py add --estimate-input
python token_usage.py add --estimate-output

# Reset token usage
python token_usage.py reset

# Get help
python token_usage.py help
```

### Enhanced Tracker Commands

```bash
# Advanced token tracking
python claude_token_tracker.py status
python claude_token_tracker.py detail
python claude_token_tracker.py add --input 1500 --output 800
python claude_token_tracker.py estimate --text-input "Your input text"
python claude_token_tracker.py monitor --monitor-time 120
```

### Background Monitoring

```bash
# Start background monitor
python token_monitor.py start --interval 30

# Start as daemon (background process)
python token_monitor.py start --daemon

# Stop background monitor
python token_monitor.py stop

# Check monitor status
python token_monitor.py status

# Create manual update request
python token_monitor.py request --input 1000 --output 500
```

### PowerShell Integration (Windows)

```powershell
# Monitor Claude activity for 5 minutes
.\claude_hook.ps1 -Action monitor -Duration 300

# Manually add tokens
.\claude_hook.ps1 -Action add -InputTokens 1500 -OutputTokens 800

# Show current status
.\claude_hook.ps1 -Action status

# Show detailed information
.\claude_hook.ps1 -Action detail

# Reset usage
.\claude_hook.ps1 -Action reset
```

## Integration Methods

### Method 1: Manual Tracking
- Use `python token_usage.py add [input] [output]` after each session
- Most accurate but requires manual intervention
- Recommended for precise tracking

### Method 2: Text Estimation
- Copy conversation text and use estimation commands
- Good balance of accuracy and convenience
- Use `--estimate-input` and `--estimate-output` options

### Method 3: Background Monitoring
- Run `python token_monitor.py start --daemon`
- Automatically detects Claude conversations in clipboard
- Minimal user intervention required

### Method 4: PowerShell Hook
- Best for Windows users
- Monitors system processes and clipboard
- Run `.\claude_hook.ps1 -Action monitor` when using Claude

## Best Practices

### 🎯 Accuracy Tips
1. Use manual tracking for important sessions
2. Cross-check estimates with actual API responses when possible
3. Monitor the logs to verify detection accuracy
4. Adjust estimation parameters based on your usage patterns

### ⏰ Monitoring Schedule
1. Start background monitor when beginning Claude work
2. Check status periodically with `python token_usage.py status`
3. Use PowerShell hooks for intensive sessions
4. Review detailed stats at end of day

### 🔧 Troubleshooting
- Check `claude_usage.log` for monitoring activity
- Verify `token_usage.json` for current state
- Ensure PowerShell execution policy allows scripts
- Use `python token_usage.py sync` to sync between trackers

## Advanced Configuration

### Customizing Token Estimation
Edit the estimation parameters in `claude_token_tracker.py`:
```python
CHARS_PER_TOKEN = 4  # Adjust based on your text patterns
TOKEN_BUFFER = 1.1   # Safety margin (10%)
```

### Monitoring Intervals
Adjust monitoring frequency in scripts:
- Background monitor: `--interval` parameter (seconds)
- PowerShell hook: `-Duration` parameter (seconds)

### Log Files
- `claude_usage.log` - Token update history
- `token_monitor.log` - Background monitoring activity
- `token_usage.json` - Current usage state

## Status Line Integration

The enhanced system maintains compatibility with your existing status line display while adding new features:

```python
# In your status line script
from token_usage import get_full_status
status = get_full_status()  # Returns enhanced status with all info
```

## API Integration (Future Enhancement)

For true API integration, monitor these potential hook points:
1. Network requests to `api.anthropic.com`
2. HTTP response headers containing token usage
3. Claude Code configuration files for session data
4. WebSocket connections for real-time updates

The current system provides excellent estimation and manual tracking capabilities while these integration points are developed.

## Quick Start

1. **Choose your preferred method:**
   - Manual: Use original `token_usage.py` commands
   - Semi-automatic: Use `claude_token_tracker.py` with estimation
   - Automatic: Run `token_monitor.py start --daemon`

2. **Test the system:**
   ```bash
   python token_usage.py add 100 50
   python token_usage.py status
   ```

3. **Start monitoring:**
   ```bash
   # Option A: Background daemon
   python token_monitor.py start --daemon
   
   # Option B: PowerShell monitoring
   powershell -ExecutionPolicy Bypass -File claude_hook.ps1 -Action monitor
   ```

4. **Check status anytime:**
   ```bash
   python token_usage.py
   ```

This system provides comprehensive token tracking with multiple integration options, accurate estimation, and automatic reset cycles to help you manage your Claude Code API usage effectively.