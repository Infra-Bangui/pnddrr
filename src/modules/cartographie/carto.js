/* module: cartographie/carto.js — PNDDRR engine (classic globals) */
/* ================= PARTIE 3 — CARTOGRAPHIE DES ZONES DE DÉSARMEMENT ================= */
/* Coordonnées approchées (longitude, latitude) des chefs-lieux des 20 préfectures */
const PREF_COORD = {
  "Bangui":[18.55,4.36], "Bamingui-Bangoran":[20.65,8.41], "Basse-Kotto":[21.18,4.32],
  "Haut-Mbomou":[26.50,5.40], "Haute-Kotto":[21.99,6.54], "Kémo":[19.08,5.72],
  "Lim-Pendé":[16.44,7.24], "Lobaye":[17.99,3.87], "Mambéré":[15.87,4.94],
  "Mambéré-Kadéï":[15.79,4.26], "Mbomou":[22.82,4.74], "Nana-Grébizi":[19.19,6.99],
  "Nana-Mambéré":[15.60,5.93], "Ombella-M'Poko":[18.12,4.80], "Ouaka":[20.67,5.77],
  "Ouham":[17.45,6.49], "Ouham-Fafa":[18.30,7.30], "Ouham-Pendé":[16.38,6.32],
  "Sangha-Mbaéré":[16.04,3.53], "Vakaga":[22.79,10.28]
};
/* Contours réels des 20 préfectures — fond de carte Natural Earth (données ouvertes),
   simplifié pour usage hors-ligne. Les tracés des trois préfectures créées par la
   loi 21-001 (Lim-Pendé, Ouham-Fafa, Mambéré) sont indicatifs (marqués a:1),
   en attente du tracé officiel. */
const RCA_GEO=[{"n":"Vakaga","p":[[[22.861,10.919],[23.006,10.687],[23.291,10.44],[23.624,9.908],[23.674,9.69],[23.606,9.537],[23.646,9.425],[23.632,9.278],[23.549,9.185],[23.463,9.154],[23.461,9.236],[23.373,9.213],[23.314,9.028],[23.114,8.917],[23.05,8.756],[22.647,8.685],[22.5,8.582],[22.391,8.592],[22.375,8.667],[22.212,8.706],[22.123,8.778],[22.087,8.969],[21.852,9.185],[21.776,9.399],[21.702,9.5],[21.617,9.589],[21.523,9.602],[21.486,9.768],[21.451,9.77],[21.253,9.583],[21.055,9.524],[20.897,9.383],[20.814,9.419],[20.841,9.484],[20.983,9.604],[21.02,9.748],[21.105,9.774],[21.132,9.849],[21.271,9.987],[21.374,9.973],[21.513,10.201],[21.656,10.234],[21.719,10.297],[21.751,10.412],[21.705,10.532],[21.723,10.637],[21.864,10.668],[22.004,10.743],[22.049,10.837],[22.176,10.816],[22.253,10.915],[22.447,10.998],[22.683,10.974],[22.861,10.919]]]},{"n":"Haute-Kotto","p":[[[23.463,9.154],[23.438,8.995],[23.478,8.959],[23.543,8.997],[23.567,8.975],[23.554,8.883],[23.482,8.783],[23.505,8.711],[23.596,8.734],[23.721,8.702],[23.803,8.722],[24.236,8.682],[24.211,8.627],[24.251,8.58],[24.193,8.532],[24.122,8.372],[24.18,8.298],[24.407,8.166],[24.473,8.074],[24.453,7.933],[24.497,7.634],[24.594,7.485],[24.512,7.308],[24.516,7.249],[24.56,7.205],[24.545,7.012],[24.346,6.958],[24.322,6.933],[24.346,6.882],[24.287,6.82],[24.303,6.778],[23.452,6.302],[23.396,6.215],[23.319,6.209],[23.291,6.104],[22.905,6.185],[22.821,6.27],[22.56,6.245],[22.457,6.08],[22.37,6.039],[22.248,6.063],[22.107,5.98],[22.052,5.708],[22.086,5.643],[22.03,5.637],[22.034,5.601],[21.901,5.475],[21.663,5.549],[21.673,5.598],[21.751,5.67],[21.85,5.62],[21.898,5.672],[21.94,5.911],[21.885,6.033],[21.822,6.057],[21.791,6.168],[21.744,6.215],[21.809,6.34],[21.795,6.545],[21.704,6.593],[21.61,6.772],[21.653,6.881],[21.606,7.003],[21.577,7.286],[21.422,7.32],[21.4,7.527],[21.131,7.703],[21.104,7.849],[21.132,7.958],[21.153,7.985],[21.419,8.018],[21.393,8.163],[21.49,8.248],[21.597,8.239],[21.62,8.279],[21.741,8.329],[21.773,8.326],[21.864,8.205],[21.981,8.221],[21.96,8.292],[22.001,8.404],[21.958,8.525],[22.005,8.605],[22.075,8.618],[22.349,8.567],[22.436,8.598],[22.507,8.583],[22.647,8.685],[23.05,8.756],[23.114,8.917],[23.314,9.028],[23.373,9.213],[23.461,9.236],[23.463,9.154]]]},{"n":"Haut-Mbomou","p":[[[24.263,8.269],[24.332,8.246],[24.431,8.271],[24.513,8.207],[24.8,8.18],[24.918,8.087],[24.953,7.997],[25.029,7.919],[25.23,7.852],[25.279,7.659],[25.165,7.58],[25.19,7.501],[25.316,7.417],[25.36,7.336],[25.786,7.143],[25.801,7.105],[26.026,6.997],[26.091,6.83],[26.378,6.653],[26.27,6.466],[26.29,6.387],[26.452,6.28],[26.456,6.23],[26.509,6.205],[26.425,6.072],[26.481,6.105],[26.544,6.031],[26.776,5.982],[26.819,5.895],[26.894,5.89],[26.916,5.85],[26.981,5.859],[27.036,5.785],[27.124,5.769],[27.218,5.645],[27.217,5.585],[27.261,5.578],[27.218,5.426],[27.264,5.26],[27.441,5.071],[27.074,5.203],[26.962,5.151],[26.867,5.038],[26.808,5.039],[26.739,5.094],[26.503,5.047],[26.391,5.149],[26.272,5.159],[26.198,5.238],[26.13,5.259],[26.088,5.245],[26.095,5.211],[26.027,5.19],[25.972,5.228],[25.911,5.17],[25.872,5.217],[25.826,5.195],[25.792,5.263],[25.758,5.244],[25.656,5.318],[25.623,5.31],[25.581,5.375],[25.371,5.317],[25.308,5.185],[25.349,5.142],[25.317,5.042],[25.228,5.01],[25.129,5.019],[25.076,4.952],[24.958,4.991],[24.789,4.92],[24.664,4.924],[24.671,4.957],[24.601,5.026],[24.481,5.102],[24.557,5.118],[24.539,5.182],[24.571,5.179],[24.605,5.273],[24.696,5.26],[24.783,5.287],[24.833,5.345],[24.871,5.333],[24.914,5.435],[24.972,5.448],[24.963,5.479],[25.046,5.564],[25.02,5.574],[25.043,5.592],[25.044,5.762],[25.118,5.806],[25.144,5.773],[25.184,5.91],[24.85,6.219],[24.925,6.208],[24.997,6.24],[25.012,6.283],[25.072,6.304],[25.05,6.375],[24.867,6.494],[24.796,6.485],[24.694,6.4],[24.612,6.391],[24.261,6.753],[24.307,6.782],[24.287,6.82],[24.346,6.882],[24.322,6.933],[24.346,6.958],[24.545,7.012],[24.56,7.205],[24.516,7.249],[24.512,7.308],[24.594,7.485],[24.497,7.634],[24.453,7.933],[24.473,8.074],[24.407,8.166],[24.263,8.269]]]},{"n":"Kémo","p":[[[19.858,5.06],[19.72,5.136],[19.432,5.136],[19.237,5.011],[19.196,4.95],[19.107,4.932],[19.091,5.036],[18.991,5.186],[19.025,5.334],[18.992,5.412],[18.898,5.493],[18.865,5.627],[18.687,5.668],[18.635,5.731],[18.627,6.001],[18.911,6.2],[18.866,6.241],[18.86,6.357],[18.759,6.462],[18.752,6.514],[19.014,6.543],[19.09,6.465],[19.176,6.437],[19.468,6.498],[19.743,6.476],[19.754,6.42],[19.852,6.361],[19.871,6.323],[19.839,6.12],[19.784,6.041],[19.717,6.034],[19.596,5.918],[19.607,5.769],[19.662,5.743],[19.662,5.677],[19.471,5.541],[19.522,5.49],[20.015,5.465],[19.962,5.346],[19.934,5.133],[19.858,5.06]]]},{"n":"Ouaka","p":[[[20.457,4.525],[20.456,4.622],[20.339,4.772],[20.237,4.806],[20.172,4.878],[20.004,4.974],[19.891,5.002],[19.858,5.06],[19.934,5.133],[19.962,5.346],[20.015,5.465],[19.522,5.49],[19.471,5.549],[19.558,5.582],[19.662,5.677],[19.662,5.743],[19.607,5.769],[19.596,5.918],[19.717,6.034],[19.784,6.041],[19.839,6.12],[19.867,6.34],[19.754,6.42],[19.743,6.476],[19.877,6.451],[19.871,6.626],[20.102,6.88],[20.156,7.097],[20.24,7.034],[20.349,7.02],[20.445,7.021],[20.572,7.075],[20.644,7.138],[20.687,7.241],[20.794,7.232],[20.894,7.289],[21.075,7.507],[21.056,7.582],[21.131,7.703],[21.4,7.527],[21.422,7.32],[21.577,7.286],[21.606,7.003],[21.653,6.881],[21.61,6.772],[21.704,6.593],[21.795,6.545],[21.809,6.34],[21.744,6.215],[21.791,6.168],[21.822,6.057],[21.893,6.02],[21.94,5.911],[21.938,5.814],[21.858,5.621],[21.751,5.67],[21.673,5.598],[21.634,5.491],[21.588,5.465],[21.518,5.51],[21.482,5.63],[21.395,5.728],[21.232,5.65],[21.122,5.656],[21.037,5.715],[21.057,5.65],[21.025,5.553],[20.94,5.523],[20.988,5.42],[20.957,5.377],[20.957,5.231],[20.903,5.123],[20.937,5.023],[20.899,4.953],[20.895,4.813],[20.712,4.748],[20.57,4.59],[20.457,4.525]]]},{"n":"Basse-Kotto","p":[[[20.603,4.41],[20.457,4.525],[20.57,4.59],[20.712,4.748],[20.895,4.813],[20.899,4.953],[20.937,5.023],[20.903,5.123],[20.957,5.231],[20.957,5.377],[20.988,5.42],[20.94,5.523],[21.025,5.553],[21.057,5.65],[21.037,5.715],[21.122,5.656],[21.232,5.65],[21.395,5.728],[21.57,5.466],[21.634,5.491],[21.663,5.549],[21.901,5.475],[21.881,5.174],[21.792,5.088],[21.833,5.005],[21.782,4.929],[21.736,4.714],[21.916,4.643],[21.956,4.566],[21.942,4.533],[22.099,4.542],[22.147,4.512],[22.065,4.363],[22.037,4.229],[21.868,4.242],[21.723,4.295],[21.634,4.294],[21.538,4.245],[21.375,4.278],[21.288,4.333],[21.211,4.292],[21.114,4.341],[21.076,4.395],[20.872,4.453],[20.603,4.41]]]},{"n":"Mbomou","p":[[[24.431,5.067],[24.396,5.122],[24.361,5.063],[24.399,5.036],[24.297,5.003],[24.259,4.93],[24.21,4.956],[24.153,4.903],[24.09,4.92],[23.978,4.854],[23.951,4.868],[23.948,4.818],[23.817,4.821],[23.588,4.734],[23.448,4.659],[23.415,4.591],[23.265,4.635],[23.169,4.738],[23.099,4.712],[23.017,4.751],[22.977,4.834],[22.898,4.824],[22.854,4.711],[22.786,4.725],[22.724,4.629],[22.689,4.492],[22.592,4.474],[22.614,4.374],[22.539,4.278],[22.546,4.237],[22.423,4.135],[22.207,4.15],[22.037,4.229],[22.065,4.363],[22.147,4.512],[22.099,4.542],[21.942,4.533],[21.956,4.566],[21.916,4.643],[21.736,4.714],[21.782,4.929],[21.833,5.005],[21.792,5.088],[21.881,5.174],[21.902,5.488],[22.034,5.601],[22.03,5.637],[22.086,5.643],[22.052,5.708],[22.114,5.985],[22.248,6.063],[22.401,6.047],[22.472,6.093],[22.541,6.232],[22.686,6.269],[22.821,6.27],[22.905,6.185],[23.291,6.104],[23.319,6.209],[23.396,6.215],[23.452,6.302],[24.261,6.753],[24.612,6.391],[24.694,6.4],[24.796,6.485],[24.867,6.494],[25.05,6.375],[25.072,6.304],[25.012,6.283],[24.997,6.24],[24.925,6.208],[24.85,6.219],[25.184,5.91],[25.144,5.773],[25.118,5.806],[25.044,5.762],[25.043,5.592],[25.02,5.574],[25.045,5.561],[24.963,5.479],[24.972,5.448],[24.88,5.392],[24.871,5.333],[24.837,5.347],[24.783,5.287],[24.699,5.26],[24.605,5.273],[24.571,5.179],[24.539,5.182],[24.557,5.118],[24.437,5.101],[24.431,5.067]]]},{"n":"Ombella-M'Poko","p":[[[19.107,4.932],[19.012,4.765],[18.828,4.56],[18.753,4.401],[18.634,4.356],[18.561,4.438],[18.497,4.399],[18.633,4.13],[18.645,3.982],[18.612,3.867],[18.499,3.911],[18.411,3.994],[18.342,4.086],[18.342,4.224],[18.305,4.302],[18.205,4.344],[18.132,4.448],[17.95,4.478],[17.891,4.456],[17.765,4.534],[17.643,4.511],[17.586,4.534],[17.465,4.794],[17.32,4.874],[17.144,5.028],[17.037,5.024],[16.996,5.092],[17.118,5.165],[17.033,5.288],[16.932,5.362],[16.708,5.379],[16.526,5.275],[16.497,5.388],[16.515,5.568],[16.749,5.779],[16.979,5.859],[16.981,5.794],[17.044,5.72],[17.583,5.721],[17.913,5.896],[17.998,5.853],[18.027,5.801],[18.244,5.8],[18.275,5.749],[18.397,5.738],[18.373,5.686],[18.413,5.563],[18.601,5.652],[18.622,5.735],[18.687,5.668],[18.865,5.627],[18.898,5.493],[19.022,5.352],[18.991,5.186],[19.091,5.036],[19.107,4.932]]]},{"n":"Bangui","p":[[[18.596,4.371],[18.537,4.306],[18.493,4.388],[18.561,4.438],[18.596,4.371]]]},{"n":"Lobaye","p":[[[18.612,3.867],[18.593,3.71],[18.626,3.477],[18.57,3.49],[18.472,3.632],[18.38,3.574],[18.249,3.575],[18.182,3.477],[18.082,3.563],[17.969,3.538],[17.919,3.566],[17.856,3.537],[17.793,3.618],[17.587,3.632],[17.482,3.705],[17.414,3.683],[17.322,3.812],[16.934,3.977],[16.738,4.245],[16.869,4.427],[16.997,4.347],[17.067,4.346],[16.846,4.68],[16.83,4.868],[17.027,4.969],[17.037,5.024],[17.144,5.028],[17.32,4.874],[17.465,4.794],[17.586,4.534],[17.643,4.511],[17.765,4.534],[17.845,4.467],[17.95,4.478],[18.147,4.436],[18.205,4.344],[18.305,4.302],[18.342,4.224],[18.342,4.086],[18.411,3.994],[18.499,3.911],[18.612,3.867]]]},{"n":"Bamingui-Bangoran","p":[[[20.802,9.426],[20.897,9.383],[21.055,9.524],[21.253,9.583],[21.451,9.77],[21.495,9.765],[21.523,9.602],[21.617,9.589],[21.702,9.5],[21.776,9.399],[21.852,9.185],[22.087,8.969],[22.137,8.76],[22.228,8.699],[22.375,8.667],[22.391,8.592],[22.349,8.567],[22.075,8.618],[21.997,8.6],[21.958,8.525],[22.001,8.404],[21.96,8.292],[21.99,8.233],[21.96,8.212],[21.864,8.205],[21.76,8.332],[21.62,8.279],[21.597,8.239],[21.49,8.248],[21.384,8.146],[21.419,8.018],[21.153,7.985],[21.132,7.958],[21.104,7.849],[21.131,7.703],[21.056,7.582],[21.075,7.507],[20.876,7.271],[20.794,7.232],[20.687,7.241],[20.633,7.125],[20.463,7.027],[20.24,7.034],[19.921,7.247],[19.885,7.353],[19.763,7.448],[19.729,7.548],[19.592,7.568],[19.599,7.651],[19.566,7.67],[19.592,7.699],[19.386,7.774],[19.357,7.756],[19.321,7.805],[19.352,7.842],[19.32,7.882],[19.352,7.898],[19.345,8.021],[19.38,8.048],[19.354,8.064],[19.359,8.13],[19.235,8.278],[19.249,8.301],[19.154,8.405],[19.064,8.583],[19.072,8.632],[19.124,8.675],[18.87,8.864],[19.101,9.015],[19.7,9.021],[19.889,9.046],[20.11,9.151],[20.155,9.116],[20.213,9.145],[20.257,9.116],[20.378,9.12],[20.507,9.213],[20.496,9.271],[20.542,9.322],[20.668,9.302],[20.655,9.343],[20.758,9.377],[20.802,9.426]]]},{"n":"Ouham","p":[[[17.896,5.898],[17.583,5.721],[17.021,5.726],[16.907,6.099],[16.953,6.135],[16.955,6.297],[17.015,6.309],[17.024,6.368],[17.091,6.397],[17.099,6.45],[17.041,6.488],[16.909,6.456],[16.793,6.558],[16.679,6.986],[16.767,7.114],[16.783,7.347],[16.832,7.427],[16.815,7.55],[16.881,7.633],[17.039,7.662],[17.059,7.697],[17.102,7.678],[17.251,7.823],[17.419,7.898],[17.466,7.884],[17.621,7.979],[17.859,7.96],[17.95,7.978],[17.95,5.874],[17.896,5.898]]],"a":1},{"n":"Ouham-Pendé","p":[[[16.764,6.614],[16.899,6.46],[17.041,6.488],[17.1,6.443],[17.091,6.397],[17.024,6.368],[17.015,6.309],[16.955,6.297],[16.953,6.135],[16.908,6.106],[16.979,5.859],[16.749,5.779],[16.515,5.568],[16.236,5.906],[16.195,5.906],[16.142,5.819],[16.064,5.792],[15.994,5.802],[15.824,5.925],[15.789,6.153],[15.705,6.278],[15.784,6.368],[15.759,6.417],[15.541,6.311],[15.48,6.328],[15.424,6.302],[15.35,6.383],[15.301,6.579],[15.189,6.695],[15.183,6.755],[14.922,6.686],[15.042,6.791],[15.064,6.85],[16.729,6.85],[16.764,6.614]]],"a":1},{"n":"Sangha-Mbaéré","p":[[[17.414,3.683],[17.334,3.619],[17.259,3.626],[17.197,3.582],[17.009,3.538],[16.868,3.562],[16.833,3.523],[16.686,3.542],[16.599,3.502],[16.465,3.157],[16.491,3.068],[16.446,2.958],[16.479,2.836],[16.197,2.236],[16.09,2.51],[16.11,2.701],[16.059,2.712],[16.095,2.837],[16.055,2.94],[16.026,2.979],[15.978,2.981],[15.914,3.098],[15.786,3.108],[15.262,3.663],[15.459,3.783],[15.506,3.742],[15.562,3.753],[15.619,3.84],[15.887,3.969],[16.085,3.991],[16.373,3.889],[16.449,3.832],[16.585,4.0],[16.601,4.142],[16.678,4.259],[16.761,4.228],[16.97,3.948],[17.322,3.812],[17.414,3.683]]]},{"n":"Nana-Mambéré","p":[[[14.576,6.19],[14.719,6.258],[14.772,6.318],[14.922,6.686],[15.183,6.755],[15.189,6.695],[15.301,6.579],[15.35,6.383],[15.424,6.302],[15.48,6.328],[15.541,6.311],[15.751,6.419],[15.775,6.404],[15.784,6.368],[15.705,6.278],[15.789,6.153],[15.816,5.936],[15.866,5.888],[15.994,5.802],[16.084,5.793],[16.156,5.832],[16.195,5.906],[16.236,5.906],[16.316,5.784],[16.437,5.691],[16.515,5.568],[16.497,5.388],[16.526,5.275],[16.001,5.068],[15.929,5.114],[15.806,5.082],[15.769,5.229],[15.71,5.233],[15.666,5.161],[15.686,5.018],[15.498,5.053],[15.406,5.0],[15.114,4.997],[15.019,4.943],[14.945,5.006],[14.66,5.011],[14.652,5.188],[14.52,5.291],[14.617,5.495],[14.59,5.608],[14.631,5.738],[14.617,5.865],[14.585,5.923],[14.466,5.921],[14.387,6.039],[14.535,6.19],[14.576,6.19]]]},{"n":"Mambéré-Kadéï","p":[[[15.064,4.293],[14.994,4.413],[14.78,4.545],[14.719,4.62],[16.886,4.62],[17.067,4.346],[17.002,4.345],[16.86,4.423],[16.738,4.245],[16.658,4.242],[16.601,4.142],[16.585,4.0],[16.449,3.832],[16.373,3.889],[16.085,3.991],[15.887,3.969],[15.619,3.84],[15.562,3.753],[15.506,3.742],[15.459,3.783],[15.262,3.663],[15.085,3.886],[15.026,4.026],[15.092,4.016],[15.192,4.052],[15.103,4.112],[15.064,4.293]]],"a":1},{"n":"Nana-Grébizi","p":[[[19.064,8.583],[19.154,8.405],[19.249,8.301],[19.235,8.278],[19.359,8.13],[19.354,8.064],[19.38,8.048],[19.345,8.021],[19.352,7.898],[19.32,7.882],[19.352,7.842],[19.321,7.805],[19.373,7.747],[19.386,7.774],[19.592,7.699],[19.566,7.67],[19.599,7.651],[19.592,7.568],[19.729,7.548],[19.763,7.448],[19.885,7.353],[19.921,7.247],[20.156,7.097],[20.102,6.88],[19.871,6.626],[19.874,6.448],[19.534,6.502],[19.176,6.437],[19.09,6.465],[19.014,6.543],[18.752,6.514],[18.776,6.583],[18.872,6.662],[18.752,6.75],[18.755,6.811],[18.655,6.941],[18.744,7.079],[18.712,7.117],[18.841,7.243],[18.732,7.571],[18.793,7.646],[19.014,7.763],[18.981,7.775],[18.98,7.856],[19.056,8.067],[19.057,8.229],[19.018,8.26],[19.072,8.41],[19.064,8.583]]]},{"n":"Lim-Pendé","p":[[[16.549,7.795],[16.613,7.748],[16.614,7.68],[16.822,7.523],[16.832,7.427],[16.795,7.385],[16.755,7.195],[16.767,7.114],[16.679,6.986],[16.724,6.881],[16.729,6.85],[15.064,6.85],[15.136,7.045],[15.188,7.089],[15.224,7.248],[15.433,7.39],[15.419,7.437],[15.481,7.523],[15.669,7.516],[15.758,7.456],[15.925,7.488],[16.043,7.584],[16.371,7.673],[16.392,7.784],[16.451,7.792],[16.549,7.87],[16.549,7.795]]],"a":1},{"n":"Ouham-Fafa","p":[[[18.589,8.048],[18.639,8.178],[18.813,8.276],[19.072,8.632],[19.072,8.41],[19.019,8.268],[19.057,8.229],[19.056,8.067],[18.98,7.856],[18.981,7.775],[19.014,7.763],[18.745,7.604],[18.732,7.571],[18.841,7.243],[18.712,7.117],[18.744,7.079],[18.655,6.953],[18.755,6.811],[18.752,6.75],[18.868,6.677],[18.867,6.644],[18.776,6.583],[18.743,6.492],[18.86,6.357],[18.866,6.241],[18.907,6.192],[18.627,6.001],[18.635,5.731],[18.608,5.663],[18.423,5.565],[18.374,5.678],[18.389,5.743],[18.275,5.749],[18.244,5.8],[18.027,5.801],[17.998,5.853],[17.95,5.874],[17.95,7.978],[18.175,8.022],[18.589,8.048]]],"a":1},{"n":"Mambéré","p":[[[14.717,4.622],[14.66,5.011],[14.945,5.006],[15.019,4.943],[15.114,4.997],[15.406,5.0],[15.498,5.053],[15.686,5.018],[15.666,5.161],[15.721,5.235],[15.769,5.229],[15.806,5.082],[15.929,5.114],[16.027,5.072],[16.73,5.384],[16.8,5.353],[16.932,5.362],[17.033,5.288],[17.118,5.165],[16.995,5.09],[17.037,5.024],[17.027,4.969],[16.83,4.868],[16.846,4.68],[16.886,4.62],[14.717,4.622]]],"a":1}];
const MAP_W=760, MAP_H=520;
function projGeo(lon,lat){ return [ (lon-14.3)/(27.55-14.3)*MAP_W, (11.05-lat)/(11.05-2.15)*MAP_H ]; }
function hexMix(hex,t){ /* blanc -> couleur selon l'intensité t (0..1) */
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  const m=x=>Math.round(255+(x-255)*(0.15+0.85*t));
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}
const CARTO_METRICS = {
  desarmes:{lbl:"Ex-combattants désarmés", fn:c=>!!c.desarmement, color:"#0E7C7B"},
  armes:{lbl:"Armes & lots collectés", fn:null, color:"#003082"},
  enroles:{lbl:"Ex-combattants enrôlés", fn:c=>true, color:"#5E7175"},
  reintegres:{lbl:"Réintégrés (parcours achevé)", fn:c=>c.statut==="reintegre", color:"#289728"},
  abandons:{lbl:"Abandons", fn:c=>c.statut==="abandon", color:"#C0242B"}
};
var CARTO_METRIC="desarmes";
var CARTO_LEVEL="pref";
var LAST_CARTO_SVG="";
const REGION_COLORS={"Plateaux":"#0E7C7B","Équateur":"#289728","Yadé":"#B87A00","Kagas":"#6A3FA0","Fertit":"#C0242B","Haut-Oubangui":"#003082","Bas-Oubangui":"#7A5E00"};
function cartoCounts(metric){
  const m={}; PREFECTURES.forEach(p=>m[p]=0);
  if(metric==="armes"){ DB.combattants.forEach(c=>{ if(c.desarmement) m[c.prefecture]=(m[c.prefecture]||0)+c.desarmement.armes.length; }); }
  else{ const fn=CARTO_METRICS[metric].fn; DB.combattants.forEach(c=>{ if(fn(c)) m[c.prefecture]=(m[c.prefecture]||0)+1; }); }
  return m;
}
function regionCounts(metric){
  const pc=cartoCounts(metric), m={};
  for(const [r,v] of Object.entries(REGIONS)) m[r]=v.prefs.reduce((a,p)=>a+(pc[p]||0),0);
  return m;
}
function rCarto(){
  $("view").innerHTML = `
  <div class="toolbar">
    <div class="field"><label>Niveau</label><select id="cLevel" onchange="CARTO_LEVEL=this.value;drawCarto()"><option value="pref" ${CARTO_LEVEL==="pref"?"selected":""}>20 préfectures</option><option value="region" ${CARTO_LEVEL==="region"?"selected":""}>7 régions</option></select></div>
    <div class="field"><label>Indicateur représenté</label><select id="cMetric" onchange="CARTO_METRIC=this.value;drawCarto()">${
      Object.entries(CARTO_METRICS).map(([k,v])=>`<option value="${k}" ${k===CARTO_METRIC?"selected":""}>${v.lbl}</option>`).join("")}</select></div>
    <div class="muted small" style="flex:1;align-self:center">Découpage loi 21-001 (2021), modèle ICASEES : 7 régions, 20 préfectures, 84 sous-préfectures — cliquez sur une zone pour le détail.</div>
    <button class="btn sec" onclick="exportCartoSVG()">Exporter SVG</button>
    <button class="btn sec" onclick="exportCartoPNG()">Exporter PNG</button>
    <button class="btn sec" onclick="exportCartoCSV()">Synthèse CSV</button>
    <button class="btn sec" onclick="printCarto()">Imprimer / PDF</button>
  </div>
  <div style="display:grid;grid-template-columns:1fr 330px;gap:16px;align-items:start">
    <div class="panel" style="margin-bottom:0"><div class="pb" id="mapBox" style="padding:8px"></div></div>
    <div id="cartoSide">
      <div class="panel" style="margin-bottom:16px"><div class="ph"><h3>Synthèse territoriale</h3><span class="muted small">région → préfecture → sous-préf. → commune</span></div><div class="pb nopad" style="max-height:340px;overflow-y:auto" id="cartoTable"></div></div>
      <div class="panel" style="margin-bottom:0"><div class="ph"><h3 id="zoneTitle">Détail de la zone</h3></div><div class="pb" id="zoneDetail"><span class="muted small">Sélectionnez une zone sur la carte.</span></div></div>
    </div>
  </div>`;
  drawCarto();
}
const CARTO_HDR=80;   /* hauteur de l'en-tête officiel du programme sur la carte */
function armInline(x,y,w,h){ return ARM_SVG.replace("<svg ", `<svg x="${x}" y="${y}" width="${w}" height="${h}" `); }
function cartoSvg(forExport){
  const M=CARTO_METRICS[CARTO_METRIC];
  const byRegion=(CARTO_LEVEL==="region");
  const counts=byRegion?regionCounts(CARTO_METRIC):cartoCounts(CARTO_METRIC);
  const max=Math.max(1,...Object.values(counts));
  const H_TOT=MAP_H+32+CARTO_HDR;
  const cx=MAP_W/2;
  let svg=`<svg viewBox="0 0 ${MAP_W} ${H_TOT}" xmlns="http://www.w3.org/2000/svg" ${forExport?`width="${MAP_W*2}" height="${H_TOT*2}"`:'style="width:100%;height:auto;display:block"'}>`;
  if(forExport) svg+=`<rect x="0" y="0" width="${MAP_W}" height="${H_TOT}" fill="#FFFFFF"/>`;
  /* En-tête officiel du programme : armoiries à gauche, République Centrafricaine en haut du bloc texte */
  svg+=`${armInline(16,8,58,55)}
  <text x="${cx}" y="22" font-size="15" font-weight="bold" text-anchor="middle" fill="#0A5D5C" font-family="Arial" letter-spacing="1">RÉPUBLIQUE CENTRAFRICAINE</text>
  <text x="${cx}" y="35" font-size="8.5" font-style="italic" text-anchor="middle" fill="#B8860B" font-family="Arial" letter-spacing="1.6">Unité — Dignité — Travail</text>
  <text x="${cx}" y="51" font-size="9" text-anchor="middle" fill="#33484C" font-family="Arial" letter-spacing="0.4">UNITÉ D'EXÉCUTION DU PROGRAMME NATIONAL DE DÉSARMEMENT,</text>
  <text x="${cx}" y="62" font-size="9" text-anchor="middle" fill="#33484C" font-family="Arial" letter-spacing="0.4">DÉMOBILISATION, RÉINTÉGRATION ET RAPATRIEMENT</text>
  <line x1="${cx-90}" y1="${CARTO_HDR-6}" x2="${cx+90}" y2="${CARTO_HDR-6}" stroke="#0A5D5C" stroke-width="1.6"/>
  <g transform="translate(0,${CARTO_HDR})">`;
  svg+=`<text x="14" y="24" font-size="15" font-weight="bold" fill="#0A5D5C" font-family="Arial">${M.lbl} ${byRegion?"par région":"par préfecture"} — carte des zones de désarmement</text>
  <g transform="translate(0,32)">`;
  for(const z of RCA_GEO){
    const zone=byRegion?regionOf(z.n):z.n;
    const n=counts[zone]||0;
    const base=byRegion?REGION_COLORS[zone]:M.color;
    const fill=n?hexMix(base,n/max):(byRegion?hexMix(base,0.06):"#F2F6F4");
    const paths=z.p.map(r=>"M"+r.map(pt=>projGeo(pt[0],pt[1]).map(v=>v.toFixed(1)).join(",")).join("L")+"Z").join(" ");
    const dash=(!byRegion&&z.a)?'stroke-dasharray="4,3"':"";
    svg+=`<path d="${paths}" fill="${fill}" stroke="${byRegion?"#7A8F8E":"#0A5D5C"}" stroke-width="${byRegion?0.7:1.1}" ${dash} stroke-linejoin="round" ${forExport?"":`style="cursor:pointer" onclick="zoneDetail('${zone.replace(/'/g,"\\'")}')"`}><title>${zone}${byRegion?" — "+z.n:""} — ${n}</title></path>`;
  }
  if(byRegion){
    for(const [r,v] of Object.entries(REGIONS)){
      const [x,y]=projGeo(...v.coord); const n=counts[r]||0;
      if(n){
        const rad=9+Math.sqrt(n/max)*17;
        svg+=`<g ${forExport?"":`style="cursor:pointer" onclick="zoneDetail('${r.replace(/'/g,"\\'")}')"`}><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${REGION_COLORS[r]}" fill-opacity="0.9" stroke="#fff" stroke-width="1.8"/><text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" font-size="12" font-weight="bold" text-anchor="middle" fill="#fff" font-family="Arial">${n}</text></g>`;
      }
      svg+=`<text x="${x.toFixed(1)}" y="${(y-(n?(9+Math.sqrt(n/max)*17):5)-4).toFixed(1)}" font-size="11" font-weight="bold" text-anchor="middle" fill="#33484C" font-family="Arial">${REGIONS[r].num}. ${r}</text>`;
    }
  } else {
    for(const p of PREFECTURES){
      const [x,y]=projGeo(...PREF_COORD[p]); const n=counts[p]||0;
      if(n){
        const r=8+Math.sqrt(n/max)*16;
        svg+=`<g ${forExport?"":`style="cursor:pointer" onclick="zoneDetail('${p.replace(/'/g,"\\'")}')"`}>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${M.color}" fill-opacity="0.85" stroke="#fff" stroke-width="1.6"/>
        <text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" font-size="12" font-weight="bold" text-anchor="middle" fill="#fff" font-family="Arial">${n}</text></g>`;
      }
      svg+=`<text x="${x.toFixed(1)}" y="${(y-(n?(8+Math.sqrt(n/max)*16):5)-3).toFixed(1)}" font-size="9.5" text-anchor="middle" fill="#33484C" font-family="Arial" ${forExport?"":`style="pointer-events:none"`}>${p}</text>`;
    }
  }
  svg+=`<text x="14" y="${MAP_H-6}" font-size="9" fill="#5E7175" font-family="Arial">${byRegion?"Chaque région est teintée selon l'indicateur ; le cercle chiffré marque son chef-lieu.":"Tracés en tirets : préfectures créées par la loi 21-001 (Lim-Pendé, Ouham-Fafa, Mambéré) — délimitation indicative."} · ${new Date().toLocaleDateString("fr-FR")} · Découpage : loi 21-001 · Modèle : ICASEES · Fond : Natural Earth</text></g></g></svg>`;
  return svg;
}
function metricWeight(c){
  if(CARTO_METRIC==="armes") return c.desarmement?c.desarmement.armes.length:0;
  return CARTO_METRICS[CARTO_METRIC].fn(c)?1:0;
}
var ZONE_NODES=[];
function nodeRef(filter,label){ ZONE_NODES.push({f:filter,l:label}); return ZONE_NODES.length-1; }
function drawCarto(){
  LAST_CARTO_SVG=cartoSvg(false);
  $("mapBox").innerHTML=LAST_CARTO_SVG;
  const M=CARTO_METRICS[CARTO_METRIC];
  ZONE_NODES=[];
  const NP="(non précisée)";
  const wsum=arr=>arr.reduce((a,c)=>a+metricWeight(c),0);
  const val=(n)=>`<b style="color:${n?M.color:"var(--muted)"};margin-left:auto">${n}</b>`;
  const row=(idx,label,n,pad,cls)=>`<div class="zrow ${cls||""}" style="padding-left:${pad}px" onclick="zoneDetailNode(${idx});event.stopPropagation()">${label}${val(n)}</div>`;
  let h="";
  for(const [rName,rV] of Object.entries(REGIONS)){
    const rC=DB.combattants.filter(c=>rV.prefs.includes(c.prefecture));
    const rN=wsum(rC);
    const rIdx=nodeRef({prefs:rV.prefs},`Région ${rName}`);
    let inner="";
    for(const p of rV.prefs){
      const pC=rC.filter(c=>c.prefecture===p);
      const pN=wsum(pC);
      const pIdx=nodeRef({prefs:[p]},`Préfecture : ${p}`);
      let spH="";
      if(pC.length){
        const sps=[...new Set(pC.map(c=>c.sousPref||NP))].sort();
        for(const sp of sps){
          const spC=pC.filter(c=>(c.sousPref||NP)===sp);
          const spIdx=nodeRef({prefs:[p],sp},`S/P ${sp} (${p})`);
          const coms=[...new Set(spC.map(c=>c.commune||NP))].sort();
          let comH="";
          for(const co of coms){
            const coC=spC.filter(c=>(c.commune||NP)===co);
            const coIdx=nodeRef({prefs:[p],sp,com:co},`Commune ${co} — S/P ${sp} (${p})`);
            comH+=row(coIdx,`<span class="muted">Commune</span> ${esc(co)}`,wsum(coC),46);
          }
          spH+=`<details><summary class="zsum" style="padding-left:30px"><span onclick="zoneDetailNode(${spIdx});event.stopPropagation()">S/P ${esc(sp)}</span>${val(wsum(spC))}</summary>${comH}</details>`;
        }
      }
      inner+=`<details><summary class="zsum" style="padding-left:16px"><span onclick="zoneDetailNode(${pIdx});event.stopPropagation()">${esc(p)}</span>${val(pN)}</summary>${spH||`<div class="zrow muted small" style="padding-left:32px">Aucun dossier.</div>`}</details>`;
    }
    h+=`<details ${rN?"open":""}><summary class="zsum zreg"><span onclick="zoneDetailNode(${rIdx});event.stopPropagation()" style="font-weight:700">Région ${esc(rName)}</span><span class="muted small" style="margin-left:6px">(${rV.prefs.length} préf.)</span>${val(rN)}</summary>${inner}</details>`;
  }
  $("cartoTable").innerHTML=`<div class="small" style="padding:6px 10px;border-bottom:1px solid var(--line);background:#FBFDFC;color:var(--muted)">${M.lbl} — cliquez sur un intitulé pour le détail, sur ▸ pour déplier.</div>${h}`;
}
function zoneDetailNode(i){
  const nd=ZONE_NODES[i]; if(!nd) return;
  const NP="(non précisée)";
  const C=DB.combattants.filter(c=>nd.f.prefs.includes(c.prefecture)
    &&(nd.f.sp===undefined||(c.sousPref||NP)===nd.f.sp)
    &&(nd.f.com===undefined||(c.commune||NP)===nd.f.com));
  renderZoneDetail(nd.l, C, nd.f.prefs.length>1?nd.f.prefs:null);
}
function zoneDetail(zone){
  const isRegion=!!REGIONS[zone] && CARTO_LEVEL==="region";
  const prefs=isRegion?REGIONS[zone].prefs:[zone];
  const C=DB.combattants.filter(c=>prefs.includes(c.prefecture));
  const titre=isRegion?`Région ${zone} (chef-lieu : ${REGIONS[zone].chef})`:`Préfecture : ${zone} (chef-lieu : ${CHEF_LIEUX[zone]||"—"}, région ${regionOf(zone)})`;
  renderZoneDetail(titre, C, isRegion?prefs:null);
}
function renderZoneDetail(titre, C, prefsList){
  $("zoneTitle").textContent=titre;
  if(!C.length){ $("zoneDetail").innerHTML=`<span class="muted small">Aucun dossier enregistré dans cette zone.</span>`; return; }
  const armes=C.reduce((a,c)=>a+(c.desarmement?c.desarmement.armes.length:0),0);
  const sites=[...new Set(C.map(c=>c.site).filter(Boolean))];
  const grp=countBy(C,c=>c.groupe);
  const stat=countBy(C,c=>STATUTS[c.statut].lbl);
  $("zoneDetail").innerHTML=`
    <table style="background:transparent;margin-bottom:8px">
      <tr><td style="color:var(--muted);font-weight:600">Dossiers</td><td style="text-align:right"><b>${C.length}</b></td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Armes collectées</td><td style="text-align:right"><b>${armes}</b></td></tr>
      ${stat.map(([k,v])=>`<tr><td class="small" style="padding-left:14px">${k}</td><td style="text-align:right">${v}</td></tr>`).join("")}
    </table>
    ${prefsList?`<div class="small" style="margin-bottom:6px"><b>Préfectures :</b> ${prefsList.map(p=>`<span class="tag">${esc(p)} · ${C.filter(c=>c.prefecture===p).length}</span>`).join(" ")}</div>`:""}
    <div class="small" style="margin-bottom:6px"><b>Groupes armés :</b> ${grp.map(([k,v])=>`<span class="tag">${esc(k)} · ${v}</span>`).join(" ")||"—"}</div>
    <div class="small" style="margin-bottom:8px"><b>Sites de regroupement :</b> ${sites.map(x=>`<span class="tag">${esc(x)}</span>`).join(" ")||"—"}</div>
    <div class="small" style="max-height:150px;overflow-y:auto">${C.map(c=>`<div style="padding:3px 0;border-bottom:1px dashed var(--line)"><span class="link" onclick="go('fiche','${c.id}')">${c.num}</span> — ${esc(c.nom)} ${esc(c.prenom)} <span class="badge st-${c.statut}" style="float:right">${STATUTS[c.statut].lbl}</span></div>`).join("")}</div>`;
}
/* ---------- Exports de la cartographie ---------- */
function exportCartoSVG(){
  dl(`pnddrr_carte_${CARTO_LEVEL}_${CARTO_METRIC}_${today()}.svg`, '<?xml version="1.0" encoding="UTF-8"?>\n'+cartoSvg(true), "image/svg+xml");
  log("Export cartographie",`Carte SVG — ${CARTO_METRICS[CARTO_METRIC].lbl} (${CARTO_LEVEL==="region"?"régions":"préfectures"})`); toast("Carte SVG téléchargée.");
}
function exportCartoPNG(){
  try{
    const svg=cartoSvg(true);
    const img=new Image();
    img.onload=function(){
      const cv=document.createElement("canvas"); cv.width=MAP_W*2; cv.height=(MAP_H+32+CARTO_HDR)*2;
      const ctx=cv.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,cv.width,cv.height);
      ctx.drawImage(img,0,0,cv.width,cv.height);
      const a=document.createElement("a"); a.href=cv.toDataURL("image/png");
      a.download=`pnddrr_carte_${CARTO_LEVEL}_${CARTO_METRIC}_${today()}.png`; a.click();
      log("Export cartographie",`Carte PNG — ${CARTO_METRICS[CARTO_METRIC].lbl}`); toast("Carte PNG téléchargée.");
    };
    img.onerror=()=>toast("Export PNG indisponible — utilisez l'export SVG.");
    img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
  }catch(e){ toast("Export PNG indisponible — utilisez l'export SVG."); }
}
function exportCartoCSV(){
  const NP="(non précisée)";
  const mkeys=Object.keys(CARTO_METRICS);
  const w=(c,k)=>k==="armes"?(c.desarmement?c.desarmement.armes.length:0):(CARTO_METRICS[k].fn(c)?1:0);
  const sums=C=>mkeys.map(k=>C.reduce((a,c)=>a+w(c,k),0));
  const rows=[["Niveau","Région","Préfecture","Sous-préfecture","Commune",...mkeys.map(k=>CARTO_METRICS[k].lbl)]];
  for(const [rName,rV] of Object.entries(REGIONS)){
    const rC=DB.combattants.filter(c=>rV.prefs.includes(c.prefecture));
    rows.push(["Région",rName,"","","",...sums(rC)]);
    for(const p of rV.prefs){
      const pC=rC.filter(c=>c.prefecture===p);
      rows.push(["Préfecture",rName,p,"","",...sums(pC)]);
      for(const sp of [...new Set(pC.map(c=>c.sousPref||NP))].sort()){
        const spC=pC.filter(c=>(c.sousPref||NP)===sp);
        rows.push(["Sous-préfecture",rName,p,sp,"",...sums(spC)]);
        for(const co of [...new Set(spC.map(c=>c.commune||NP))].sort()){
          rows.push(["Commune",rName,p,sp,co,...sums(spC.filter(c=>(c.commune||NP)===co))]);
        }
      }
    }
  }
  dl(`pnddrr_synthese_territoriale_${today()}.csv`, csv(rows), "text/csv");
  log("Export cartographie","Synthèse territoriale CSV (région/préfecture/sous-préfecture/commune)"); toast("Synthèse territoriale CSV téléchargée.");
}
function printCarto(){
  const M=CARTO_METRICS[CARTO_METRIC];
  const byRegion=(CARTO_LEVEL==="region");
  const counts=byRegion?regionCounts(CARTO_METRIC):cartoCounts(CARTO_METRIC);
  const rows=(byRegion?Object.keys(REGIONS):PREFECTURES).map(p=>[p,counts[p]||0]).sort((a,b)=>b[1]-a[1]);
  doPrint(docWrap(`${docEntete("Cartographie des zones de désarmement")}
    <h2 class="titre">Carte des zones de désarmement</h2>
    <div style="border:1px solid #000;padding:6px">${cartoSvg(true).replace(/width="\d+" height="\d+"/,'style="width:100%;height:auto"')}</div>
    <table class="dt" style="margin-top:14px"><tr><th>${byRegion?"Région":"Préfecture"}</th><th style="text-align:right">${M.lbl}</th></tr>${
      rows.filter(r=>r[1]).map(([p,n])=>`<tr><td>${p}</td><td style="text-align:right"><b>${n}</b></td></tr>`).join("")||"<tr><td colspan=2>Aucune donnée</td></tr>"}</table>
    <div class="sig"><div class="c"></div><div class="c">Fait à ${esc(cfg("villeSignature")||"Bangui")}, le ${new Date().toLocaleDateString("fr-FR")}<br>Pour le PNDDRR<div class="ligne">${esc(CUR.nom)}</div></div></div>`));
  log("Impression","Carte des zones de désarmement");
}
