/**
 * Sample artifacts for testing
 * Replace with real museum data
 */

import { Artifact } from '../types';

export const sampleArtifacts: Artifact[] = [
  {
    id: 'gem_001',
    name: 'Golden Mask of Tutankhamun',
    nameArabic: 'قناع توت عنخ آمون الذهبي',
    category: 'funerary_mask',
    dynasty: '18th Dynasty',
    period: 'New Kingdom',
    dateApprox: '1323 BCE',
    material: ['gold', 'lapis lazuli', 'obsidian', 'quartz', 'carnelian'],
    dimensions: '54 cm height, 39.3 cm width',
    weight: '11 kg',
    discovery: {
      date: '1925',
      location: 'Valley of the Kings, Tomb KV62',
      discoverer: 'Howard Carter',
    },
    locationInMuseum: 'Gallery 2, Main Hall',
    storyFacts: [
      'This mask covered the head of Tutankhamun\'s mummified body for over 3,000 years',
      'It weighs 11 kilograms of solid gold - about as heavy as a car tire',
      'The blue stripes are made of lapis lazuli, a stone so precious it was worth more than gold',
      'The eyes are made of obsidian and quartz, giving them an eerily lifelike quality',
      'In 2014, the beard accidentally fell off during cleaning and was hastily glued back with epoxy',
      'The mask shows Tutankhamun wearing the nemes headdress, reserved only for pharaohs',
      'X-rays revealed a second face underneath - possibly from reusing an older mask',
    ],
    connections: ['gem_002', 'gem_003'],
    tags: ['iconic', 'must_see', 'gold', 'pharaoh', 'tutankhamun'],
  },
  {
    id: 'gem_002',
    name: 'Canopic Shrine of Tutankhamun',
    nameArabic: 'صندوق الأحشاء لتوت عنخ آمون',
    category: 'canopic',
    dynasty: '18th Dynasty',
    period: 'New Kingdom',
    dateApprox: '1323 BCE',
    material: ['gilded wood', 'gold', 'glass', 'faience'],
    discovery: {
      date: '1922',
      location: 'Valley of the Kings, Tomb KV62',
      discoverer: 'Howard Carter',
    },
    storyFacts: [
      'This shrine protected the king\'s internal organs for his journey to the afterlife',
      'Ancient Egyptians believed you needed your organs in the next world',
      'Four goddesses - Isis, Nephthys, Neith, and Serqet - guard each side',
      'Inside were four miniature golden coffins, each holding a different organ',
      'The heart was left inside the body - Egyptians believed it was the seat of the soul',
    ],
    connections: ['gem_001', 'gem_004'],
    tags: ['tutankhamun', 'gold', 'afterlife'],
  },
  {
    id: 'gem_003',
    name: 'Statue of Khafre',
    nameArabic: 'تمثال خفرع',
    category: 'statue',
    dynasty: '4th Dynasty',
    period: 'Old Kingdom',
    dateApprox: '2520 BCE',
    material: ['diorite'],
    dimensions: '168 cm height',
    discovery: {
      date: '1860',
      location: 'Giza, Valley Temple of Khafre',
      discoverer: 'Auguste Mariette',
    },
    storyFacts: [
      'This statue shows Pharaoh Khafre, builder of the second largest pyramid at Giza',
      'The falcon god Horus wraps his wings around the king\'s head, protecting him',
      'Made from diorite - one of the hardest stones known to ancient Egyptians',
      'The Egyptians had no iron tools - they carved this with copper and sand over years',
      'Khafre\'s face may have inspired the Great Sphinx, which stands guard near his pyramid',
      'The statue was found buried upside down in a pit, possibly hidden from invaders',
    ],
    connections: ['gem_005'],
    tags: ['statue', 'pharaoh', 'giza', 'old_kingdom'],
  },
  {
    id: 'gem_004',
    name: 'Scarab Bracelet of Tutankhamun',
    nameArabic: 'سوار الجعران لتوت عنخ آمون',
    category: 'jewelry',
    dynasty: '18th Dynasty',
    period: 'New Kingdom',
    dateApprox: '1323 BCE',
    material: ['gold', 'lapis lazuli', 'carnelian', 'turquoise', 'feldspar'],
    discovery: {
      date: '1922',
      location: 'Valley of the Kings, Tomb KV62',
      discoverer: 'Howard Carter',
    },
    storyFacts: [
      'The scarab beetle represented rebirth to ancient Egyptians',
      'They watched beetles roll dung balls and saw a symbol of the sun\'s journey across the sky',
      'This bracelet was found on Tutankhamun\'s mummy, meant to protect him forever',
      'The gold still shines after 3,300 years - it never tarnishes',
      'Howard Carter found 143 pieces of jewelry on Tutankhamun\'s body alone',
    ],
    connections: ['gem_001', 'gem_002'],
    tags: ['jewelry', 'tutankhamun', 'gold', 'scarab'],
  },
  {
    id: 'gem_005',
    name: 'The Rosetta Stone (Replica)',
    nameArabic: 'حجر رشيد (نسخة)',
    category: 'stele',
    dynasty: 'Ptolemaic Period',
    period: 'Ptolemaic',
    dateApprox: '196 BCE',
    material: ['granodiorite'],
    dimensions: '112.3 cm height, 75.7 cm width',
    discovery: {
      date: '1799',
      location: 'Rashid (Rosetta), Egypt',
      discoverer: 'French soldiers',
    },
    storyFacts: [
      'The Rosetta Stone unlocked the secret of Egyptian hieroglyphics',
      'It contains the same text in three scripts: hieroglyphic, demotic, and Greek',
      'Jean-François Champollion cracked the code in 1822 after years of work',
      'The text is actually quite boring - it\'s a tax decree praising Ptolemy V',
      'The original is in the British Museum - Egypt has requested its return many times',
      'Without this stone, we might never have been able to read ancient Egyptian texts',
    ],
    tags: ['famous', 'language', 'ptolemaic', 'replica'],
  },
];

/**
 * Load sample artifacts into database
 */
export async function loadSampleData() {
  const { ArtifactDatabase } = await import('../services/ArtifactDatabase');
  
  await ArtifactDatabase.initialize();
  await ArtifactDatabase.bulkInsert(sampleArtifacts);
  
  console.log(`Loaded ${sampleArtifacts.length} sample artifacts`);
}
