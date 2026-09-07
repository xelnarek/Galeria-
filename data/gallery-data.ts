import { Artist, Artwork, CollectionInfo } from '@/types/gallery';

export const artistData: Artist = {
  name: '[IMIĘ I NAZWISKO ARTYSTY]',
  tagline: 'Malarstwo sztalugowe • Kolekcja prywatna',
  biography:
    '[TUTAJ BIOGRAFIA — Miejsce na opis drogi artystycznej ojca, jego wrażliwości, lat spędzonych przy sztalugach oraz pasji, która towarzyszyła każdemu naniesionemu pociągnięciu pędzla. Możesz wpisać tutaj kilka osobistych zdań lub pełny biogram.]',
  statement:
    '„Obrazy powstałe z potrzeby tworzenia. Każde płótno jest zapisem chwili, poszukiwaniem światła i rozmową z ciszą.”',
  portrait:
    'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
  yearsActive: 'Kolekcja wieloletnia',
};

export const collectionData: CollectionInfo = {
  title: 'PRYWATNA KOLEKCJA',
  subtitle: 'Wystawa dzieł sztuki',
  quote: 'Obrazy powstałe z potrzeby tworzenia.',
  description:
    'Cyfrowa przestrzeń wystawiennicza stworzona, aby oddać należne miejsce twórczości taty. Zbiór płócien gromadzonych przez lata — każde z nich kryje w sobie unikalną emocję, warsztat oraz cząstkę rodzinnej historii.',
  giftDedication: 'Stworzone z miłością jako dar od córki dla ojca.',
  curatorNote:
    'Wystawa została zaprojektowana według zasad klasycznego muzealnictwa i nowoczesnej galerii: z zachowaniem pełnego skupienia na strukturze farby, kolorystyce i autonomii każdego dzieła.',
  coverArtworkId: 'dzielo-01',
};

export const artworksData: Artwork[] = [
  {
    id: 'dzielo-01',
    slug: 'pejzaz-o-zmierzchu',
    title: 'Pejzaż o zmierzchu',
    year: '2021',
    category: 'Pejzaż',
    medium: 'Olej na płótnie [TUTAJ TECHNIKA]',
    width: 90,
    height: 70,
    image:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=2400&auto=format&fit=crop',
    thumbnail:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    description:
      '[TUTAJ OPIS — Przejmująca kompozycja krajobrazowa z wyczuwalną głębią barw. Artysta operuje subtelnymi tonami grafitu, ciepłego ugru i gaszonej bieli, budując mistyczną atmosferę gasnącego dnia.]',
    story: {
      origin:
        '[TUTAJ HISTORIA — Jak powstał obraz? Czy był malowany w plenerze, czy powstał ze wspomnienia letniego wieczoru?]',
      meaning:
        '[TUTAJ ZNACZENIE — Co oznacza dla artysty? Zapis zadumy nad przemijaniem i pięknem natury.]',
      curatorialNote:
        'Kluczowe dzieło w zbiorach, otwierające główną oś wystawy i definiujące paletę tonalną kolekcji.',
    },
    details: [
      {
        id: 'det-01-1',
        title: 'Faktura nieba i impast',
        description:
          'Gęste nałożenie farby w partiach chmur, ukazujące śmiałe, zdecydowane pociągnięcia szpachli.',
        image:
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
      },
      {
        id: 'det-01-2',
        title: 'Przejście tonalne horyzontu',
        description:
          'Cienkie warstwy laserunku tworzące iluzję zamglonej przestrzeni w dolnej partii kompozycji.',
        image:
          'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    featured: true,
    order: 1,
    exhibitionOrder: 1,
  },
  {
    id: 'dzielo-02',
    slug: 'martwa-natura-ze-swiatlem',
    title: 'Martwa natura ze światłem',
    year: '2022',
    category: 'Martwa natura',
    medium: 'Olej na płótnie [TUTAJ TECHNIKA]',
    width: 60,
    height: 80,
    image:
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2400&auto=format&fit=crop',
    thumbnail:
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop',
    description:
      '[TUTAJ OPIS — Kameralne studium martwej natury. Gra światłocienia wydobywa z mroku przedmioty codziennego użytku, nadając im niemal sakralną powagę i monumentalizm.]',
    story: {
      origin:
        '[TUTAJ HISTORIA — Obraz namalowany w pracowni domowej podczas chłodnych miesięcy zimowych.]',
      meaning:
        '[TUTAJ ZNACZENIE — Celebrowanie prostoty i uważności na detale otaczającego świata.]',
    },
    details: [
      {
        id: 'det-02-1',
        title: 'Blik świetlny',
        description:
          'Punktowe, precyzyjne dotknięcie pędzlem z bielą tytanową, ożywiające całą kompozycję.',
        image:
          'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    featured: false,
    order: 2,
    exhibitionOrder: 3,
  },
  {
    id: 'dzielo-03',
    slug: 'cisza-nad-woda',
    title: 'Cisza nad wodą',
    year: '2019',
    category: 'Pejzaż',
    medium: 'Olej na desce [TUTAJ TECHNIKA]',
    width: 75,
    height: 50,
    image:
      'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?q=80&w=2400&auto=format&fit=crop',
    thumbnail:
      'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?q=80&w=800&auto=format&fit=crop',
    description:
      '[TUTAJ OPIS — Płótno o horyzontalnym układzie, w którym głównym bohaterem staje się tafla wody odbijająca poranne mgły. Harmonijna, wyciszająca kolorystyka.]',
    story: {
      origin:
        '[TUTAJ HISTORIA — Pamiątka ze wspólnego rodzinnego wyjazdu nad jezioro.]',
      meaning:
        '[TUTAJ ZNACZENIE — Pragnienie uchwycenia absolutnego spokoju i jedności z przyrodą.]',
    },
    order: 3,
    exhibitionOrder: 2,
  },
  {
    id: 'dzielo-04',
    slug: 'struktura-emocji',
    title: 'Struktura emocji',
    year: '2023',
    category: 'Abstrakcja',
    medium: 'Technika mieszana, akryl i olej [TUTAJ TECHNIKA]',
    width: 100,
    height: 100,
    image:
      'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=2400&auto=format&fit=crop',
    thumbnail:
      'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=800&auto=format&fit=crop',
    description:
      '[TUTAJ OPIS — Współczesna forma ekspresji, w której artysta rezygnuje z dosłowności na rzecz dialogu faktur, zgrzytów szpachli i nawarstwiających się powłok malarskich.]',
    story: {
      origin:
        '[TUTAJ HISTORIA — Dzieło powstałe pod wpływem muzyki klasycznej i wewnętrznego impulsu twórczego.]',
      meaning:
        '[TUTAJ ZNACZENIE — Eksperyment z materią malarską i wolnością gestu.]',
    },
    details: [
      {
        id: 'det-04-1',
        title: 'Rzeźbiarska grubość powłoki',
        description:
          'Wyraziste nawarstwienia farby tworzące trójwymiarową strukturę wyczuwalną pod palcami.',
        image:
          'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    order: 4,
    exhibitionOrder: 7,
  },
  {
    id: 'dzielo-05',
    slug: 'nocne-czuwanie',
    title: 'Nocne czuwanie',
    year: '2020',
    category: 'Pejzaż',
    medium: 'Olej na płótnie [TUTAJ TECHNIKA]',
    width: 70,
    height: 90,
    image:
      'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=2400&auto=format&fit=crop',
    thumbnail:
      'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=800&auto=format&fit=crop',
    description:
      '[TUTAJ OPIS — Nokturn o głębokich, aksamitnych granatach i ciepłych punktach światła. Niezwykła wrażliwość na barwę cienia.]',
    story: {
      origin:
        '[TUTAJ HISTORIA — Powstały podczas bezsennych nocy w podmiejskiej pracowni.]',
      meaning:
        '[TUTAJ ZNACZENIE — Samotność twórcy zamieniona w poetycki nokturn.]',
    },
    order: 5,
    exhibitionOrder: 6,
  },
  {
    id: 'dzielo-06',
    slug: 'wspomnienie-ogrodu',
    title: 'Wspomnienie ogrodu',
    year: '2022',
    category: 'Studium',
    medium: 'Olej na płótnie lnianym [TUTAJ TECHNIKA]',
    width: 85,
    height: 65,
    image:
      'https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2400&auto=format&fit=crop',
    thumbnail:
      'https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=800&auto=format&fit=crop',
    description:
      '[TUTAJ OPIS — Ciepłe, rozproszone światło przenikające przez zieleń. Płótno nasycone nostalgią i intymną atmosferą domowego zacisza.]',
    story: {
      origin:
        '[TUTAJ HISTORIA — Inspirowany ogrodem rodzinnym kwitnącym w środku lata.]',
      meaning:
        '[TUTAJ ZNACZENIE — Prezent i podziękowanie za ciepło ogniska domowego.]',
    },
    order: 6,
    exhibitionOrder: 4,
  },
  {
    id: 'dzielo-07',
    slug: 'droga-przez-las',
    title: 'Droga przez las',
    year: '2018',
    category: 'Pejzaż',
    medium: 'Olej na płótnie [TUTAJ TECHNIKA]',
    width: 60,
    height: 50,
    image:
      'https://images.unsplash.com/photo-1576769267415-9642010aa962?q=80&w=2400&auto=format&fit=crop',
    thumbnail:
      'https://images.unsplash.com/photo-1576769267415-9642010aa962?q=80&w=800&auto=format&fit=crop',
    description:
      '[TUTAJ OPIS — Wczesny obraz w dorobku, charakteryzujący się surowym, bezkompromisowym traktowaniem formy drzew i rytmu pni.]',
    story: {
      origin:
        '[TUTAJ HISTORIA — Jeden z pierwszych obrazów rozpoczętych w nowej technice olejnej.]',
      meaning:
        '[TUTAJ ZNACZENIE — Metafora życiowej drogi i wytrwałości w dążeniu do celu.]',
    },
    order: 7,
    exhibitionOrder: 5,
  },
];
