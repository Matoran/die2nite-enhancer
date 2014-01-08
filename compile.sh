#!/bin/sh

set -e

ABSPATH="$(cd "$(dirname "$0")"; pwd)"

USERSCRIPT="$ABSPATH/userscript/die2nite_enhancer.user.js"
ICON_DIR="$ABSPATH/icons"
OUTPUT_DIR="$ABSPATH/build"

PEM="$HOME/.pem/die2nite_enhancer.pem"
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
CFX="$HOME/bin/cfx"


# Init the compilation
function init()
{
  # Create the output directory
  rm -rf "$OUTPUT_DIR"
  mkdir -p "$OUTPUT_DIR"
}

# Build the user script
function compile_user_script()
{
  userscript_source_dir="$ABSPATH/userscript"
  userscript_build_dir="$OUTPUT_DIR/userscript"
  userscript_ext="$OUTPUT_DIR/userscript.user.js"

  # Gather sources
  cp -r "$userscript_source_dir" "$userscript_build_dir"

  # Grab the extension
  mv "$userscript_build_dir/die2nite_enhancer.user.js" "$userscript_ext"

  # Clean and notify
  rm -rf "$userscript_build_dir"
  echo '-- User script done!'
}

# Build the Chrome extension
function compile_chrome_ext()
{
  chrome_source_dir="$ABSPATH/chrome"
  chrome_build_dir="$OUTPUT_DIR/chrome"
  chrome_ext="$OUTPUT_DIR/chrome.crx"
  chrome_zip="$OUTPUT_DIR/chrome.zip"

  # Gather sources
  cp -r "$chrome_source_dir" "$chrome_build_dir"
  cp "$ICON_DIR"/icon{48,128}.png "$chrome_build_dir"
  cp "$USERSCRIPT" "$chrome_build_dir"

  # Package the extension
  "$CHROME" --pack-extension="$chrome_build_dir" --pack-extension-key="$PEM"

  # Zip the extension
  find "$chrome_build_dir" | zip -j "$chrome_zip" -@

  # Clean and notify
  rm -rf "$chrome_build_dir"
  echo '-- Chrome extension done!'
}

# Build the Firefox extension
function compile_firefox_ext()
{
  firefox_source_dir="$ABSPATH/firefox"
  firefox_build_dir="$OUTPUT_DIR/firefox"
  firefox_ext="$OUTPUT_DIR/firefox.xpi"

  # Gather sources
  cp -r "$firefox_source_dir" "$firefox_build_dir"
  mkdir "$firefox_build_dir/data"
  cp "$USERSCRIPT" "$firefox_build_dir/data"

  # Package the extension
  cd "$firefox_build_dir" && "$CFX" xpi --output-file="$firefox_ext"

  # Clean and notify
  rm -rf "$firefox_build_dir"
  echo '-- Firefox extension done!'
}

# Build the Opera extension
function compile_opera_ext()
{
  opera_source_dir="$ABSPATH/opera"
  opera_build_dir="$OUTPUT_DIR/opera"
  opera_ext="$OUTPUT_DIR/opera.nex"

  # Gather sources
  cp -r "$opera_source_dir" "$opera_build_dir"
  cp "$ICON_DIR"/icon{48,128}.png "$opera_build_dir"
  cp "$USERSCRIPT" "$opera_build_dir"

  # Package the extension
  "$CHROME" --pack-extension="$opera_build_dir" --pack-extension-key="$PEM"
  mv "$OUTPUT_DIR"/opera.crx "$opera_ext"

  # Clean and notify
  rm -rf "$opera_build_dir"
  echo '-- Opera extension done!'
}


init
compile_user_script
compile_chrome_ext
compile_firefox_ext
#compile_safari_ext
compile_opera_ext

exit 0
