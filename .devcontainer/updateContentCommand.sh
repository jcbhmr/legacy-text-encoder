#!/usr/bin/env bash
set -Eeuo pipefail

# https://github.com/TheJaredWilcurt/blog/discussions/40
# https://github.com/TheJaredWilcurt/blog/discussions/41
mkdir -p ~/.proto
cat <<'EOF' > ~/.proto/.prototools
[settings]
telemetry = false
auto-install = true
EOF
bash <(curl -fsSL https://moonrepo.dev/install/proto.sh) --yes
. ~/.bashrc
proto install node && proto install npm
cat <<'EOF'
# proto's "npm install --global" bin
export PATH="$PATH:$HOME/.proto/tools/node/globals/bin"
EOF
