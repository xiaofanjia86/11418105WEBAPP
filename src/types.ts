/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  age: string;
  gender: '公' | '母';
  genderIcon: string;
  size: string;
  personality: string[];
  status: '待認養' | '已認養';
  story: string;
  imageUrl: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  hasPetExperience: 'yes' | 'no';
  previousBreed: string;
  adoptionReason: string;
  otherSuggestions?: string;
  updatedAt?: any;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  petImageUrl: string;
  adopterName: string;
  adopterPhone: string;
  adopterEmail: string;
  adopterAddress: string;
  hasPetExperience: 'yes' | 'no';
  previousBreed: string;
  adoptionReason: string;
  otherSuggestions?: string;
  status: '審核中' | '已同意' | '已婉拒';
  createdAt: any;
}
