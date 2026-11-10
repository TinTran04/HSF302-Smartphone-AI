/**
 * Real 3D models (GLB) for each skin.
 *
 * Files live in `FE/public/models/`.
 *
 * A skin without an entry (or whose file fails to load) uses the built-in procedural avatar.
 * If the GLB contains animation clips, clips named like idle / wave / think / happy / listen are played;
 * otherwise the whole model gets procedural motion (float, breathe, sway, nod, hop).
 */
export interface AvatarModel {
  url: string;
  /** The model already contains the glowing chat bubble, so the code one is hidden. */
  hasBubble?: boolean;
  /** The model already contains the halo, so the code one is hidden. */
  hasHalo?: boolean;
  /** The model already contains the glowing floor rings, so the code platform is hidden. */
  hasPlatform?: boolean;
  /** Name of a node that holds the whole head, if any, so it can look at the pointer. */
  headNode?: string;
  /** Height in scene units after normalising (procedural avatar is about 2.4). */
  height?: number;
  /** Extra turn around the vertical axis, in radians, if the model does not face the camera. */
  rotationY?: number;
}

// FPT_Female_3D_Chatbot (5 skins), compressed with gltf-transform (meshopt). Each file embeds
// Idle_Float_Loop, Blink_Loop, Typing_Dots_Loop and Halo_Pulse_Loop, plus its own bubble, halo and floor rings.
const chatbot = (id: string): AvatarModel => ({
  url: `/models/avatar-${id}.glb`,
  hasBubble: true,
  hasHalo: true,
  hasPlatform: true,
  height: 2.75,
});

export const avatarModels: Partial<Record<string, AvatarModel>> = {
  'fpt-university': chatbot('fpt-university'),
  'tech-consultant': chatbot('tech-consultant'),
  'neon-cyber': chatbot('neon-cyber'),
  'sales-advisor': chatbot('sales-advisor'),
  'playful-pastel': chatbot('playful-pastel'),
};
