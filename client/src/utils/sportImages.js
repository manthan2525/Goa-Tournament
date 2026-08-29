// Centralized Sport Image Mapping for Goa Tournament Application
// Home, Listing Cards, Live Center & General Dashboards use sport-specific images.
// Organizer-uploaded banners appear ONLY on the View Tournament details page.

export const SPORT_IMAGES = {
  Football:
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  Cricket:
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
  Badminton:
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
  Chess:
    'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
  Kabaddi:
    'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
  'Table Tennis':
    'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80',
  TableTennis:
    'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80',
  Volleyball:
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
  Basketball:
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  Futsal:
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
  Tennis:
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  default:
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
};

/**
 * Returns the sport-specific thematic image for Home cards, listings, and dashboards.
 * NEVER falls back to organizer uploaded banner on listing cards.
 *
 * @param {string} sportName Name of the sport
 * @returns {string} Image URL for the sport
 */
export const getSportImage = (sportName) => {
  if (!sportName || typeof sportName !== 'string') {
    return SPORT_IMAGES.default;
  }
  const clean = sportName.trim();
  if (SPORT_IMAGES[clean]) {
    return SPORT_IMAGES[clean];
  }
  const noSpace = clean.replace(/\s+/g, '');
  if (SPORT_IMAGES[noSpace]) {
    return SPORT_IMAGES[noSpace];
  }
  return SPORT_IMAGES.default;
};

export default getSportImage;
