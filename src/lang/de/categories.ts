import type { Category } from '../../core/types.ts'

// Solution-word categories. Words are uppercase A-Z: words with umlauts or
// ß are left out entirely (no Ä -> AE, no ß -> SS spelling), matching the
// grid words. "ss" in current spelling (NUSS, RUSSLAND) is fine.
// `easy` categories have few members, so the anagram is quick to spot.
export const CATEGORIES: readonly Category[] = [
  {
    id: 'country',
    name: 'Land',
    clue: 'Welches Land ist gesucht?',
    words: [
      'ALBANIEN', 'ALGERIEN', 'ANDORRA', 'ANGOLA', 'ARMENIEN', 'BAHRAIN', 'BARBADOS', 'BELARUS',
      'BELGIEN', 'BELIZE', 'BENIN', 'BHUTAN', 'BOLIVIEN', 'BOTSUANA', 'BRASILIEN', 'BULGARIEN',
      'BURUNDI', 'CHILE', 'CHINA', 'ECUADOR', 'ERITREA', 'ESTLAND', 'FIDSCHI', 'FINNLAND', 'GABUN',
      'GAMBIA', 'GEORGIEN', 'GHANA', 'GRENADA', 'GUINEA', 'GUYANA', 'HAITI', 'INDIEN', 'IRAK',
      'IRAN', 'IRLAND', 'ISLAND', 'ISRAEL', 'ITALIEN', 'JAMAIKA', 'JAPAN', 'JEMEN', 'JORDANIEN',
      'KANADA', 'KATAR', 'KENIA', 'KOLUMBIEN', 'KOSOVO', 'KROATIEN', 'KUBA', 'KUWAIT', 'LAOS',
      'LESOTHO', 'LETTLAND', 'LIBANON', 'LIBERIA', 'LIBYEN', 'LITAUEN', 'LUXEMBURG', 'MALAWI',
      'MALAYSIA', 'MALI', 'MALTA', 'MAROKKO', 'MEXIKO', 'MOLDAU', 'MONACO', 'MONGOLEI', 'MYANMAR',
      'NAMIBIA', 'NAURU', 'NEPAL', 'NIGER', 'NIGERIA', 'NORWEGEN', 'OMAN', 'PAKISTAN', 'PALAU',
      'PANAMA', 'PARAGUAY', 'PERU', 'POLEN', 'PORTUGAL', 'RUANDA', 'RUSSLAND', 'SAMBIA', 'SAMOA',
      'SCHWEDEN', 'SCHWEIZ', 'SENEGAL', 'SERBIEN', 'SIMBABWE', 'SLOWAKEI', 'SLOWENIEN', 'SOMALIA',
      'SPANIEN', 'SUDAN', 'SURINAME', 'SYRIEN', 'TAIWAN', 'TANSANIA', 'THAILAND', 'TOGO', 'TONGA',
      'TSCHAD', 'TUNESIEN', 'TUVALU', 'UGANDA', 'UNGARN', 'URUGUAY', 'VIETNAM', 'ZYPERN',
    ],
    lessKnown: [
      'ANDORRA', 'ARMENIEN', 'BAHRAIN', 'BARBADOS', 'BELARUS', 'BELIZE', 'BENIN', 'BHUTAN',
      'BOTSUANA', 'BURUNDI', 'ERITREA', 'FIDSCHI', 'GABUN', 'GAMBIA', 'GEORGIEN', 'GRENADA',
      'GUINEA', 'GUYANA', 'KATAR', 'KOSOVO', 'KUWAIT', 'LAOS', 'LESOTHO', 'LIBERIA', 'MALAWI',
      'MALI', 'MOLDAU', 'MONGOLEI', 'MYANMAR', 'NAMIBIA', 'NAURU', 'NIGER', 'OMAN', 'PALAU',
      'PARAGUAY', 'RUANDA', 'SAMBIA', 'SAMOA', 'SENEGAL', 'SIMBABWE', 'SOMALIA', 'SUDAN',
      'SURINAME', 'TANSANIA', 'TOGO', 'TONGA', 'TSCHAD', 'TUVALU', 'UGANDA', 'URUGUAY',
    ],
  },
  {
    id: 'capital',
    name: 'Hauptstadt',
    clue: 'Welche Hauptstadt ist gesucht?',
    words: [
      'ABUJA', 'ACCRA', 'ALGIER', 'AMMAN', 'AMSTERDAM', 'ANKARA', 'ASTANA', 'ATHEN', 'BAGDAD',
      'BAKU', 'BANGKOK', 'BEIRUT', 'BELGRAD', 'BERLIN', 'BERN', 'BOGOTA', 'BRASILIA', 'BUDAPEST',
      'BUKAREST', 'CANBERRA', 'CARACAS', 'COLOMBO', 'DAKAR', 'DAMASKUS', 'DHAKA', 'DOHA', 'DUBLIN',
      'ERIWAN', 'HANOI', 'HARARE', 'HAVANNA', 'HELSINKI', 'JAKARTA', 'KABUL', 'KAIRO',
      'KAMPALA', 'KATHMANDU', 'KIGALI', 'LIMA', 'LISSABON', 'LONDON', 'LUANDA', 'LUSAKA',
      'MADRID', 'MANILA', 'MAPUTO', 'MASKAT', 'MINSK', 'MOSKAU', 'NAIROBI', 'NIKOSIA', 'OSLO',
      'OTTAWA', 'PARIS', 'PEKING', 'PRAG', 'QUITO', 'RABAT', 'RIAD', 'RIGA', 'SANAA', 'SANTIAGO',
      'SARAJEVO', 'SEOUL', 'SKOPJE', 'SOFIA', 'STOCKHOLM', 'TALLINN', 'TASCHKENT', 'TEHERAN',
      'TIFLIS', 'TIRANA', 'TOKIO', 'TUNIS', 'VADUZ', 'VALLETTA', 'WARSCHAU', 'WIEN',
      'ZAGREB',
    ],
    lessKnown: [
      'ABUJA', 'ACCRA', 'ALGIER', 'AMMAN', 'ASTANA', 'BAKU', 'BOGOTA', 'CARACAS', 'COLOMBO',
      'DAKAR', 'DHAKA', 'DOHA', 'ERIWAN', 'HANOI', 'HARARE', 'JAKARTA', 'KAMPALA', 'KATHMANDU',
      'KIGALI', 'LUANDA', 'LUSAKA', 'MANILA', 'MAPUTO', 'MASKAT', 'NIKOSIA', 'QUITO', 'RABAT',
      'RIAD', 'SANAA', 'SKOPJE', 'TASCHKENT', 'TIFLIS', 'TIRANA', 'VALLETTA',
    ],
  },
  {
    id: 'fruit',
    name: 'Frucht',
    clue: 'Welche Frucht ist gesucht?',
    words: [
      'ANANAS', 'APFEL', 'APRIKOSE', 'AVOCADO', 'BANANE', 'BIRNE', 'BROMBEERE', 'DATTEL',
      'ERDBEERE', 'FEIGE', 'GUAVE', 'HIMBEERE', 'KIRSCHE', 'KIWI', 'KOKOSNUSS', 'LIMETTE',
      'LITSCHI', 'MANDARINE', 'MANGO', 'MARACUJA', 'MARILLE', 'MELONE', 'MIRABELLE', 'NEKTARINE',
      'ORANGE', 'PAPAYA', 'PFIRSICH', 'PFLAUME', 'QUITTE', 'TRAUBE', 'ZITRONE', 'ZWETSCHGE',
    ],
    lessKnown: [
      'GUAVE', 'LITSCHI', 'MARACUJA', 'MIRABELLE', 'PAPAYA', 'QUITTE',
    ],
  },
  {
    id: 'animal',
    name: 'Tier',
    clue: 'Welches Tier ist gesucht?',
    words: [
      'ADLER', 'AFFE', 'ALPAKA', 'AMEISE', 'AMSEL', 'BIBER', 'BIENE', 'BISON', 'DACHS', 'DELFIN',
      'ECHSE', 'ELCH', 'ELEFANT', 'ENTE', 'ESEL', 'EULE', 'FALKE', 'FLAMINGO', 'FLIEGE',
      'FORELLE', 'FROSCH', 'FUCHS', 'GANS', 'GEPARD', 'GIRAFFE', 'GORILLA', 'HAMSTER', 'HASE',
      'HECHT', 'HERMELIN', 'HIRSCH', 'HUHN', 'HUMMER', 'HUND', 'IGEL', 'JAGUAR', 'KAMEL',
      'KARPFEN', 'KATZE', 'KOALA', 'KRABBE', 'KRANICH', 'KROKODIL', 'LACHS', 'LAMA', 'LEOPARD',
      'LUCHS', 'MARDER', 'MAUS', 'MEISE', 'MOTTE', 'MUSCHEL', 'NASHORN', 'NILPFERD', 'OTTER',
      'PANDA', 'PAPAGEI', 'PFAU', 'PFERD', 'PINGUIN', 'PUMA', 'QUALLE', 'RABE', 'RATTE', 'RAUPE',
      'REIHER', 'ROBBE', 'SCHAF', 'SCHLANGE', 'SCHNECKE', 'SCHWAN', 'SCHWEIN', 'SPATZ', 'SPECHT',
      'SPINNE', 'STORCH', 'TAUBE', 'TIGER', 'WESPE', 'WIESEL', 'WOLF', 'WURM', 'ZEBRA',
      'ZIEGE',
    ],
    lessKnown: [
      'ALPAKA', 'BISON', 'GEPARD', 'HERMELIN', 'KRANICH', 'MARDER', 'REIHER', 'WIESEL',
    ],
  },
  {
    id: 'body',
    name: 'Körperteil',
    clue: 'Welcher Körperteil ist gesucht?',
    words: [
      'ACHSEL', 'ADER', 'ARM', 'AUGE', 'BAUCH', 'BECKEN', 'BEIN', 'BRAUE', 'BRUST', 'DARM',
      'DAUMEN', 'ELLBOGEN', 'FERSE', 'FINGER', 'GAUMEN', 'GEHIRN', 'HAAR', 'HALS', 'HAND',
      'HAUT', 'HERZ', 'KIEFER', 'KINN', 'KNIE', 'KNOCHEN', 'KOPF', 'LEBER', 'LIPPE', 'LUNGE',
      'MAGEN', 'MANDEL', 'MILZ', 'MUND', 'MUSKEL', 'NABEL', 'NACKEN', 'NAGEL', 'NASE', 'NERV',
      'NIERE', 'OHR', 'RIPPE', 'SCHULTER', 'SEHNE', 'STIRN', 'VENE', 'WADE', 'WANGE', 'WIMPER',
      'ZAHN', 'ZEHE', 'ZUNGE',
    ],
    lessKnown: [
      'ACHSEL', 'ADER', 'BRAUE', 'GAUMEN', 'MANDEL', 'MILZ', 'SEHNE', 'VENE',
    ],
  },
  {
    id: 'vegetable',
    name: 'Gemüse',
    clue: 'Welches Gemüse ist gesucht?',
    words: [
      'BOHNE', 'BROKKOLI', 'ERBSE', 'FENCHEL', 'GURKE', 'KARFIOL', 'KAROTTE', 'KARTOFFEL', 'KOHL',
      'LAUCH', 'MAIS', 'PAPRIKA', 'RETTICH', 'SALAT', 'SELLERIE', 'SPARGEL', 'SPINAT', 'TOMATE',
      'ZUCCHINI', 'ZWIEBEL',
    ],
    lessKnown: [
      'FENCHEL', 'RETTICH',
    ],
  },
  {
    id: 'instrument',
    name: 'Musikinstrument',
    clue: 'Welches Musikinstrument ist gesucht?',
    words: [
      'CELLO', 'GEIGE', 'GITARRE', 'HARFE', 'HORN', 'KLAVIER', 'OBOE', 'ORGEL', 'POSAUNE',
      'SAXOPHON', 'TROMMEL', 'TROMPETE', 'TUBA', 'ZITHER',
    ],
    lessKnown: [
      'OBOE', 'ZITHER',
    ],
  },
  {
    id: 'sport',
    name: 'Sportart',
    clue: 'Welche Sportart ist gesucht?',
    words: [
      'BADMINTON', 'BASEBALL', 'BIATHLON', 'BILLARD', 'BOWLING', 'BOXEN', 'CRICKET', 'CURLING',
      'DARTS', 'FECHTEN', 'GOLF', 'HANDBALL', 'HOCKEY', 'JUDO', 'KARATE', 'KEGELN', 'LANGLAUF',
      'MARATHON', 'POLO', 'RINGEN', 'RODELN', 'RUDERN', 'RUGBY', 'SCHACH', 'SEGELN', 'SLALOM',
      'SQUASH', 'SUMO', 'SURFEN', 'TENNIS', 'TRIATHLON', 'TURNEN',
    ],
    lessKnown: [
      'BIATHLON', 'CRICKET', 'CURLING', 'POLO', 'SLALOM', 'SQUASH', 'SUMO',
    ],
  },
  {
    id: 'kitchen',
    name: 'Küchengegenstand',
    clue: 'Welcher Küchengegenstand ist gesucht?',
    words: [
      'BACKOFEN', 'BECHER', 'DECKEL', 'EIERUHR', 'FLASCHE', 'GABEL', 'GLAS', 'GRILL', 'HERD',
      'KANNE', 'KELLE', 'KESSEL', 'KRUG', 'MESSER', 'MIXER', 'NUDELHOLZ', 'OFEN', 'PFANNE', 'REIBE',
      'SCHALE', 'SERVIETTE', 'SIEB', 'SPATEL', 'TABLETT', 'TASSE', 'TELLER', 'TOASTER', 'TOPF',
      'TRICHTER', 'WAAGE', 'WOK', 'ZANGE',
    ],
    lessKnown: [
      'SPATEL', 'TRICHTER',
    ],
  },
  {
    id: 'clothing',
    name: 'Kleidungsstück',
    clue: 'Welches Kleidungsstück ist gesucht?',
    words: [
      'ANZUG', 'BADEHOSE', 'BIKINI', 'BLAZER', 'BLUSE', 'DIRNDL', 'HANDSCHUH', 'HEMD', 'HOSE',
      'HUT', 'JACKE', 'JEANS', 'KAPPE', 'KAPUZE', 'KIMONO', 'KLEID', 'KORSETT', 'KRAWATTE',
      'LEDERHOSE', 'MANTEL', 'OVERALL', 'PANTOFFEL', 'PARKA', 'PONCHO', 'PULLOVER', 'PYJAMA',
      'ROCK', 'SAKKO', 'SANDALE', 'SCHAL', 'SCHUH', 'SHORTS', 'SOCKE', 'STIEFEL', 'STRUMPF',
      'TRACHT', 'TUNIKA', 'UMHANG', 'WESTE',
    ],
    lessKnown: [
      'BLAZER', 'KORSETT', 'PARKA', 'PONCHO', 'TUNIKA', 'UMHANG',
    ],
  },
  {
    id: 'plant',
    name: 'Pflanze',
    clue: 'Welche Pflanze ist gesucht?',
    words: [
      // trees
      'AHORN', 'BIRKE', 'BUCHE', 'EIBE', 'EICHE', 'ERLE', 'ESCHE', 'FICHTE', 'KASTANIE', 'KIEFER',
      'LINDE', 'PALME', 'PAPPEL', 'TANNE', 'ULME', 'WEIDE', 'ZEDER',
      // flowers
      'ASTER', 'DAHLIE', 'ENZIAN', 'FLIEDER', 'GERANIE', 'HORTENSIE', 'IRIS', 'JASMIN', 'KAMILLE',
      'KROKUS', 'LAVENDEL', 'LILIE', 'MARGERITE', 'MOHN', 'NARZISSE', 'NELKE', 'ORCHIDEE', 'PRIMEL',
      'ROSE', 'TULPE', 'VEILCHEN',
      // other plants
      'BAMBUS', 'DISTEL', 'EFEU', 'FARN', 'GINSTER', 'HOLUNDER', 'KAKTUS', 'KLEE', 'MISTEL',
      'MOOS', 'ROSMARIN', 'SALBEI', 'SCHILF', 'THYMIAN',
    ],
    lessKnown: [
      'EIBE', 'ERLE', 'ESCHE', 'GINSTER', 'MISTEL', 'SCHILF', 'ULME', 'ZEDER',
    ],
  },
  // Small categories: easier anagrams
  {
    id: 'planet',
    name: 'Planet',
    clue: 'Welcher Planet ist gesucht?',
    easy: true,
    words: ['ERDE', 'JUPITER', 'MARS', 'MERKUR', 'NEPTUN', 'SATURN', 'URANUS', 'VENUS'],
  },
  {
    id: 'weekday',
    name: 'Wochentag',
    clue: 'Welcher Wochentag ist gesucht?',
    easy: true,
    words: ['DIENSTAG', 'FREITAG', 'MITTWOCH', 'MONTAG', 'SAMSTAG', 'SONNTAG'],
  },
  {
    id: 'month',
    name: 'Monat',
    clue: 'Welcher Monat ist gesucht?',
    easy: true,
    words: ['APRIL', 'AUGUST', 'DEZEMBER', 'FEBRUAR', 'JANUAR', 'JULI', 'JUNI', 'NOVEMBER', 'OKTOBER'],
  },
  {
    id: 'chess',
    name: 'Schachfigur',
    clue: 'Welche Schachfigur ist gesucht?',
    easy: true,
    words: ['BAUER', 'DAME', 'SPRINGER', 'TURM'],
  },
]
