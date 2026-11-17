import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  RotateCw,
  Stethoscope,
  AlertTriangle,
  Layers,
  RotateCcw,
} from "lucide-react";
import type { BodyRegionId, TriageStatus } from "@/types/health";
import { createHumanBodyGeometry } from "./humanBodyGeometry";

export const STATUS_COLORS: Record<TriageStatus, { color: number; emissive: number; ring: number }> = {
  normal: { color: 0x10b981, emissive: 0x047857, ring: 0x34d399 },
  monitoring: { color: 0xf59e0b, emissive: 0xb45309, ring: 0xfbbf24 },
  acute: { color: 0xef4444, emissive: 0xb91c1c, ring: 0xf87171 },
};

interface SurfaceAnchor {
  triangle: number;
  barycentric: [number, number, number];
  offset: number;
}

const REGION_CONFIGS: Array<{
  id: BodyRegionId;
  anchor: SurfaceAnchor;
  radius: number;
  label: string;
}> = [
  { id: "head", anchor: { triangle: 848, barycentric: [0.604927, 0.091915, 0.303159], offset: 0.012 }, radius: 0.05, label: "Đầu" },
  { id: "shoulder", anchor: { triangle: 15380, barycentric: [0.122997, 0.816196, 0.060807], offset: 0.012 }, radius: 0.045, label: "Vai" },
  { id: "chest", anchor: { triangle: 2265, barycentric: [0.029258, 0.589923, 0.380819], offset: 0.012 }, radius: 0.045, label: "Ngực" },
  { id: "abdomen", anchor: { triangle: 7553, barycentric: [0.537079, 0.343803, 0.119119], offset: 0.012 }, radius: 0.045, label: "Bụng" },
  { id: "spine", anchor: { triangle: 20589, barycentric: [0.033447, 0.927784, 0.038769], offset: 0.012 }, radius: 0.045, label: "Cột sống" },
  { id: "knee", anchor: { triangle: 21764, barycentric: [0.041132, 0.662593, 0.296275], offset: 0.012 }, radius: 0.045, label: "Gối" },
];

function getAnchoredPosition(geometry: THREE.BufferGeometry, anchor: SurfaceAnchor) {
  const index = geometry.getIndex();
  if (!index) throw new Error("Body geometry must have an index buffer");

  const position = geometry.getAttribute("position");
  const start = anchor.triangle * 3;
  const aIndex = index.getX(start);
  const bIndex = index.getX(start + 1);
  const cIndex = index.getX(start + 2);
  const [aWeight, bWeight, cWeight] = anchor.barycentric;
  const a = new THREE.Vector3().fromBufferAttribute(position, aIndex);
  const b = new THREE.Vector3().fromBufferAttribute(position, bIndex);
  const c = new THREE.Vector3().fromBufferAttribute(position, cIndex);
  const point = a.clone().multiplyScalar(aWeight)
    .addScaledVector(b, bWeight)
    .addScaledVector(c, cWeight);
  const normal = new THREE.Vector3().subVectors(b, a)
    .cross(new THREE.Vector3().subVectors(c, a)).normalize();

  return point.addScaledVector(normal, anchor.offset);
}

interface BodyCanvas3DProps {
  activeRegionId: BodyRegionId;
  regionStatuses: Record<BodyRegionId, TriageStatus>;
  isBusy: boolean;
  onSelectRegion: (regionId: BodyRegionId) => void;
  onAskRegionInChat: (regionId: BodyRegionId) => void;
}
function buildRegionSpheres(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  regionStatuses: Record<BodyRegionId, TriageStatus>
) {
  const regionSpheres: THREE.Mesh[] = [];

  REGION_CONFIGS.forEach((cfg) => {
    const sphereGeometry = new THREE.SphereGeometry(cfg.radius, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      visible: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      emissiveIntensity: 0.6,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(getAnchoredPosition(geometry, cfg.anchor));
    sphere.userData.isRegionSphere = true;
    sphere.userData.regionId = cfg.id;
    sphere.userData.regionLabel = cfg.label;
    sphere.userData.surfaceAnchor = cfg.anchor;
    parent.add(sphere);
    regionSpheres.push(sphere);

    const status = regionStatuses[cfg.id] || "normal";
    const colorInfo = STATUS_COLORS[status] || STATUS_COLORS.normal;
    const safeColor = colorInfo && colorInfo.color ? colorInfo.color : STATUS_COLORS.normal.color;
    const safeEmissive = colorInfo && colorInfo.emissive ? colorInfo.emissive : STATUS_COLORS.normal.emissive;
    sphereMaterial.color.setHex(safeColor);
    sphereMaterial.emissive = new THREE.Color(safeEmissive);
  });

  return regionSpheres;
}

export default function BodyCanvas3D({
  activeRegionId,
  regionStatuses,
  isBusy,
  onSelectRegion,
  onAskRegionInChat,
}: BodyCanvas3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [xrayMode, setXrayMode] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegionId | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const bodyRootRef = useRef<THREE.Group | null>(null);
  const bodyGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") || probe.getContext("webgl");
      if (!gl) setWebglError(true);
    } catch {
      setWebglError(true);
    }
  }, []);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    try {
      const probe = document.createElement("canvas");
      const glTest = probe.getContext("webgl2") || probe.getContext("webgl");
      if (!glTest) {
        setWebglError(true);
        return;
      }
    } catch {
      setWebglError(true);
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const bodyRoot = new THREE.Group();
    bodyRoot.scale.set(1.25, 1.25, 1.25);
    bodyRoot.position.set(0, 0.5, 0);
    bodyRoot.rotation.x = -Math.PI / 2;
    scene.add(bodyRoot);
    bodyRootRef.current = bodyRoot;

    const bodyGeometry = createHumanBodyGeometry();
    bodyGeometryRef.current = bodyGeometry;
    bodyGeometry.computeVertexNormals();
    const bodyMesh = new THREE.Mesh(
      bodyGeometry,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 })
    );
    bodyRoot.add(bodyMesh);
    const regionSpheres = buildRegionSpheres(bodyRoot, bodyGeometry, regionStatuses);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0.18, 0.84, 3);
    camera.lookAt(0, 0.45, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.45, 0);
    controls.minDistance = 1.5;
    controls.maxDistance = 6;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-2, 4, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.65);
    pointLight.position.set(1.4, 1.8, 1.4);
    scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(4, 16, 0xcbd5e1, 0xcbd5e1);
    gridHelper.position.y = -0.6;
    scene.add(gridHelper);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      if (!camera) return;
      if (!container) return;
      mouse.x =
        ((event.clientX - container.getBoundingClientRect().left) /
          container.clientWidth) *
          2 -
        1;
      mouse.y =
        -(
          (event.clientY - container.getBoundingClientRect().top) /
            container.clientHeight
        ) *
          2 +
        1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionSpheres);
      if (intersects.length > 0) {
        const regionId = intersects[0].object.userData.regionId as BodyRegionId;
        setHoveredRegion(regionId);
        container.style.cursor = "pointer";
      } else {
        setHoveredRegion(null);
        container.style.cursor = "default";
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!camera) return;
      if (!container) return;
      mouse.x =
        ((event.clientX - container.getBoundingClientRect().left) /
          container.clientWidth) *
          2 -
        1;
      mouse.y =
        -(
          (event.clientY - container.getBoundingClientRect().top) /
            container.clientHeight
        ) *
          2 +
        1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(regionSpheres);
      if (intersects.length > 0) {
        const regionId = intersects[0].object.userData.regionId as BodyRegionId;
        onSelectRegion(regionId);
      }
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onClick);

    let animationFrameId = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      regionSpheres.forEach((sphere) => {
        sphere.position.copy(
          getAnchoredPosition(bodyGeometry, sphere.userData.surfaceAnchor as SurfaceAnchor)
        );
      });
      if (autoRotate) {
        // No body group to rotate in this simple version
      }
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (scene && camera && renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("click", onClick);
      cancelAnimationFrame(animationFrameId);
      controlsRef.current?.dispose();
      bodyRoot.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      if (bodyRootRef.current === bodyRoot) bodyRootRef.current = null;
      if (bodyGeometryRef.current === bodyGeometry) bodyGeometryRef.current = null;
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [activeRegionId, regionStatuses, onSelectRegion, autoRotate]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const config = REGION_CONFIGS.find((c) => c.id === activeRegionId);
    if (!config) return;

    if (!bodyRootRef.current || !bodyGeometryRef.current) return;
    const targetPos = bodyRootRef.current.localToWorld(
      getAnchoredPosition(bodyGeometryRef.current, config.anchor)
    );
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 800;
    const start = performance.now();
    let frameId = 0;

    const animateFocus = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      camera.position.lerpVectors(
        startPos,
        new THREE.Vector3(targetPos.x, targetPos.y + 0.5, targetPos.z + 1.8),
        eased
      );
      controls.target.lerpVectors(startTarget, targetPos, eased);
      controls.update();
      if (t < 1) {
        frameId = requestAnimationFrame(animateFocus);
      }
    };
    animateFocus();
    return () => cancelAnimationFrame(frameId);
  }, [activeRegionId]);

  if (webglError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">WebGL không được hỗ trợ</h3>
        <p className="text-xs text-slate-500 mt-1">
          Trình duyệt của bạn không hỗ trợ WebGL. Vui lòng cập nhật trình duyệt hoặc sử dụng thiết bị khác để xem mô hình 3D.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0" id="canvas-container">
      <div
        ref={hostRef}
        className="flex-1 bg-white border border-slate-200 rounded-lg relative overflow-hidden"
        style={{ minHeight: 0 }}
      />
      <div className="mt-3 flex items-center justify-center flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
            autoRotate
              ? "bg-sky-50 border-sky-300 text-sky-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          {autoRotate ? "Đang xoay" : "Xoay 360°"}
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          onClick={() => {
            if (cameraRef.current && controlsRef.current) {
              cameraRef.current.position.set(0.18, 0.84, 3);
              controlsRef.current.target.set(0, 0.45, 0);
            }
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
        <button
          type="button"
          onClick={() => setXrayMode((v) => !v)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
            xrayMode
              ? "bg-sky-50 border-sky-300 text-sky-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {xrayMode ? "X-Ray: Bật" : "X-Ray"}
        </button>
        {hoveredRegion && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onAskRegionInChat(hoveredRegion)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-[11px] font-medium hover:bg-sky-700 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <Stethoscope className="w-3 h-3" />
            Hỏi AI về {hoveredRegion}
          </button>
        )}
      </div>
    </div>
  );
}