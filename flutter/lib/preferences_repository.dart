import 'package:shared_preferences/shared_preferences.dart';

class PreferencesRepository {
  static const _onboardingKey = 'onboarding_complete_v1';

  Future<bool> isOnboardingComplete() async =>
      (await SharedPreferences.getInstance()).getBool(_onboardingKey) ?? false;

  Future<void> completeOnboarding() async =>
      (await SharedPreferences.getInstance()).setBool(_onboardingKey, true);
}
