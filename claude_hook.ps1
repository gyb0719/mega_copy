# Claude Code Token Usage Hook
# PowerShell script to monitor Claude Code usage patterns

param(
    [string]$Action = "monitor",
    [int]$InputTokens = 0,
    [int]$OutputTokens = 0,
    [int]$Duration = 300,  # 5 minutes default
    [string]$LogFile = "claude_usage.log"
)

# Configuration
$TokenUsageFile = "token_usage.json"
$MaxTokens = 220000
$ResetHours = 5

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry -Encoding UTF8
}

function Get-ProcessInfo {
    # Monitor Node.js processes (Claude Code likely runs on Node)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    $claudeProcesses = Get-Process -Name "*claude*" -ErrorAction SilentlyContinue
    
    return @{
        NodeProcesses = $nodeProcesses.Count
        ClaudeProcesses = $claudeProcesses.Count
        TotalProcesses = $nodeProcesses.Count + $claudeProcesses.Count
    }
}

function Monitor-NetworkActivity {
    # Monitor network connections that might indicate API calls
    try {
        $connections = Get-NetTCPConnection | Where-Object {
            $_.RemoteAddress -match "anthropic|claude" -or
            $_.RemotePort -in @(443, 80) -and
            $_.State -eq "Established"
        }
        return $connections.Count
    } catch {
        return 0
    }
}

function Estimate-TokensFromText {
    param([string]$Text)
    
    if (-not $Text) { return 0 }
    
    # Basic token estimation (4 chars per token average)
    $charCount = $Text.Length
    $wordCount = ($Text -split '\s+').Count
    
    # Adjust for code patterns
    $codePatterns = ([regex]::Matches($Text, '[{}()\[\];,.]')).Count
    $specialChars = ([regex]::Matches($Text, '[<>@#$%^&*+=|\\]')).Count
    
    $estimated = $charCount / 4
    
    # Code adjustment
    if ($codePatterns -gt ($charCount * 0.1)) {
        $estimated *= 1.2
    }
    
    if ($specialChars -gt ($charCount * 0.05)) {
        $estimated *= 1.1
    }
    
    return [int]($estimated * 1.1)  # 10% safety buffer
}

function Update-TokenUsage {
    param(
        [int]$InputTokens,
        [int]$OutputTokens,
        [bool]$IsEstimated = $true
    )
    
    $usage = @{}
    
    # Load existing usage
    if (Test-Path $TokenUsageFile) {
        try {
            $usage = Get-Content $TokenUsageFile -Raw | ConvertFrom-Json -AsHashtable
            
            # Check if reset is needed
            if ($usage.reset_time) {
                $resetTime = [DateTime]::Parse($usage.reset_time)
                if ((Get-Date) -ge $resetTime) {
                    Write-Log "Auto-resetting token usage (5 hours elapsed)"
                    $usage = @{}
                }
            }
        } catch {
            Write-Log "Error loading usage file, creating new"
            $usage = @{}
        }
    }
    
    # Initialize if empty
    if (-not $usage.Count) {
        $now = Get-Date
        $usage = @{
            input = 0
            output = 0
            total = 0
            start_time = $now.ToString("o")
            reset_time = $now.AddHours($ResetHours).ToString("o")
            last_updated = $now.ToString("o")
            session_count = 0
            estimated_sessions = 0
            manual_updates = 0
        }
    }
    
    # Update counters
    $usage.input += $InputTokens
    $usage.output += $OutputTokens
    $usage.total = $usage.input + $usage.output
    $usage.last_updated = (Get-Date).ToString("o")
    
    if ($IsEstimated) {
        $usage.estimated_sessions++
    } else {
        $usage.manual_updates++
    }
    
    # Save updated usage
    $usage | ConvertTo-Json -Depth 3 | Set-Content $TokenUsageFile -Encoding UTF8
    
    Write-Log "Updated tokens - Input: $InputTokens, Output: $OutputTokens, Total: $($usage.total)"
    return $usage
}

function Get-TokenStatus {
    if (-not (Test-Path $TokenUsageFile)) {
        return "Tokens: 220K/220K (100% left) [5h0m]"
    }
    
    try {
        $usage = Get-Content $TokenUsageFile -Raw | ConvertFrom-Json
        $total = $usage.total
        $remaining = $MaxTokens - $total
        $percentRemaining = [Math]::Max(0, [int](($remaining / $MaxTokens) * 100))
        
        # Calculate time remaining
        $resetTime = [DateTime]::Parse($usage.reset_time)
        $timeRemaining = $resetTime - (Get-Date)
        
        if ($timeRemaining.TotalSeconds -gt 0) {
            $hours = [int]$timeRemaining.TotalHours
            $minutes = [int]$timeRemaining.Minutes
            $timeStr = if ($hours -gt 0) { "${hours}h${minutes}m" } else { "${minutes}m" }
        } else {
            $timeStr = "Resetting..."
        }
        
        # Format numbers
        function Format-Number($num) {
            if ($num -ge 1000000) { return "$([Math]::Round($num/1000000, 1))M" }
            elseif ($num -ge 1000) { return "$([int]($num/1000))K" }
            else { return $num.ToString() }
        }
        
        $remainingFormatted = Format-Number $remaining
        $maxFormatted = Format-Number $MaxTokens
        
        return "Tokens: $remainingFormatted/$maxFormatted ($percentRemaining% left) [$timeStr]"
        
    } catch {
        return "Tokens: Error reading status"
    }
}

function Monitor-ClaudeActivity {
    param([int]$DurationSeconds)
    
    Write-Log "Starting Claude activity monitor for $DurationSeconds seconds"
    $endTime = (Get-Date).AddSeconds($DurationSeconds)
    $lastClipboard = ""
    
    while ((Get-Date) -lt $endTime) {
        try {
            # Check clipboard for Claude conversation
            $clipboard = Get-Clipboard -ErrorAction SilentlyContinue
            
            if ($clipboard -and $clipboard -ne $lastClipboard) {
                $lastClipboard = $clipboard
                
                # Check if it looks like Claude content
                $claudeIndicators = @(
                    "I'll help you", "Let me", "I can help", "I'll create",
                    "Assistant:", "Human:", "Claude:", "function_calls",
                    "```python", "```javascript", "<function_calls>"
                )
                
                $indicatorCount = 0
                foreach ($indicator in $claudeIndicators) {
                    if ($clipboard -match [regex]::Escape($indicator)) {
                        $indicatorCount++
                    }
                }
                
                if ($indicatorCount -ge 2) {
                    Write-Log "Detected potential Claude conversation in clipboard"
                    
                    # Simple conversation parsing
                    $inputText = ""
                    $outputText = ""
                    
                    # Split by common conversation markers
                    $parts = $clipboard -split "(?:Human:|User:|Assistant:|Claude:)"
                    
                    for ($i = 0; $i -lt $parts.Length; $i++) {
                        if ($i % 2 -eq 0) {
                            $inputText += $parts[$i]
                        } else {
                            $outputText += $parts[$i]
                        }
                    }
                    
                    $inputTokens = Estimate-TokensFromText $inputText
                    $outputTokens = Estimate-TokensFromText $outputText
                    
                    if ($inputTokens -gt 0 -or $outputTokens -gt 0) {
                        Update-TokenUsage -InputTokens $inputTokens -OutputTokens $outputTokens -IsEstimated $true
                    }
                }
            }
            
            # Check process activity
            $processInfo = Get-ProcessInfo
            if ($processInfo.TotalProcesses -gt 0) {
                Write-Log "Claude-related processes detected: Node=$($processInfo.NodeProcesses), Claude=$($processInfo.ClaudeProcesses)"
            }
            
            # Check network activity
            $networkConnections = Monitor-NetworkActivity
            if ($networkConnections -gt 0) {
                Write-Log "Active network connections detected: $networkConnections"
            }
            
        } catch {
            Write-Log "Monitor error: $($_.Exception.Message)"
        }
        
        Start-Sleep -Seconds 5
    }
    
    Write-Log "Monitoring completed"
}

# Main execution
switch ($Action.ToLower()) {
    "monitor" {
        Monitor-ClaudeActivity -DurationSeconds $Duration
    }
    
    "add" {
        if ($InputTokens -gt 0 -or $OutputTokens -gt 0) {
            $usage = Update-TokenUsage -InputTokens $InputTokens -OutputTokens $OutputTokens -IsEstimated $false
            Write-Host "Manually added - Input: $InputTokens, Output: $OutputTokens"
            Write-Host "Total usage: $($usage.total)"
        } else {
            Write-Host "Error: InputTokens and OutputTokens must be specified for add action"
        }
    }
    
    "status" {
        $status = Get-TokenStatus
        Write-Host $status
    }
    
    "reset" {
        if (Test-Path $TokenUsageFile) {
            Remove-Item $TokenUsageFile
        }
        Write-Host "Token usage reset"
    }
    
    "detail" {
        if (Test-Path $TokenUsageFile) {
            $usage = Get-Content $TokenUsageFile -Raw | ConvertFrom-Json
            Write-Host "Input tokens: $($usage.input)"
            Write-Host "Output tokens: $($usage.output)"
            Write-Host "Total used: $($usage.total)/$MaxTokens"
            Write-Host "Manual updates: $($usage.manual_updates)"
            Write-Host "Estimated sessions: $($usage.estimated_sessions)"
            
            if ($usage.start_time) {
                $start = [DateTime]::Parse($usage.start_time)
                Write-Host "Period start: $($start.ToString('yyyy-MM-dd HH:mm'))"
            }
            
            if ($usage.reset_time) {
                $reset = [DateTime]::Parse($usage.reset_time)
                Write-Host "Next reset: $($reset.ToString('yyyy-MM-dd HH:mm'))"
            }
        } else {
            Write-Host "No usage data found"
        }
    }
    
    default {
        Write-Host "Usage: ./claude_hook.ps1 -Action [monitor|add|status|reset|detail]"
        Write-Host "  -Action monitor: Monitor Claude activity"
        Write-Host "  -Action add -InputTokens X -OutputTokens Y: Manually add tokens"
        Write-Host "  -Action status: Show current token status"
        Write-Host "  -Action reset: Reset token usage"
        Write-Host "  -Action detail: Show detailed usage information"
        Write-Host "  -Duration: Monitor duration in seconds (default: 300)"
    }
}

# Always show current status at the end
if ($Action -ne "status") {
    $currentStatus = Get-TokenStatus
    Write-Host "`nCurrent status: $currentStatus"
}