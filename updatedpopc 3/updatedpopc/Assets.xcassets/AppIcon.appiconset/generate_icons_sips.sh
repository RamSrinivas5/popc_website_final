#!/bin/bash

BASE_DIR="/Users/user1/Downloads/newfrontendandbackendcode 2/updatedpopc 3/updatedpopc/Assets.xcassets/AppIcon.appiconset"
SOURCE_IMG="$BASE_DIR/popc_icon.png"

if [ ! -f "$SOURCE_IMG" ]; then
    echo "Source image not found: $SOURCE_IMG"
    exit 1
fi

# Function to generate icon
# usage: gen_icon <size_pt> <scale> <idiom>
gen_icon() {
    local size_pt=$1
    local scale=$2
    local idiom=$3
    
    # Calculate pixel size (floating point multiplication using bc)
    local px=$(echo "$size_pt * $scale" | bc | awk '{print int($1)}')
    local filename="icon_${size_pt}x${size_pt}@${scale}x.png"
    local filepath="$BASE_DIR/$filename"
    
    echo "Generating $filename ($px px)..."
    sips -z $px $px "$SOURCE_IMG" --out "$filepath" > /dev/null 2>&1
}

# Define sizes array (size_pt scale idiom)
# Note: 83.5 is a float, we handle it
sizes=(
    "20 2 iphone" "20 3 iphone"
    "29 2 iphone" "29 3 iphone"
    "40 2 iphone" "40 3 iphone"
    "60 2 iphone" "60 3 iphone"
    "20 1 ipad" "20 2 ipad"
    "29 1 ipad" "29 2 ipad"
    "40 1 ipad" "40 2 ipad"
    "76 1 ipad" "76 2 ipad"
    "83.5 2 ipad"
    "1024 1 ios-marketing"
)

# Start Contents.json
JSON_FILE="$BASE_DIR/Contents.json"
echo '{
  "images": [' > "$JSON_FILE"

TOTAL=${#sizes[@]}
COUNTER=0

for item in "${sizes[@]}"; do
    gen_icon $item
    
    # Extract values
    val=($item)
    size_pt=${val[0]}
    scale=${val[1]}
    idiom=${val[2]}
    filename="icon_${size_pt}x${size_pt}@${scale}x.png"
    
    # Format size string
    size_str="${size_pt}x${size_pt}"
    
    # Add to JSON
    echo "    {
      \"size\": \"$size_str\",
      \"idiom\": \"$idiom\",
      \"filename\": \"$filename\",
      \"scale\": \"${scale}x\"
    }" >> "$JSON_FILE"
    
    COUNTER=$((COUNTER + 1))
    if [ $COUNTER -lt $TOTAL ]; then
        echo "    ," >> "$JSON_FILE"
    fi
done

# End Contents.json
echo '  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}' >> "$JSON_FILE"

echo "Done! Icons generated and Contents.json updated."
