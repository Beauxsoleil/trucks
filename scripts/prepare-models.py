"""Package the selected CC0 Kenney models with embedded textures.
Usage: python scripts/prepare-models.py /path/to/car-kit.zip /path/to/nature-kit.zip
Downloads and license/source notes are documented in public/assets/models/README.md.
"""
import json
from pathlib import Path, PurePosixPath
import struct
import sys
import zipfile

DEST = Path(__file__).resolve().parents[1] / 'public/assets/models'

def package(archive, source, target):
    data = archive.read(source)
    json_length = struct.unpack_from('<I', data, 12)[0]
    document = json.loads(data[20:20 + json_length])
    binary_length = struct.unpack_from('<I', data, 20 + json_length)[0]
    binary = bytearray(data[28 + json_length:28 + json_length + binary_length])
    for image in document.get('images', []):
        if 'uri' not in image:
            continue
        uri = image.pop('uri')
        texture = archive.read(str(PurePosixPath(source).parent / uri))
        binary.extend(b'\0' * (-len(binary) % 4))
        image['bufferView'] = len(document.setdefault('bufferViews', []))
        document['bufferViews'].append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(texture)})
        image['mimeType'] = 'image/png'
        binary.extend(texture)
    document['buffers'][0]['byteLength'] = len(binary)
    encoded = json.dumps(document, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    binary.extend(b'\0' * (-len(binary) % 4))
    result = struct.pack('<III', 0x46546C67, 2, 28 + len(encoded) + len(binary))
    result += struct.pack('<II', len(encoded), 0x4E4F534A) + encoded
    result += struct.pack('<II', len(binary), 0x004E4942) + binary
    (DEST / target).write_bytes(result)
    print(target, len(result))

if __name__ == '__main__':
    DEST.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(sys.argv[1]) as car, zipfile.ZipFile(sys.argv[2]) as nature:
        for name in ['truck', 'wheel-tractor-dark-back']:
            package(car, f'Models/GLB format/{name}.glb', f'{name}.glb')
        for name in ['tree_oak', 'tree_pineRoundA', 'rock_largeA']:
            package(nature, f'Models/GLTF format/{name}.glb', f'{name}.glb')
        (DEST / 'LICENSE-car-kit.txt').write_bytes(car.read('License.txt'))
        (DEST / 'LICENSE-nature-kit.txt').write_bytes(nature.read('License.txt'))
