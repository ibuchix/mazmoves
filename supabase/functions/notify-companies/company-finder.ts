import { Company, MoveRequest, Assignment } from './types.ts';

export const findNearbyCompanies = async (
  supabase: any,
  request: MoveRequest,
  useDeliveryLocation = false
): Promise<{ assignments: Assignment[]; locationUsed: 'pickup' | 'delivery' }> => {
  const assignments: Assignment[] = [];
  const locationUsed = useDeliveryLocation ? 'delivery' : 'pickup';
  
  const point = useDeliveryLocation ? request.delivery_location : request.pickup_location;
  
  if (!point) {
    console.warn(`Missing location for ${locationUsed}`);
    return { assignments: [], locationUsed };
  }

  const { data: nearbyCompanies, error } = await supabase
    .rpc('find_companies_within_radius', {
      point: point,
      radius_miles: 25
    });

  if (error) {
    console.error('Error finding nearby companies:', error);
    return { assignments: [], locationUsed };
  }

  for (const result of nearbyCompanies) {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', result.id)
      .single();

    if (companyError) {
      console.error('Error fetching company details:', companyError);
      continue;
    }

    assignments.push({ 
      company, 
      distance: result.distance 
    });
  }

  return { assignments, locationUsed };
};