#!/bin/bash

# GitHub SSH Setup for Devcontainers
# Automates SSH key generation and GitHub authentication setup
# Idempotent: safe to run multiple times

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
KEY_TYPE="ed25519"
KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_ed25519}"
SSH_DIR="$HOME/.ssh"

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check dependencies
check_dependencies() {
    print_header "Checking Dependencies"

    local missing_deps=0

    if ! command -v ssh-keygen &> /dev/null; then
        print_error "ssh-keygen is required but not installed"
        missing_deps=1
    else
        print_success "ssh-keygen found"
    fi

    if ! command -v ssh-agent &> /dev/null; then
        print_error "ssh-agent is required but not installed"
        missing_deps=1
    else
        print_success "ssh-agent found"
    fi

    if ! command -v git &> /dev/null; then
        print_error "git is required but not installed"
        missing_deps=1
    else
        print_success "git found"
    fi

    if [ $missing_deps -eq 1 ]; then
        print_error "Missing dependencies. Please install them first."
        exit 1
    fi
}

# Create SSH directory with proper permissions
setup_ssh_directory() {
    print_header "Setting Up SSH Directory"

    if [ ! -d "$SSH_DIR" ]; then
        mkdir -p "$SSH_DIR"
        chmod 700 "$SSH_DIR"
        print_success "Created SSH directory: $SSH_DIR"
    else
        # Ensure proper permissions
        chmod 700 "$SSH_DIR"
        print_success "SSH directory exists: $SSH_DIR"
    fi
}

# Generate SSH key if it doesn't exist
generate_ssh_key() {
    print_header "Generating SSH Key"

    if [ -f "$KEY_PATH" ]; then
        print_warning "SSH key already exists at $KEY_PATH"
        print_success "Using existing key"
        return 0
    fi

    # Get email for key comment
    local email
    email=$(git config user.email 2>/dev/null || echo "user@example.com")

    print_warning "Generating $KEY_TYPE SSH key (no passphrase)..."
    ssh-keygen -t "$KEY_TYPE" -C "$email" -f "$KEY_PATH" -N "" > /dev/null 2>&1

    # Set proper permissions on private key
    chmod 600 "$KEY_PATH"
    print_success "SSH key generated: $KEY_PATH"
}

# Setup SSH agent and add key
setup_ssh_agent() {
    print_header "Setting Up SSH Agent"

    # Start ssh-agent if not running
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)" > /dev/null
        print_success "SSH agent started"
    else
        print_success "SSH agent already running"
    fi

    # Add key to agent
    if ssh-add "$KEY_PATH" > /dev/null 2>&1; then
        print_success "SSH key added to agent"
    else
        print_error "Failed to add SSH key to agent"
        exit 1
    fi
}

# Configure SSH agent persistence in shell
configure_shell_persistence() {
    print_header "Configuring SSH Agent Persistence"

    local bashrc_file="$HOME/.bashrc"
    local persistence_marker="# SSH Agent Auto-Start"

    # Check if already configured
    if grep -q "$persistence_marker" "$bashrc_file" 2>/dev/null; then
        print_success "SSH agent persistence already configured in $bashrc_file"
        return 0
    fi

    # Add ssh-agent configuration to .bashrc
    cat >> "$bashrc_file" << 'EOF'

# SSH Agent Auto-Start
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)" > /dev/null 2>&1
    ssh-add ~/.ssh/id_ed25519 2>/dev/null || true
fi
EOF

    print_success "SSH agent persistence configured in $bashrc_file"
}

# Display public key
display_public_key() {
    print_header "Public SSH Key"

    if [ ! -f "$KEY_PATH.pub" ]; then
        print_error "Public key file not found: $KEY_PATH.pub"
        exit 1
    fi

    local pubkey
    pubkey=$(cat "$KEY_PATH.pub")

    echo -e "\n${YELLOW}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║ COPY THIS PUBLIC KEY TO GITHUB                                 ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${GREEN}✓ Copy the ENTIRE line below (from ssh-ed25519 to the end):${NC}\n"

    echo -e "${YELLOW}┌────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${YELLOW}│${NC} $pubkey"
    echo -e "${YELLOW}└────────────────────────────────────────────────────────────────┘${NC}\n"

    echo -e "${BLUE}📋 Add this key at: https://github.com/settings/keys${NC}\n"
}

# Detect git repository info
get_github_info() {
    print_header "Detecting GitHub Repository"

    # Try to get remote URL
    local remote_url
    remote_url=$(git remote get-url origin 2>/dev/null || echo "")

    if [ -z "$remote_url" ]; then
        print_warning "No git remote found, skipping remote update"
        return 1
    fi

    # Check if already using SSH
    if [[ "$remote_url" == git@github.com:* ]]; then
        print_success "Already using SSH remote"
        return 1
    fi

    # Check if HTTPS (with or without PAT token)
    if [[ "$remote_url" =~ ^https://([^@]+@)?github.com/ ]]; then
        if [[ "$remote_url" =~ @github.com ]]; then
            print_warning "Found HTTPS remote with authentication token (will remove when converting to SSH)"
        else
            print_warning "Found HTTPS remote: $remote_url"
        fi
        return 0
    fi

    print_warning "Unexpected remote format: $remote_url"
    return 1
}

# Convert HTTPS remote to SSH
convert_remote_to_ssh() {
    print_header "Converting Git Remote to SSH"

    if ! get_github_info; then
        return 0
    fi

    local https_url
    https_url=$(git remote get-url origin)

    # Extract repo info from HTTPS URL, removing any authentication token
    # https://github.com/user/repo.git -> git@github.com:user/repo.git
    # https://token@github.com/user/repo.git -> git@github.com:user/repo.git
    local ssh_url
    ssh_url=$(echo "$https_url" | sed 's|https://\([^@]*@\)\?github.com/|git@github.com:|')

    git remote set-url origin "$ssh_url"
    print_success "Remote URL updated to: $ssh_url"
}

# Test SSH connection
test_ssh_connection() {
    print_header "Testing SSH Connection"

    # Add GitHub to known_hosts if not present
    if ! grep -q "github.com" "$SSH_DIR/known_hosts" 2>/dev/null; then
        ssh-keyscan -t ed25519 github.com >> "$SSH_DIR/known_hosts" 2>/dev/null || true
        print_success "Added GitHub to known_hosts"
    fi

    # Test connection
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        print_success "SSH connection to GitHub verified"
        return 0
    else
        print_warning "SSH connection to GitHub not yet verified"
        print_warning "Public key may not be added to GitHub account yet"
        return 0
    fi
}

# Verify setup
verify_setup() {
    print_header "Verification"

    echo -e "${YELLOW}Git configuration:${NC}"
    git remote -v | sed 's/^/  /'
    echo ""

    echo -e "${YELLOW}SSH key:${NC}"
    ls -lh "$KEY_PATH" 2>/dev/null | awk '{print "  " $0}' || echo "  (not found)"
    echo ""

    echo -e "${YELLOW}SSH agent status:${NC}"
    ssh-add -l 2>/dev/null | sed 's/^/  /' || echo "  (no keys loaded)"
    echo ""

    echo -e "${YELLOW}Your public key (for easy copying):${NC}"
    if [ -f "$KEY_PATH.pub" ]; then
        cat "$KEY_PATH.pub" | sed 's/^/  /'
    else
        echo "  (not found)"
    fi
    echo ""
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  GitHub SSH Setup for Devcontainers   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    check_dependencies
    setup_ssh_directory
    generate_ssh_key
    setup_ssh_agent
    configure_shell_persistence
    display_public_key
    convert_remote_to_ssh
    test_ssh_connection
    verify_setup

    echo -e "${GREEN}✓ GitHub SSH setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Copy the public key displayed above"
    echo "2. Go to: https://github.com/settings/keys"
    echo "3. Click 'New SSH key' and paste the key"
    echo "4. Test with: git pull"
    echo ""
}

# Run main
main "$@"
