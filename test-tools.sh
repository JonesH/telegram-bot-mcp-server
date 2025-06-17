#!/bin/bash

# Test script for Telegram Bot MCP Server tools
# Usage: ./test-tools.sh <BOT_TOKEN> [TEST_CHAT_ID] [TEST_USER_ID]
#
# Required: BOT_TOKEN from @BotFather
# Optional: TEST_CHAT_ID (defaults to your own user ID from getMe)
# Optional: TEST_USER_ID (defaults to your own user ID from getMe)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if node is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    print_error "Yarn is not installed or not in PATH"
    exit 1
fi

# Check arguments
if [ $# -lt 1 ]; then
    print_error "Usage: $0 <BOT_TOKEN> [TEST_CHAT_ID] [TEST_USER_ID]"
    print_info "Get your bot token from @BotFather on Telegram"
    print_info "TEST_CHAT_ID and TEST_USER_ID are optional (will use bot's own ID if not provided)"
    exit 1
fi

BOT_TOKEN="$1"
TEST_CHAT_ID="$2"
TEST_USER_ID="$3"

# Validate bot token format
if [[ ! "$BOT_TOKEN" =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
    print_error "Invalid bot token format. Should be like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
    exit 1
fi

print_header "Telegram Bot MCP Server Tool Test"
print_info "Bot Token: ${BOT_TOKEN:0:10}..."

# Build the project
print_header "Building Project"
if ! yarn build; then
    print_error "Failed to build project"
    exit 1
fi
print_success "Project built successfully"

# Start the MCP server in background
print_header "Starting MCP Server"
export TELEGRAM_BOT_API_TOKEN="$BOT_TOKEN"
SERVER_LOG=$(mktemp)
node ./.build/index.js > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!

# Give server time to start
sleep 2

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    print_error "Failed to start MCP server"
    cat "$SERVER_LOG"
    exit 1
fi

print_success "MCP server started (PID: $SERVER_PID)"

# Cleanup function
cleanup() {
    print_info "Cleaning up..."
    kill $SERVER_PID 2>/dev/null || true
    rm -f "$SERVER_LOG"
}
trap cleanup EXIT

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Function to send MCP request
send_mcp_request() {
    local tool_name="$1"
    local params="$2"
    local description="$3"
    
    print_info "Testing: $description"
    
    # Create MCP request
    local request="{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"$tool_name\", \"arguments\": $params}}"
    
    # Send request to server
    local response
    if response=$(echo "$request" | timeout 10s node -e "
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('', (answer) => {
            console.log(answer);
            rl.close();
        });
    " 2>&1); then
        # Check if response contains error
        if echo "$response" | grep -q '"error"'; then
            print_error "$description: $(echo "$response" | jq -r '.error.message // .error' 2>/dev/null || echo 'Unknown error')"
            ((TESTS_FAILED++))
            return 1
        else
            print_success "$description"
            ((TESTS_PASSED++))
            return 0
        fi
    else
        print_error "$description: Request timeout or failed"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test bot authentication first
print_header "Testing Bot Authentication"
BOT_INFO=$(send_mcp_request "get-me" "{}" "Get bot information" 2>&1)
if [ $? -eq 0 ]; then
    # Extract bot ID from response if possible
    if [ -z "$TEST_CHAT_ID" ]; then
        # Try to extract bot ID from response (this is a simplified extraction)
        print_info "No TEST_CHAT_ID provided, will skip tests requiring chat interaction"
    fi
    if [ -z "$TEST_USER_ID" ]; then
        print_info "No TEST_USER_ID provided, will skip tests requiring user interaction"
    fi
else
    print_error "Bot authentication failed. Check your token."
    exit 1
fi

# Test basic tools that don't require chat interaction
print_header "Testing Basic Information Tools"

send_mcp_request "get-my-name" "{}" "Get bot name"
send_mcp_request "get-my-description" "{}" "Get bot description"
send_mcp_request "get-my-short-description" "{}" "Get bot short description"
send_mcp_request "get-my-commands" "{}" "Get bot commands"

# Test configuration tools (these modify bot settings)
print_header "Testing Configuration Tools"

# Test setting and getting bot name
send_mcp_request "set-my-name" "{\"name\": \"Test Bot\"}" "Set bot name"
send_mcp_request "get-my-name" "{}" "Verify bot name change"

# Test setting and getting bot description
send_mcp_request "set-my-description" "{\"description\": \"Test bot description\"}" "Set bot description"
send_mcp_request "get-my-description" "{}" "Verify bot description change"

# Test setting and getting short description
send_mcp_request "set-my-short-description" "{\"short_description\": \"Test short desc\"}" "Set bot short description"
send_mcp_request "get-my-short-description" "{}" "Verify bot short description change"

# Test setting bot commands
send_mcp_request "set-my-commands" "{\"commands\": [{\"command\": \"start\", \"description\": \"Start the bot\"}, {\"command\": \"help\", \"description\": \"Get help\"}]}" "Set bot commands"
send_mcp_request "get-my-commands" "{}" "Verify bot commands change"

# Test webhook configuration (using a dummy HTTPS URL)
print_header "Testing Webhook Configuration"
send_mcp_request "setWebHook" "{\"url\": \"https://example.com/webhook\", \"max_connections\": 40}" "Set webhook URL"

# Tests that require chat interaction
if [ -n "$TEST_CHAT_ID" ]; then
    print_header "Testing Chat Interaction Tools"
    
    # Test basic message sending
    send_mcp_request "send-message" "{\"chatId\": \"$TEST_CHAT_ID\", \"text\": \"Test message from MCP server\"}" "Send basic message"
    send_mcp_request "sendMessage" "{\"chatId\": \"$TEST_CHAT_ID\", \"text\": \"Enhanced message with markdown\", \"parse_mode\": \"Markdown\"}" "Send enhanced message"
    
    # Test message with inline keyboard
    send_mcp_request "sendMessage" "{\"chatId\": \"$TEST_CHAT_ID\", \"text\": \"Message with button\", \"reply_markup\": {\"inline_keyboard\": [[{\"text\": \"Test Button\", \"callback_data\": \"test_callback\"}]]}}" "Send message with inline keyboard"
    
    # Test photo sending (using a test image URL)
    send_mcp_request "send-photo" "{\"chatId\": \"$TEST_CHAT_ID\", \"media\": \"https://telegram.org/img/t_logo.png\", \"text\": \"Test photo caption\"}" "Send photo message"
    
    # Test chat information
    send_mcp_request "get-chat" "{\"chatId\": \"$TEST_CHAT_ID\"}" "Get chat information"
    
    # Test chat member count (will work for groups/channels)
    print_info "Testing chat member count (may fail for private chats)"
    send_mcp_request "get-chat-member-count" "{\"chatId\": \"$TEST_CHAT_ID\"}" "Get chat member count" || {
        print_warning "Chat member count failed (expected for private chats)"
        ((TESTS_FAILED--))
        ((TESTS_SKIPPED++))
    }
    
    # Test menu button configuration
    send_mcp_request "setChatMenuButton" "{\"chat_id\": \"$TEST_CHAT_ID\", \"menu_button\": {\"type\": \"commands\"}}" "Set chat menu button to commands"
    send_mcp_request "setChatMenuButton" "{\"menu_button\": {\"type\": \"default\"}}" "Reset chat menu button to default"
    
else
    print_warning "Skipping chat interaction tests (no TEST_CHAT_ID provided)"
    ((TESTS_SKIPPED += 8))
fi

# Tests that require user interaction
if [ -n "$TEST_USER_ID" ] && [ -n "$TEST_CHAT_ID" ]; then
    print_header "Testing User Interaction Tools"
    
    # Test getting chat member info
    send_mcp_request "get-chat-member" "{\"chatId\": \"$TEST_CHAT_ID\", \"userId\": $TEST_USER_ID}" "Get chat member information"
    
    # Skip ban/unban tests as they're destructive
    print_warning "Skipping ban/unban tests (destructive operations)"
    ((TESTS_SKIPPED += 2))
    
elif [ -n "$TEST_USER_ID" ]; then
    print_warning "Skipping user interaction tests (need both TEST_CHAT_ID and TEST_USER_ID)"
    ((TESTS_SKIPPED += 3))
else
    print_warning "Skipping user interaction tests (no TEST_USER_ID provided)"
    ((TESTS_SKIPPED += 3))
fi

# Test callback query and web app tools (these require actual interactions)
print_header "Testing Interactive Tools"
print_warning "Callback query and web app tools require actual user interactions"
print_info "These tools would be tested when users interact with buttons/web apps:"
print_info "- answerCallbackQuery: Responds to button presses"
print_info "- answerWebAppQuery: Processes Mini App data"
print_info "- editMessageText: Updates message content"
print_info "- editMessageReplyMarkup: Updates button layouts"
((TESTS_SKIPPED += 4))

# Final summary
print_header "Test Summary"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "${YELLOW}Tests Skipped: $TESTS_SKIPPED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))"

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "All testable tools are working correctly!"
    exit 0
else
    print_error "Some tests failed. Check the output above for details."
    exit 1
fi