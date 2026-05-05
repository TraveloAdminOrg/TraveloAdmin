export interface RideType {
  _id: string;
  icon: string;
  title: string;
  passengers: number;
  // Region _ids the ride type is enabled for. Backend returns the populated
  // ObjectIds; the form filters its dropdowns against this list.
  allowedRegions: string[];
  allowedCities?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type RideTypeCreateInput = {
  icon?: string;
  title: string;
  passengers: number;
  allowedRegions: string[];
  isActive: boolean;
};

export type RideTypeUpdateInput = Partial<RideTypeCreateInput>;
