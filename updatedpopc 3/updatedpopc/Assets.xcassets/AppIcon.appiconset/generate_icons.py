import json
import os
from PIL import Image

def generate_icons():
    base_dir = "/Users/user1/Downloads/newfrontendandbackendcode 2/updatedpopc 3/updatedpopc/Assets.xcassets/AppIcon.appiconset"
    source_img_path = os.path.join(base_dir, "popc_icon.png")
    
    if not os.path.exists(source_img_path):
        print("Source image not found.")
        return
        
    img = Image.open(source_img_path)
    # Ensure it's in RGBA or RGB
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
        
    # iOS App Icons shouldn't have alpha channels usually, but we will convert to RGB and save it to be safe
    # Actually, apple recommends NO alpha channel for App Icons.
    # We will composite over white
    background = Image.new('RGBA', img.size, (255,255,255))
    alpha_composite = Image.alpha_composite(background, img)
    final_img = alpha_composite.convert('RGB')
    
    # iOS required sizes: (size_pt, scale, idiom)
    sizes = [
        (20, 2, "iphone"), (20, 3, "iphone"),
        (29, 2, "iphone"), (29, 3, "iphone"),
        (40, 2, "iphone"), (40, 3, "iphone"),
        (60, 2, "iphone"), (60, 3, "iphone"),
        (20, 1, "ipad"), (20, 2, "ipad"),
        (29, 1, "ipad"), (29, 2, "ipad"),
        (40, 1, "ipad"), (40, 2, "ipad"),
        (76, 1, "ipad"), (76, 2, "ipad"),
        (83.5, 2, "ipad"),
        (1024, 1, "ios-marketing")
    ]
    
    images_array = []
    
    for size_pt, scale, idiom in sizes:
        # 83.5 * 2 = 167
        px = int(size_pt * scale)
        filename = f"icon_{size_pt}x{size_pt}@{scale}x.png"
        filepath = os.path.join(base_dir, filename)
        
        resized = final_img.resize((px, px), Image.Resampling.LANCZOS)
        resized.save(filepath, "PNG")
        
        # fix formatting for int
        size_str = f"{int(size_pt)}x{int(size_pt)}" if size_pt.is_integer() else f"{size_pt}x{size_pt}"
            
        images_array.append({
            "size": size_str,
            "idiom": idiom,
            "filename": filename,
            "scale": f"{scale}x"
        })
        
    contents = {
        "images": images_array,
        "info": {
            "version": 1,
            "author": "xcode"
        }
    }
    
    with open(os.path.join(base_dir, "Contents.json"), "w") as f:
        json.dump(contents, f, indent=2)
        
if __name__ == "__main__":
    generate_icons()
