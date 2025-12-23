/**
 * Shipping Module
 *
 * Exports address validation and delivery estimate utilities.
 */

// Validation exports
export {
  validateAddress,
  validatePostalCode,
  validatePhone,
  validateCity,
  isValidIsraeliCity,
  formatPhoneNumber,
  ISRAELI_CITIES,
  type ValidationResult,
  type AddressValidationResult,
} from './validation';

// Estimates exports
export {
  getShippingZone,
  getRecipientDeliveryEstimate,
  formatDeliveryEstimate,
  getDeliveryDateRange,
  type ShippingZone,
  type DeliveryEstimate,
  type DeliveryDateRange,
} from './estimates';
