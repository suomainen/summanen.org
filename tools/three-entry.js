/* three.js-kirjaston osat, joita js/forest.js käyttää. Koottu yhdeksi tiedostoksi
   js/vendor/three.min.js komennolla `npm run build:three` (ks. README).
   Tiedosto asettaa globaalin THREE-olion, jotta sivu toimii tavallisilla <script>-tageilla. */
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
  ColorManagement, ConeGeometry, CylinderGeometry, DoubleSide, EdgesGeometry, FogExp2, GridHelper,
  Group, IcosahedronGeometry, Line, LineBasicMaterial, LineSegments, LinearSRGBColorSpace, Matrix4,
  Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, REVISION, Scene,
  Sprite, SpriteMaterial, Vector3, WebGLRenderer,
} from 'three';

window.THREE = {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color,
  ColorManagement, ConeGeometry, CylinderGeometry, DoubleSide, EdgesGeometry, FogExp2, GridHelper,
  Group, IcosahedronGeometry, Line, LineBasicMaterial, LineSegments, LinearSRGBColorSpace, Matrix4,
  Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, REVISION, Scene,
  Sprite, SpriteMaterial, Vector3, WebGLRenderer,
};
