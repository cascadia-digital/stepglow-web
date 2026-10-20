#!/bin/zsh
# Renders the 1200×630 link-preview image to public/og-v<version>.png.
#
# Usage: og/render.sh <soon|live> <version>
#   og/render.sh soon 1   "Coming soon to the App Store" (before release)
#   og/render.sh live 2   Apple's "Download on the App Store" badge (after release)
#
# Before "live": download Apple's official badge (black, US English, SVG) from
# https://developer.apple.com/app-store/marketing/guidelines/ and save it unmodified
# as og/app-store-badge.svg. Apple only allows the badge once the app is on the App Store.
#
# Afterwards, set ogImage in src/layouts/Layout.astro to the new file name.
# Use a new version number each time, so sites that cached the old image fetch the new one.
set -e
cd "${0:A:h}"
mode=${1:?usage: render.sh soon|live version}
version=${2:?usage: render.sh soon|live version}
if [[ $mode == live && ! -f app-store-badge.svg ]]; then
    echo "Save Apple's official badge as og/app-store-badge.svg first."; exit 1
fi
out="$PWD/../public/og-v$version.png"
profile=$(mktemp -d)
perl -e 'alarm 60; exec @ARGV' "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --user-data-dir="$profile" --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --window-size=1200,630 --screenshot="$out" \
    "file://$PWD/og.html?cta=$mode" 2>/dev/null
rm -rf "$profile"
sips -g pixelWidth -g pixelHeight "$out" | tail -2
