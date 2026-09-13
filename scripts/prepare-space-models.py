"""Bundle selected CC0 Space Kit models. Usage: python scripts/prepare-space-models.py archive.zip"""
import importlib.util
import sys
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location('pack_models', Path(__file__).with_name('prepare-models.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with zipfile.ZipFile(sys.argv[1]) as archive:
    for name in ['satelliteDish', 'rock_largeA', 'rock_crystalsLargeA']:
        module.package(archive, f'Models/GLTF format/{name}.glb', f'space-{name}.glb')
    (module.DEST / 'LICENSE-space-kit.txt').write_bytes(archive.read('License.txt'))
