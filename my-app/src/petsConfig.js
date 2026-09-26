// ─── КОНФИГ ПИТОМЦЕВ ───
// Для каждого яйца: 2 вариации, у каждой 3 стадии
// ВАЖНО: пути должны точно совпадать с папками в assets/

export const PETS_BY_EGG = {
  bird: {
    species: 'Птица',
    egg: require('../assets/eggs/bird_egg.png'),
    variations: {
      f: {
        label: 'Розовая',
        preview: require('../assets/Animals/Bird/Pink/bird1_f.png'),
        stages: [
          require('../assets/Animals/Bird/Pink/bird1_f.png'),
          require('../assets/Animals/Bird/Pink/bird2_f.png'),
          require('../assets/Animals/Bird/Pink/bird3_f.png'),
        ],
      },
      m: {
        label: 'Жёлтая',
        preview: require('../assets/Animals/Bird/Yellow/bird1_m.png'),
        stages: [
          require('../assets/Animals/Bird/Yellow/bird1_m.png'),
          require('../assets/Animals/Bird/Yellow/bird2_m.png'),
          require('../assets/Animals/Bird/Yellow/bird3_m.png'),
        ],
      },
    },
  },

  cat: {
    species: 'Кот',
    egg: require('../assets/eggs/cat_egg.png'),
    variations: {
      f: {
        label: 'Фиолетовая',
        preview: require('../assets/Animals/Cat/Purple/cat1_f.png'),
        stages: [
          require('../assets/Animals/Cat/Purple/cat1_f.png'),
          require('../assets/Animals/Cat/Purple/cat2_f.png'),
          require('../assets/Animals/Cat/Purple/cat3_f.png'),
        ],
      },
      m: {
        label: 'Серая',
        preview: require('../assets/Animals/Cat/Grey/cat1_m.png'),
        stages: [
          require('../assets/Animals/Cat/Grey/cat1_m.png'),
          require('../assets/Animals/Cat/Grey/cat2_m.png'),
          require('../assets/Animals/Cat/Grey/cat3_m.png'),
        ],
      },
    },
  },

  dog: {
    species: 'Собака',
    egg: require('../assets/eggs/dog_egg.png'),
    variations: {
      f: {
        label: 'Белая',
        preview: require('../assets/Animals/Dog/White/dog1_f.png'),
        stages: [
          require('../assets/Animals/Dog/White/dog1_f.png'),
          require('../assets/Animals/Dog/White/dog2_f.png'),
          require('../assets/Animals/Dog/White/dog3_f.png'),
        ],
      },
      m: {
        label: 'Коричневая',
        preview: require('../assets/Animals/Dog/Brown/dog1_m.png'),
        stages: [
          require('../assets/Animals/Dog/Brown/dog1_m.png'),
          require('../assets/Animals/Dog/Brown/dog2_m.png'),
          require('../assets/Animals/Dog/Brown/dog3_m.png'),
        ],
      },
    },
  },

  fox: {
    species: 'Лиса',
    egg: require('../assets/eggs/fox_egg.png'),
    variations: {
      f: {
        label: 'Фиолетовая',
        preview: require('../assets/Animals/Fox/Purple/fox1_f.png'),
        stages: [
          require('../assets/Animals/Fox/Purple/fox1_f.png'),
          require('../assets/Animals/Fox/Purple/fox2_f.png'),
          require('../assets/Animals/Fox/Purple/fox3_f.png'),
        ],
      },
      m: {
        label: 'Оранжевая',
        preview: require('../assets/Animals/Fox/Orange/fox1_m.png'),
        stages: [
          require('../assets/Animals/Fox/Orange/fox1_m.png'),
          require('../assets/Animals/Fox/Orange/fox2_m.png'),
          require('../assets/Animals/Fox/Orange/fox3_m.png'),
        ],
      },
    },
  },

  pinguin: {
    species: 'Пингвин',
    egg: require('../assets/eggs/pinguin_egg.png'),
    variations: {
      f: {
        label: 'Розовый',
        preview: require('../assets/Animals/Pinguin/Pink/pinguin1_f.png'),
        stages: [
          require('../assets/Animals/Pinguin/Pink/pinguin1_f.png'),
          require('../assets/Animals/Pinguin/Pink/pinguin2_f.png'),
          require('../assets/Animals/Pinguin/Pink/pinguin3_f.png'),
        ],
      },
      m: {
        label: 'Чёрный',
        preview: require('../assets/Animals/Pinguin/Black/pinguin1_m.png'),
        stages: [
          require('../assets/Animals/Pinguin/Black/pinguin1_m.png'),
          require('../assets/Animals/Pinguin/Black/pinguin2_m.png'),
          require('../assets/Animals/Pinguin/Black/pinguin3_m.png'),
        ],
      },
    },
  },

  tiger: {
    species: 'Тигр',
    egg: require('../assets/eggs/tiger_egg.png'),
    variations: {
      f: {
        label: 'Белый',
        preview: require('../assets/Animals/Tiger/White/tiger1_f.png'),
        stages: [
          require('../assets/Animals/Tiger/White/tiger1_f.png'),
          require('../assets/Animals/Tiger/White/tiger2_f.png'),
          require('../assets/Animals/Tiger/White/tiger3_f.png'),
        ],
      },
      m: {
        label: 'Оранжевый',
        preview: require('../assets/Animals/Tiger/Orange/tiger1_m.png'),
        stages: [
          require('../assets/Animals/Tiger/Orange/tiger1_m.png'),
          require('../assets/Animals/Tiger/Orange/tiger2_m.png'),
          require('../assets/Animals/Tiger/Orange/tiger3_m.png'),
        ],
      },
    },
  },
};

// ─── ХЕЛПЕРЫ ───

// Картинка яйца по виду
export function getEggImage(speciesId) {
  return PETS_BY_EGG[speciesId]?.egg ?? PETS_BY_EGG.pinguin.egg;
}

// Препросмотр питомца для конкретной стадии (0=яйцо-стадия, 1, 2)
// stage: 0 — сразу после вылупления, 1 — средняя, 2 — финальная
export function getPetImage(speciesId, variationId, stage = 1) {
  const species = PETS_BY_EGG[speciesId];
  if (!species) return PETS_BY_EGG.pinguin.variations.m.stages[stage] || PETS_BY_EGG.pinguin.variations.m.stages[0];
  const variation = species.variations[variationId] || species.variations.m || species.variations.f;
  const stageIndex = Math.max(0, Math.min(stage, variation.stages.length - 1));
  return variation.stages[stageIndex];
}

// Препросмотр выбранной вариации (для экрана с именем)
export function getVariationPreview(speciesId, variationId) {
  const species = PETS_BY_EGG[speciesId];
  if (!species) return null;
  const variation = species.variations[variationId];
  return variation ? variation.preview : null;
}

// Список всех видов (для каталога)
export const SPECIES_LIST = Object.entries(PETS_BY_EGG).map(([id, cfg]) => ({
  id,
  species: cfg.species,
  egg: cfg.egg,
}));