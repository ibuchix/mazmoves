import { calculateDistance, RADIUS_MILES } from './distance.ts';
import { Company, MoveRequest, Assignment } from './types.ts';

export const findNearbyCompanies = (
  companies: Company[],
  request: MoveRequest,
  useDeliveryLocation = false
): { assignments: Assignment[]; locationUsed: 'pickup' | 'delivery' } => {
  const assignments: Assignment[] = [];
  const locationUsed = useDeliveryLocation ? 'delivery' : 'pickup';
  
  const baseLat = useDeliveryLocation ? request.delivery_latitude : request.pickup_latitude;
  const baseLon = useDeliveryLocation ? request.delivery_longitude : request.pickup_longitude;

  if (!baseLat || !baseLon) {
    console.warn(`Missing coordinates for ${locationUsed} location`);
    return { assignments: [], locationUsed };
  }

  for (const company of companies) {
    if (!company.latitude || !company.longitude) {
      console.warn('Missing coordinates for company:', company.name);
      continue;
    }

    const distance = calculateDistance(
      baseLat,
      baseLon,
      company.latitude,
      company.longitude
    );

    console.log(`Company ${company.name} is ${Math.round(distance)} miles away from ${locationUsed} location`);

    if (distance <= RADIUS_MILES) {
      console.log(`Creating assignment for company ${company.name} based on ${locationUsed} location`);
      assignments.push({ company, distance });
    }
  }

  return { assignments, locationUsed };
};