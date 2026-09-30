/* ==========================================================================
   RACE CONFIG — the single source of truth for everything event-specific.
   Edit values here; the page renders all content from this object.

   Dates use ISO 8601 with an explicit UTC offset, e.g. "2027-04-24T07:30:00+02:00".
   Money and numbers are plain numbers; they are formatted with `locale`/`currency`.
   Images: Unsplash URLs get resized/cropped automatically; any other URL is used as-is.
   ========================================================================== */
(function () {
  "use strict";

  /* Values reused in several places below — change once, applies everywhere. */
  const RACE_START = "2027-04-24T07:30:00+02:00";
  const REGISTRATION_CLOSES = "2027-04-10T23:59:00+02:00";
  const MIN_AGE = 16;

  const categories = [
    {
      id: "gran-fondo",
      name: "Gran Fondo",
      distanceKm: 112,
      elevationM: 1850,
      timeLimitHours: 7,
      fee: 85,
      description:
        "The full loop: lakeside flats, the Monte Ceneri climb and a gravel sector through Valle Capriasca."
    },
    {
      id: "medio-fondo",
      name: "Medio Fondo",
      distanceKm: 68,
      elevationM: 940,
      timeLimitHours: 5,
      fee: 65,
      description:
        "Same start, same finish, one climb fewer. The gravel sector is still on the menu."
    }
  ];

  window.RACE_CONFIG = {
    locale: "en-CH",
    currency: "CHF",

    event: {
      name: "Veloria Gran Fondo",
      edition: "3rd edition",
      discipline: "Road & gravel",
      tagline:
        "A lap of Lake Lugano, one decisive climb and a gravel sector that sorts the field.",
      raceStart: RACE_START,
      registrationCloses: REGISTRATION_CLOSES,
      timeZone: "Europe/Zurich",
      timeZoneLabel: "CEST",
      organizer: "Veloria Events Sagl",
      location: {
        venue: "Piazza della Riforma",
        city: "Lugano",
        region: "Ticino",
        country: "Switzerland",
        mapUrl:
          "https://www.openstreetmap.org/?mlat=46.0049&mlon=8.9510#map=17/46.0049/8.9510"
      }
    },

    hero: {
      image: {
        src: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
        alt: "A tight group of road cyclists racing side by side"
      }
    },

    categories,

    /* Info cells in the Details section. `format`: "number" | "currency" (optional). */
    stats: [
      { label: "Terrain", value: "Asphalt + gravel", note: "88% paved, 12% compact gravel" },
      { label: "Expected riders", value: 1200, format: "number", note: "The field is capped for safety" },
      { label: "Aid stations", value: 4, format: "number", note: "Water, fruit, gels and a mechanic" },
      { label: "Minimum age", value: MIN_AGE, unit: "years", note: "On race day" },
      { label: "Timing", value: "Chip", note: "Live tracking and instant results" },
      { label: "Roads", value: "Closed", note: "Traffic-free for the entire route" }
    ],

    starterPack: [
      "Race jersey",
      "Timing chip & bib",
      "Insulated bidon",
      "Three energy gels",
      "Finisher medal",
      "Post-race pasta party"
    ],

    /* `offsetDays` is relative to the race day. `time` is "HH:MM" or an ISO date. */
    schedule: [
      {
        offsetDays: -1,
        title: "Race eve",
        items: [
          { time: "14:00", title: "Race village opens", text: "Bib and starter pack pickup at the venue." },
          { time: "17:30", title: "Route briefing", text: "Course walkthrough, gravel sector and safety notes." },
          { time: "20:00", title: "Pickup closes" }
        ]
      },
      {
        offsetDays: 0,
        title: "Race day",
        items: [
          { time: "06:00", title: "Late pickup", text: "Last chance to collect your bib." },
          { time: "07:15", title: "Start pens close" },
          { time: RACE_START, title: "Gran Fondo start", highlight: true },
          { time: "07:45", title: "Medio Fondo start", highlight: true },
          { time: "11:30", title: "First finishers expected" },
          { time: "15:30", title: "Awards ceremony", text: "Podiums for every category and age group." }
        ]
      }
    ],

    gallery: [
      {
        src: "https://images.unsplash.com/photo-1541625602330-2277a4c46182",
        alt: "Two cyclists riding side by side along a coastal road",
        caption: "Kilometre 12, the lakeside flats"
      },
      {
        src: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f",
        alt: "A lone cyclist descending a curving road through dense forest",
        caption: "Descending through the pines after Monte Ceneri"
      },
      {
        src: "https://images.unsplash.com/photo-1452573992436-6d508f200b30",
        alt: "Motion-blurred cyclists racing, in black and white",
        caption: "Full gas on the final kilometre"
      },
      {
        src: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0",
        alt: "A rider splashing through a rocky creek",
        caption: "The water crossing on the gravel sector"
      },
      {
        src: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be",
        alt: "A cyclist riding up an empty road through rolling hills at dusk",
        caption: "Last light on the upper plateau"
      },
      {
        src: "https://images.unsplash.com/photo-1600403477955-2b8c2cfab221",
        alt: "A group of cyclists riding along a tree-lined country road",
        caption: "The Medio Fondo group in Valle Capriasca"
      },
      {
        src: "https://images.unsplash.com/photo-1609605988071-0d1cfd25044e",
        alt: "A cyclist riding away on a foggy road lined with bare trees",
        caption: "Morning fog before the start"
      },
      {
        src: "https://images.unsplash.com/photo-1508789454646-bef72439f197",
        alt: "A rider pausing on a grassy ridge with rocky peaks behind",
        caption: "Recon ride in the high pastures"
      },
      {
        src: "https://images.unsplash.com/photo-1541625247055-1a61cfa6a591",
        alt: "Three smiling cyclists standing with their bikes on a cobbled street",
        caption: "Finishers in the race village"
      }
    ],

    sponsors: [
      { name: "Northpeak", logo: "assets/sponsors/northpeak.svg", url: "#" },
      { name: "Ciclolab", logo: "assets/sponsors/ciclolab.svg", url: "#" },
      { name: "Ferro Wheels", logo: "assets/sponsors/ferro.svg", url: "#" },
      { name: "Alto Hydration", logo: "assets/sponsors/alto.svg", url: "#" },
      { name: "Kinetic Bank", logo: "assets/sponsors/kinetic.svg", url: "#" },
      { name: "Lumen Optics", logo: "assets/sponsors/lumen.svg", url: "#" },
      { name: "Ridgeway Tyres", logo: "assets/sponsors/ridgeway.svg", url: "#" },
      { name: "Monte Coffee", logo: "assets/sponsors/monte.svg", url: "#" }
    ],

    faq: [
      {
        q: "Can I transfer my entry to someone else?",
        a: "Yes, until registration closes. Use the link in your confirmation email to change the rider details. After that, entries are non-transferable."
      },
      {
        q: "What bike can I ride?",
        a: "Any road, gravel or cyclocross bike in good working order. We recommend tyres of at least 28 mm for the gravel sector. Time-trial bikes and e-bikes are not permitted."
      },
      {
        q: "Is a helmet mandatory?",
        a: "Yes. A certified helmet must be worn and fastened at all times on the course."
      },
      {
        q: "What happens if I can't make it?",
        a: "Cancel up to 30 days before the race for a 50% refund. After that we can defer your entry to next year's edition."
      },
      {
        q: "Do I need a racing licence?",
        a: "No. The event is open to everyone who meets the minimum age. A basic accident insurance is included in the entry fee."
      },
      {
        q: "Where can I park?",
        a: "Rider parking is available at Campo Marzio, 800 m from the start, free of charge for registered riders."
      }
    ],

    contact: {
      email: "hello@veloria.example",
      phone: "+41 91 000 00 00",
      social: [
        { label: "Instagram", url: "#" },
        { label: "Strava club", url: "#" },
        { label: "YouTube", url: "#" }
      ]
    },

    links: {
      terms: "#",
      privacy: "#"
    },

    form: {
      minAge: MIN_AGE,
      shirtSizes: ["XS", "S", "M", "L", "XL", "XXL"],
      /* POST endpoint that receives the registration as JSON. `null` simulates success. */
      endpoint: null
    },

    /* Page copy. */
    copy: {
      registerCta: "Register",
      signUpCta: "Sign up",
      closedCta: "Registration closed",
      closedMessage: "Registration is closed. See you at the finish line.",
      countdownLabel: "Registration closes in",
      detailsLink: "Race details",
      sections: {
        details: {
          index: "01",
          title: "Race details",
          lead: "Two distances, one start line. Everything you need to know before you enter."
        },
        schedule: {
          index: "02",
          title: "Race weekend",
          lead: "Pick up your pack the evening before, or early on race morning."
        },
        gallery: {
          index: "03",
          title: "Last year",
          lead: "Scenes from the previous edition, from the first light to the last finisher."
        },
        signup: {
          title: "Your start line is waiting.",
          lead: "The field is capped. Secure your place before registration closes."
        },
        sponsors: {
          index: "04",
          title: "Partners",
          lead: "The race is made possible by these partners."
        },
        faq: {
          index: "05",
          title: "Questions",
          lead: "Can't find what you need? Write to us, we reply within a day."
        }
      },
      form: {
        title: "Register",
        submit: "Complete registration",
        submitting: "Submitting…",
        submitError: "Something went wrong. Please try again in a moment.",
        successTitle: "You're in, {firstName}.",
        successText:
          "A confirmation is on its way to your inbox. Bring a photo ID to pick up your starter pack."
      }
    }
  };
})();
