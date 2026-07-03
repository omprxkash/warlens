const PUBLIC_URL = process.env.PUBLIC_URL || '';

export const CATEGORIES = [
  { id: 'Combat', label: 'Combat', folder: 'Combat' },
  { id: 'DestroyedBuildings', label: 'Destroyed Buildings', folder: 'DestroyedBuildings' },
  { id: 'Fire', label: 'Fire', folder: 'Fire' },
  { id: 'HumanitarianAid', label: 'Humanitarian Aid', folder: 'HumanitarianAid' },
  { id: 'MilitaryVehicles', label: 'Military Vehicles & Weapons', folder: 'MilitaryVehicles' },
];

const FILES_BY_CATEGORY = {
  Combat: [
    '1.jpg', '10.jpeg', '100.jpg', '11.jpeg', '12.jpeg',
    '13.jpeg', '14.jpeg', '15.jpeg', '16.jpeg', '17.jpeg',
    '18.jpeg', '19.jpeg', '2.jpeg', '20.jpeg', '21.jpeg',
    '22.jpeg', '23.jpeg', '24.jpeg', '25.jpeg', '26.jpeg',
  ],
  DestroyedBuildings: [
    '000_32GB49R.jpg',
    '01000000-0aff-0242-6479-08db16c9a96b_w1200_r1.jpg',
    '03132023_OpEd-Quake_083810.jpg',
    '1000_F_232845570_QtsAF27Gv4bHBIZtEes4j4dvlJwPqWI6.jpg',
    '1247068368.jpg',
    '1280px-Destroyed_building_in_Muzaffarabad_after_the_earthquake_(2005)(1).jpg',
    '1280px-Destroyed_building_in_Muzaffarabad_after_the_earthquake_(2005).jpg',
    '138785380_15817260430911n.jpg',
    '152000818-post-war-city-war-ruins-destroyed-city-after-a-military-attack-bombed-buildings-debris-bui(1).jpg',
    '152000818-post-war-city-war-ruins-destroyed-city-after-a-military-attack-bombed-buildings-debris-bui.jpg',
    '1943821_turkeyearthquakeshutterstock_597776.jpg',
    '196924.jpg',
    '20230215-_dsc9594-edit_custom-38a29ba4c4611b249851057199c57f4ddb5c8e02.jpg',
    '260012.jpg',
    '28DAILY-turkey-audio-app-02-ftwb-videoSixteenByNine3000.jpg',
    '2E9A8121.jpg',
    '30f8d6oz(1).jpg',
    '30f8d6oz.jpg',
    '360_F_207131848_acX4397l37Lf8nazdiwhn7HSe3SNN9an.jpg',
    '360_F_269046835_NvSW6fUHd3aSfiZ5uCDS5Kk263JDjvGw.jpg',
  ],
  Fire: [
    'fire1.jpeg', 'fire10.jpeg', 'fire100.jpeg', 'fire11.jpeg', 'fire12.jpeg',
    'fire13.jpeg', 'fire14.jpeg', 'fire15.jpeg', 'fire16.jpeg', 'fire17.jpeg',
    'fire18.jpeg', 'fire19.jpeg', 'fire2.jpeg', 'fire20.jpeg', 'fire21.jpeg',
    'fire22.jpeg', 'fire23.jpeg', 'fire24.jpeg', 'fire25.jpeg', 'fire26.jpeg',
  ],
  HumanitarianAid: [
    '100.jpeg', '51.jpg', '52.jpeg', '53.jpeg', '54.jpg',
    '55.jpeg', '56.jpeg', '57.jpeg', '58.jpeg', '59.jpeg',
    '60.jpeg', '61.jpeg', '62.jpeg', '63.jpeg', '64.jpg',
    '65.jpeg', '66.jpg', '67.jpeg', '68.jpeg', '69.jpeg',
  ],
  MilitaryVehicles: [
    '1.jpeg', '10.jpeg', '100.jpeg', '11.jpeg', '12.jpg',
    '13.jpeg', '14.jpg', '15.jpeg', '16.jpg', '17.jpg',
    '18.jpeg', '19.jpeg', '2.jpg', '20.jpg', '21.jpg',
    '22.jpg', '23.jpeg', '24.jpg', '25.jpeg', '26.jpg',
  ],
};

export const DATASET = CATEGORIES.flatMap((cat) =>
  FILES_BY_CATEGORY[cat.id].map((file) => ({
    file,
    category: cat.id,
    label: cat.label,
    folder: cat.folder,
    url: `${PUBLIC_URL}/dataset/${cat.folder}/${encodeURIComponent(file)}`,
  })),
);

export const DATASET_TOTAL = DATASET.length;
export const TRAINING_TOTAL = 500;
