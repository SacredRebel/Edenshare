export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type ListingType = 'LAND' | 'RESOURCE' | 'SERVICE';
export type ExchangeType = 'FREE' | 'TRADE' | 'PAID' | 'WORK_EXCHANGE' | 'DONATION' | 'FLEXIBLE';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';
export type BadgeType = 'VERIFIED_ID' | 'VERIFIED_EMAIL' | 'VERIFIED_PHONE' | 'TRUSTED_HOST' | 'COMMUNITY_BUILDER' | 'EARLY_ADOPTER' | 'SUPER_HOST';

export interface NodeData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'land' | 'resource' | 'community' | 'service';
  members: number;
  rating: number;
  online: boolean;
  desc: string;
  verified: boolean;
}
