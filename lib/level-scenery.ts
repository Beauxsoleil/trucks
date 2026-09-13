import * as THREE from 'three';
import type { ToyKit } from './toy-models';
import type { LevelId } from './levels';

// Original low-poly toys complement the bundled CC0 Kenney models.
export function dinosaur(k: ToyKit, parent: THREE.Object3D) {
  const root = new THREE.Group(); parent.add(root);
  k.ball(1.3, 0x73a963, root, 0, 1.8).scale.set(1, .8, 1.65);
  for (const x of [-.75, .75]) for (const z of [-1, 1]) k.box(.5, 1.4, .5, 0x73a963, root, x, .7, z);
  const neck = k.box(.8, 2.6, .8, 0x73a963, root, 0, 3, -1.3, .3); neck.rotation.x = -.25;
  k.ball(.75, 0x8bc777, root, 0, 4.5, -1.65).scale.set(1, .8, 1.4);
  for (const x of [-.65, .65]) { k.ball(.17, 0xffffff, root, x, 4.65, -1.9); k.ball(.08, 0x17394b, root, x * 1.12, 4.65, -1.94); }
  const tail = k.mesh(new THREE.ConeGeometry(.65, 2.8, 8), 0x73a963, root, 0, 1.7, 2.3); tail.rotation.x = Math.PI / 2;
  return root;
}

export function decorateLevel(k: ToyKit, id: LevelId, scene: THREE.Scene) {
  const props: { root: THREE.Group; distance: number; side: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const root = new THREE.Group(); scene.add(root);
    const side = (i % 2 ? -1 : 1) * (9 + i % 3);
    if (id === 'dino') {
      dinosaur(k, root).rotation.y = side > 0 ? -.7 : .7;
      for (let n = 0; n < 3; n++) {
        const foot = k.ball(.6, 0x627a48, root, -Math.sign(side) * 3, .07, n * 2); foot.scale.set(.8, .08, 1.4);
      }
    } else if (id === 'snow') {
      for (let n = 0; n < 3; n++) k.mesh(new THREE.ConeGeometry(1.8 - n * .35, 2.3, 7), 0xf5fbff, root, 0, 1.8 + n * 1.1);
      k.mesh(new THREE.CylinderGeometry(.23, .3, 1.5, 7), 0x805e49, root, 0, .6);
      if (i % 2 === 0) { k.ball(.8, 0xffffff, root, 2.5, .7); k.ball(.55, 0xffffff, root, 2.5, 1.65); for (const x of [2.3, 2.7]) k.ball(.07, 0x17394b, root, x, 1.8, .48); }
    } else if (id === 'moon') {
      const crater = k.mesh(new THREE.TorusGeometry(2, .3, 6, 16), 0x777f9e, root); crater.rotation.x = Math.PI / 2; crater.position.y = .1;
      const floor = k.mesh(new THREE.CircleGeometry(1.9, 16), 0x656c89, root, 0, .02); floor.rotation.x = -Math.PI / 2;
    } else {
      for (const x of [-1, 0, 1]) k.box(.85, .9, 1.2, 0xe4be5c, root, x, .45);
    }
    props.push({ root, distance: 25 + i * 44, side });
  }
  if (id === 'moon') {
    const earth = k.ball(7, 0x579fd2, scene, -28, 30, -85);
    k.ball(3.4, 0x81c898, earth, -2, 1, 5).scale.z = .25;
    for (let i = 0; i < 35; i++) k.ball(.12, 0xffffff, scene, Math.sin(i * 17) * 65, 18 + (i % 9) * 4, -60 - (i % 5) * 6);
  }
  return props;
}

export function destination(k: ToyKit, id: LevelId, word: string) {
  const root = new THREE.Group();
  if (id === 'moon') {
    k.ball(5, 0xdde6ef, root, 0, 1).scale.set(1, .8, .85);
    k.box(3.3, 3.2, .4, 0x354e75, root, 0, 1.6, 4);
    k.box(2.6, .35, .5, 0x7ce8da, root, 0, 3.2, 4.2);
    k.mesh(new THREE.CylinderGeometry(.1, .1, 5, 8), 0xe9ecfa, root, 5, 2.5);
    k.box(2, 1.2, .08, 0xffd768, root, 6, 4.4);
  } else if (id === 'dino') {
    for (const x of [-4.5, 4.5]) k.mesh(new THREE.CylinderGeometry(.45, .55, 6, 8), 0x99704c, root, x, 3);
    k.box(10, 1.2, 1, 0xf1ce82, root, 0, 5.8);
    dinosaur(k, root).position.set(-6, 0, 1);
    for (const x of [-1, 0, 1]) k.ball(.7, 0xffefc1, root, x, .7, 0).scale.y = 1.4;
  } else {
    k.box(9, 5, 6, 0x9b7057, root, 0, 2.5);
    for (const side of [-1, 1]) { const roof = k.box(5.5, .5, 7, 0xf4fbff, root, side * 2.1, 5.8); roof.rotation.z = -side * .55; }
    k.box(2.3, 3.3, .2, 0x593e35, root, 0, 1.65, 3.1);
    for (const x of [-3, 3]) k.box(1.5, 1.4, .2, 0xffd778, root, x, 2.6, 3.1);
  }
  k.label(word, '#fff1ce', 2, 1.2, root, 0, id === 'dino' ? 5.8 : 4, id === 'moon' ? 4.3 : 3.2);
  return root;
}
