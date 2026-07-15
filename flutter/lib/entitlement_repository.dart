class EntitlementRepository {
  const EntitlementRepository();

  /// Reserved for the future one-time, parent-approved ad-free purchase.
  Future<bool> hasAdFreeEntitlement() async => false;
}
