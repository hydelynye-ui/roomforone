import type { ObjectId, ObjectPose, Vec3 } from '../types';

export const INITIAL_POSES: Record<ObjectId, ObjectPose> = {
  computer: { position: [-0.8, 1.29, -2.25], rotation: 0 },
  keyboard: { position: [-0.8, 1.29, -1.48], rotation: 0 },
  mouse: { position: [-0.15, 1.29, -1.45], rotation: 0 },
  lamp: { position: [-1.9, 1.29, -2.1], rotation: 0 },
  tangle: { position: [0.28, 1.37, -1.65], rotation: 0 },
  headphones: { position: [0.85, 1.29, -2.25], rotation: 0.12 },
  game: { position: [1.6, 1.29, -1.45], rotation: -0.2 },
  atmosphere: { position: [1.8, 1.41, -2.3], rotation: -0.15 },
  tools: { position: [-2.35, 1.06, 1.05], rotation: 0 },
};
export const RADII: Record<ObjectId, number> = {
  computer: 0.52, keyboard: 0.32, mouse: 0.1, lamp: 0.23,
  tangle: 0.4, headphones: 0.33, game: 0.4, atmosphere: 0.25, tools: 0.22,
};
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

export function constrainPose(id: ObjectId, next: ObjectPose, others: Partial<Record<ObjectId, ObjectPose>>): ObjectPose {
  const r = RADII[id];
  const p = [...next.position] as Vec3;
  if (id === 'tools') {
    p[0] = clamp(p[0], -2.6, -2.15);
    p[2] = clamp(p[2], 0.45, 1.65);
  } else {
    p[0] = clamp(p[0], -2.35 + r, 2.35 - r);
    p[2] = clamp(p[2], -2.72 + r * 0.6, -0.98 - r * 0.6);
    // Simple, deterministic tabletop exclusion zones prevent passing through other props.
    for (let pass = 0; pass < 5; pass++) {
      for (const [key, pose] of Object.entries(others)) {
        if (key === id || key === 'tools' || !pose) continue;
        const dx = p[0] - pose.position[0], dz = p[2] - pose.position[2];
        const distance = Math.hypot(dx, dz);
        const minimum = (r + RADII[key as ObjectId]) * 0.7;
        if (distance < minimum) {
          const angle = distance > 0.001 ? Math.atan2(dz, dx) : Math.PI / 2;
          p[0] = pose.position[0] + Math.cos(angle) * minimum;
          p[2] = pose.position[2] + Math.sin(angle) * minimum;
          p[0] = clamp(p[0], -2.35 + r, 2.35 - r);
          p[2] = clamp(p[2], -2.72 + r * 0.6, -0.98 - r * 0.6);
        }
      }
    }
  }
  p[1] = INITIAL_POSES[id].position[1];
  return { position: p, rotation: wrapAngle(next.rotation) };
}

export function initialTangle(): Vec3[] {
  return Array.from({ length: 12 }, (_, i) => {
    const t = i / 11 * Math.PI * 1.65;
    return [Math.cos(t) * 0.27, Math.sin(t * 2) * 0.025, Math.sin(t) * 0.22] as Vec3;
  });
}
const distance = (a: Vec3, b: Vec3) => Math.hypot(...a.map((v, i) => v - b[i]));
export const TANGLE_LENGTHS = initialTangle().slice(1).map((p, i) => distance(p, initialTangle()[i]));

export function deformTangle(source: Vec3[], index: number, target: Vec3): Vec3[] {
  const points = source.map(p => [...p] as Vec3);
  points[index] = [clamp(target[0], -0.42, 0.42), clamp(target[1], -0.01, 0.12), clamp(target[2], -0.32, 0.32)];
  const follow = (anchor: number, child: number, length: number) => {
    const a = points[anchor], b = points[child];
    const dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy, dz) || 1;
    points[child] = [a[0] + dx / d * length, a[1] + dy / d * length, a[2] + dz / d * length];
  };
  // Each side follows outward from the held segment; lengths remain exact.
  for (let j = index + 1; j < points.length; j++) follow(j - 1, j, TANGLE_LENGTHS[j - 1]);
  for (let j = index - 1; j >= 0; j--) follow(j + 1, j, TANGLE_LENGTHS[j]);
  // Translate the chain as a whole to keep every joint above the desk and inside its footprint.
  const bounds = [0, 1, 2].map(axis => [Math.min(...points.map(p => p[axis])), Math.max(...points.map(p => p[axis]))]);
  const limits = [[-0.6, 0.6], [-0.015, 0.18], [-0.48, 0.48]];
  const offset = bounds.map(([lo, hi], axis) => lo < limits[axis][0] ? limits[axis][0] - lo : hi > limits[axis][1] ? limits[axis][1] - hi : 0);
  return points.map(p => p.map((v, axis) => v + offset[axis]) as Vec3);
}
