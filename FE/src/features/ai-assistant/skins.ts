/** Outfits for the phone-advisor avatar. Every skin shares the same 3D model. */
export type MascotOutfit = 'hoodie' | 'jacket' | 'blazer';
export type MascotAccessory = 'nameTag' | 'tie' | 'visor' | 'catEars' | 'heart' | 'drawstrings';

export interface MascotSkin {
  id: string;
  name: string;
  description: string;
  outfit: MascotOutfit;
  colors: {
    skin: string;
    hair: string;
    iris: string;
    /** Hoodie, jacket or blazer. */
    outfit: string;
    /** Collar, cuffs, hood lining. */
    trim: string;
    /** Shirt under a blazer, drawstrings, zip. */
    inner: string;
    headphones: string;
    /** Halo, chat bubble, ear-cup icons and other glowing parts. */
    glow: string;
    scrunchie: string;
  };
  accessories: MascotAccessory[];
  /** Text on the chest name tag. */
  badge?: string;
}

export const mascotSkins: MascotSkin[] = [
  {
    id: 'fpt-university',
    name: 'FPT University',
    description: 'Áo khoác cam cổ trắng, thẻ tên sinh viên, tai nghe cam.',
    outfit: 'jacket',
    colors: {
      skin: '#fbdcc8',
      hair: '#6b4330',
      iris: '#4a2c1d',
      outfit: '#f27022',
      trim: '#ffffff',
      inner: '#ffffff',
      headphones: '#f27022',
      glow: '#ff8a3d',
      scrunchie: '#ffffff',
    },
    accessories: ['nameTag'],
    badge: 'FPT University',
  },
  {
    id: 'tech-consultant',
    name: 'Tech Consultant',
    description: 'Hoodie trắng bạc, tai nghe xám, ánh sáng xanh dịu.',
    outfit: 'hoodie',
    colors: {
      skin: '#fbdcc8',
      hair: '#6b4330',
      iris: '#4a2c1d',
      outfit: '#eef1f7',
      trim: '#c9d1e0',
      inner: '#9aa6ba',
      headphones: '#b8c0cf',
      glow: '#7c9cff',
      scrunchie: '#c9d1e0',
    },
    accessories: ['drawstrings'],
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Hoodie tím đêm, kính visor và viền neon.',
    outfit: 'hoodie',
    colors: {
      skin: '#f6d6c6',
      hair: '#4a2f2a',
      iris: '#3b2160',
      outfit: '#2a1d5c',
      trim: '#5b3cc4',
      inner: '#22d3ee',
      headphones: '#4c3bb3',
      glow: '#a855f7',
      scrunchie: '#22d3ee',
    },
    accessories: ['visor', 'drawstrings'],
  },
  {
    id: 'sales-advisor',
    name: 'Sales Advisor',
    description: 'Vest đen, sơ mi trắng, cà vạt và tai nghe vàng.',
    outfit: 'blazer',
    colors: {
      skin: '#fbdcc8',
      hair: '#5a3726',
      iris: '#4a2c1d',
      outfit: '#1c1d24',
      trim: '#2c2e38',
      inner: '#ffffff',
      headphones: '#d4a537',
      glow: '#f5c451',
      scrunchie: '#f5c451',
    },
    accessories: ['tie', 'nameTag'],
    badge: 'Sales Advisor',
  },
  {
    id: 'playful-pastel',
    name: 'Playful Pastel',
    description: 'Hoodie xanh mint, tai nghe tai mèo hồng và trái tim.',
    outfit: 'hoodie',
    colors: {
      skin: '#fbdcc8',
      hair: '#6b4330',
      iris: '#5a2f3a',
      outfit: '#9be3cf',
      trim: '#ffc7dc',
      inner: '#ff8fb8',
      headphones: '#ffb3cf',
      glow: '#ff7eb6',
      scrunchie: '#ffc7dc',
    },
    accessories: ['catEars', 'heart', 'drawstrings'],
  },
];

export const defaultSkinId = mascotSkins[0].id;

export const skinById = (id: string | null | undefined) =>
  mascotSkins.find((skin) => skin.id === id) ?? mascotSkins[0];
