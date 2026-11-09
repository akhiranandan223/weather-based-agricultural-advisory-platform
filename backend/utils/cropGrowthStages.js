const commonGrowthStages = [
  'Germination',
  'Seedling',
  'Germination / Seedling',
  'Vegetative',
  'Tillering',
  'Flowering',
  'Flowering / Tillering',
  'Fruiting',
  'Grain Filling',
  'Grain Formation / Pod Filling',
  'Maturity',
  'Ripening / Maturity',
  'Harvesting'
];

const cropSpecificGrowthStages = {
  Rice: ['Panicle Initiation', 'Booting', 'Heading', 'Milk Stage', 'Dough Stage'],
  Cotton: ['Squaring', 'Boll Formation', 'Boll Opening'],
  Maize: ['Emergence', 'Knee-High', 'Tasseling', 'Silking', 'Dough Stage'],
  Wheat: ['Crown Root Initiation', 'Jointing', 'Booting', 'Heading', 'Dough Stage'],
  Groundnut: ['Pegging', 'Pod Formation', 'Pod Filling'],
  Chilli: ['Transplanting', 'Budding'],
  Tomato: ['Transplanting', 'Budding'],
  Soybean: ['Branching', 'Pod Formation', 'Seed Filling'],
  'Pulses / Gram': ['Branching', 'Pod Formation', 'Seed Filling'],
  Sugarcane: ['Grand Growth'],
  Other: []
};

const growthStageValues = [
  ...new Set([
    ...commonGrowthStages,
    ...Object.values(cropSpecificGrowthStages).flat()
  ])
];

const getGrowthStagesForCrop = (cropName) => [
  ...new Set([
    ...commonGrowthStages,
    ...(cropSpecificGrowthStages[cropName] || [])
  ])
];

const isValidGrowthStageForCrop = (growthStage, cropName) =>
  getGrowthStagesForCrop(cropName).includes(growthStage);

module.exports = {
  commonGrowthStages,
  cropSpecificGrowthStages,
  growthStageValues,
  getGrowthStagesForCrop,
  isValidGrowthStageForCrop
};
